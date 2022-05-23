var collection = require("../model/collection");
var db = require("../config/database");
const async = require("hbs/lib/async");
const { sale } = require("paypal-rest-sdk");
var objectId = require("mongodb").ObjectId;
module.exports = {
  addProduct: (product, files, resolve) => {
    let Img = files.map((info, index) => {
      console.log(JSON.stringify(info));
      return files[index].filename;
    });
    console.log("##########");
    product.img = Img;
    product.Price = parseInt(product.Price);
    product.Stock = parseInt(product.Stock);
    db.get()
      .collection("product")
      .insertOne(product)
      .then(() => {
        resolve();
      });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },
  addCategory: (category, file) => {
    return new Promise(async (resolve, reject) => {
      let Img = file.filename;
      category.img = Img;
      db.get()
        .collection("category")
        .insertOne(category)
        .then((response) => {
          resolve(response);
        });
    });
  },
  getAllCategory: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },
  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: objectId(productId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  updateProduct: (productId, proDetails) => {
    console.log(proDetails.Name);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectId(productId) },
          {
            $set: {
              Name: proDetails.Name,
              Description: proDetails.Description,
              Price: proDetails.Price,
              Category: proDetails.Category,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  getProDetails: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(productId) })
        .then((product) => {
          resolve(product);
        });
    });
  },
  getAllorders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .sort({ date: -1 })
        .toArray();
      resolve(orders);
    });
  },
  statusUpdate: (status, orderId) => {
    return new Promise((resolve, reject) => {
      if (status == "Delevered") {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { id: objectId(orderId) },
            {
              $set: {
                status: status,
                Cancelled: false,
                Delivered: true,
              },
            }
          );
      } else if (status == "Cancelled") {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: objectId(orderId) },
            {
              $set: {
                status: status,
                Cancelled: true,
                Delivered: false,
              },
            }
          );
      } else {
        db.get()
          .collection(collection.ORDER_COLLECTION)
          .updateOne(
            { _id: objectId(orderId) },
            {
              $set: {
                status: status,
              },
            }
          )
          .then((response) => {
            resolve(true);
          });
      }
    });
  },
  topPayMethod: () => {
    return new Promise(async (resolve, reject) => {
      let count = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([{ $group: { _id: "$PaymentMethode", count: { $sum: 1 } } }])
        .toArray();
      resolve(count);
    });
  },
  totalRevenue: () => {
    return new Promise(async (resolve, reject) => {
      let revenue = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: null,
              revenue: { $sum: "$totalAmount" },
            },
          },
        ])
        .toArray();
      console.log(revenue, "revenue");
      resolve(revenue);
    });
  },
  // Daily sales
  getDailySales: () => {
    return new Promise(async (resolve, reject) => {
      let dailySales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              status: "Delivered",
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$Date" } },
              totalAmount: { $sum: "$totalAmount" },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])
        .toArray();

      resolve(dailySales);
    });
  },

  // Monthly sales

  getMonthlySales: () => {
    return new Promise(async (resolve, reject) => {
      let monthlySales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              status: "Delivered",
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$Date" } },
              totalAmount: { $sum: "$totalAmount" },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
          {
            $limit: 7,
          },
        ])
        .toArray();
      resolve(monthlySales);
    });
  },

  // Monthly sales for dashboard

  getMonthlySalesForGrowth: () => {
    return new Promise(async (resolve, reject) => {
      let monthlySales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              status: "Delivered",
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$Date" } },
              totalAmount: { $sum: "$totalAmount" },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: -1 },
          },
          {
            $limit: 7,
          },
        ])
        .toArray();
      resolve(monthlySales);
    });
  },


  // Yearly sales

  getYearlySales: () => {
    return new Promise(async (resolve, reject) => {
      let yearlySales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              status: "Delivered",
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y", date: "$Date" } },
              totalAmount: { $sum: "$totalAmount" },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
          {
            $limit: 7,
          },
        ])
        .toArray();

      resolve(yearlySales);
    });
  },


  // Yearly sales for dash board

  getYearlySalesForDashBoard: () => {
    return new Promise(async (resolve, reject) => {
      let yearlySales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              status: "Delivered",
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y", date: "$Date" } },
              totalAmount: { $sum: "$totalAmount" },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: -1 },
          },
          {
            $limit: 7,
          },
        ])
        .toArray();

      resolve(yearlySales);
    });
  },

  // Get all sales in the day

  getAllSales: () => {
    return new Promise(async (resolve, reject) => {
      let sales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%d", date: "$Date" } },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: -1 },
          },
          {
            $limit: 7,
          },
        ])
        .toArray();
      resolve(sales);
    });
  },

  // get all payment amount razorpay and Paypal
  getPaymentMethodAmount: () => {
    return new Promise(async (resolve, reject) => {
      let pay = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([{ $group: { _id: "$PaymentMethode", count: { $sum: "$totalAmount" }}},{
        $sort: { _id: 1 },
      },])
      .toArray();
      resolve(pay);
    });
  },
};
