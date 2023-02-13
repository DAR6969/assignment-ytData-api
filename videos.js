const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

// this is the database schema
const videoSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: false
    },
    thumbUrl:{
        type: String,
        required: true
    },
    pageno:{
        type: Number,
        index: true,
        required: true
        
    }
})

module.exports = mongoose.model('Video', videoSchema)