import Transfer from "./transfer.model.js"
import Services from '../services/services.model.js'
import Account from '../account/accounts.model.js'


export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

//Tranferencia
export const transfer = async (req, res) => {
    try {
        const uid = req.user._id
        const { recipientAccount, amount } = req.body

        //cuenta del usuario
        const accountRoot = await Account.findOne({ uid: uid })
        if (!accountRoot) {
            return res.status(404).send({ message: 'Root account not found' });
        }

        // buscar cuenta a la que llegara el dinero
        //const accountRoot = await Account.findOne({accountNumber: rootAccount})
        const accountRecipient = await Account.findOne({ accountNumber: recipientAccount })
        //verificar que existan las cuentas
        if (!accountRecipient) {
            return res.status(404).send({ message: 'Account not found' })
        }

        // Ver que tengan saldo suficiente
        if (accountRoot.availableBalance < amount) {
            return res.status(400).send({ message: 'Insufficient balance in root account' })
        }

        // Ver que la cantidad no sea mayor a Q2000
        if (amount > 2000) {
            return res.status(400).send({ message: 'Cannot transfer more than Q2000 in a single transaction' });
        }



        //Actulizar los saldos
        accountRoot.availableBalance -= parseFloat(amount)
        accountRecipient.availableBalance += parseFloat(amount)

        await accountRoot.save()
        await accountRecipient.save()

        //Hacer la transferencia
        const newTransfer = new Transfer({
            rootAccount: accountRoot._id,
            recipientAccount: accountRecipient._id,
            amount: parseFloat(amount),
            motion: 'TRANSFER'
        })
        await newTransfer.save()
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'transfer error' })
    }
}

//Compra
export const buyed = async (req, res) => {
    try {
        let uid = req.user._id
        const { services } = req.body

        //cuenta del usuario
        const accountRoot = await Account.findOne({ uid: uid })
        if (!accountRoot) {
            return res.status(404).send({ message: 'Root account not found' });
        }

        //ver que exista la cuenta
        if (!accountRoot) {
            return res.status(404).send({ message: 'Account not found' })
        }

        // Obtener servicio
        const service = await Services.findById(services);
        //ver que exista el servicio
        if (!service) {
            return res.status(404).send({ message: 'Service not found' });
        }

        // Ver que tengan saldo suficiente
        if (accountRoot.availableBalance < service.price) {
            return res.status(400).send({ message: 'Insufficient balance in root account' })
        }

        // Actualizar saldo
        accountRoot.availableBalance -= parseFloat(service.price)

        await accountRoot.save()

        //Crear  compra
        const newBuyed = new Transfer({
            rootAccount: accountRoot._id,
            services: services,
            motion: 'BUYED'
        })

        await newBuyed.save()

        return res.status(200).send({ message: 'Purchase successful', buyed: newBuyed })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Purchase error' })
    }
}

//Deposito
export const deposit = async (req, res) => {
    try {
        const { recipientAccount, amount } = req.body

        // buscar la cuenta
        const accountRecipient = await Account.findOne({ accountNumber: recipientAccount })

        // Actualizar saldo
        accountRecipient.availableBalance += parseFloat(amount)

        await accountRecipient.save()

        // Crear deposito
        const newDeposit = new Transfer({
            recipientAccount: accountRecipient._id,
            amount: parseFloat(amount),
            motion: 'DEPOSIT'
        })

        await newDeposit.save()
        return res.status(200).send({ message: 'Deposit successful', deposit: newDeposit })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Deposit error' })
    }
}

//Revertir transferencia
export const revertTransfer = async (req, res) => {
    try {
        const { id } = req.body
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

        // Obtener las cuentas del usuario
        const userAccounts = await Account.find({ user: userId });
        const accountIds = userAccounts.map(account => account._id);

        // Obtener las transferencias relacionadas con las cuentas del usuario
        const transfers = await Transfer.find({
            $or: [
                { rootAccount: { $in: accountIds } },
                { recipientAccount: { $in: accountIds } }
            ]
        }).sort({ date: -1 });

        // Enviar respuesta con las transferencias
        res.status(200).send({
            message: 'User transfer history retrieved successfully',
            transfers
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error retrieving user transfer history', error: error.message });
    }
};

// Historial (últimos 5 movimientos)
export const getLastFiveTransfers = async (req, res) => {
    try {
        const userId = req.user._id

        // Obtener las cuentas del usuario
        const userAccounts = await Account.find({ user: userId })
        const accountIds = userAccounts.map(account => account._id)

        // Obtener las transferencias relacionadas con las cuentas del usuario
        const transfers = await Transfer.find({
            $or: [
                { rootAccount: { $in: accountIds } },
                { recipientAccount: { $in: accountIds } }
            ]
        }).sort({ date: -1 }).limit(5)// Esto es lo que hace que solo muestre los ultimos 5 movimientos

        // Enviar respuesta con las transferencias
        res.status(200).send({
            message: 'The last five user transfer',
            transfers
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error retrieving last five user transfers', error: error.message })
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
                    { recipientAccount: account._id }
                ]
            });
            return {
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