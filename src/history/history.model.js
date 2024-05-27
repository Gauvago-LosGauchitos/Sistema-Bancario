import mongoose from "mongoose"

const historySchema = mongoose.Schema({
    transfer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transfer",
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    }
})

export default mongoose.model('history', historySchema)