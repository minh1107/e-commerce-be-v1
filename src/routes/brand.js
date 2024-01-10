const routers = require('express').Router()
const controller = require('../controllers/brand')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

// router
routers.post('/', [verifyAccessToken, isAdmin] ,controller.createBrand)
routers.get('/', [verifyAccessToken, isAdmin] ,controller.getBrand)
routers.put('/:bid', [verifyAccessToken, isAdmin] ,controller.updateBrand)
routers.delete('/:bid', [verifyAccessToken, isAdmin] ,controller.deleteBrand)

module.exports = routers