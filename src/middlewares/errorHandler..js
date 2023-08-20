// Khi không tìm được routes sẽ đi vào hàm này tạo lỗi và nhảy tiếp hàm tiếp theo
const notFound = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`)
    res.status(404)
    next(error)
}

// Nhảy vào hàm này khi có lỗi vì nó bắt lỗi là err 
const errHandler = (err, req, res, next) => {
    const statusCode = res.statusCode == 200 ? 400 : res.statusCode
    return res.status(statusCode).json({
        status: false,
        message: err?.message
    })
}

module.exports = {notFound, errHandler}