'use strict'

import User from "./user.model.js"
import {generateJwt} from '../utils/jwt.js'
import {  encrypt,checkPassword } from '../utils/validator.js'
import jwt from 'jsonwebtoken'


export const testU = (req, res) => {
    console.log('test is running')
    return res.send({
        message: 'Test is running'
    })
}

export const defaultUser = async () => {
    try {
        const userExist = await User.findOne({
            username: 'ADMINB'
        })

        if (userExist) {
            return console.log('The default user already exists')
        }
        let data = {
            name: 'ADMINB',
            username: 'ADMINB',
            accountNumber: '1111',
            DPI: '3184155340717',
            address: 'calle solovino',
            phone: '12345678',
            email: 'default@gmail.com',
            password: await encrypt('ADMINB'),
            nameOfWork: 'administrador',
            monthlyIncome: '101',
            role: 'ADMIN'
        }
        let user = new User(data)
        await user.save()
        return console.log('Updated user', data)
    } catch (err) {
        console.error(err)
    }
}

//registro Admin
export const registerAd = async (req, res) => {
    try {
        let data = req.body
        let exists = await User.findOne({
            $or: [{
                    user: data.username
                },
                {
                    email: data.email
                }
            ]
        })
        if (exists) {
            return res.status(500).send({
                message: 'Email or username alredy exists'
            })
        }
        data.password = await encrypt(data.password)
        data.role = 'ADMIN'
        let user = new User(data)
        await user.save()
        return res.send({
            message: `Registered successfully, can be logged with username ${user.username}`
        })
    } catch (err) {
        console.error(err)
        return res.status(500).send({
            message: 'Error registering user',
            err: err
        })
    }
}

// registro client
export const registerC = async (req, res) => {
    try {
        let data = req.body
        let exists = await User.findOne({
            $or: [
                {
                    user: data.username
                },
                {
                    email: data.email
                }
            ]
        })
        if (exists) {
            return res.status(500).send({ message: 'Email or username alredy exists' })
        }
        data.password = await encrypt(data.password)
        data.role = 'CLIENT'
        let user = new User(data)
        await user.save()
        return res.send({ message: `Registered successfully, can be logged with username ${user.username}` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering user', err: err })
    }
}


// login
export const login = async (req, res) => {
    try {
        let {
            username,
            password,
            email
        } = req.body
        let user = await User.findOne({
            $or: [{
                    username
                },
                {
                    email
                }
            ]
        })
        if (user && await checkPassword(password, user.password)) {
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                surname: user.surname,
                role: user.role
            }
            let token = await generateJwt(loggedUser)
            return res.send({
                message: `Welcome ${loggedUser.name}`,
                loggedUser,
                token
            })
        }
        return res.status(404).send({
            message: 'Invalid credentials'
        })
    } catch (err) {
        console.error(err)
        return res.status(500).send({
            message: 'Error to login'
        })
    }

}

//Update


//Delete
export const deleteU = async (req, res) => {
    try {
        let secretKey = process.env.SECRET_KEY
        let { authorization } = req.headers
        let { uid } = jwt.verify(authorization, secretKey)// extrae del token el uid para no ponerlo en la url
        let { confirmation } = req.body // Agrega un campo de confirmación 

        // verifica si el campo confirmation es no que de el siguiente mensaje y que no ejecute nada
        if (confirmation === 'no') {
            return res.status(200).send({ message: 'Deletion cancelled by user' })
        }
        // verifica si el campo confirmation es si que continue con el proceso de eliminacion al igual que si se pone otra palabra que no sea
        // si o no que tire el mensaje que solo se puede poner si o no
        if (confirmation !== 'yes') {
            return res.status(400).send({ message: 'Please confirm the deletion by providing confirmation: "yes or no"' })
        }

        let deletedUser = await User.findOneAndDelete({ _id: uid })

        if (!deletedUser) return res.status(404).send({ message: 'Account not found and not deleted' })

        return res.send({ message: `Account with username ${deletedUser.username} deleted successfully` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting account' })
    }
}