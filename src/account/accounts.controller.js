import mongoose from "mongoose"
import Accounts from "./accounts.model.js"

//testeo
export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

//Register de accounts
export const register = async (req, res) => {
    try {
        const { availableBalance, creationDate, user, favorite } = req.body

        if (isNaN(availableBalance) || availableBalance < 0) {
            return res.status(400).send({ message: 'El balance disponible debe ser un número positivo.' })
            //esto hace que no pueda ser numeros negtivos 
        }

         //convierte en un objeto de fecha
        const parsedDate = new Date(creationDate)
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).send({ message: 'Fecha de creación no válida.' })
        }

        if (parsedDate > new Date()) {
            return res.status(400).send({ message: 'La fecha de creación no puede ser en el futuro.' })
            //esto hace que la fecha no pueda ser futura
        }

        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).send({ message: 'El ID de usuario no es válido.' })
            //varifica si el use existe
        }

        // crea una nueva accion de la cuenta
        let accounts = new Accounts({ availableBalance, creationDate: parsedDate, user, favorite })
        await accounts.save();
        return res.send({ message: `Cuenta registrada con éxito, número de cuenta ${accounts.accountNumber}` })

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: 'Error de validación', error: err.message })
        }
        if (err.code === 11000) {
            return res.status(400).send({ message: 'El número de cuenta ya existe.' })
        }
        console.error(err)
        return res.status(500).send({ message: 'Error registrando la cuenta', error: err })
    }
}


//Delete 

export const eliminarA = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ message: 'El ID de la cuenta no es válido.' })
        }

        const account = await Accounts.findById(id)

        if (!account) {
            return res.status(404).send({ message: 'Cuenta no encontrada.' })
        }
        if (account.availableBalance !== 0) {
            return res.status(400).send({ message: 'No se puede eliminar la cuenta. El balance disponible debe ser cero.' })
        }

        await Accounts.findByIdAndDelete(id)
        return res.send({ message: 'Cuenta eliminada con éxito.' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error eliminando la cuenta', error })
    }
}

// Obtener una cuenta específica
export const getAccount = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ message: 'El ID de la cuenta no es válido.' })
        }

        const account = await Accounts.findById(id)
        if (!account) {
            return res.status(404).send({ message: 'Cuenta no encontrada.' })
        }

        return res.send({ data: account })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error obteniendo la cuenta', error })
    }
}


// Filtrar cuentas
export const filterAccounts = async (req, res) => {
    try {
        const { user, creationDate } = req.query
        const query = {}

        if (user && mongoose.Types.ObjectId.isValid(user)) {
            query.user = user
        }

        if (creationDate) {
            const parsedDate = new Date(creationDate)
            if (!isNaN(parsedDate.getTime())) {
                query.creationDate = parsedDate
            } else {
                return res.status(400).send({ message: 'Fecha de creación no válida.' })
            }
        }

        let data = await Accounts.find(query)
        return res.send({ data })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error filtrando las cuentas', error })
    }
}