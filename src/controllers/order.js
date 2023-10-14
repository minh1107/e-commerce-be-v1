const asyncHandler = require('express-async-handler')
const Order = require('../modules/order')
const User = require('../modules/user')
const Coupon = require('../modules/coupon')

const createOrder = asyncHandler( async(req, res) => {
    const { _id } = req.user
    // Trỏ đến bảng product lấy title và price
    const orderInfo = await User.findById(_id).select('cart').populate('cart.product', 'title price')
    const { coupon } = req.body
    const products = orderInfo?.cart?.map(item => ({
      product: item.product._id,
      count: item.quantity,
      color: item.color
    }))
    let total = orderInfo.cart.reduce((sum, item) => item.product.price * item.quantity + sum, 0)
    if(coupon) {
      const { discount } = await Coupon.findById(coupon).select('discount')
      total -= Math.round(total*(discount/100))
    }
    const rs = await Order.create({products, total, orderBy: _id, coupon})
    if(orderInfo) 
    res.status(200).json({
      status: orderInfo ? true : false,
      rs: rs,
      orderInfo
    })
})

const updateStatus = asyncHandler( async(req, res) => {
    const { oid } = req.params
    const { status } = req.body
    if(!(oid || status)) throw new Error('Không có thông tin đơn hàng để sửa đổi trang thái đơn hàng')
    const response = await Order.findByIdAndUpdate(oid, {status}, {new: true})
    return res.status(200).json({
      status: response ? true : false,
      statusOrder: status,
      rs: response ? response : 'Không có response trả về',
    })
})

const getStatus = asyncHandler( async(req, res) => {
  const { oid } = req.params
  if(!oid) throw new Error('Không lấy được đơn hàng ra')
  const response = await Order.findById(oid)
  return res.status(200).json({
    status: response ? true : false,
    rs: response ? response : 'Không có response trả về',
  })
})

const getAllStatus = asyncHandler( async(req, res) => {
  const response = await Order.find()
  return res.status(200).json({
    status: response ? true : false,
    rs: response ? response : 'Không có response trả về',
  })
})

module.exports = { createOrder, updateStatus, getStatus, getAllStatus }