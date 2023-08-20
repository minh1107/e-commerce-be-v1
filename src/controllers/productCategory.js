const ProductCategory = require('../modules/productCategory')
const asyncHandler = require('express-async-handler')

const createCategory = asyncHandler( async(req, res) => {
    const { title, urlImage} = req.body
    if(!title && !urlImage) throw new Error('Require title and url image')
    const response = await ProductCategory.create(req.body)
    return res.status(200).json({
      status: response ? true : false,
      data: response ? response : `Can't create product category`
    })
})

const getCategories = asyncHandler( async(req, res) => {
  const response = await ProductCategory.find()
  return res.status(200).json({
    status: response ? true : false,
    data: response ? response : 'No data product category'
  })
})

const updateCategory = asyncHandler( async(req, res) => {
  const { pcid } = req.params
  const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, {new: true})
  return res.status(200).json({
    status: response ? true : false,
    updatedProductCategory: response ? response : "can't update"

  })
})

const deleteCategory = asyncHandler( async(req, res) => {
  const { pcid } = req.params
  
  const response = await ProductCategory.findByIdAndDelete(pcid)
  return res.status(200).json({
    status: response ? true : false,
    data: response ? response : "Can't delete"
  })
})

module.exports = { createCategory, deleteCategory, updateCategory, getCategories }