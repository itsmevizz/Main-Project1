var express = require("express");
var multer = require("multer");
var router = express.Router();
const title = "Admin_panel";
const upload = require("../middleware/multer");
const uploadBanner = require('../middleware/bannerMulter')
var productHelper = require("../helpers/products.helpers");
const userHelpers = require("../helpers/user-helpers");
const { response } = require("../app");
const { getAllProducts } = require("../helpers/products.helpers");
const async = require("hbs/lib/async");
const { trusted } = require("mongoose");
const adminHelpers = require('../helpers/admin-helpers')
const pdf = require('../public/javascripts/pdf')
require('dotenv').config()

const verifyAdmin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin");
  }
}

router.get("/", function (req, res, next) {
  if (req.session.admin) {
    res.redirect('admin/admin-home')
  } else {
    res.render("admin/admin-login", { adminlogin: true, err: req.session.err });
    req.session.err = false;
  }
});

router.get("/admin-home", async (req, res) => {
  console.log('hi');
  let totalRevanue = await productHelper.totalRevenue()
  let pay = await productHelper.topPayMethod()
  let monthlySales = await productHelper.getMonthlySales()
  let dailySales = await productHelper.getDailySales()
  let yearlySales = await productHelper.getYearlySales()
  // Change array to object
  var topPayMethod = await pay.reduce(function (r, e) {
    r[e._id] = e.count;
    return r;
  }, {});
  // 

  console.log(topPayMethod, '/*/*/*/');
  res.render("admin/admin-home", { admin: true, topPayMethod, totalRevanue });
});

router.get('/view-allproducts', verifyAdmin, (req, res) => {
  productHelper.getAllCategory().then((categorys) => {
    let category = categorys
    productHelper.getAllProducts().then((product) => {
      res.render("admin/view-allproducts", { admin: true, category, product });
      req.flash.success = false
      req.flash.failed = false
    })
  })
})

router.get("/admin-login", verifyAdmin, (req, res) => {
  res.render("admin/admin-login", { title, adminlogin: true });
});

router.get("/add-product", verifyAdmin, (req, res) => {
  success = req.flash.success
  failed = req.flash.failed
  productHelper.getAllCategory().then((categorys) => {
    let category = categorys
    productHelper.getAllProducts().then((product) => {
      res.render("admin/add-product", { admin: true, success, failed, category, product });
      req.flash.success = false
      req.flash.failed = false
    })
  })
});

router.post("/add-product", verifyAdmin, upload.array("Image", 10), (req, res) => {
  if (req.body.Category && req.files && req.body.Price) {
    productHelper.addProduct(req.body, req.files, () => {
      req.flash.success = "Product added successfully";
      res.redirect("/admin/add-product");
      console.log('all don');
    });
  } else {
    req.flash.failed = "Please give the details";
    res.redirect("/admin/add-product");
  }
});

router.get('/all-users', verifyAdmin, (req, res) => {
  userHelpers.getAllUsers().then((users) => {
    res.render('admin/all-users', { admin: true, users })
  })
})

router.post('/Block-user', (req, res) => {
  Id = req.body.id
  userHelpers.blockUser(Id).then((response) => {
    console.log(response + '/*/*/');
    res.json({ blocked: true })
  })
})
router.post('/unblock-user', (req, res) => {
  Id = req.body.id
  userHelpers.unBlockUser(Id).then((response) => {
    console.log("hi daa kuttaaa");
    res.json({ unblocked: true })
  })
})
router.get('/delete-user', verifyAdmin, (req, res) => {
  let userId = req.query.id;
  console.log(userId);
  userHelpers.deleteUser(userId).then((response) => {
    res.redirect("/admin/all-users");
  });
})
// Category management

router.get('/category-manage', verifyAdmin, (req, res) => {
  productHelper.getAllCategory().then((category) => {
    console.log(category);
    res.render('admin/category-manage', { admin: true, category, failed: req.flash.failed, success: req.flash.success })
    req.flash.success = false;
    req.flash.failed = false;
  })
})
router.post('/add-category', upload.single('Image'), (req, res) => {
  if (req.file && req.body.Name) {
    productHelper.addCategory(req.body, req.file,).then((data) => {
      console.log(data + '#%$%%$$$');
      req.flash.success = "Product added successfully";
      res.redirect("/admin/category-manage");
    })
  } else {
    req.flash.failed = 'Please give details'
    res.redirect("/admin/category-manage");
  }
})

router.get('/view-category', verifyAdmin, (req, res) => {
  productHelper.getAllCategory().then((category) => {
    console.log(category);
    res.render('admin/view-category', { admin: true, category })
  })
})



const credential = {
  username: process.env.adminUsername,
  password: process.env.adminPassword,
};
//login user............
router.post("/login", (req, res) => {
  if (
    req.body.User == credential.username &&
    req.body.Password == credential.password
  ) {
    req.session.admin = req.body.User;
    if (req.session.admin) {
      res.redirect("/admin/admin-home");
    }
  } else {
    if (req.body.User == "" || req.body.Password == "") {
      req.session.err = "Username and password must not be empty";
      res.redirect("/admin");
    } else {
      req.session.err = "Invalid Username or Password";
      res.redirect("/admin");
    }
  }
});
router.post("/adminlogout", (req, res) => {
  req.session.admin = null;
  res.redirect("/admin");
});
router.get("/delete-product", verifyAdmin, (req, res) => {
  let productId = req.query.id;
  productHelper.deleteProduct(productId).then((response) => {
    res.redirect("/admin");
  });
});
router.get("/edit-product", verifyAdmin, async (req, res) => {
  if (req.session.admin) {
    let product = await productHelper.getProDetails(req.query.id);
    console.log(product);
    res.render("admin/edit-product", { admin: true, product });
  } else {
    res.redirect("/admin");
  }
});
router.post("/edit-product", (req, res) => {
  console.log(JSON.stringify(req.body));
  productHelper.updateProduct(req.query.id, req.body).then((response) => {
    console.log(response + '/*/*/*/*');
    res.redirect("/admin/add-product");
  });
});


// order manegement
router.get('/all-orders', (req, res) => {
  adminHelpers.getAllorders().then((orders) => {
    orders.map(async (order) => {
      if (order.status == 'placed') {
        let options = [{ "option": "Cancelled" }, { "option": "Shipped" }]
        order.options = options
      } else if (order.status == "Shipped") {
        let options = [{ "option": "Delivered" }]
        order.options = options
      }
    })
    console.log(orders);
    res.render('admin/all-orders', { admin: true, orders })
  })
})

// delevery status
router.post('/deleveryStatusUpdate', (req, res) => {
  console.log('Hi status');
  let status = req.body.status
  let orderId = req.body.orderId
  productHelper.statusUpdate(status, orderId).then((response) => {
    res.json(true)
  })
})


// Chart data page
router.get('/chartdata', verifyAdmin, (req, res) => {
  res.render('admin/charts', { admin: true })
})

// Get dart data ajax call
router.get('/getChartData', async (req, res) => {
  let monthlySales = await productHelper.getMonthlySales()
  let dailySales = await productHelper.getDailySales()
  let yearlySales = await productHelper.getYearlySales()
  let allSales = await productHelper.getAllSales()
  let pay = await productHelper.getPaymentMethodAmount()
  let forgrowth = await productHelper.getMonthlySalesForGrowth()
  let fordash = await productHelper.getYearlySalesForDashBoard()
  let walletTotal = await adminHelpers.getTotalWallet()
  let orderStatistics = await adminHelpers.getOrderStatus()
  let totalOrders = await adminHelpers.getTotalOrders()
  let totalUsers = await adminHelpers.getAllUsers()

  // map to get only the total amount
  let dailyAmt = [];
  dailySales.map((daily) => {
    dailyAmt.push(daily.totalAmount);
  });
  // map to get only the dates
  let date = [];
  dailySales.map((daily) => {
    date.push(daily._id);
  });
  // map to get only the amount
  let monthlyAmount = [];
  monthlySales.map((daily) => {
    monthlyAmount.push(daily.totalAmount);
  });
  // map to get only the date
  let month = [];
  monthlySales.map((daily) => {
    month.push(daily._id);
  });


  // map to get only the amount
  let yearlyAmount = [];
  yearlySales.map((daily) => {
    yearlyAmount.push(daily.totalAmount);
  });

  // map to get only the year
  let year = [];
  yearlySales.map((daily) => {
    year.push(daily._id);
  });

  // map to get the count of sale
  let sale = [];
  allSales.map((daily) => {
    sale.push(daily.count);
  });

  // map to get the amount of online transaction
  let transactions = [];
  pay.map((tran) => {
    transactions.push(tran.count);
  });

  // map to get the amount for dashbord growth
  let grow = [];
  forgrowth.map((tran) => {
    grow.push(tran.totalAmount);
  });

  // map to get the amount for dashbord profit
  let pro = [];
  fordash.map((tran) => {
    pro.push(tran.totalAmount);
  });

  // map to get orderStatistics count
  let Statistics = []
  orderStatistics.map((sta) => {
    Statistics.push(sta.count)
  })
  // map to get orderStatistics label
  let statLabls = []
  orderStatistics.map((lab) => {
    statLabls.push(lab._id)
  })
  let statisticsLable = []
  statLabls.map((sss) => {
    statisticsLable.push()
  })
  // Total orders
  let ttlOrders = []
  totalOrders.map((ttl) => {
    ttlOrders.push(ttl.count)
  })
  // Total wallet
  let wallet = []
  walletTotal.map((wlt) => {
    wallet.push(wlt.Total)
  })
  // Total users
  let users = []
  totalUsers.map((usrs) => {
    users.push(usrs.count)
  })
  console.log(grow);
  let growth = Math.round(grow[1] / grow[0])

  let sales = Math.round(sale[0] / sale[1])

  let profit = Math.round((pro[0] * (30 / 100)) + pro[0])

  let transaction = transactions[0] + transactions[1] + transactions[2]

  let payments = transactions[1] + transactions[2]

  // console.log(dailySales,'daily');

  res.json({ dailyAmt, date, monthlyAmount, month, yearlyAmount, grow, year, growth, sales, profit, transaction, payments, wallet, statisticsLable, Statistics, ttlOrders, users })

})

// Banner Managment
router.get('/bannermanage', verifyAdmin, (req, res) => {
  let success = req.flash.success
  res.render('admin/bannermanagement', { admin: true, failed: req.flash.failed, success })
  req.flash.failed = false;
  req.flash.success = false;
})

router.post('/add-banner', uploadBanner.single('Image'), (req, res) => {
  if (req.file && req.body) {
    adminHelpers.addBanner(req.body, req.file,).then((data) => {
      req.flash.success = "Banner added successfully";
      res.redirect("/admin/bannermanage");
    })
  } else {
    req.flash.failed = 'Please choose file'
    res.redirect("/admin/bannermanage");
  }
})

// View Banner

router.get('/view-banners', verifyAdmin, async (req, res) => {
  let banners = await adminHelpers.getBanners()
  console.log(banners);
  res.render('admin/view-banners', { admin: true, banners })
})

// Delete banner
router.post('/delete-banner', (req, res) => {
  console.log(req.body, 'Helloo');
  adminHelpers.removeBanner(req.body).then(() => {
    res.json({ bannerRemoved: true })
  })
})

// Desable banner
router.post('/desable-banner', (req, res) => {
  adminHelpers.hideandShowBanner(req.body).then(() => {
    res.json({ bannerDesabled: true })
  })
})

// Coupon Manage

router.get('/coupons', verifyAdmin, async (req, res) => {
  let coupons = await adminHelpers.getAllCoupons().then((coupons) => {
    res.render('admin/coupon', { admin: true, coupons, failed: req.flash.failed })
    req.flash.failed = false

  })
})

router.post('/add-coupon', (req, res) => {
  adminHelpers.addCoupon(req.body).then((response) => {
    if (response) {
      res.redirect('/admin/coupons')
    } else {
      req.flash.failed = 'Coupon already there'
      res.redirect('/admin/coupons')
    }
  })
})

router.post('/remove-coupon', async (req, res) => {
  console.log(req.body);
  await adminHelpers.removeCoupon(req.body).then(() => {
    res.json({ satus: true })
  })
})

router.get('/category-offers', verifyAdmin, async (req, res) => {
  let category = await productHelper.getCategoryOfferrr()
  res.render('admin/category-offer', { admin: true, category, success: req.flash.success })
  req.flash.success = null
})

router.post("/remove-cateOffer", async (req, res) => {
  console.log('hi cat');
  await adminHelpers.removeCateOffer(req.body).then(() => {
    res.json({ status: true })
  })
})


router.post('/add-category-offer', (req, res) => {
  adminHelpers.addCategoryOffer(req.body).then(() => {
    req.flash.success = 'Ok'
    res.redirect('/admin/category-offers')
  })
})
router.get('/order-dtls', verifyAdmin, async (req, res) => {
  await adminHelpers.getOrderDetails(req.query).then((details) => {
    console.log(details);
    res.render('admin/view-orderDtls', { details, admin: true })

  }).catch((e) => {
    console.log('Hi')
  })
})


router.post('/get-report', async (req, res) => {

  var tomorrow = new Date(req.body.ToDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  let fromDate = new Date(req.body.FromDate)
  var orders = await adminHelpers.salesReport(fromDate, tomorrow)
  console.log(orders);
  res.render('admin/salesreport', { orders, admin: true })


})


module.exports = router;
