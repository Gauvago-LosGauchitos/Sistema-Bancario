'use strict'

import User from "./user.model.js"
import jwt from 'jsonwebtoken'
import { encrypt} from '../utils/validator.js'

export const testU = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

export const defaultUser = async () => {
    try {
        const userExist = await User.findOne({ username: 'ADMINB' })

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