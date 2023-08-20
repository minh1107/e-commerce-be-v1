const Coupon = require('../modules/coupon')
const asyncHandler = require('express-async-handler')

const createCoupon = asyncHandler( async(req, res) => {
    const {name, discount, expiry} = req.body
    if(!(name || discount || expiry)) throw new Error('Tạo coupon không có đầy đủ thông tin')
    const response = await Coupon.create({...req.body, expiry: Date.now() + expiry * 24 * 60 * 60 * 1000})
    return res.status(200).json({
      status: response ? true : false,
      response: response ? response : 'Không tạo được'
    })
})

const getCoupon = asyncHandler( async(req, res) => {
  const response = await Coupon.findById(req.params.cid)
  return res.status(200).json({
    status: response ? true : false,
    response: response ? response : 'Không lấy được danh sách mã giảm giá'
  })
})

const getAllCoupons = asyncHandler( async(req, res) => {
  const response = await Coupon.find()
  return res.status(200).json({
    status: response ? true : false,
    response: response ? response : 'Không lấy được danh sách mã giảm giá'
  })
})

const deleteCoupon = asyncHandler(async (req, res) => {
  const response = await Coupon.findByIdAndDelete(req.params.cid, {new: true})
  res.status(200).json({
    status: response ? true : false,
    rs: response ? response : 'Không xóa được mã giảm giá này'
  })
})

const updateCoupons = asyncHandler( async(req, res) => {
  const { expiry } = req.body
  if(Object.keys(req.body).length) throw new Error('Sửa coupon không có thông tin')
  const response = await Coupon.findByIdAndUpdate(req.params.cid, {...req.body, expiry: Date.now() + expiry * 24 * 60 * 60 * 1000}, {new: true})
  return res.status(200).json({
    status: response ? true : false,
    response: response ? response : 'Không sửa được'
  })
})

module.exports = { createCoupon, getAllCoupons, updateCoupons, getCoupon, deleteCoupon}