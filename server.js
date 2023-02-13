// type "npm run devStart" to run the server

const express = require('express')
const { default: mongoose } = require('mongoose')
const app = express()
const Video = require('./videos')
require('dotenv').config();
const {google} = require('googleapis')
const e = require('express')


/* this part initialises the Database where the reults from the 
Youtube Data api are stored */

mongoose.connect('mongodb://localhost/pagination')
const db = mongoose.connection
db.once('open', async ()=>{
    db.dropDatabase()
    if(await Video.countDocuments().exec() > 0) return

    console.log("db update")
    youtubeCall()
})

// API endpoint. the API call can be found in the request.rest file: 
// Do install a REST Client in youe code IDE to easily check responses from databse function
// GET http://localhost:3000/videos?page=2&limit=6
app.get('/videos', (req,res)=>{
    let result = paginatedResults(Video, req);
    while(result.length === 0)  
    result = paginatedResults
    // while(res.paginatedResults.length === 0) {
    //     res.paginatedResults = paginatedResults(Video);
    // }
    res.json(res.paginatedResults)
})

/* this function gives sliced results based on parameters from the request */
function paginatedResults(model, req){
    return async (req,res, next)=>{
        const page = parseInt(req.query.page)
    const limit = req.query.limit

    const startIndex = (page-1)*limit
    const endIndex = page*limit

    const results = {}

    results.next = {
        page: page + 1,
        limit:limit
    }

    results.prev = {
        page: page - 1,
        limit:limit
    }

    try{
        results.results = await model.find().limit(limit).skip(startIndex).exec()
        res.paginatedResults = results
        next()
    }catch(e){
        res.status(500).json({message: e.message})
    }

    }
}

/* this function calls the youtube data API at intervals of 10s as requested
   it also stores the next token with each call to use youtube API's pagination 
   feature. This is called in the DB code above and the data is stored in the database*/

function youtubeCall(){
    let count = 0
    let next_token = ''

    setInterval(() => {
        google.youtube('v3').search.list({
            key: process.env.YOUTUBE_TOKEN,
            part: 'snippet',
            q: 'Shubhman',
            maxResults: 10,
            order: 'date',
            pageToken: next_token
        }).then((response)=>{
            console.log(response)
            const {data} = response
            next_token = data.nextPageToken
            data.items.forEach(item=>{
                console.log(`Title: ${item.snippet.title}\nDescription: ${item.snippet.description}\n`)
                Video.create({name:item.snippet.title, 
                    description:item.snippet.description, 
                    thumbUrl: item.snippet.thumbnails.default.url,
                    pageno: Math.floor((count/10)) + 1
                })
                ++count
            })
        }).catch((err)=> console.log(err))
    }, 10000);
    
}

app.listen(3000)
