import History from "./history.model.js"


export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}
