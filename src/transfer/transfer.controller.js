import Transfer from "./transfer.model.js"
import Services from '../services/services.model.js'


export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

export const transfer = async (req, res) => {
    try {
        let uid = req.user._id
        let data = req.body 
        
        
    } catch (error) {
        
    }
}

export const buyed = async (req, res) => {
    try {
        let uid = req.user._id
        let data = req.body 
        


    } catch (error) {
        
    }
}
