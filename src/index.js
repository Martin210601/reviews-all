const express= require('express');
require('dotenv').config()
const path = require('path');
var bodyParser = require('body-parser')
const mongoose = require('mongoose')
const AuthRouter = require('../src/Routes/Auth')
const PostRouter = require('../src/Routes/Post')
const NewsRouter = require('../src/Routes/News')
const app = express();
app.get('/', (req, res)=>{
    res.send('hello world')
})
 
// connectDB

const connectDB = async ()=>{
    try {
        await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@reviewsall.2rbm2.mongodb.net/?retryWrites=true&w=majority`,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        console.log('done')
    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
}
connectDB()

//PORT
const PORT=5000
//

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'uploads')));
// app.use('/uploads',express.static('upload'))
app.use(express.json())
app.use(bodyParser.json())
app.use('/api/auth',AuthRouter)
app.use('/api/post',PostRouter)
app.use('/news',NewsRouter)


app.listen(PORT,()=>console.log(`Server started on port ${PORT}`))
