import Services from "./services.model.js"
import { checkUpdateS } from "../utils/validator.js"
import fs from 'fs';
import { upload } from '../utils/multerConfig.js';

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
            'Seguro de vida',
            'Asesoria financiera',
            'Dolares'
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
export const register = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);

        let data = req.body;

        const existingServices = await Services.findOne({ name: data.name });
        if (existingServices) {
            return res.status(400).send({ message: 'Service already exists' });
        }

        // Procesa la imagen si está presente
        if (req.file) {
            console.log('Archivo recibido:', req.file);

            // Lee el archivo de imagen y conviértelo a base64
            const imageData = fs.readFileSync(req.file.path);
            const base64Image = Buffer.from(imageData).toString('base64');
            const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

            // Agrega la URL de la imagen a los datos del servicio
            data.img = imageUrl;

            // Elimina el archivo temporal actual
            fs.unlinkSync(req.file.path);
        } else {
            console.log('No se recibió archivo');
        }

        let service = new Services(data);
        await service.save();

        return res.send({ message: `Registered successfully, service: ${service.name}`, service });
    } catch (error) {
        console.error('Error interno:', error);
        return res.status(500).send({ message: 'Internal server error', err: error });
    }
};


//Listar
export const listarServices = async (req, res) => {
    try {
        // el select es para selecionar que quiero que me muestre y que no :v
        let data = await Services.find().select('name description price -_id img');
        return res.send({ data });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'The information cannot be obtained.' });
    }
}


//Eliminar
export const deleteS = async(req, res)=>{
    try {
        let { name } = req.body; 
        console.log(name)

        const service = Services.findOne({name: name})
        const previousImagePath = service.img;
        if (previousImagePath  && fs.existsSync(previousImagePath)) {
            fs.unlinkSync(previousImagePath);
        }

        let deletedServices = await Services.findOneAndDelete({name: name});
        
        if(!deletedServices) return res.status(404).send({message: 'Services not found and not deleted'}); 
        return res.send({message: `Services with name ${deletedServices.name} deleted successfully`});
    } catch (err) {
        console.error(err);
        return res.status(500).send({message: 'Error deleting services'});
    }
}


//Actualizar
export const updateS = async (req, res) => {
    try {
        let { name } = req.params;
        let data = req.body;
        console.log(data);
        console.log(name);
        
        // Verificar que el servicio existe
        let service = await Services.findOne({ name: name });
        if (!service) return res.status(404).send({ message: 'Service not found' });
        // Verificar si hay datos que no se pueden actualizar
        let update = checkUpdateS(data, name);
        if (!update) return res.status(400).send({ message: 'Some data cannot be updated' });

        // Manejo de imagen si se recibe un archivo
        if (req.file) {
            upload.single('img')(req, res, async (err) =>{
                if (err) {
                    return res.status(400).send({ message: err.message });
                }
                console.log('Archivo recibido:', req.file);

            const previousImagePath = service.img;

            // Lee el archivo de imagen y conviértelo a base64
            const imageData = fs.readFileSync(req.file.path);
            const base64Image = Buffer.from(imageData).toString('base64');
            const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

            // Agrega la URL de la imagen a los datos del servicio
            data.img = imageUrl;

            if (previousImagePath && fs.existsSync(previousImagePath)) {
                fs.unlinkSync(previousImagePath);
            }

            })
            
        }

        // Actualizar el servicio
        let updatedService = await Services.findOneAndUpdate(
            { name: name },
            data,
            { new: true }
        ).select('name description price img -_id');

        if (!updatedService) return res.status(404).send({ message: 'Service not found and not updated' });

        return res.send({ message: 'Service updated', updatedService });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error updating service' });
    }
};

//Buscar
export const search = async (req, res) => {
    try {
        let { search } = req.body
        let services = await Services.find({ name: { $regex: search, $options: 'i' } }).select('name description price -_id img');
        if (services.length === 0) {
            return res.status(404).send({ message: 'Services not found' });
        }
        return res.send({ message: 'Services found', services });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error searching services', err: err });
    }
}

//Buscar por medio del nombre del servicio
export const searchByName = async (req, res) => {
    try {
        const {name} = req.body
        console.log(name)

        if(!name){
            return res.status(400).send({message: 'Name is required'})
        }

        const service = await Services.findOne({name});
        if(!service){
            return res.status(404).send({message: 'Service not found'})
        }

        return res.send({service})
        
    } catch (error) {
        console.error(err);
        return res.status(500).send({ message: 'Error searching service', err: err });
        
    }
}
