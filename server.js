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
    origin: process.env.CLIENT_URL,
    methods: ['POST', 'PUT', 'GET', 'DELETE', 'PATCH'],
    credentials: true,
}))
app.use(express.static(__dirname)); //here is important thing - no static directory, because all static :)

app.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});
dbConnect()
initRoutes(app)

app.use('/', (req, res) => {
    res.req('Server running')
})

app.listen(port, () => {
    console.log('server run at', port)
})