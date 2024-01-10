const express = require('express')
const dbConnect = require('./src/config/dbConnect')
const initRoutes = require('./src/routes')
const cookie = require('cookie-parser')
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 8000
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookie())
app.use(cors({
    origin: process.env.CLIENT_URL || "https://e-commerce-fe-v1.vercel.app/",
    methods: ['POST', 'PUT', 'GET', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: {

    }
}))


dbConnect()
initRoutes(app)

app.use('/', (req, res) => {
    res.req('Server running')
})

app.listen(port, () => {
    console.log('server run at', port)
})