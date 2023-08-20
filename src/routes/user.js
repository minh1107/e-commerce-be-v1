const router = require('express').Router()
const controller = require('../controllers/user')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/register', controller.register)
router.get('/finalregister/:token', controller.finalRegister)
router.post('/login', controller.login)
router.get('/getcurrent',verifyAccessToken ,controller.getCurrent)
router.post('/refreshtoken', controller.refreshAccessToken)
router.post('/logout', verifyAccessToken, controller.logout)
router.post('/forgotpassword', controller.forgotPassword)
router.get('/resetpassword', controller.resetPassword)
router.get('/alluser', [verifyAccessToken, isAdmin], controller.getAllUser) 
router.get('', [verifyAccessToken, isAdmin ], controller.getUser)
router.delete('', [verifyAccessToken, isAdmin ], controller.deleteUser)
router.put('/updatecurrent', verifyAccessToken, controller.updateUser)
router.put('/updatebyadmin/:uid', [verifyAccessToken, isAdmin], controller.updateByAdminUser)


module.exports = router

