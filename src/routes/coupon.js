const routers = require('express').Router()
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const controller = require('../controllers/coupon')

routers.post('/',[verifyAccessToken, isAdmin] ,controller.createCoupon)
routers.get('/:cid',[verifyAccessToken] ,controller.getCoupon)
routers.get('/',[verifyAccessToken] ,controller.getAllCoupons)
routers.put('/:cid',[verifyAccessToken,isAdmin] ,controller.updateCoupons)
routers.delete('/:cid',[verifyAccessToken,isAdmin] ,controller.deleteCoupon)

module.exports = routers