const routers = require('express').Router()
const controller = require('../controllers/productCategory')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

routers.post('/', [verifyAccessToken, isAdmin] ,controller.createCategory)
routers.get('/', controller.getCategories)
routers.put('/:pcid', [verifyAccessToken, isAdmin] ,controller.updateCategory)
routers.delete('/:pcid', [verifyAccessToken, isAdmin] ,controller.deleteCategory)

module.exports = routers