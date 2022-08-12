const mongoose = require('mongoose')
var slug = require('mongoose-slug-generator');
mongoose.plugin(slug);
const Schema = mongoose.Schema


const PostSchema = new Schema({
    title: {
        type: String,
        required: true,

    },
    topic: {
        type: String,
        required: true,
        enum: ['TRAVEL', 'FOOD']
    },
    description: {
        type: String,
        required: true,
    },
    rate: {
        type: Number,
        require: true
    },
    views: {
        type: Number,
        default: 0
    },
    thumb: {
        type: String,
    },
    like: {
        type: Array,
        default: []
    },
    uploadedImages: {
        type: Array,
        default: []
    },
    slug: { type: String, slug: "title", unique: true },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
}, { timestamps: true })


module.exports = mongoose.model('posts', PostSchema)