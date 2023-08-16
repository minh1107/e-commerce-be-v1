const express = require('express')
require('dotenv')

const app = express()
const port = process.env.PORT || 8000
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/', (req, res) => {
    res.req('Server running')
})

app.listen(port, () => {
    console.log('server run at', port)
})