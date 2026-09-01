const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema ({
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'superAdmin'],
        default: 'user'
    }
});

// Only one account can hold the top-level role, including if two first-user
// registration requests arrive at nearly the same time.
userSchema.index(
    { role: 1 },
    { unique: true, partialFilterExpression: { role: 'superAdmin' } }
);

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
