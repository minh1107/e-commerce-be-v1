const controller = require('../controllers/product')
const routers = require('express').Router()
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploadCloud = require('../config/cloudinary')

routers.post('/ratings', verifyAccessToken, controller.rating)
routers.put('/ratings', verifyAccessToken, controller.rating)
routers.post('/', [verifyAccessToken, isAdmin], uploadCloud.fields([{name: 'images', maxCount: 10},{name: 'thumb', maxCount: 1}]), controller.createProduct)
routers.get('/:pid', controller.getProduct)
routers.get('/', controller.getAllProducts)
routers.put('/:pid', [verifyAccessToken, isAdmin],uploadCloud.fields([{name: 'images', maxCount: 10},{name: 'thumb', maxCount: 1}]), controller.updateProduct)
routers.put('/uploadimage/:pid', [verifyAccessToken, isAdmin], uploadCloud.array('images', 10), controller.uploadImageProduct)
routers.delete('/:pid', [verifyAccessToken, isAdmin], controller.deleteProduct)


module.exports = routers