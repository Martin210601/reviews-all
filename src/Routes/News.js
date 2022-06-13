const express= require('express');
const router = express.Router()
const Post= require('../models/Posts')



/// GET all posts 

router.get('/all',async  (req, res, next)=>{
    try {
        const posts= await Post.find({}).populate('user',['username'])
        res.json({success:true,posts})
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:'no post found'})
    }
})


module.exports = router