const express= require('express');
const router = express.Router()
const Post= require('../models/Posts')
const path= require('path')
const fs = require('fs');         
const uploadFile = require('../Middleware/upload')
const verifyToken = require('../Middleware/Auth')
const User= require('../models/User')
const mongoose = require('mongoose')
 

require('dotenv').config()
// GET private post routes


router.get('/profile',verifyToken, async (req, res,) =>{
    try {
        const post = await Post.find({ user : req.userId }).populate('user',['username'])
        res.json(post)
    } catch (error) {
        console.log(error)
        res.status(404).json({success: false,message:'not found posts'})
    }
})


/// Route create posts 
/// access private 
router.post('/create',[verifyToken,uploadFile.single('thumb')], async (req, res)=>{
    console.log(req.file)
    
    const {title,status,description,rate,thumb,like}= req.body

    let existingUser;
    try{
        existingUser = await User.findById(req.userId)
    }
    catch(err){ 
        return console.log(err)
    }
    if(!existingUser){
        return res.status(404).json({message:'can not find user'})
    }
    try {
        const newPost= new Post({
            title,
            status,
            description,
            rate,
            thumb:
            req.file.path.split('\\').slice(1).join('/'),
            // {
            //     contentType: 'image/png',
            //     data: fs.readFileSync(path.join('./src/uploads/' + req.file.filename),{encoding:'utf8', flag:'r'}),
            // },
            like,
            user:req.userId
    
        })
        const session = await mongoose.startSession()
        session.startTransaction()
        await newPost.save({session})
        existingUser.posts.push(newPost)
        await existingUser.save({session})
        await session.commitTransaction()
        res.json({success:true,message:"created successfully" ,post : newPost} )
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:'create new post failed'})
    }
})


/// update post private


router.put('/update/:id',[verifyToken,uploadFile.single('thumb')], async (req, res) => {
    const {title,status,description,rate,like}= req.body
    let updatePost
    (req.file ?
        ( updatePost = {
            title,
            status,
            description,
            rate,
            thumb:
            // {
                    // contentType: 'image/png',
                    // data: fs.readFileSync(path.join('./src/uploads/' + req.file.filename),{encoding:'utf8', flag:'r'}),
                // },
            req.file.path.split('\\').slice(1).join('/'),
            like,
            user:req.userIds
        }) :
    ( updatePost={
            title,
            status,
            description,
            rate,
            like,
            user:req.userId
        }))
    try {


        const updateCondition = {_id : req.params.id,user: req.userId}
           updatePost = await Post.findByIdAndUpdate(updateCondition,updatePost,{new:true})
        // User not Authorized or post not foundation
        if(!updatePost){
            return res.status(404).json({success:false,message:'update failed because user not authorized or post not found'})
        }
        res.json({success:true,message:'update successful',post: updatePost})
    }catch(err){
        console.log(err);
        res.status(500).json({success:false, message:'update failed'})
    }})

module.exports = router




// DELETE post private

router.delete('/delete/:id',verifyToken, async (req, res)=>{
    const deleteCondition = {_id : req.params.id,user: req.userId}
    try{
        
        const deletedPost = await Post.findByIdAndDelete(deleteCondition)
        if(!deletedPost){
            return res.status(401).json({success:false, message:'not found post'})
        }
        res.json({success:true, message:'deleted post successfully'})
    }catch(error){
        console.log(err);
        res.status(400).json({success:false, message:'delete failed'})
    }

})