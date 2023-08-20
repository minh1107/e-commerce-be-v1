const BlogCategory = require('../modules/blogCategory')
const asyncHandler = require('express-async-handler')

const createCategory = asyncHandler( async(req, res) => {
    const response = await BlogCategory.create(req.body)
    return res.status(200).json({
      status: response ? true : false,
      data: response ? response : `Can't create blog category`
    })
})

const getCategories = asyncHandler( async(req, res) => {
  const response = await BlogCategory.find().select('title id')
  return res.status(200).json({
    status: response ? true : false,
    data: response ? response : 'No data blog category'
  })
})

const updateCategory = asyncHandler( async(req, res) => {
  const { bcid } = req.params
  const response = await BlogCategory.findByIdAndUpdate(bcid, req.body, {new: true})
  return res.status(200).json({
    status: response ? true : false,
    updatedBlogCategory: response ? response : "can't update"

  })
})

const deleteCategory = asyncHandler( async(req, res) => {
  const { bcid } = req.params
  
  const response = await BlogCategory.findByIdAndDelete(bcid)
  return res.status(200).json({
    status: response ? true : false,
    data: response ? response : "Can't delete"
  })
})

module.exports = { createCategory, deleteCategory, updateCategory, getCategories }