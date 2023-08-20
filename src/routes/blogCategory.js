const routers = require('express').Router()
const controller = require('../controllers/blogCategory')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

routers.post('/', [verifyAccessToken, isAdmin] ,controller.createCategory)
routers.get('/', [verifyAccessToken, isAdmin] ,controller.getCategories)
routers.put('/:bcid', [verifyAccessToken, isAdmin] ,controller.updateCategory)
routers.delete('/:bcid', [verifyAccessToken, isAdmin] ,controller.deleteCategory)

module.exports = routers