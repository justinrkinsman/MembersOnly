const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new Shcema({
    first_name: { type: String, required: true, minLength: 1, maxLength: 100 },
    last_name: { type: String, required: true, minLength: 1, maxLength: 100 },
    username: {type: String, required: true},
    password: {type: String},
    membership: {type: Boolean},
})

// Virtual for user's full name
UserSchema.virtual("full_name").get(function () {
    return `${first_name} ${last_name}`
})

module.exports = mongoose.model("User", UserSchema)