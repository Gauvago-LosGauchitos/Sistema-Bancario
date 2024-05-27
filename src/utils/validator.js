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

export const checkOldPassword = async (oldPassword, hash) => {
    try {
        return await compare(oldPassword, hash);
    } catch (err) {
        console.error(err);
        throw new Error('Error comparing passwords');
    }
};

export const hashPassword = async (password) => {
    try {
        const hashedPassword = await hash(password, 10); 
        return hashedPassword;
    } catch (err) {
        console.error(err);
        throw new Error('Error hashing password');
    }
};

