'use strict'

import { hash, compare } from 'bcrypt'

//encriptar contra
export const encrypt = async (password) => {
    try {
        return hash(password, 10)
    } catch (err) {
        console.error(err)
        return err
    }
}

//validacion de contra
export const checkPassword = async (password, hash) => {
    try {
        return await compare(password, hash)
    } catch (err) {
        console.error(err);
        return err
    }
}

//Update Services
export const checkUpdateS = (data, servicesId)=>{
    if(servicesId){
        if(Object.entries(data).length === 0){
            return false
        }
        return true
    }else{
        return false
    }
}
