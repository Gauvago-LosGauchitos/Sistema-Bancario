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



//Update User
export const checkUpdateUser = (data, userId) => {
    if (userId) {
      if (Object.entries(data).length === 0) {
        return false;
      }
  
      // Verificar si se esta actualizando la contraseña y/o el DPI
      if (data.password || data.dpi) {
        return false;
      }
  
      return true;
    } else {
      return false;
    }
  };

  export const checkUpdateUserSelf = (data) => {
    if (Object.entries(data).length === 0) {
      return false;
    }
    // Verificar si password, DPI, name, accountNumber, address, nameOfWork, o monthlyIncome se esta actualizando
    if (data.password || data.dpi || data.name || data.accountNumber || data.address || data.jobTitle || data.monthlyIncome) {
      return false;
    }
  
    return true;
  };