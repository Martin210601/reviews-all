const express = require('express');
const router = express.Router()
const User = require('../models/User')
const argon2 = require('argon2');
const jwt = require('jsonwebtoken')
const verifyToken = require('../Middleware/Auth')

require('dotenv').config()


// GET api/auth public
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password')
        if (!user) return res.status(400).json({ success: false, message: 'not found user login' })
        res.json({ success: true, user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'internal server error' })
    }
})




// POST api/auth/register
// desc Register user

router.post('/register', async (req, res) => {
    const { username, password } = req.body


    //simple validation
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'missing username or password' })
    } else {

        try {
            const user = await User.findOne({ username })
            if (user) {

                return res.status(400).json({ success: false, message: 'username already taken 1' })
            } else {

                // new user is already
                const hashedPassword = await argon2.hash(password)
                const newUser = new User({ username, password: hashedPassword, posts: [] })
                await newUser.save()

                ///return tokens
                const accessToken = jwt.sign({ userId: newUser._id }, process.env.ACCESS_TOKEN_SECRET)
                return res.json({ success: true, message: 'create new user successfully', accessToken })
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: 'create new user failed' })
        }
    }
})



// POST api/auth/login
// desc Login user

router.post('/login', async (req, res, next) => {
    const { username, password } = req.body
    if (!username || !password) {
        return
        res.status(400).json({ success: false, message: 'Invalid username or password' })
    } else {
        try {
            //check user
            const user = await User.findOne({ username })
            if (!user) return res.status(400).json({ success: false, message: 'Incorrect username ' })

            //check password
            const passwordValid = await argon2.verify(user.password, password)
            if (!passwordValid) return res.status(400).json({ success: false, message: 'Incorrect  password' })
            // password valid   
            const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET)
            return res.json({ success: true, message: 'login successfully', accessToken })

        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: 'login user failed' })
        }
    }
})

module.exports = router
