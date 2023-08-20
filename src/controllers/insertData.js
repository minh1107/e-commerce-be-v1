const Product = require('../modules/product')
const asyncHandler = require('express-async-handler')
const data = require('../data/data2.json')
const slugify = require('slugify')
const ProductCategory = require('../modules/productCategory')
const cateProduct = require('../data/cate_brand')

const fn = async(product) => {
    await Product.create({
        title: product?.name,
        slug: slugify(product?.name) + Math.round(Math.random() * 1000) + " ",
        description: product?.description,
        brand: product?.brand,
        price: parseInt(product?.price.replace(/\./g, "").replace(",", ".").split(" ")[0]) || 0,
        quantity: Math.round(Math.random() * 1000),
        sold: Math.round(Math.random() * 100),
        images: product?.images,
        color: product?.variants?.find(el => el.label == 'Color')?.variants[0],
        category: product?.category[1],
        thumb: product?.thumb,
        totalRating: Math.round(Math.random()*5)
    }   
    )
}

const insertProduct = asyncHandler(async (req, res) => {
    const promise = []
    for (let product of data ) promise.push(fn(product))
    await Promise.all(promise)
    return res.json('done')
    //   const newProduct = await Product.create(req.body)

//   return res.status(200).json({
//     status: newProduct ? true : false,
//     createProduct: newProduct ? newProduct : "Cannot create new product"
//   })
})

const fn2 = async(cateProduct) => {
    await ProductCategory.create({
        title: cateProduct?.cate,
        brand: cateProduct?.brand,
        image: cateProduct?.image
    }   
    )
    console.log(ProductCategory)
}

const insertCategoryProduct = asyncHandler(async (req, res) => {
    const promise = []
    for (let product of cateProduct ) promise.push(fn2(product))
    await Promise.all(promise)
    return res.json('done')
})

module.exports = {insertProduct, insertCategoryProduct}