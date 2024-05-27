import mongoose from "mongoose"

const accountsSchema = mongoose.Schema({
    availableBalance: {
        type: Number,
        required: true
    },
    creationDate: {
        type: Date,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    accountNumber: {
        type: Number,
        required: true
    },  
    favorite: {
        type: Boolean,
        default: false,
        required: true
    }
})

export default mongoose.model('accounts', accountsSchema)