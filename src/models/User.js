const mongoose= require('mongoose')
const Schema = mongoose.Schema


const UserSchema = new Schema({
    username:{
        type: String,
        required:true,
        unique:true
    },
    password:{
        type: String,
        required:true,
        minlength:6,
    },
    posts:[
        {type:mongoose.Types.ObjectId,ref:'posts'}
    ],
    createdAt: {
        type: Date,
        default:Date.now()
        
    }
})


module.exports= mongoose.model('users',UserSchema )