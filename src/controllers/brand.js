const Brand = require('../modules/brand')
const asyncHandler = require('express-async-handler')

const createBrand = asyncHandler( async(req, res) => {
    const response = await Brand.create(req.body)
    return res.status(200).json({
      status: response ? true : false,
      data: response ? response : `Can't create brand`
    })
})

const getBrand = asyncHandler( async(req, res) => {
  const response = await Brand.find().select('title id')
  return res.status(200).json({
    status: response ? true : false,
    data: response ? response : 'No data brand'
  })
})

const updateBrand = asyncHandler( async(req, res) => {
  const { bid } = req.params
  const response = await Brand.findByIdAndUpdate(bid, req.body, {new: true})
  return res.status(200).json({
    status: response ? true : false,
    updatedBrand: response ? response : "Can't update"

  })
})

const deleteBrand = asyncHandler( async(req, res) => {
  const { bid } = req.params
  
  const response = await Brand.findByIdAndDelete(bid)
  return res.status(200).json({
    status: response ? true : false,
    data: response ? response : "Can't delete"
  })
})

module.exports = { getBrand, deleteBrand, updateBrand, createBrand }