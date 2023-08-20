const { generateAccessToken, generateRefreshToken } = require("../middlewares/jwt");
const User = require("../modules/user");
const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken');
const sendMail = require("../utils/sendmail");
const crypto = require('crypto')
const makeToken = require('uniqid')

// Đăng ký tài khoản
// const register = asyncHandler( async(req, res) => {
//     // Lấy thông tin người dùng từ body request
//     const {email, password, firstname, lastname, mobile} = req.body

//     // Không có thông tin
//     if(!(email && password && firstname && lastname && mobile)) 
//     return res.status(400).json({
//         status: false,
//         message: 'Missing input'    
//     })

//     // Tìm use theo email
//     const user = await User.findOne({email})
//     if(user) throw new Error('Email had been regitered')
//     else {
//         // Tạo với data request gửi về bằng body
//         const response = await User.create(req.body)
//         // Trả về responsve
//         return res.status(201).json({
//             status: response ? true : false,
//             message: response ? 'Created' : "Can't created",
//             data: response ? response : null
//     })}
// })

const register = asyncHandler( async(req, res) => {
    const { email, password, firstname, lastname, mobile} = req.body
    if(!(email && password && firstname && lastname && mobile)) 
        return res.status(400).json({
            status: false,
            message: 'Missing input'    
        })
    const user = await User.findOne({email})
    if(user) throw new Error('Email had been regitered')
    const token = makeToken() 
    res.cookie('dataRegister', {...req.body, token}, {httpOnly: true, maxAge: 15 * 60 * 1000})
    const html = `Xin vui lòng click vào đây để xác thực email đăng ký \
    <a href=${process.env.SERVER_URL}/api/v1/user/finalregister/${token}>Nhấn vào đây</a>`
    const rs = await sendMail({email, html, subject: 'Xác nhận mail'})
    return res.status(200).json({
        status: true,
        message: 'Please check your email registered!'
    })

})

const finalRegister = asyncHandler( async(req, res) => {
    const cookie = req.cookies
    const { token } = req.params
    if(!cookie || token != cookie?.dataRegister?.token) {
        res.clearCookie('dataRegister')
        res.redirect(`${process.env.CLIENT_URL}/finalregister/false`)
    }
    const response = await User.create({
        firstname: cookie.dataRegister.firstname,
        lastname: cookie.dataRegister.lastname,
        email: cookie.dataRegister.email,
        password: cookie.dataRegister.password,
        mobile: cookie.dataRegister.mobile,
    })
    res.clearCookie('dataRegister')
    // Trả về responsve
    if(response) return res.redirect(`${process.env.CLIENT_URL}/finalregister/true`)
    else res.redirect(`${process.env.CLIENT_URL}/finalregister/false`)
})

// Login
const login = asyncHandler( async(req, res) => {
    const {email, password} = req.body
    if(!(email && password)) 
    return res.status(400).json({
            sucess: false,
            mes: 'Missing input'
    })
    // Tìm theo email nếu có email trả về res
    const response  = await User.findOne({email})
    // Check có res và password có đúng không
    if(response && await response.isCorrectPassword(password)) {
        const {password, refreshToken, role, ...newData} = response.toObject()
        // Tạo accessToken và refresh token
        const accessToken = generateAccessToken(newData._id, role)
        const newRefreshToken = generateRefreshToken(newData._id)
        // Update refresh token vào data
        await User.findByIdAndUpdate(response._id, {refreshToken: newRefreshToken}, {new: true})
        // Gửi refreshToken lên cookie
        res.cookie('refreshToken', refreshToken, {expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  ,httpOnly: true })
        return res.status(200).json({
            status: true,
            accessToken,
            data: newData,
        })
    } else {
        throw new Error('User or password is not correct')
    }
})

const getCurrent = asyncHandler( async(req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('-password -refreshToken -role')
    return res.status(200).json({
        state: user ? true : false,
        data: user ? user : 'not found user'
    })
})

const refreshAccessToken = asyncHandler( async(req, res) => {
    // lấy refresh token từ cookie
    const cookie = req.cookies
    console.log(cookie)
    // Check có refresh token có và hợp lệ hay không
    if(!cookie && !cookie.refreshToken) throw new Error('No refreshtoken in cookies')
    const decodeRefreshtoken = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({_id: decodeRefreshtoken._id, refreshToken: cookie.refreshToken})
    return res.status(200).json({
        status: true,
        newAccessToken: response ? generateAccessToken({_id: response._id, role: response.role}) : 'Refresh token not match'
    })
})

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    if(!(cookie || cookie.refreshToken)) throw new Error('No refresh token in cookies') 
    // Xóa refresh token ở db
    await User.findOneAndUpdate({refreshToken: cookie.refreshToken}, {refreshToken: ''}, {new: true})
    // Xóa refresh token tại trình duyện
    res.clearCookie('refreshToken', {httpOnly: true, secure: true})
    res.status(200).json({
        status: true,
        message: 'Logout successfully'
    })
})

// Client gửi mail
// Server check mail có hơp lệ hay không => Gửi mail + kèm theo (password change token)
// Client check => click link
// client gửi api kèm token 
// Check token mà client gửi có giống token ở phía server không
// Change password
const forgotPassword = asyncHandler(async(req, res) => {
    const {email} = req.body
    if(!email) throw new Error('Missing input')
    const user = await User.findOne({email})
    if(!user) throw new Error('User not found')
    const resetToken  = user.createPasswordChangedToken()
    await user.save()
    const html = `Xin vui lòng click vào đây để đổi mật khẩu Link có hạn là 15p<a href=${process.env.CLIENT_URL}/resetpassword/${resetToken}>Nhấn vào đây</a>`
    const subject = 'Quên mật khẩu'
    const data = {
        email,
        html,
        subject
    }
    const rs = sendMail(data)
    return res.status(200).json({
      status: true,
      message: rs ? 'Send mail successfully' : 'Send mail fail'
    })
    
})

const resetPassword = asyncHandler( async(req, res) => {
    const { password, token } = req.body
    if(!(password || token)) throw new Error('Missing input')
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex') 
    const user = await User.findOne({passwordResetToken, passswordResetExpries: {$gt: Date.now()}})
    const checkPassword = await user?.isCorrectPassword(password)
    if(checkPassword) throw new Error('You entered your old password')
    if(!user) {
        throw new Error('Invalid token')
    }
    user.password = password
    user.passwordResetToken = undefined
    user.passwordChangeAt = Date.now()
    user.passswordResetExpries = undefined
    await user.save()
    return res.status(200).json({
        status: user ? true : false,
        data: user ? user : ''
    })
})

const getAllUser = asyncHandler( async(req, res) => {
    const response  = await User.find()
    return res.status(200).json({
        status: response ? true : false ,
        data: response ? response : ''
    })
})

const getUser = asyncHandler( async(req, res) => {
    const { _id } = req.query
    if(!_id) throw new Error('Missing input')
    const user = await User.findById(_id).select('-password -refreshToken -role')
    return res.status(200).json({
        state: user ? true : false,
        data: user ? user : 'not found user'
    })
})

const deleteUser = asyncHandler( async(req, res) => {
    const { _id } = req.query
    if(!_id) throw new Error('Missing input')
    const user = await User.findByIdAndDelete(_id)
    return res.status(200).json({
        state: user ? true : false,
        data: user ? 'Delete completed' : "Can't delete"
    })
})

const updateUser = asyncHandler( async(req, res) => {
    const data = req.body
    const { _id } = req.user
    if(!(_id && Object.keys(req.body).length !== 0)) throw new Error('Missing input')
    const user = await User.findByIdAndUpdate(_id, data, {new: true}).select('-password -role')
    return res.status(200).json({
        state: user ? true : false,
        data: user ? 'Update completed' : "Can't Update"
    })
}) 

const updateByAdminUser = asyncHandler( async(req,res) => {
    const data = req.body
    const { uid } = req.params
    if(!(uid && Object.keys(req.body).length !== 0)) throw new Error('Missing input')
    const user = await User.findByIdAndUpdate(uid, data, {new: true}).select('-password -role')
    return res.status(200).json({
        state: user ? true : false,
        data: user ? 'Update completed' : "Can't Update"
    })
})

module.exports = { register, login, getCurrent, refreshAccessToken, logout, forgotPassword, resetPassword,getAllUser, getUser, deleteUser, updateUser, updateByAdminUser, finalRegister }