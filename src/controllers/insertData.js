const Product = require('../modules/product')
const asyncHandler = require('express-async-handler')
const data = require('../data/data2.json')
const slugify = require('slugify')
const ProductCategory = require('../modules/productCategory')
const cateProduct = require('../data/cate_brand')

const productItem = async(product) => {
    await Product.create({
        title: product?.name,
        slug: slugify(product?.name) + Math.round(Math.random() * 1000) + " ",
        description: product?.description,
        brand: product?.brand,
        price: parseInt(product?.price.replace(/\./g, "").replace(",", ".").split(" ")[0]) || 0,
        quantity: Math.round(Math.random() * 1000),
        sold: Math.round(Math.random() * 100),
        images: product?.images,
        color: product?.variants?.find(el => el.label == 'Color')?.variants || ['RED', 'BLUE', 'GREEN', 'YELLOW', 'RED'],
        internal: product?.variants?.find(el => el.label == 'Internal')?.variants ||  ["32GB", "64GB", "128GB"], 
        ram: product?.variants?.find(el => el.label == 'Ram')?.variants ||  ["4GB", "8GB", "12GB"],
        category: product?.category[1],
        thumb: product?.thumb,
        totalRating: 0,
        descriptionDetail: product?.infomations?.DESCRIPTION,
        warranty: product?.infomations?.WARRANTY,
        delivery: product?.infomation?.DELIVERY || "Purchasing & Delivery\nBefore you make your purchase, it’s helpful to know the measurements of the area you plan to place the furniture. You should also measure any doorways and hallways through which the furniture will pass to get to its final destination.\nPicking up at the store\nShopify Shop requires that all products are properly inspected BEFORE you take it home to insure there are no surprises. Our team is happy to open all packages and will assist in the inspection process. We will then reseal packages for safe transport. We encourage all customers to bring furniture pads or blankets to protect the items during transport as well as rope or tie downs. Shopify Shop will not be responsible for damage that occurs after leaving the store or during transit. It is the purchaser’s responsibility to make sure the correct items are picked up and in good condition.\nDelivery\nCustomers are able to pick the next available delivery day that best fits their schedule. However, to route stops as efficiently as possible, Shopify Shop will provide the time frame. Customers will not be able to choose a time. You will be notified in advance of your scheduled time frame. Please make sure that a responsible adult (18 years or older) will be home at that time.\n\nIn preparation for your delivery, please remove existing furniture, pictures, mirrors, accessories, etc. to prevent damages. Also insure that the area where you would like your furniture placed is clear of any old furniture and any other items that may obstruct the passageway of the delivery team. Shopify Shop will deliver, assemble, and set-up your new furniture purchase and remove all packing materials from your home. Our delivery crews are not permitted to move your existing furniture or other household items. Delivery personnel will attempt to deliver the purchased items in a safe and controlled manner but will not attempt to place furniture if they feel it will result in damage to the product or your home. Delivery personnel are unable to remove doors, hoist furniture or carry furniture up more than 3 flights of stairs. An elevator must be available for deliveries to the 4th floor and above.",
        payment: product?.infomation?.PAYMENT || "Purchasing & Delivery\nBefore you make your purchase, it’s helpful to know the measurements of the area you plan to place the furniture. You should also measure any doorways and hallways through which the furniture will pass to get to its final destination.\nPicking up at the store\nShopify Shop requires that all products are properly inspected BEFORE you take it home to insure there are no surprises. Our team is happy to open all packages and will assist in the inspection process. We will then reseal packages for safe transport. We encourage all customers to bring furniture pads or blankets to protect the items during transport as well as rope or tie downs. Shopify Shop will not be responsible for damage that occurs after leaving the store or during transit. It is the purchaser’s responsibility to make sure the correct items are picked up and in good condition.\nDelivery\nCustomers are able to pick the next available delivery day that best fits their schedule. However, to route stops as efficiently as possible, Shopify Shop will provide the time frame. Customers will not be able to choose a time. You will be notified in advance of your scheduled time frame. Please make sure that a responsible adult (18 years or older) will be home at that time.\n\nIn preparation for your delivery, please remove existing furniture, pictures, mirrors, accessories, etc. to prevent damages. Also insure that the area where you would like your furniture placed is clear of any old furniture and any other items that may obstruct the passageway of the delivery team. Shopify Shop will deliver, assemble, and set-up your new furniture purchase and remove all packing materials from your home. Our delivery crews are not permitted to move your existing furniture or other household items. Delivery personnel will attempt to deliver the purchased items in a safe and controlled manner but will not attempt to place furniture if they feel it will result in damage to the product or your home. Delivery personnel are unable to remove doors, hoist furniture or carry furniture up more than 3 flights of stairs. An elevator must be available for deliveries to the 4th floor and above."
    }   
    )
}

const insertProduct = asyncHandler(async (req, res) => {
    const promise = [] 
    for (let product of data ) promise.push(productItem(product))
    await Promise.all(promise)
    return res.json('done')
    //   const newProduct = await Product.create(req.body)

//   return res.status(200).json({
//     status: newProduct ? true : false,
//     createProduct: newProduct ? newProduct : "Cannot create new product"
//   })
})

const categoryItem = async(cateProduct) => {
    await ProductCategory.create({
        title: cateProduct?.cate,
        brand: cateProduct?.brand,
        image: cateProduct?.image 
    }   
    )
}

const insertCategoryProduct = asyncHandler(async (req, res) => {
    const promise = []
    for (let product of cateProduct ) promise.push(categoryItem(product))
    await Promise.all(promise)
    return res.json('done')
})

module.exports = {insertProduct, insertCategoryProduct}