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

//Listar accounts

export const obtener = async (req, res) => {
    try {
        let data = await Accounts.find()
        return res.send({ data })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'the information cannot be brought' })
    }
}