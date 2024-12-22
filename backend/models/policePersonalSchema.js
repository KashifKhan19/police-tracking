const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const policePersonalSchema = new Schema({
    policeOfficerId: {
        type: Number,
        required: true,
        unique: true
    },
    cnic: {
        type: Number,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    location: {
        cords: {
            type: [Number],
        }
    },
    image: {
        type: Buffer
    },
    stationName: {
        type: String,
        required: true
    },
});

// Hashing the password
policePersonalSchema.pre('save', function(next) {
    const user = this;
    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

// Compare password method
policePersonalSchema.methods.comparePassword = function(candidatePassword) {
    const user = this;
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
            if (err) reject('Error comparing passwords');
            if (!isMatch) reject('Passwords do not match');
            resolve(true);
        });
    });
};

// Register the model
mongoose.model('PolicePersonal', policePersonalSchema);
