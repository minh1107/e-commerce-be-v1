const routerUser = require('./user')
const errorHandler = require('../middlewares/errorHandler.')

const initRouters = (app) => {
    app.use('/api/v1/user', routerUser)

    app.use(errorHandler.notFound)
    app.use(errorHandler.errHandler)
}

module.exports = initRouters