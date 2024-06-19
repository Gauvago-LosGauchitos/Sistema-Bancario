'use strict'

import User from "./user.model.js"
import Account from '../account/accounts.model.js'
import Transfer from "../transfer/transfer.model.js"
import { generateJwt } from '../utils/jwt.js'
import { encrypt, checkPassword, checkUpdateUser, checkUpdateUserSelf } from '../utils/validator.js'
import { upload } from '../utils/multerConfig.js';
import fs from 'fs';
import path from 'path';
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
        let data = req.body;
        console.log(data.username)
        let exists = await User.findOne({
            $or: [
                { user: data.username },
                { email: data.email }
            ]
        });

        if (exists) {
            return res.status(500).send({
                message: 'Email or username already exists'
            });
        }

        // Encrypt the password
        data.password = await encrypt(data.password);

        // Set the user role to 'ADMIN'
        data.role = 'ADMIN';

        // Create a new user
        let user = new User(data);
        await user.save();

        // Create a new account
        let accountData = {
            client: user._id,
            availableBalance: 200,
            creationDate: new Date()
        };
        let account = new Account(accountData);
        await account.save();

        return res.send({
            message: `Registered successfully, can be logged with username ${user.username}`
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: 'Error registering user',
            err: err
        });
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

        //Crea una cuenta
        let accountData = {
            client: user._id,
            availableBalance: 200,
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
        const { username, ...userData } = req.body;  // Extraer username del cuerpo de la solicitud y los demás datos de usuario
        console.log(userData)
        console.log(username)
        if (!username || !userData) {
            return res.status(400).json({ message: 'No se han proporcionado datos para actualizar' });
        }

        // Verificar si el usuario es administrador
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        if (user.role === 'ADMIN') {
            return res.status(403).json({ message: 'No se puede modificar un administrador' });
        }

        // No deja actualizar si se intenta actualizar algunos de estos campos, DPI o la contraseña
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
            nameOfWork: userData.nameOfWork,
            monthlyIncome: userData.monthlyIncome,
        };

        // Verificar ingresos mensuales
        if (updatedUser.monthlyIncome < 100) {
            return res.status(400).json({ message: 'Ingresos mensuales deben ser mayores o iguales a Q100' });
        }

        // Actualizar usuario
        const userUpdated = await User.findOneAndUpdate({ username }, updatedUser, { new: true });

        res.json({ message: 'Usuario actualizado correctamente', user: userUpdated });
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
        const { username } = req.body; // Extraer el username del cuerpo de la solicitud
        console.log('Deleting user:', username);

        if (!username) {
            return res.status(400).send({ message: 'Username is required' });
        }

        const deletedUser = await User.findOneAndDelete({ username });

        if (!deletedUser) {
            return res.status(404).send({ message: 'Account not found and not deleted' });
        }

        return res.send({ message: `Account with username ${deletedUser.username} deleted successfully` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error deleting account' });
    }
};

//Busqueda de usuario Logueado
export const getLoggedUser = async (req, res) => {
    try {
        const uid = req.user._id
        let userLogged = await User.findById(uid)
        if (!userLogged) {
            return res.status(404).send({ message: 'User not found' })
        }
        return res.send({ userLogged })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting user' })
    }
}

//listar admins
export const listAdmin = async (req, res) => {
    try {
        let admins = await User.find({ role: 'admin' })
        if (!admins) {
            return res.status(404).send({ message: 'No admins found' })
        }
        return res.send({ admins })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting user' })

    }

}

//listar usuarios
export const listUsers = async (req, res) => {
    try {
        let users = await User.find({ role: 'CLIENT' })
        if (!users) {
            return res.status(404).send({ message: 'No clients found' })
        }
        return res.send({ users })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting user' })

    }

}

// Función para buscar un usuario por nombre de usuario
export const findUserByUsername = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).send({ message: 'Username is required in the request body' });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        return res.send({ user });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error finding user' });
    }
};

// Función para manejar la carga de imágenes
// Función para manejar la carga de imágenes
export const uploadImage = (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(400).send({ message: err.message });
        }

        try {
            const { authorization } = req.headers;
            const secretKey = process.env.SECRET_KEY;
            const { uid } = jwt.verify(authorization, secretKey);

            // Encuentra al usuario para obtener la URL de la imagen anterior
            const user = await User.findById(uid);
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }

            // Guarda la ruta de la imagen anterior para eliminarla
            const previousImagePath = user.imgProfile;

            // Lee el nuevo archivo de imagen y conviértelo a base64
            const imageData = fs.readFileSync(req.file.path);
            const base64Image = Buffer.from(imageData).toString('base64');
            const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

            // Actualiza el usuario con la nueva URL de la imagen
            user.imgProfile = imageUrl;
            await user.save();

            // Elimina la imagen anterior si existe y no está en formato base64
            if (previousImagePath && fs.existsSync(previousImagePath)) {
                fs.unlinkSync(previousImagePath);
            }

            // Elimina el archivo temporal actual
            fs.unlinkSync(req.file.path);

            return res.send({ message: 'Image uploaded and user updated successfully', imageUrl });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: 'Internal server error' });
        }
    });
};

