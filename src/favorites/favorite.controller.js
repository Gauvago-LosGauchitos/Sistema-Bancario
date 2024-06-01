import Favorite from "./favorite.model.js"
import {checkUpdateF} from '../utils/validator.js'

//testeo
export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

//Register
export const register = async(req, res) => {
    try {
        let data = req.body
        if (!data.alias || !data.accountFavorite || !data.user) {
            return res.status(400).send({ message: 'Cuenta favorita y usuario son obligatorios' })
        }

        // Verificar si la combinación de cuenta favorita y usuario ya existe
        const existingFavorite = await Favorite.findOne({
            accountFavorite: data.accountFavorite,
            user: data.user
        })

        if (existingFavorite) {
            return res.status(400).send({ message: 'El favorito ya existe para este usuario y cuenta' })
        }

        let favorite = new Favorite(data)
        await favorite.save()

        return res.send({ message: `Registrado exitosamente, se puede registrar con alias ${favorite.alias}` })
    } catch (err) {
        return res.status(500).send({ message: 'Error registro favorito', err: err })
    }
}


//Eliminar
export const deleteF = async(req, res)=>{
    try {
        let { id } = req.params;
        let deletedFavorite = await Favorite.findOneAndDelete({_id: id});
        if(!deletedFavorite) return res.status(404).send({message: 'Favorito no encontrada y no eliminada'}); 
        return res.send({message: `Favorito con nombre  ${deletedFavorite.alias} eliminado exitosamente`});
    } catch (err) {
        console.error(err);
        return res.status(500).send({message: 'Error al eliminar a favorite'});
    }
}

//Listar
export const obtener = async (req, res) => {
    try {
        const favorites = await Favorite.find().populate('user', 'name').populate('accountFavorite', 'accountNumber').select('-__v').select('-_id');
        if (!favorites || favorites.length === 0) {
            return res.status(404).json({ message: 'No se encontraron favoritos' })
        }
        return res.status(200).json(favorites)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener favoritos', error: error.message })
    }
}


//Update

export const UpdateF = async (req, res) => {
    try{
        let {id} = req.params
        let data = req.body
        let update = checkUpdateF(data, id)
        if(!update) return res.status .send({message: `Favorito actualizado exitososamente`})
        let  updateFavorite = await Favorite.findOneAndUpdate(
            {_id: id},
            data,
            {new: true}
        )
        if(!updateFavorite) return res.status(404).send({ message: `Favorito c no encontrado`})
        return res.send({message: `Favorito actualizado exitoso`})
    }   catch(error){
        console.error(error);
        return res.status(500).send({message: 'Error al actualizar favorito', error: error.message})
    }     
}