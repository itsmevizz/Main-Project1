const async = require("hbs/lib/async");
var db = require("../config/database");
var collection = require("../model/collection");
const bcrypt = require("bcrypt");
const { response } = require("../app");
var objectId = require("mongodb").ObjectId;
var instance = require('../middleware/razorpay');
const { resolve } = require("path");
const { error, log } = require("console");
const { rejects } = require("assert");
const moment = require('moment');
const { use } = require("../routes/admin");
module.exports = {
  doSignup:(userData,referral) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let wallet = {}
      userData.Status = "active";
      let email = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });
      if (!email) {
        userData.Password = await bcrypt.hash(userData.Password, 10);
        db.get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData)
          .then(async (data) => {
            if (data) {
              wallet.userId = data.insertedId
              wallet.Amount = 0
              await db.get()
                .collection(collection.WALLET_COLLECTION)
                .insertOne(wallet)
              let validateReferral = await db.get()
                .collection(collection.USER_COLLECTION)
                .findOne({ Referral: referral })
              if (validateReferral) {
                await db.get()
                  .collection(collection.WALLET_COLLECTION)
                  .updateOne({ userId: objectId(validateReferral._id) }, {
                    $inc: { Amount: 100 }
                  })
                await db.get()
                  .collection(collection.WALLET_COLLECTION)
                  .updateOne({ userId: objectId(data.insertedId) }, {
                    $inc: { Amount: 50 }
                  })
              }else{
                console.log('Wrong referral');
              }
              response.user = userData.Name;
              resolve(response);
            } else {
              resolve();
            }
          });
      } else {
        resolve();
      }
    });
  },
  checkSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let email = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });
      if (!email) {
        resolve();
      } else {
        resolve(email);
      }
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });
      if (user) {
        if (user.Status == "active") {
          bcrypt.compare(userData.Password, user.Password).then((status) => {
            if (status) {
              response.status = true;
              response.active = true;
              response.Number = user.Number;
              response.Name = user.Name;
              response.user = user;
              resolve(response);
            } else {
              console.log("not ok");
              resolve({ status: false, active: true });
            }
          });
        } else {
          resolve({ active: false });
        }
      } else {
        console.log("Login failed ");
        resolve({ status: false, active: true });
      }
    });
  },
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },
  blockUser: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(id) },
          {
            $set: {
              Status: "",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  unBlockUser: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(id) },
          {
            $set: {
              Status: "active",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  productView: (id) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(id) });
      resolve(product);
    });
  },
  deleteUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .deleteOne({ _id: objectId(userId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(cartItems);
    });
  },
  addToCart: (proId, userId,product) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1,
      productName: product.Name,
      actualPrice: product.Price,
      DiscountPrice:product.Offers.DiscountPrice,
      Discount:product.Offers.Discount,
      productImage: product.img,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == proId
        );
        if (proExist != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  changePdoductQuantity: (details) => {
    details.count = parseInt(details.count);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          {
            _id: objectId(details.cart),
            "products.item": objectId(details.product),
          },
          {
            $inc: { "products.$.quantity": details.count },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  removeFromCart: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: objectId(details.cart) },
          {
            $pull: { products: { item: objectId(details.product) } },
          }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        });
    });
  },
  getTotalAmount: (uresId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(uresId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            }, 
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.Offers.DiscountPrice"] } },
            },
          },
        ])
        .toArray();
      resolve(total[0]?.total);
    });
  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      resolve(cart?.products);
    });
  },
  placeOrderWithNewAddress: (order, products, total, method) => {
    return new Promise((resolve, reject) => {
      console.log(order, products, total);
      let status = order.PaymentMethod === "COD" ? "placed" : "pending";
      let orderObj = {
        deliveryDetails: {
          Name: order.Name,
          Mobile: order.Mobile,
          Address: order.Address,
          Pincode: order.Pincode,
          State: order.State,
          City: order.City,
          userId: objectId(order.userId),
        },
        userId: objectId(order.userId),
        PaymentMethode: order.PaymentMethod,
        products: products,
        totalAmount: total,
        status: status,
        Date: new Date(),
      };
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          db.get()
            .collection(collection.ADDRESS_COLLECTION)
            .insertOne(orderObj.deliveryDetails)
            .then((respons) => {
              db.get()
                .collection(collection.CART_COLLECTION)
                .deleteOne({ user: objectId(order.userId) });
              resolve(response.insrtedId);
            });
        });
    });
  },
  placeOrder: (order, products, total, actualAmnt, fromWallet, method) => {
    console.log('Hi cod');
    return new Promise((resolve, reject) => {
      let status = method === "COD" ? "placed" : "pending";
      let orderObj = {
        userId: objectId(order.userId),
        deliveryDetails: {
          Name: order.Name,
          Mobile: order.Mobile,
          Address: order.Address,
          Pincode: order.Pincode,
          State: order.State,
          City: order.City,
        },
        PaymentMethode: method,
        products: products,
        totalAmount: total,
        actualAmount: actualAmnt,
        fromWallet: fromWallet,
        status: status,
        Date: new Date(),
      };
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          db.get()
            .collection(collection.CART_COLLECTION)
            .deleteOne({ user: objectId(order.userId) });
          resolve(response.insertedId);
        });
    });
  },
  getAddressDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(collection.ADDRESS_COLLECTION)
        .find({ userId: objectId(userId) })
        .toArray();
      resolve(address);
    });
  },
  // for edit address
  getSingleAddress: (addressId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ADDRESS_COLLECTION)
        .findOne({ _id: objectId(addressId) })
        .then((address) => {
          resolve(address);
        });
    });
  },
  getUserAddressDetails: (addressId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ADDRESS_COLLECTION)
        .findOne({ _id: objectId(addressId) })
        .then((address) => {
          resolve(address);
        });
    });
  },
  getProfile: (userId) => {
    return new Promise(async (resolve, reject) => {
      let profile = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) });

      resolve(profile);
    });
  },
  userOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: objectId(userId) })
        .sort({ _id: -1 })
        .toArray();
      resolve(orders);
    });
  },
  getOrderedProductsCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let products = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (products) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  editAddress: (details) => {
    var addressId = objectId(details.addressId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ADDRESS_COLLECTION)
        .updateOne(
          { _id: objectId(addressId) },
          {
            $set: {
              Name: details.Name,
              PhoneNumber: details.PhoneNumber,
              State: details.State,
              Pincode: details.Pincode,
              City: details.City,
              House: details.House,
              Address: details.Address,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  changePassword: (userData, userId) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) });
      bcrypt.compare(userData.oldPassword, user.Password)
        .then(async (status) => {
          if (status) {
            var newPassword = await bcrypt.hash(userData.newPassword, 10);
            db.get()
              .collection(collection.USER_COLLECTION)
              .updateOne(
                { _id: objectId(userId) },
                {
                  $set: {
                    Password: newPassword,
                  },
                }
              )
              .then((data) => {
                resolve(response);
              });
          } else {
            resolve();
          }
        });
    });
  },
  changeuserProfile: (details) => {
    var addressId = objectId(details.userId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(details.userId) },
          {
            $set: {
              Name: details.Name,
              Number: details.Number,
              Email: details.Email,
              Surname: details.Surname,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  cancelOrder: (details, userId) => {
    return new Promise(async (resolve, reject) => {
      let walletData = {}
      let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(details.orderId) })
      let now = new Date()
      let date = moment(now).format('YYYYMMDD');
      let orderDate = moment(order.Date).format('YYYYMMDD');
      walletData.Amount = order.totalAmount
      walletData.userId = objectId(userId)
      console.log(date - orderDate);
      let refund = parseInt(order.totalAmount + order?.fromWallet)
      if (order.status != 'Shipped' && order.status != 'Delivered' && order.status != 'Cancelled' || !(date - orderDate) >= 7) {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne({ _id: objectId(details.orderId) }, { $set: { status: 'Cancelled' } })
          .then(async (response) => {
            if(order.status !="Pending"){
            let userWallet = await db.get()
              .collection(collection.WALLET_COLLECTION)
              .findOne({ userId: objectId(userId) })
            if (!userWallet) {
              console.log('No wallet');
              await db.get()
                .collection(collection.WALLET_COLLECTION)
                .insertOne(walletData)
            } else {
              await db.get()
                .collection(collection.WALLET_COLLECTION)
                .updateOne({ userId: objectId(userId) },
                  {
                    $inc: { Amount: refund }
                  }
                )
            }
            resolve({ canceled: true });
          }else{
            resolve({ canceled: true });
          }
          });
      } else if (order.status == 'Shipped') {
        reject({ shipped: true })
      } else if (order.status == 'Delivered') {
        reject({ Delivered: true })
      } else if (order.status == 'Cancelled') {
        reject({ Cancelled: true })
      } else {
        reject({ DateExed: true })
      }
    });
  },
  //RazorPay
  generateRazorpay: (orderId, totalPrice) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalPrice,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId
      };
      instance.orders.create(options, function (err, order) {
        resolve(order)
      });
    })
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require('crypto')
      let hmac = crypto.createHmac('sha256', 'rbt1OzFQAPzAxBp8hUeYmKni')

      hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
      hmac = hmac.digest('hex')
      if (hmac == details['payment[razorpay_signature]']) {
        resolve()
      } else {
        reject()
      }

    })
  },
  changePaymentStatus: ((orderId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({ _id: objectId(orderId) },
          {
            $set: {
              status: 'placed'
            }
          }
        ).then(() => {
          resolve()
        })
    })
  }),

  // Get the banner
  getTopBanner: (() => {
    return new Promise(async (resolve, reject) => {
      let banner = await db.get()
        .collection(collection.BANNER_COLLECTION)
        .aggregate([{ $match: { Position: 'Top', Status: 'Show' } },
        {
          $project: { _id: 0, img: 1 }
        },
        ]).toArray()
      resolve(banner)
    })
  }),

  getBottomBanner: (() => {
    return new Promise(async (resolve, reject) => {
      let banner = await db.get()
        .collection(collection.BANNER_COLLECTION)
        .aggregate([{ $match: { Position: 'Bottom', Status: 'Show' } },
        {
          $project: { _id: 0, img: 1 }
        },
        ]).toArray()
      resolve(banner)
    })
  }),

  // Add To wishlist

  addToWishList: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userWishlist = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userWishlist) {
        let proExist = userWishlist.products.findIndex(
          (product) => product.item == proId
        );
        console.log(proId, 'proId');
        console.log(proExist);
        if (proExist != -1) {
          reject()
          console.log('nop nop');
        } else {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let wishlist = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.WISHLIST_COLLECTION)
          .insertOne(wishlist)
          .then((response) => {
            resolve();
            console.log('New wishlest line 679');
          });
      }
    });
  },
  getWishlistCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let wishlist = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (wishlist) {
        count = wishlist.products.length;
      }
      resolve(count);
    });
  },

  getWishListItems: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wishlistItems = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      if (!wishlistItems.length == 0) {
        resolve(wishlistItems);
      } reject(error)
    })
  },

  getOrderDetails: (orderId) => {
    console.log(orderId, 'OrderId\n');
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
              fromWallet:'$fromWallet',
              actualAmount:'$actualAmount',
              item: "$products.item",
              quantity: "$products.quantity",
              Name:"$products.productName",
              img:"$products.productImage",
              actualPrice:"$products.actualPrice",
              DiscountPrice:"$products.DiscountPrice",
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
      if (!orderDetails.length == 0) {
        resolve(orderDetails);
      } reject(error)
    })

  },
  getCategoru: ((categoryName) => {
    console.log(categoryName.Name);
    return new Promise(async (resolve, reject) => {
      let category = await db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ Category: categoryName.Name })
        .toArray()
      if (!category.length == 0) {
        resolve(category)
      } else {
        reject()
      }
    })
  }),
  validateCoupon: ((code, userId) => {
    return new Promise(async (resolve, reject) => {
      let coupon = await db.get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ CouponCode: code.code })
      console.log(coupon?._id);
      if (coupon) {
        let checkUser = await db.get()
          .collection(collection.COUPON_COLLECTION)
          .findOne({
            CouponCode: code.code,
            users: {
              $elemMatch: {
                user: objectId(userId)
              }
            }
          })
        // !!!!!!!!!!!!!!!!!!!!!!! removed "!" for testing
        if (!checkUser) {
          console.log('\n Coupon ok \n');
          await db.get()
            .collection(collection.COUPON_COLLECTION)
            .updateOne(
              { _id: objectId(coupon._id) },
              {
                $push: { users: { user: objectId(userId) } }
              }
            )
          resolve(coupon)
        } else {
          reject({ used: true })
        }
      }
      reject({ valid: false })
    })
  }),

  removeCoupon: ((code, userId) => {
    console.log('Hi remove');
    return new Promise(async (resolve, reject) => {
      let lo = await db.get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ CouponCode: code.couponCode })
      let foo = await db.get()
        .collection(collection.COUPON_COLLECTION)
        .updateOne(
          { _id: objectId(lo?._id) },
          {
            $pull: { users: { user: objectId(userId) } },
          }
        )
      resolve()
    })
  }),

  walletDtls: ((userId) => {
    return new Promise(async (resolve, reject) => {
      let wallet = await db.get()
        .collection(collection.WALLET_COLLECTION)
        .findOne({ userId: objectId(userId) })
      if (wallet) {
        resolve(wallet.Amount)
      } reject()
    })
  }),
  deductFromWallet: ((amount, userId) => {
    return new Promise(async (resolve, reject) => {
      await db.get()
        .collection(collection.WALLET_COLLECTION)
        .updateOne({ userId: objectId(userId) }, {
          $inc: { Amount: -amount }
        })
      resolve()
    })
  }),
  userReferral: (code, userId) => {
    return new Promise(async (resolve, reject) => {
      let check = await db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) })
      if (check.Referral) {
        reject(check.Referral)
      } else {
        let Referral = await db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne({ _id: objectId(userId) },
            {
              $set: { Referral: code }
            }
          )
        resolve({ status: true })
      }
    })
  },

  removeFromWishlist:(proId,userId)=>{
    console.log(proId);
    console.log(userId);
    return new Promise(async(resolve,reject)=>{
      await db.get().collection(collection.WISHLIST_COLLECTION)
      .updateOne(
        {user: objectId(userId)},
        {
          $pull: { products: { item: objectId(proId.product) } },
        }
      )
      .then((response) => {
        console.log(response);
        resolve({ removeProduct: true });
      });
      
    })
  },

};
