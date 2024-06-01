'use strict'

import User from "./user.model.js"
import Account from '../account/accounts.model.js'
import { generateJwt } from '../utils/jwt.js'
import { encrypt, checkPassword, checkUpdateUser, checkUpdateUserSelf } from '../utils/validator.js'
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

        // Crear una cuenta bancaria para el usuario
        let accountData = {
            user: user._id,
            availableBalance: 0,
            creationDate: new Date()
        }
        let account = new Account(accountData)
        await account.save()
        
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

//Update de parte de un admin
export const updateUserAd = async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = req.body;

        if (!checkUpdateUser(userData, userId)) {
            return res.status(400).json({ message: 'No se han proporcionado datos para actualizar' });
        }

        // Verificar si el usuario es administrador
        const user = await User.findById(userId);
        if (user.role === 'ADMIN') {
            return res.status(403).json({ message: 'No se puede modificar un administrador' });
        }

        // no deja actulizar si se inteta actulizar algunos de estos campos osea Dpi o la contrase;a
        let restrictedFields = [];
        if ('DPI' in userData) {
            restrictedFields.push('DPI');
            delete userData.DPI;
        }
        if ('password' in userData) {
            restrictedFields.push('password');
            delete userData.password;
        }

        if (restrictedFields.length > 0) {
            return res.status(400).json({ message: `No se puede actualizar los campos: ${restrictedFields.join(', ')}` });
        }
        // Actualizar campos permitidos
        const updatedUser = {
            name: userData.name,
            username: userData.username,
            address: userData.address,
            phone: userData.phone,
            email: userData.email,
            nameOfWork: userData.jobTitle,
            monthlyIncome: userData.monthlyIncome,
        };

        // Verificar ingresos mensuales
        if (updatedUser.monthlyIncome < 100) {
            return res.status(400).json({ message: 'Ingresos mensuales deben ser mayores o iguales a Q100' });
        }

        // Actualizar usuario
        await User.findByIdAndUpdate(userId, updatedUser, { new: true });

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};

//update del mismo usuario a si mismo
export const updateUserSelf = async (req, res) => {
  try {
    const token = req.headers.authorization
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decoded.id;
    const userData = req.body;
    

    if (!checkUpdateUserSelf(userData)) {
      return res.status(400).json({ message: 'No se pueden actualizar los siguientes campos: nombre, DPI, número de cuenta, dirección, nombre de trabajo, ingresos mensuales' });
    }

    // Actualizar campos permitidos
    const updatedUser = {
      nickname: userData.nickname,
      phone: userData.phone,
      email: userData.email,
    };

    // Actualizar usuario
    await User.findByIdAndUpdate(userId, updatedUser, { new: true });

    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};


//Delete
export const deleteU = async (req, res) => {
    try {
        let { uid } = req.params.id
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

