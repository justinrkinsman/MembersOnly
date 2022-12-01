const { DateTime } = require('luxon')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const PostSchema = new Schema({
    title: { type: String, required: true, minLength: 1, maxLength: 100 },
    post_body: { type: String, required: true, minLength: 1 },
    timestamp: { type: Date, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
})

// Formatted timestamp
PostSchema.virtual("formatted_timestamp").get(function () {
    return DateTime.fromJSDate(this.timestamp).toFormat("MMMM d yyyy', ' h:mm a")
})

PostSchema.virtual("delete_post_url").get(function () {
    return "/delete-post/" + this._id
})

PostSchema.virtual("edit_post_url").get(function () {
    return "/edit-post/" + this._id
})

module.exports = mongoose.model("Post", PostSchema)