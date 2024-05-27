import mongoose from "mongoose"

const motionSchema = mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    amount:{
        type:Number,
        required:true
    },
    dateAndHour:{
        type:Date,
        default:Date.now,
        required:true
    },
    acount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"accounts",
        required:true
    }
})

export default mongoose.model('motion', motionSchema)