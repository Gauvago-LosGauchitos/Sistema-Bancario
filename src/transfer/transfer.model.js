import mongoose from "mongoose"

const transferSchema = mongoose.Schema({
    date :{
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    rootAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accounts',
        required: true
    },
    recipientAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accounts',
        required: true
    }
})

export default mongoose.model('transfer', transferSchema)