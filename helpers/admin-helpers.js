var collection = require("../model/collection");
var db = require("../config/database");
const async = require("hbs/lib/async");
var objectId = require("mongodb").ObjectId;
let moment = require('moment');
const { get } = require("mongoose");
const { AwsPage } = require("twilio/lib/rest/accounts/v1/credential/aws");

module.exports = {
    addBanner: ((banner, file) => {
        return new Promise(async (resolve, reject) => {
            let Img = file.filename;
            banner.img = Img;
            banner.Status = "Show"
            db.get()
                .collection("banner")
                .insertOne(banner)
                .then((response) => {
                    resolve(response);
                });
        });
    }),

    getBanners: (() => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get()
                .collection(collection.BANNER_COLLECTION)
                .find()
                .sort({ _id: -1 })
                .toArray();
            resolve(banner)
        })
    }),

    removeBanner: ((Id) => {
        return new Promise(async (resolve, reject) => {
            db.get()
                .collection(collection.BANNER_COLLECTION)
                .deleteOne({ _id: objectId(Id.bannerId) })
                .then(() => {
                    resolve()
                })
        })

    }),

    hideandShowBanner: ((Id) => {
        return new Promise(async (resolve, reject) => {
            let findBanner = await db.get()
                .collection(collection.BANNER_COLLECTION)
                .findOne({ _id: objectId(Id.bannerId) })
            if (findBanner.Status === 'Show') {
                db.get()
                    .collection(collection.BANNER_COLLECTION)
                    .updateOne({ _id: objectId(Id.bannerId) },
                        {
                            $set: {
                                Status: ''
                            }
                        }
                    )
            } else {
                db.get()
                    .collection(collection.BANNER_COLLECTION)
                    .updateOne({ _id: objectId(Id.bannerId) },
                        {
                            $set: {
                                Status: 'Show'
                            }
                        }
                    )

            } resolve()
        })
    }),
    addCoupon: ((data) => {
        return new Promise(async (resolve, reject) => {
            checkCoupon = await db.get()
                .collection(collection.COUPON_COLLECTION)
                .find({ CouponCode: data.CouponCode })
                .toArray()

            console.log(checkCoupon);
            if (!checkCoupon.length == 1) {
                db.get()
                    .collection("coupon")
                    .insertOne(data)
                    .then((response) => {
                        resolve(response);
                    });
            } else {
                resolve()
            }
        });
    }),

    offerExpiry: ((today) => {
        let date = moment(today).format('YYYY-MM-DD');
        return new Promise(async (resolve, reject) => {
            // Coupon Expired Delete********
            await db.get().collection(collection.COUPON_COLLECTION).deleteMany({
                "ExpirationDate": {
                    $lte: date
                }
            })

            // Category
            let offerExist = await db.get()
                .collection(collection.CATEGORY_COLLECTION)
                .find({
                    "Offer.ExpirationDate": {
                        $lte: date
                    }
                })
                .toArray()
            if (offerExist) {
                offerExist.map(async (data) => {
                    let cate = await db.get()
                        .collection(collection.CATEGORY_COLLECTION)
                        .updateMany({ _id: data._id },
                            { $set: { Offer: { Discount: 0, ExpirationDate: "YYY-MM-DD" } } }
                        )

                    let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                        {
                            $match: {
                                Category: data.Name
                            }
                        },
                    ]).toArray()


                    await products.map(async (product) => {
                        await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                            {
                                _id: product._id,
                            },
                            {
                                $set: { Offers: { DiscountPrice: product.Price, Discount: 0 } }
                            })
                    })
                })

            }
            else {
            }


            resolve()
        })
    }),

    getAllCoupons: (() => {
        return new Promise(async (resolve, reject) => {
            coupon = await db.get()
                .collection(collection.COUPON_COLLECTION)
                .find()
                .sort({ _id: -1 })
                .toArray()
            resolve(coupon)
        })
    }),

    removeCoupon: ((id) => {
        return new Promise(async (resolve, reject) => {
            db.get()
                .collection(collection.COUPON_COLLECTION)
                .deleteOne({ _id: objectId(id.id) })

            resolve()
        })
    }),
    removeCateOffer: ((id) => {
        console.log(id, '/*/*/*/*/');
        return new Promise(async (resolve, reject) => {
            let cate = await db.get()
                .collection(collection.CATEGORY_COLLECTION)
                .updateOne({ _id: objectId(id.id) },
                    { $set: { Offer: { Discount: 0, ExpirationDate: "YYY-MM-DD" } } }
                )
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match: {
                        Category: id.name
                    }
                },
            ]).toArray()

            console.log(products);

            await products.map(async (product) => {
                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                    {
                        _id: product._id,
                    },
                    {
                        $set: { Offers: { DiscountPrice: product.Price, Discount: 0 } }
                    })
            })
            resolve()
        })

    }),

    addCategoryOffer: (data) => {
        return new Promise(async (resolve, reject) => {
            let Offer = {}
            Offer.Discount = parseInt(data.Percentage)
            Offer.ExpirationDate = data.ExpirationDate
            let offerExist = await db.get().collection(collection.CATEGORY_OFFER).findOne({ Category: data.Category })

            if (offerExist) {
                await db.get().collection(collection.CATEGORY_OFFER).updateOne({ Category: data.Category }, {
                    $set: { Offer: { Discount: Offer.Discount, ExpirationDate: data.ExpirationDate } }
                })
            }
            else {
                await db.get().collection(collection.CATEGORY_OFFER).updateOne({ Name: data.Category }, { $set: { Offer } })
            }

            let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match: {
                        Category: data.Category
                    }
                },
            ]).toArray()

            console.log(products);

            await products.map(async (product) => {
                let Price = product.Price
                Price = parseInt(Price)
                let DiscountPrice = Price - ((Price * Offer.Discount) / 100)
                DiscountPrice = parseInt(DiscountPrice.toFixed(2))

                let Offers = {}
                Offers.DiscountPrice = DiscountPrice
                Offers.Discount = Offer.Discount
                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                    {
                        _id: product._id,
                    },
                    {
                        $set: { Offers }
                    })
            })
            resolve({ status: true })
        })
    },

    getTotalWallet: () => {
        return new Promise(async (resolve, reject) => {
            let wallet = db.get()
                .collection(collection.WALLET_COLLECTION)
                .aggregate([
                    { $group: { _id: null, Total: { $sum: '$Amount' } } }
                ]).toArray()
            resolve(wallet)
        })
    },

    getOrderStatus: () => {
        return new Promise(async (resolve, reject) => {
            let Statistics = await db.get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([{
                    $unwind: "$products",
                }, {
                    $project: {
                        item: "$products.item"
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: "item",
                        foreignField: "_id",
                        as: 'products'
                    }
                }, {
                    $unwind: "$products"
                },
                {
                    $group: {
                        _id: "$products.Category",
                        count: { $sum: 1 }
                    }
                }]).toArray()
            resolve(Statistics)
        })
    },

    getTotalOrders: () => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([{
                    $group: {
                        _id: null,
                        count: { $sum: 1 }
                    }
                }]).toArray()
            resolve(total)
        })

    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let allUsers = await db.get()
                .collection(collection.USER_COLLECTION)
                .aggregate([{
                    $group: {
                        _id: null,
                        count: { $sum: 1 }
                    }
                }]).toArray()
            resolve(allUsers)
        })
    },
    getOrderDetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderDetails = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: { _id: objectId(orderId) },
                    },
                    {
                        $unwind: "$products",
                    },
                    {
                        $project: {
                            totalAmount: '$totalAmount',
                            fromWallet: '$fromWallet',
                            actualAmount: '$actualAmount',
                            item: "$products.item",
                            quantity: "$products.quantity",
                            Name: "$products.productName",
                            img: "$products.productImage",
                            actualPrice: "$products.actualPrice",
                            DiscountPrice: "$products.DiscountPrice",
                        },
                    },
                    // {
                    //   $lookup: {
                    //     from: collection.PRODUCT_COLLECTION,
                    //     localField: "item",
                    //     foreignField: "_id",
                    //     as: "product",
                    //   },
                    // },
                    // {
                    //   $project: {
                    //     totalAmount: 1,
                    //     item: 1,
                    //     quantity: 1,
                    //     product: { $arrayElemAt: ["$product", 0] },
                    //   },
                    // },
                ])
                .toArray();
            resolve(orderDetails);
        })

    },
    salesReport: (from, till) => {
        // console.log(from);
        // console.log(till);
        return new Promise(async (resolve, reject) => {
            let salesReport = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: "$products"
                },
                {
                    $project: {
                        item: "$products.item",
                        quantity: "$products.quantity",
                        totalAmount: "$actualAmount",
                        status: "$status",
                        date: "$Date",
                        PayMethod: '$PaymentMethode',
                        deliveryDetails: "$deliveryDetails"
                    }
                },
                {
                    $match: {
                        $or: [{ status: "Delivered" }, { status: "Placed" }, { status: "Shipped" }],
                        date: {
                            $gte: from,
                            $lte: till
                        }
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: "item",
                        foreignField: "_id",
                        as: "products"
                    }
                },
                {
                    $unwind: "$products"
                },
                {
                    $project: {
                        quantity: 1,
                        deliveryDetails: 1,
                        PayMethod: 1,
                        date: 1,
                        totalAmount: 1,
                        products: "$products",
                        productName: "$products.Name",
                        Price: "$products.Price",
                        totalAmount: 1

                    }
                },
                // {
                //     $group: {
                //         _id: "$_id",
                //         Name: "$productName",
                //         totalQty: { $sum: "$quantity" },
                //         totalSale: { $sum: "$Price" },
                //         netCost: {
                //             $sum: {
                //                 $multiply: ["$quantity", "$Price"]
                //             }
                //         },
                //     },
                // },
                // {
                //     $project: {
                //         _id: 1,
                //         Name:1,
                //         totalQty: 1,
                //         totalSale: 1,
                //         netCost: 1,
                //         //   profit: {
                //         //     $subtract:["$totalSale","$netCost"]
                //         //   }
                //     }
                // }
            ]).toArray()
            // console.log(salesReport);
            resolve(salesReport)
        })
    },

    getAllorders: () => {
        return new Promise(async (resolve, reject) => {
          let orders = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .find()
            .sort({ _id: -1 })
            .toArray();
          resolve(orders);
        });
      },
}