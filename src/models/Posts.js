const mongoose= require('mongoose')
const Schema = mongoose.Schema


const PostSchema = new Schema({
    title:{
        type: String,
        required: true,

    },
    status: {
        type: String,
        required: true,
        enum:['Du lịch','Ăn uống']
    },
    description: {
        type: String,
        required: true,
    },
    rate: { 
        type:Number,
        require:true
    },
    thumb:{
        type:String,
        require: true
        // data:Buffer,
        // ContentType: String
    },
    like: {
        type:Number,
        default:0
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:'users'
    }

})


module.exports= mongoose.model('posts',PostSchema )