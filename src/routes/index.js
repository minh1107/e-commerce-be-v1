const { notFound, errHandler } = require('../middlewares/errorHandler.')
const userRouter = require('./user')

// Tạo route chung để gán các rout con vào app
const initRoutes = (app) => {
    app.use('/api/v1/user',userRouter)

    app.use(notFound)
    app.use(errHandler)
}

module.exports = initRoutes