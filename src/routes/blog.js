const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const controller = require('../controllers/blog')
const routers = require('express').Router()
// const uploader = require('../config/cloudinary')

routers.post('/',verifyAccessToken, isAdmin, controller.createBlog)
routers.get('/:bid', controller.getBlog)
routers.get('/', controller.getAllBlog)
routers.put('/like/:bid',verifyAccessToken, controller.likeBlog)
routers.put('/dislike/:bid',verifyAccessToken, controller.dislikeBlog)
routers.put('/:bid',[verifyAccessToken, isAdmin], controller.updateBlog)
routers.delete('/:bid',[verifyAccessToken, isAdmin], controller.deleteBlog)

// routers.put('/uploadimage/:bid',[verifyAccessToken, isAdmin], uploader.single('image') , controller.uploadImageBlog)
module.exports = routers