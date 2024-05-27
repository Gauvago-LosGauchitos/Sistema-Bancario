import mongoose from "mongoose"

const favoriteSchema = mongoose.Schema({
    alias:{
        type:String,
        required:true
    },
    accountFavorite:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'accounts',
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    }
})

export default mongoose.model('favorite', favoriteSchema)