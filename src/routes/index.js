const routerUser = require('./user')
const routerProduct = require('./product')
const routerProductCategory = require('./productCategory')
const routerBlogCategory = require('./blogCategory')
const routerBlog = require('./blog')
const errorHandler = require('../middlewares/errorHandler.')
const routerBrand = require('./brand')
const routerCoupon = require('./coupon')
const routerOrder = require('./order')
const routerInser = require('./insert')

const initRouters = (app) => {
    app.use('/api/v1/user', routerUser)
    app.use('/api/v1/product', routerProduct)
    app.use('/api/v1/productCategory', routerProductCategory)
    app.use('/api/v1/BlogCategory', routerBlogCategory)
    app.use('/api/v1/blog', routerBlog)
    app.use('/api/v1/brand', routerBrand)
    app.use('/api/v1/coupon', routerCoupon)
    app.use('/api/v1/order', routerOrder)
    app.use('/api/v1/insert', routerInser)

    app.use(errorHandler.notFound)
    app.use(errorHandler.errHandler)
}

module.exports = initRouters