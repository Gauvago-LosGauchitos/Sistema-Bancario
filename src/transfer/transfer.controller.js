import Transfer from "./transfer.model.js"
import Services from '../services/services.model.js'
import Account from '../account/accounts.model.js'
import User from "../user/user.model.js"


export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

//Tranferencia
export const transfer = async (req, res) => {
    try {
        const { recipientAccount, amount } = req.body
        const uid = req.user._id
        const user  = User.findById({uid})
        

        //cuenta del usuario
        const rootAccount  = await Account.findOne({ client: uid })

        if (!rootAccount ) {
            return res.status(404).send({ message: 'Root account not found' });
        }

        // buscar cuenta a la que llegara el dinero
        //const accountRoot = await Account.findOne({accountNumber: rootAccount})
        const accountRecipient = await Account.findOne({ accountNumber: recipientAccount })
        console.log(accountRecipient)

        if(accountRecipient.client === rootAccount.client){
            console.log('igual')
        }
        //verificar que existan las cuentas
        if (!accountRecipient) {
            return res.status(404).send({ message: 'Account not found' })
        }


        if(rootAccount.accountNumber === accountRecipient.accountNumber){
            console.log('si')
            return res.status(400).send({ message: 'No puedes transferirte a ti mismo' })

        }

        // Ver que tengan saldo suficiente
        if (rootAccount.availableBalance < amount) {
            return res.status(400).send({ message: 'Insufficient balance in root account' })
        }

        // Ver que la cantidad no sea mayor a Q2000
        if (amount > 2000) {
            return res.status(400).send({ message: 'Cannot transfer more than Q2000 in a single transaction' });
        }

         //Por día no puede transferir más de 10,000 (en diferentes transferencias).
        const startToday = new Date();
        startToday.setHours(0, 0, 0, 0); 

        const endToday = new Date();
        endToday.setHours(23, 59, 59, 999);

        const transfersToday = await Transfer.find({
            rootAccount,
            date: { 
                $gte: startToday,
                $lt: endToday
            }
        });

        const transferLimit = 10000
        const totalTransferredToday = transfersToday.reduce((sum, transfer) => sum + transfer.amount, 0);
        if (parseInt(totalTransferredToday) + parseInt(amount) > transferLimit) {
          
            return res.status(400).send({ message: 'Cannot transfer more than Q10,000 in a day' });
        }


        //Actulizar los saldos
        rootAccount.availableBalance -= parseFloat(amount)
        accountRecipient.availableBalance += parseFloat(amount)

        await rootAccount.save()
        await accountRecipient.save()

        //Hacer la transferencia
        const newTransfer = new Transfer({
            rootAccount: rootAccount._id,
            recipientAccount: accountRecipient._id,
            amount: parseFloat(amount),
            motion: 'TRANSFER'
        })
        await newTransfer.save()

        return res.status(200).send({ message: 'Transferencia completada', newTransfer })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'transfer error' })
    }
}   

//Compra
export const buyed = async (req, res) => {
    try {
        let uid = req.user._id;
        const { service, quantity } = req.body; // Obtener la cantidad desde el request

        // Validar la cantidad
        if (quantity <= 0) {
            return res.status(400).send({ message: 'Quantity must be greater than zero' });
        }

        // Cuenta del usuario
        const accountRoot = await Account.findOne({ client: uid });
        if (!accountRoot) {
            return res.status(404).send({ message: 'Root account not found' });
        }

        // Obtener servicio
        let serviceFound = await Services.findOne({ name: service });
        // Ver que exista el servicio
        if (!serviceFound) {
            return res.status(404).send({ message: 'Service not found' });
        }

        const totalAmount = parseFloat(serviceFound.price) * quantity; // Calcular el total

        // Ver que tengan saldo suficiente
        if (accountRoot.availableBalance < totalAmount) {
            return res.status(400).send({ message: 'Insufficient balance in root account' });
        }

        // Actualizar saldo
        accountRoot.availableBalance -= totalAmount;

        await accountRoot.save();

        // Crear compra
        const newBuyed = new Transfer({
            rootAccount: accountRoot._id,
            services: serviceFound._id,
            motion: 'BUYED',
            amount: totalAmount // Asignar el total como el amount
        });

        await newBuyed.save();

        return res.status(200).send({ 
            message: 'Purchase successful', 
            buyed: newBuyed,
            newBalance: accountRoot.availableBalance // Devolver el nuevo balance
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Purchase error' });
    }
}


//Deposito
export const deposit = async (req, res) => {
    try {
        const { recipientAccount, amount } = req.body;
        let uid = req.user._id;

        const accountRoot = await Account.findOne({ client: uid });
        if (!accountRoot) {
            return res.status(404).send({ message: 'Root account not found' });
        }

        // Buscar la cuenta del destinatario
        const accountRecipient = await Account.findOne({ accountNumber: recipientAccount });

        // Actualizar saldo
        accountRecipient.availableBalance += parseFloat(amount);

        await accountRecipient.save();

        // Crear el depósito
        const newDeposit = new Transfer({
            rootAccount: accountRoot._id,
            recipientAccount: accountRecipient._id,
            amount: parseFloat(amount),
            motion: 'DEPOSIT'
        });

        await newDeposit.save();

        // Realizar la población
        const populatedDeposit = await Transfer.findById(newDeposit._id).populate({
            path: 'rootAccount',
            populate: {
                path: 'client',
                select: 'name'
            }
        });

        return res.status(200).send({ message: 'Deposit successful', deposit: populatedDeposit });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Deposit error' });
    }
};

//Revertir transferencia
export const revertTransfer = async (req, res) => {
    try {
        const { id } = req.body
        console.log(id)
        const transfer = await Transfer.findById(id)

        if (!transfer) {
            return res.status(404).send({ message: 'Transfer not found' })
        }

        // Medir un minuto
        const now = new Date();
        if ((now - transfer.date) > 60000) {
            return res.status(400).send({ message: 'Cannot revert transfer after 1 minute' })
        }

        //Ver si no ha sido revertida antes
        if (transfer.reverted) {
            return res.status(400).send({ message: 'Transfer has already been reverted' })
        }

        const rootAccount = await Account.findById(transfer.rootAccount)
        const recipientAccount = await Account.findById(transfer.recipientAccount)

        //Convertir a decimal pa q no pete
        const amountR = parseFloat(transfer.amount);
        if (isNaN(amountR)) {
            return res.status(400).send({ message: 'Invalid transfer amount' });
        }

        // Revertir
        rootAccount.availableBalance += amountR
        recipientAccount.availableBalance -= amountR

        await rootAccount.save()
        await recipientAccount.save()

        transfer.reverted = true
        await transfer.save()

        return res.status(200).send({ message: 'Transfer successfully reverted', transfer })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Revert transfer error' })
    }
}

//Revertir deposito
export const revertDeposit = async (req, res) => {
    try {
        const { id } = req.body
        const deposit = await Transfer.findById(id)
        if (!deposit) {
            return res.status(404).send({ message: 'Deposit not found' })
        }
        //Medir un minuto
        const now = new Date()
        if ((now - deposit.date) > 60000) {
            return res.status(400).send({ message: 'Cannot revert deposit after 1 minute' })
        }


        //Ver si no ha sido revertida antes
        if (deposit.reverted) {
            return res.status(400).send({ message: 'Deposit has already been reverted' })
        }

        const recipientAccount = await Account.findById(deposit.recipientAccount);

        // Convertir a decimal pa q no pete
        const amountR = parseFloat(deposit.amount)
        if (isNaN(amountR)) {
            return res.status(400).send({ message: 'Invalid deposit amount' })
        }

        // Revertir
        recipientAccount.availableBalance -= amountR

        await recipientAccount.save()
        deposit.reverted = true
        await deposit.save()

        return res.status(200).send({ message: 'Deposit successfully reverted', deposit })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Revert deposit error' })
    }
}

//Historial
export const getTransferHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        

        const user = await User.findById(userId)

        // Obtener las cuentas del usuario
        const userAccounts = await Account.find({ client: userId });

        // Obtener solo los IDs de las cuentas
        const accountIds = userAccounts.map(account => account._id);

        // Obtener las transferencias relacionadas con las cuentas del usuario
        let transfers = await Transfer.find({
            $or: [
                { rootAccount: { $in: accountIds } },
                { recipientAccount: { $in: accountIds } }
            ]
        }).sort({ date: -1 });

        // Iterar sobre las transferencias para manejar la populación condicionalmente
        for (let i = 0; i < transfers.length; i++) {
            const transfer = transfers[i];

            // Populación para rootAccount y recipientAccount según corresponda
            if (transfer.rootAccount) {
                await transfer.populate({
                    path: 'rootAccount',
                    select: 'accountNumber availableBalance',
                    populate: {
                        path: 'client',
                        select: 'name'  
                    }
                })
            }
            if (transfer.recipientAccount) {
                await transfer.populate({
                    path: 'recipientAccount',
                    select: 'accountNumber',
                    populate: {
                        path: 'client',
                        select: 'name'  
                    }
                })
            }

            // Populación para services si el tipo de transferencia es "BUYED"
            if (transfer.motion === 'BUYED' && transfer.services) {
                await transfer.populate('services', 'name')
            }
        }

        // Enviar respuesta con las transferencias
        res.status(200).send({
            message: 'User transfer history retrieved successfully',
            transfers,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error retrieving user transfer history', error: error.message });
    }
};

// Historial (últimos 5 movimientos)
export const getLastFiveTransfers = async (req, res) => {
    try {
        const { userId } = req.body;

        // Obtener las cuentas del usuario
        const userAccounts = await Account.find({ client: userId });
        const accountIds = userAccounts.map(account => account._id);

        // Obtener las transferencias relacionadas con las cuentas del usuario
        let transfers = await Transfer.find({
            $or: [
                { rootAccount: { $in: accountIds } },
                { recipientAccount: { $in: accountIds } }
            ]
        }).sort({ date: -1 }).limit(5);

        // Poblar los nombres de los servicios cuando sea aplicable (en caso de BUYED)
        transfers = await Transfer.populate(transfers, [
            {
                path: 'services',
                select: 'name'
            },
            {
                path: 'rootAccount',
                populate: {
                    path: 'client',
                    select: 'username'
                }
            },
            {
                path: 'recipientAccount',
                populate: {
                    path: 'client',
                    select: 'username'
                }
            }
        ]);

        // Enviar respuesta con las transferencias
        res.status(200).send({
            message: 'The last five user transfer',
            transfers
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error retrieving last five user transfers', error: error.message });
    }
};


//Mas moviminetos en orden ascedentes a descendete
export const getAccountsByMovements = async (req, res) => {
    try {
        const accounts = await Account.find();

        // Esto cuenta los movimientos de las cuentas
        const accountMovements = await Promise.all(accounts.map(async (account) => {
            const transferCount = await Transfer.countDocuments({
                $or: [
                    { rootAccount: account._id },
                    { recipientAccount: { $in: account._id } }
                ]
            });

            const populatedAccount = await Account.populate(account, { path: 'client', select: 'username' });
            return {
                accountOwner: account.client?.username,
                accountNumber: account.accountNumber,
                movements: transferCount
            };
        }));

        // Ordenar las cuentas segn el nummero de movimientos
        const { order } = req.query
        accountMovements.sort((a, b) => order === 'asc' ? a.movements - b.movements : b.movements - a.movements);

        res.status(200).send({
            message: 'Accounts sorted by number of movements',
            accounts: accountMovements
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error retrieving accounts by movements', error: error.message });
    }
};