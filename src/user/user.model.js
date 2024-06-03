import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    DPI: {
        type : Number,
        unique: true,
        minLength: 13,
        maxLength: 13,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        minLength: 8,
        maxLength: 8,
        required: true
    },
    email: {
        type: String,
        required: true
    }, 
    password: {
        type: String,
        minLength: [8, 'Password must be 8 characters'],
        required: true
    },
    nameOfWork: {
        type: String,
        required: true
    },
    monthlyIncome: {
        type: Number,
        minLength: 101,
        required: true
    },
    imgProfile: {
        type: String,
        required: false
    },
    role: {
        type: String,
        uppercase: true,
        enum: ['ADMIN', 'CLIENT'],
        required: true
    }
})

export default mongoose.model('user', userSchema)