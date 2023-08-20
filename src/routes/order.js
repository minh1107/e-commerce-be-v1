const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const routers = require('express').Router()
const controller = require('../controllers/order')

routers.post('/', [verifyAccessToken], controller.createOrder)
routers.put('/:oid', [verifyAccessToken, isAdmin], controller.updateStatus)
routers.get('/:oid', [verifyAccessToken], controller.getStatus)
routers.get('/', [verifyAccessToken, isAdmin], controller.getAllStatus)

module.exports = routers