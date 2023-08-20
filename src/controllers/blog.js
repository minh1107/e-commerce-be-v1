const Blog = require('../modules/blog')
const asyncHandler = require('express-async-handler')

const createBlog = asyncHandler(async (req, res) => {
  const response = await Blog.create(req.body)
  const { title, description, category} =  req.body
  if(!(title || description || category)) throw new Error('Blog missing')
  return res.status(200).json({
    success: response ? true : false,
    createdBlog: response ? response : "Can't create blog"
  })
})

const excludedFields = 'lastName firstName'
const getBlog = asyncHandler(async (req, res) => {
  // 
  const response = await Blog.findByIdAndUpdate(req.params.bid, { $inc: {numberViews: 1}}, {new: true}).populate({path: 'likes',select: excludedFields})
  .populate({path: 'dislikes', select: excludedFields})
  return res.status(200).json({
    success: response ? true : false,
    reactedBlog: response ? response : "Can't create blog"
  })
})

const getAllBlog = asyncHandler(async (req, res) => {
  const response = await Blog.find()
  return res.status(200).json({
    success: response ? true : false,
    getAllBlog: response ? response : "Can't all blog"
  })
})

const updateBlog = asyncHandler(async (req, res) => {
  const {bid} = req.params
  if(Object.keys(req.body).length === 0) throw new Error('Không có thông tin sửa đổi blog')
    const response = await Blog.findByIdAndUpdate(bid, req.body, {new: true})
    return res.json({
      status: response ? true : false,
      updatedBlog: response ? 'Updated' : "Can't Updated"
    })
})

const deleteBlog = asyncHandler(async (req, res) => {
  const response = await Blog.findByIdAndDelete(req.params.bid)
  return res.status(200).json({
    success: response ? true : false,
    deleteBlog: response ? response : "Can't delete blog"
  })
})

/**
 * Nếu người dùng like thì bỏ dislike và sau đó thêm like
 * Nếu không thì check xem người đó đang like hay không 
 */
const likeBlog = asyncHandler( async(req, res) => {
    // Lấy _id người dùng và blog id ra
    const { _id } = req.user
    const { bid } = req.params
    // Nếu không có bid thì bắn lỗi
    if(!bid) throw new Error('Không có id của blog')
    // Tìm blog tương tứng theo id blog
    const blog = await Blog.findById(bid)
    // Kiểm tra user có đang dislike blog đó không
    const dislikedBlog = blog.dislikes.find(item => item.toString() === _id)
    // Nếu đang dislike thì chuyển sang like ngay lập tức khi dí vào nút lịke
    if(dislikedBlog) {
      const response = await Blog.findByIdAndUpdate(bid, {$pull: {dislikes: _id}, $push: {likes: _id}}, {new: true})
      return res.status(200).json({
        status: response ? true : false,  
        rs: response
      })
    }
    // Kiểm tra blog đó đã được like hay chưa
    const isLiked = blog.likes.find(item => item.toString() === _id)
    // Nếu đã được like thì bỏ like đi
    if(isLiked) {
      const response = await Blog.findByIdAndUpdate(bid, {$pull: {likes: _id}}, {new: true})
      return res.status(200).json({
        status: response ? true : false,  
        rs: response
      })
    // Nếu đã chưa like thì like đi
    } else {
      const response = await Blog.findByIdAndUpdate(bid, { $push: {likes: _id}}, {new: true})
      return res.status(200).json({
        status: response ? true : false,  
        rs: response
      })
    }
})

/**
 * Tương tự like
 */
const dislikeBlog = asyncHandler( async(req, res) => {
  const { _id } = req.user
  const { bid } = req.params
  if(!bid) throw new Error('Không có id của blog')
  const blog = await Blog.findById(bid)
  const likedBlog = blog.likes.find(item => item.toString() === _id)
  if(likedBlog) {
    const response = await Blog.findByIdAndUpdate(bid, {$pull: {likes: _id}, $push: {dislikes: _id}}, {new: true})
    return res.status(200).json({
      status: response ? true : false,  
      rs: response
    })
  }
  const isDisliked = blog.dislikes.find(item => item.toString() === _id)
  if(isDisliked) {
    const response = await Blog.findByIdAndUpdate(bid, {$pull: {dislikes: _id}}, {new: true})
    return res.status(200).json({
      status: response ? true : false,  
      rs: response
    })
  } else {
    const response = await Blog.findByIdAndUpdate(bid, { $push: {dislikes: _id}}, {new: true})
    return res.status(200).json({
      status: response ? true : false,  
      rs: response
    })
  }
})

const uploadImageBlog = asyncHandler( async(req, res) => {
  if(!req.file) throw new Error('Không có ảnh tải lên')
  const response = await Blog.findByIdAndUpdate(req.params.bid, {image: req.file.path}, {new: true})
  return res.status(200).json({
    status: req.file,
    updateBlog: response ? response : 'Không tải được ảnh blog lên'
  })
})

module.exports = {
  createBlog, getBlog, getAllBlog, updateBlog, deleteBlog, likeBlog, dislikeBlog, uploadImageBlog
}