const Product = require('../modules/product')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')

const createProduct = asyncHandler(async (req, res) => {
  const imagesArr = req.files.images
  const images = []
  for(i of imagesArr) {
    images.push(i.path)
  }
  const thumb = req.files.thumb[0].path
  if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
  if (req.body && req.body.title) {
    req.body.slug = slugify(req.body.title, { locale: 'vi' })
  }
  const request = {...req.body, images, thumb}
  const newProduct = await Product.create(request)
  return res.status(200).json({
    status: newProduct ? true : false,
    createProduct: newProduct ? newProduct : "Cannot create new product"
  })
})

const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  // Chọc vào trường ratings rồi chọc tiếp vào postedBy để lấy dữ liệu từ id user
  const product = await Product.findById(pid).populate({
    path: 'rating',
    populate: {
      path: 'votedBy',
      select: 'firstname lastname avatar'
    }
  })
  return res.status(200).json({
    status: product ? true : false,
    product: product ? product : "Cannot get product"
  })
})

// Filtering, sorting, pagination
const getAllProducts = asyncHandler(async (req, res) => {
  const queries = { ...req.query }
  const excludeFields = ['limit', 'sort', 'page', 'fields']
  excludeFields.forEach(item => delete queries[item])

  // Format lại các operators cho đúng cú pháp mongoose
  let queryString = JSON.stringify(queries)
  queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedElement => `$${matchedElement}`)

  const formatQueries = JSON.parse(queryString)
  // Để thằng mongoose db hiểu là sử dụng được cả chữ hoa và chữ thường
  let colorQueryObject = {}
  if (queries?.title) formatQueries.title = { $regex: queries.title, $options: 'i' }
  if (queries?.category) formatQueries.category = { $regex: queries.category, $options: 'i' }
  if (queries?.color) {
    delete formatQueries.color
    const colorArr = queries.color?.split(',')
    const colorQuery = colorArr.map(el => ({color: { $regex: el, $options: 'i' }}))
    colorQueryObject = {$or: colorQuery}
  }
  const finalQueris = { ...colorQueryObject, ...formatQueries }
 
  let queryCommand = Product.find(finalQueris);
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
  let totalProducts = await Product.estimatedDocumentCount()
  if(queries?.category) {
    const totalProductsQuery = { category: { '$regex': queries.category, '$options': 'i' } }
    totalProducts = await Product.find(totalProductsQuery);
  }
  try {
    const response = await queryCommand.exec();
    const counts = response.length;
    
    return res.status(200).json({
      counts: counts ? counts : '',
      totalProducts: totalProducts,
      status: counts ? true : false,
      product: response ? response : "Cannot get all products"
    });
  } catch (err) {
    throw new Error(err.message);
  }

  // const products = await Product.find()
})

const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title, { locale: 'vi' })
  const updateProduct = await Product.findByIdAndUpdate(pid, req.body, { new: true })
  return res.status(200).json({
    status: updateProduct ? true : false,
    product: updateProduct ? updateProduct : "Cannot get all products"
  })
})

const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const infoDelete = await Product.findByIdAndDelete(pid)
  return res.status(200).json({
    status: infoDelete ? true : false,
    product: infoDelete ? infoDelete : "Cannot delete product"
  })
})
const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { star, comment, pid, updatedAt } = req.body
  if (!star && !pid) throw new Error('Missing input star and product id in rating')
  const productRating = await Product.findById(pid)
  // Check xem là  create rating hay edit rating
  const rated = productRating?.rating?.find(el => el.votedBy.toString() === _id)
  // Nếu có rating
  if (rated) {
    // tìm và update thông tin
    await Product.updateOne({
      rating: { $elemMatch: rated }
    }, {
      $set: { "rating.$.star": star, "rating.$.comment": comment, "rating.$.updatedAt": updatedAt},
    }, { new: true })

  } else {
    await Product.findByIdAndUpdate(pid, {
      $push: { rating: { star, comment, votedBy: _id, updatedAt } }
    }, {new: true})
  }
  const updatedProduct = await Product.findById(pid).populate({
    path: 'rating',
    populate: {
      path: 'votedBy',
      select: 'firstname lastname avatar'
    }
  }).select('rating title')
  const ratingCount = updatedProduct.rating.length
  const sumStar = updatedProduct.rating.reduce((sum, el) => {
    return sum + el.star
  }, 0)

  updatedProduct.totalRating = Math.round(sumStar / ratingCount)
  await updatedProduct.save()

  res.status(200).json({
    status: updatedProduct ? true : false,
    updatedProduct: updatedProduct,
  })
})

const uploadImageProduct = asyncHandler( async(req, res) => {
  if(!req.files) throw new Error('Không có ảnh tải lên')
  const response = await Product.findByIdAndUpdate(req.params.pid, {$push: {images: { $each: req.files.map(el => el.path )}}}, {new: true})
  return res.status(200).json({
    status: req.file,
    response
  })
})

module.exports = {
  createProduct, getProduct, getAllProducts, updateProduct, deleteProduct, rating, uploadImageProduct
}