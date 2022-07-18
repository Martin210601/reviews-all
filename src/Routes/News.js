const express = require('express');
const router = express.Router()
const Post = require('../models/Posts')



/// GET all posts 

const PAGE_SIZE = 6
router.get('/all', async (req, res, next) => {
    const page = req.query.page
    if (page) {
        let pageNumber = parseInt(page)
        if (pageNumber < 1) {
            pageNumber = 1
        }
        const skipPost = (pageNumber - 1) * PAGE_SIZE
        try {
            const posts = await Post.find({}).sort({ createdAt: -1 }).skip(skipPost).limit(PAGE_SIZE).populate('user', ['username'])
            let totalPost = await Post.countDocuments()
            totalPost > 0 ? totalPost : totalPost = 1
            res.json({ success: true, posts, totalPost })
            next()
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: 'no post found' })
        }
    } else {
        try {
            const posts = await Post.find({}).sort({ createdAt: -1 }).populate('user', ['username'])
            res.json({ success: true, posts })
            next()
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: 'no post found' })
        }
    }

})


module.exports = router