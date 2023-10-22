const asyncHandler = require('express-async-handler')
const Order = require('../modules/order')
const User = require('../modules/user')
const Coupon = require('../modules/coupon')

const createOrder = asyncHandler( async(req, res) => {
    const { _id } = req.user
    const orderInfo = req.body
    console.log(orderInfo)
    // Trỏ đến bảng product lấy title và price
    // const orderInfo = await User.findById(_id).select('cart').populate('cart.product', 'title price')
    const { coupon } = req.body
    console.log(orderInfo)
    const products = orderInfo?.map(item => ({
      product: item._id,
      count: item.quantity,
      color: item.color,
      price: item.price,
      ram: item.ram,
      internal: item.internal
    }))
    let total = orderInfo.reduce((sum, item) => parseInt(item.price) * item.quantity + sum, 0)
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
  // Filtering
  let totalOrder = await Order.estimatedDocumentCount()
  try {
    const response = await queryCommand.exec();
    const counts = response.length;

    return res.status(200).json({
      counts: counts ? counts : '',
      totalOrder: totalOrder,
      status: counts ? true : false,
      order: response ? response : "Cannot get all order"
    });
  } catch (err) {
    throw new Error(err.message);
  }
})  

const deleteOrder = asyncHandler( async(req, res) => {
  const { oid } = req.params
  console.log( req.params )
  if(!oid) {
    throw new Error('No data')
  }
  const response = await Order.findByIdAndDelete(oid)
  res.status(200).json({
    status: response ? true : false, 
    data: response ? response : 'Không có data'
  })
})

module.exports = { createOrder, updateStatus, getStatus, getAllStatus, getOrderList, deleteOrder }