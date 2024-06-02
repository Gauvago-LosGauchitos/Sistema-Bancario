import mongoose from "mongoose"

const transferSchema = mongoose.Schema({
    date :{
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
    },
    rootAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accounts',
    },
    recipientAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accounts'
    },
    motion:{
        type: String,
        enum:['TRANSFER', 'BUYED','DEPOSIT'],
        uppercase: true,
        required: true
    },
    services:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'services',
    }
})

export default mongoose.model('transfer', transferSchema)