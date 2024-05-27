import Services from "./services.model.js"


export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

export const register = async(req, res)=>{
    try {
        let data = req.body
        const existingServices = await Services.findOne({ name: data.name });
        if (existingServices) {
            return res.status(400).send({ message: 'Services already exists' });
        }
        let services = new Services(data)
        await services.save()
        return res.send({message: `Registered succesfully, can be logged with name ${services.name}`})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error registering Services', err: err})
    }
}
