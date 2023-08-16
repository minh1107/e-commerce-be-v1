const express = require('express')
const dbConnect = require('./src/config/dbConnect')
const initRoutes = require('./src/routes')
require('dotenv').config()


const app = express()
const port = process.env.PORT || 8000
app.use(express.json())
app.use(express.urlencoded({extended: true}))
dbConnect()
initRoutes(app)

app.use('/', (req, res) => {
    res.req('Server running')
})

app.listen(port, () => {
    console.log('server run at', port)
})