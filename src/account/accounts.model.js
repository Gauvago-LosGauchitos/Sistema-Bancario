import mongoose from "mongoose";

const accountsSchema = new mongoose.Schema({
    availableBalance: {
        type: Number,
        required: true,
        min: [0, 'El balance disponible no puede ser negativo.']
    },
    creationDate: {
        type: Date,
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    accountNumber: {
        type: Number,
        unique: true,
        minlength: [10, 'El número de cuenta debe tener al menos 10 dígitos.'],
        maxlength: [20, 'El número de cuenta no puede tener más de 20 dígitos.']
    },
    favorite: {
        type: Boolean,
        default: false
    }
});

// esto hace que genere la cuenta aleatoriamente
accountsSchema.pre('validate', async function(next) {
    if (!this.isNew) {
        return next();
    }
    try {
        let accountNumber;
        let exists = true;
        while (exists) {
            //esto que genere una cuenta de 10 numeros
            accountNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
            //esto mira si el numero de cuenta ya existe
            exists = await mongoose.models.accounts.findOne({ accountNumber });
        }
        //esto hace que le asigne el numero de cuenta
        this.accountNumber = accountNumber;
        next();
    } catch (err) {
        next(err);
    }
});

export default mongoose.model('accounts', accountsSchema);
