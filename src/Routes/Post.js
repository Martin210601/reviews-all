const express = require('express');
const router = express.Router()
const Post = require('../models/Posts')
const path = require('path')
const fs = require('fs');
const uploadFile = require('../Middleware/upload')
const verifyToken = require('../Middleware/Auth')
const { cloudinary } = require('../Middleware/cloudiaryconfig')
const User = require('../models/User')
const mongoose = require('mongoose');


require('dotenv').config()
// GET private post routes

const PAGE_SIZE = 6
router.get('/profile', verifyToken, async (req, res,) => {
    const page = req.query.page
    if (page) {
        let pageNumber = parseInt(page)
        if (pageNumber < 1) {
            let pageNumber = 1
        }
        const skipPost = (pageNumber - 1) * PAGE_SIZE
        try {
            const myPost = await Post.find({ user: req.userId }).sort({ createdAt: -1 }).skip(skipPost).limit(PAGE_SIZE).populate('user', ['username'])
            let totalMyPost = await Post.find({ user: req.userId }).countDocuments()
            res.json({ success: true, myPost, totalMyPost })

        } catch (error) {
            console.log(error)
            res.status(404).json({ success: false, message: 'not found posts' })
        }
    } else {

        try {

            const myPost = await Post.find({ user: req.userId }).populate('user', ['username'])

            res.json({ success: true, myPost, })
        } catch (error) {
            console.log(error)
            res.status(404).json({ success: false, message: 'not found posts' })
        }
    }
})



// LIKE AND DISLIKE POST 

router.put('/:id/like', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        const user = await User.findById(req.userId)
        if (!post.like.includes(req.userId) && !user.like.includes(post._id)) {
            await post.updateOne({ $push: { like: req.userId } })
            await user.updateOne({ $push: { like: post._id } })
            res.status(200).json({ success: true, message: 'LIKE POST SUCCESSFUL', post })

        } else {
            await post.updateOne({ $pull: { like: req.userId } })
            await user.updateOne({ $pull: { like: post._id } })
            res.status(200).json({ success: false, message: 'DISLIKE POST SUCCESSFUL', })
        }
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

// GET USERS POST LIKED

router.get('/favorite', verifyToken, async (req, res) => {
    const page = req.query.page
    if (page) {
        let pageNumber = parseInt(page)
        if (pageNumber < 1) {
            let pageNumber = 1
        }
        const skipPost = (pageNumber - 1) * PAGE_SIZE
        try {
            const user = await User.findById(req.userId)
            if (user) {
                const list = user.like
                const favPost = await Promise.all(
                    list.map(postId => {
                        const postID = postId.toString()
                        return Post.findById(postID).populate('user', ['username'])
                    })
                )

                const favPostLimit = favPost.slice(skipPost, skipPost + PAGE_SIZE)
                const totalFavPost = favPost.length
                // let totalPage = Math.ceil(totalFavPost / PAGE_SIZE)
                // totalPage > 0 ? totalPage : totalPage = 1
                res.status(200).json({ success: true, message: 'DONE', favPostLimit, totalFavPost })
            }
        } catch (error) {
            res.status(500).json({ error: error })
        }
    } else {
        try {
            const user = await User.findById(req.userId)
            if (user) {
                const list = user.like
                const favPost = await Promise.all(
                    list.map(postId => {
                        const postID = postId.toString()
                        return Post.findById(postID).populate('user', ['username'])
                    })
                )
                res.status(200).json({ success: true, message: 'DONE', favPost })
            }
        } catch (error) {
            res.status(500).json({ error: error })
        }
    }

})


/// Route create posts 
/// access private 
router.post('/create', [verifyToken, uploadFile.fields([{ name: 'thumb', maxCount: 1 },
{ name: 'uploadedImages', maxCount: 5 }])],
    async (req, res) => {
        const { thumb, uploadedImages } = req.files
        if (thumb) {
            try {
                var thumbnail
                const result = await cloudinary.uploader.upload(thumb[0].path, {
                    upload_preset: 'uploadimg',
                })
                thumbnail = result.secure_url
            } catch (error) {
                console.log('error', error)
            }
        } else {
            var thumbnail = ''
        }
        if (uploadedImages) {
            try {
                var arrUploadedImages = []
                for (const x in uploadedImages) {
                    const result = await cloudinary.uploader.upload(uploadedImages[x].path, {
                        upload_preset: 'uploadimg'
                    })
                    arrUploadedImages.push(result.secure_url)
                }
            } catch (error) {
                console.log(error)
            }
        } else {
            var arrUploadedImages = []
        }
        const { title, status, description, rate, like, slug, views, } = req.body

        let existingUser;
        try {
            existingUser = await User.findById(req.userId)
        }
        catch (err) {
            return console.log(err)
        }
        if (!existingUser) {
            return res.status(404).json({ message: 'can not find user' })
        }
        try {
            const newPost = new Post({
                title,
                status,
                description,
                rate,
                slug,
                uploadedImages: arrUploadedImages,
                views,
                thumb: thumbnail,
                like,
                user: req.userId

            })
            const session = await mongoose.startSession()
            session.startTransaction()
            await newPost.save({ session })
            existingUser.posts.push(newPost)
            await existingUser.save({ session })
            await session.commitTransaction()
            res.json({ success: true, message: "created successfully", post: newPost })
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: 'create new post failed' })
        }
    })


/// update post private


router.put('/update/:id', [verifyToken, uploadFile.fields([{ name: 'thumb', maxCount: 1 }, { name: 'uploadedImages', maxCount: 5 }])], async (req, res) => {
    const { title, status, description, rate } = req.body
    const { thumb, uploadedImages } = req.files
    if (thumb) {
        try {
            var thumbnail1
            const result = await cloudinary.uploader.upload(thumb[0].path, {
                upload_preset: 'uploadimg',
            })
            thumbnail1 = result.secure_url
        } catch (error) {
            console.log('error', error)
        }
    } else {
        var thumbnail1 = ''
    }
    if (uploadedImages) {
        try {
            var arrUploadedImages1 = []
            for (const x in uploadedImages) {
                const result = await cloudinary.uploader.upload(uploadedImages[x].path, {
                    upload_preset: 'uploadimg'
                })
                arrUploadedImages1.push(result.secure_url)
            }
        } catch (error) {
            console.log(error)
        }
    } else {
        var arrUploadedImages1 = []
    }
    let updatePost
    (req.files ?
        (updatePost = {
            title,
            status,
            description,
            rate,
            uploadedImages: arrUploadedImages1,
            thumb: thumbnail1,
            user: req.userId
        }) :
        (updatePost = {
            title,
            status,
            description,
            rate,
            user: req.userId
        }))
    try {


        const updateCondition = { _id: req.params.id, user: req.userId }
        updatePost = await Post.findByIdAndUpdate(updateCondition, updatePost, { new: true })
        // User not Authorized or post not foundation
        if (!updatePost) {
            return res.status(404).json({ success: false, message: 'update failed because user not authorized or post not found' })
        }

        res.json({ success: true, message: 'update successful', post: updatePost })

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'update failed' })
    }
})





// DELETE post private

router.delete('/delete/:id', verifyToken, async (req, res) => {
    const deleteCondition = { _id: req.params.id, user: req.userId }
    try {
        const user = await User.findById(req.userId)
        await user.updateOne({ $pull: { like: req.params.id, posts: req.params.id } })
        const deletedPost = await Post.findByIdAndDelete(deleteCondition)
        if (!deletedPost) {
            return res.status(401).json({ success: false, message: 'not found post' })
        }
        res.json({ success: true, message: 'deleted post successfully' })
    } catch (error) {
        console.log(error);
        res.status(400).json({ success: false, message: 'delete failed' })
    }

})


// get post info

router.get('/:slug', async (req, res) => {
    try {
        const postInfo = await Post.findOne({ slug: req.params.slug })
        await postInfo.updateOne({ $inc: { views: 1 } })
        if (postInfo) {
            res.json({ success: true, message: 'Get post information successfully', postInfo })
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({ success: false, message: 'Not found post' })
    }
})
module.exports = router
