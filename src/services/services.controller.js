import Services from "./services.model.js"
import { checkUpdateS } from "../utils/validator.js"

//testeo
export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

export const defaultServices = async (req, res) => {
    try {
        const defaultServicesExist = await Services.findOne({ name: 'default' });

        if (defaultServicesExist) {
        } else {
            const defaultData = {
                name: 'default',
                description: 'default',
                price: 500
            };
            const defaultServices = new Services(defaultData);
            await defaultServices.save();
        }

        const servicesDefault = [
            'Depositos',
            'Transferencia',
            'Préstamos'
        ];

        const existingServices = await Services.find({ name: { $in: servicesDefault } });
        const existingServiceNames = new Set(existingServices.map(cat => cat.name));
        const newServices = servicesDefault.filter(name => !existingServiceNames.has(name));
        const newServicesPromises = newServices.map(name => Services.create({ name: name, description: 'en linea', price: 500 }));
        await Promise.all(newServicesPromises);

        console.log('Services categories created');
    } catch (err) {
        console.error(err);
    }
}

//Register
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

//Listar
export const listarServices = async (req, res) => {
    try {
        // el select es para selecionar que quiero que me muestre y que no :v
        let data = await Services.find().select('name description price -_id');
        return res.send({ data });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'The information cannot be obtained.' });
    }
}


//Eliminar
export const deleteS = async(req, res)=>{
    try {
        let { id } = req.params;
        let deletedServices = await Services.findOneAndDelete({_id: id});
        if(!deletedServices) return res.status(404).send({message: 'Services not found and not deleted'}); 
        return res.send({message: `Services with name ${deletedServices.name} deleted successfully`});
    } catch (err) {
        console.error(err);
        return res.status(500).send({message: 'Error deleting services'});
    }
}


//Actualizar
export const updateS = async(req, res)=>{
    try {
        let { id } = req.params
        let data = req.body
        let update = checkUpdateS(data, id)
        if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be updated'})
        let updatedServices = await Services.findOneAndUpdate(
            {_id: id},
            data,
            {new: true}
        ).select('name description price -_id');
        if(!updatedServices) return res.status(404).send({message: 'Services not found and not updated'})
        return res.send({message: 'Services updated', updatedServices})    
    } catch (err) {
        console.error(err)
        //if(err.keyValue && err.keyValue.name) return res.status(400).send ({message: `Services ${err.keyValue.name} is already token`})
        return res.status(500).send({message: 'Error updating product'})
    }
}

//Buscar
export const search = async (req, res) => {
    try {
        let { search } = req.body
        let services = await Services.find({ name: { $regex: search, $options: 'i' } }).select('name description price -_id');
        if (services.length === 0) {
            return res.status(404).send({ message: 'Services not found' });
        }
        return res.send({ message: 'Services found', services });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error searching services', err: err });
    }
}
