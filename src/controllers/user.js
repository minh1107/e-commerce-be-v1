const User = require("../modules/user");
const asyncHandler = require('express-async-handler')

// Đăng ký tài khoản
const register = asyncHandler( async(req, res) => {
    // Lấy thông tin người dùng từ body request
    const {email, passwrod, firstname, lastname, mobile} = req.body

    // Không có thông tin
    if(!(email || passwrod || firstname || lastname || mobile)) 
    return res.status(400).json({
        status: false,
        message: 'Missing input'    
    })
    // Tạo với data request gửi về bằng body
    const response = await User.create(req.body)
    // Trả về responsve
    return res.status(201).json({
        status: true,
        message: 'Created',
        data: response
    })

})


module.exports = {register}