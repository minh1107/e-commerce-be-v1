const asyncHandler = require('express-async-handler')
const Order = require('../modules/order')
const User = require('../modules/user')
const Coupon = require('../modules/coupon')

const createOrder = asyncHandler( async(req, res) => {
    const { _id } = req.user
    const orderInfo = req.body
    let isPaid = false
    let paymentType = 'receive'
    let paymentId = null
    // Trỏ đến bảng product lấy title và price
    // const orderInfo = await User.findById(_id).select('cart').populate('cart.product', 'title price')
    if(!orderInfo?.finalCart?.length) {
      throw new Error('Không có mặt hàng nào được chọn')
    }
    if(orderInfo.paymentExpression) {
      isPaid = true
      paymentType = 'online',
      paymentId = orderInfo?.paymentExpression?.id
    }
    const { coupon } = req.body
    const products = orderInfo?.finalCart?.map(item => ({
      product: item.id,
      count: item.quantity,
      color: item.color,
      price: item.price,
      ram: item.ram,
      internal: item.internal,
      thumb: item.thumb,
      title: item.title
    }))
    let total = orderInfo.finalCart.reduce((sum, item) => parseInt(item.price) * item.quantity + sum, 0)
    if(coupon) {
      const { discount } = await Coupon.findById(coupon).select('discount')
      total -= Math.round(total*(discount/100))
    }
    const rs = await Order.create({products, total, orderBy: _id, coupon, receiver: orderInfo.receiver, 
      address: orderInfo.address, mobile: orderInfo.mobile, isPaid: isPaid, paymentType: paymentType, paymentId: paymentId})
    const user = await User.findById(_id)
    user.addToHistoryShopping({products, orderId: rs._id})
    await user.save()

    if(orderInfo) 
    res.status(200).json({
      status: orderInfo ? true : false,
      rs: rs,
      orderInfo
    })
})

const updateStatus = asyncHandler( async(req, res) => {
    const { oid } = req.params
    const { status, isPaid } = req.body
    if(!(oid || status)) throw new Error('Không có thông tin đơn hàng để sửa đổi trang thái đơn hàng')
    const response = await Order.findByIdAndUpdate(oid, {status, isPaid}, {new: true})
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

const getOrderList = asyncHandler( async(req, res) => {
  const queries = { ...req.query }
  const excludeFields = ['limit', 'sort', 'page', 'fields']
  excludeFields.forEach(item => delete queries[item])
  // Format lại các operators cho đúng cú pháp mongoose
  let queryString = JSON.stringify(queries)
  queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedElement => `$${matchedElement}`)

  const formatQueries = JSON.parse(queryString)
  // Để thằng mongoose db hiểu là sử dụng được cả chữ hoa và chữ thường
  if(req.query.search) {
      delete formatQueries.search
      formatQueries['$or'] = [
          {'orderBy.firstname': { $regex: req.query.search, $options: 'i' }},
          {'orderBy.lastname': { $regex: req.query.search, $options: 'i' }},
          {'orderBy.email': { $regex: req.query.search, $options: 'i' }},
      ]
  }
 
  let queryCommand = Order.find().populate({
    path: 'orderBy',
    select: 'firstname lastname email mobile'
  })
  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.replace(",", " ");
    queryCommand = queryCommand.sort(sortBy)
  }
  // Select fields
  if (req.query.fields) {
    // Tách string truyền vào ngăn cách nhau bởi dấu phẩy tạo thành array và tiếp tục join thành string ngăn cách nhau bằng dấu ''  
    const fields = req.query.fields.replace(",", " ")
    queryCommand = queryCommand.select(fields)
  }

  // Pagination, limit, page
  // +2 => 2,
  // +string => NaN
  //  18 sản phẩm => page = 2 limit = 2 => start = 3 => skip = (page - 1) * limit = 2
  const limit = +req.query.limit || process.env.LIMIT_PRODUCT
  queryCommand.limit(limit)
  if (req.query.page && req.query.limit) {
    const page = +req.query.page || 1
    const limit = +req.query.limit || process.env.LIMIT_PRODUCT
    const skip = (page - 1) * limit
    queryCommand.skip(skip).limit(limit)
  }
  queryCommand.find({ $text: { $search: `${req.query["statusEnum"]}` }})
  // Filtering
  let totalOrder = await Order.estimatedDocumentCount()
  try {
    const response = await queryCommand.exec();
    const counts = response.length;

    return res.status(200).json({
      counts: counts ? counts : '',
      totalOrder: totalOrder,
      status: counts ? true : false,
      order: response ? response : "Cannot get all order",
      enumStatus:  ["Canceled", 'Processing','Shipping', 'Succeeded'] 
    });
  } catch (err) {
    throw new Error(err.message);
  }
})  

const deleteOrder = asyncHandler( async(req, res) => {
  const { oid } = req.params
  if(!oid) {
    throw new Error('No data')
  }
  const response = await Order.findByIdAndDelete(oid)
  res.status(200).json({
    status: response ? true : false, 
    data: response ? response : 'Không có data'
  })
})

const getCurrentOrder = asyncHandler( async(req, res) => {
  const { _id } = req.user
  const response = await Order.find({orderBy: _id, isReceive: false})
  res.status(200).json({
    status: response ? true : false, 
    data: response ? response : 'Không có data'
  })
})

const checkReceive = asyncHandler( async(req, res) => {
  const {oid} = req.params
  if(!oid) throw new Error('Không có sản phảm')
  const response = await Order.findByIdAndUpdate(oid, {isReceive: true})
  res.status(200).json({
    status: response ? true : false, 
    data: response ? response : 'Không có data'
  })
})

module.exports = { createOrder, updateStatus, getStatus, getAllStatus, getOrderList, deleteOrder, getCurrentOrder, checkReceive }