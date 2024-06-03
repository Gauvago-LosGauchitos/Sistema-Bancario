import Transfer from "./transfer.model.js"
import Services from '../services/services.model.js'
import Account from '../account/accounts.model.js'


export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

export const transfer = async (req, res) => {
    try {
        const uid = req.user._id
        const { rootAccount, recipientAccount, amount } = req.body

        // buscar las cuentas
        const accountRoot = await Account.findOne({accountNumber: rootAccount})
        const accountRecipient = await Account.findOne({accountNumber: recipientAccount})
        
        //verificar que existan las cuentas
        if (!accountRoot || !accountRecipient) {
            return res.status(404).send({ message: 'Account not found' })
        }

        // Ver que tengan saldo suficiente
        if (accountRoot.availableBalance < amount) {
            return res.status(400).send({ message: 'Insufficient balance in root account' })
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

export const buyed = async (req, res) => {
    try {
        let uid = req.user._id
        const { rootAccount, services } = req.body

        // Obtener cuenta por número de cuenta
        const accountRoot = await Account.findOne({ accountNumber: rootAccount })
        
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
        if (accountRoot.balance < service.price) {
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

export const deposit = async (req, res) =>{
    try {
        const { recipientAccount, amount, motion} = req.body

        // buscar la cuenta
        const accountRecipient = await Account.findOne({accountNumber: recipientAccount})

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