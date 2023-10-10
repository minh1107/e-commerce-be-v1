const routers = require('express').Router()
const controller = require('../controllers/insertData')

routers.post('/product' , controller.insertProduct)
routers.post('/productcategory' ,controller.insertCategoryProduct)


module.exports = routers