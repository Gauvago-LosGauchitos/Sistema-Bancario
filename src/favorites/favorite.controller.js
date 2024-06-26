import Favorite from "./favorite.model.js"
import Account from '../account/accounts.model.js';
import User from '../user/user.model.js';  
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
        const uid = req.user._id
        console.log(data)

        if (!data.alias || !data.accountFavorite ) {
            return res.status(400).send({ message: 'Cuenta favorita y usuario son obligatorios' })
        }

        // Verificar si la combinación de cuenta favorita y usuario ya existe
        const existingFavorite = await Favorite.findOne({
            accountFavorite: data.accountFavorite,
            user: uid
        })

        if (existingFavorite) {
            return res.status(400).send({ message: 'El favorito ya existe para este usuario y cuenta' })
        }

        let favorite = new Favorite({
            alias: data.alias,
            accountFavorite: data.accountFavorite,
            user: uid
        })
        await favorite.save()

        return res.send({ message: `Guardado en favoritos al usuario ${favorite.alias}` })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: 'Error registro favorito' })
    }
}


//Eliminar
export const deleteF = async(req, res) => {
  try {
      const { id } = req.params;
      let deletedFavorite = await Favorite.findOneAndDelete({_id: id});
      if(!deletedFavorite) return res.status(404).send({message: 'Favorito no encontrado y no eliminado'}); 
      return res.send({message: `Favorito con nombre ${deletedFavorite.alias} eliminado exitosamente`});
  } catch (err) {
      console.error(err);
      return res.status(500).send({message: 'Error al eliminar el favorito'});
  }
}

//Listar
export const obtener = async (req, res) => {
  try {
    const userId = req.user._id

    // Buscar todos los favoritos asociados al usuario
    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: 'accountFavorite',
        select: 'accountNumber',  
          populate: {
            path: 'client',  // Populate para obtener el usuario asociado a la cuenta
            select: 'imgProfile'  
          }
      })
      .select('-__v');  

    if (!favorites || favorites.length === 0) {
      return res.status(404).json({ message: 'No se encontraron favoritos para este usuario' });
    }

    return res.status(200).json(favorites);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener favoritos', error: error.message });
  }
};



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