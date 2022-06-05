var express = require("express");
const { response, render } = require("../app");
var router = express.Router();
var userHelpers = require("../helpers/user-helpers");
var config = require("../config/otp");
const { route } = require("./admin");
const productHelper = require("../helpers/products.helpers");
const { getAllCategory } = require("../helpers/products.helpers");
const async = require("hbs/lib/async");
const { getTotalAmount } = require("../helpers/user-helpers");
var client = require("twilio")(config.accountSID, config.authToken);
var verifyLogin = require("../middleware/verifySession");
const paypal = require("paypal-rest-sdk");
const { disconnect } = require("mongoose");
const adminHelpers = require("../helpers/admin-helpers");
require('dotenv').config()

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:process.env.paypalClientId,
  client_secret:process.env.paypalClientSecret,
});

/* GET home page. */
router.get("/", async function (req, res, next) {
  var user = req.session.user;
  var name = req.flash.Name;
  let cartCount = 0;
  let wishlistCount = 0;
  let today = new Date();
  await adminHelpers.offerExpiry(today).then((resp) => {

  })
  if (req.session.user) {
    wishlistCount = await userHelpers.getWishlistCount(req.session.user?._id);
    cartCount = await userHelpers.getCartCount(req.session.user?._id);
  }
  let category = await productHelper.getAllCategory();
  let bannerTop = await userHelpers.getTopBanner()
  let bannerBottom = await userHelpers.getBottomBanner()
  productHelper.getAllProducts().then((products) => {
    res.render("user/home", {
      title: "Sparklein",
      products,
      user,
      category,
      cartCount,
      wishlistCount,
      name,
      bannerTop,
      bannerBottom,
    });
  });
});

router.get("/product-view", async (req, res) => {
  var user = req.session.user;
  id = req.query.id;
  totalAmt = await userHelpers.getTotalAmount(req.session.user?._id);
  cartCount = await userHelpers.getCartCount(req.session.user?._id);
  wishlistCount = await userHelpers.getWishlistCount(req.session.user?._id);
  let name = req.flash.Name
  userHelpers.productView(id).then((product) => {
    var products = product;
    console.log(products);
    res.render("user/product-view", { products, user, cartCount, totalAmt, name, wishlistCount });
  });
});

router.get("/user-login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    loginErr = req.flash.loginErr;
    success = req.flash.success
    console.log("\n !@#!#!");
    res.render("user/user-login", { login: true, loginErr, success });
    req.flash.loginErr = false;
    req.flash.success = false;
  }
});
router.get("/user-signUp", (req, res) => {
  if (!req.session.user) {
    let referral = req.query?.referral
    console.log(referral, "THis is this");
    res.render("user/user-signUp", { login: true, failed: req.flash.failed, referral });
    req.flash.failed = false;
  } else {
    res.redirect("/");
  }
});

router.post("/user-login", (req, res) => {
  if (!req.session.user) {
    if (req.body.Email && req.body.Password) {
      userHelpers.doLogin(req.body).then((response) => {
        if (response.active) {
          if (response.status) {
            var Number = response.Number;
            var Name = response.Name;
            console.log(Name);
            client.verify
            .services(config.serviceSID)
            .verifications
            .create({
              to:`+91${Number}`,
              channel:'sms'
            })
            .then((data)=>{
            res.render('user/otp',{login: true,Number, Name})
            })
            // res.redirect("/");
            // req.session.user = response.user;
            // req.flash.Name = Name;
            // res.redirect("/");
          } else {
            req.flash.loginErr = "Invallid Email or Password";
            res.redirect("/user-login");
          }
        } else {
          req.flash.loginErr = "Admin is blocked you";
          res.redirect("/user-login");
        }
      });
    } else if (req.body.Email == "" && req.body.Password == "") {
      req.flash.loginErr = "Email and Password Must Not be Empty";
      res.redirect("/user-login");
    } else {
      req.flash.loginErr = "Invallid Email or Password";
      res.redirect("/user-login");
    }
  } else {
    redirect("/");
  }
});

router.post("/user-signUp", (req, res) => {
  req.flash.Number = req.body.Number;
  let referral = req.body.referral
  req.body.referral = null
  userHelpers.doSignup(req.body, referral).then((response) => {
    if (response) {
      req.flash.success = "Your account has been activated successfully. You can now login.";
      res.redirect("/user-login");
    } else {
      req.flash.failed = "Email Already Exists";
      res.redirect("/user-signUp");
    }
  });
});

router.get("/otp", (req, res) => {
  res.render("user/otp", {login:true});
});

router.post("/otp-varify", (req, res) => {
  var Number = req.query.Number;
  var Name = req.query.Name;
  console.log(Number);
  var otp = req.body.Number;
  var out = otp.join("");
  console.log(otp);
  console.log(out);
  client.verify
    .services(config.serviceSID)
    .verificationChecks.create({
      to: `+91${Number}`,
      code: out,
    })
    .then((data) => {
      if (data.status == "approved") {
        req.session.user = Name;
        res.redirect("/");
        req.flash.Number = null;
      } else {
        otpErr = "Invalid OTP";
        res.render("user/otp", {login:true, otpErr, Number });
      }
    });
});
router.post("/otp-resend", (req, res) => {
  var Number = req.query.Number;
  console.log(Number);
  client.verify
    .services(config.serviceSID)
    .verifications.create({
      to: `+91${Number}`,
      channel: "sms",
    })
    .then((data) => {
      console.log(JSON.stringify(data));
    });
});
router.get("/logout", (req, res) => {
  req.session.user = null;
  req.flash.Name = null
  req.flash.Number = null
  res.redirect("/");
});

router.get("/category", async (req, res) => {
  cartCount = 0
  wishlistCount = 0
  cartCount = await userHelpers.getCartCount(req.session.user?._id);
  wishlistCount = await userHelpers.getWishlistCount(req.session.user?._id);
  userHelpers.getCategoru(req.query).then((products) => {
    res.render("user/category", { products, cartCount, wishlistCount });
  }).catch(() => {
    console.log('No items');
    res.redirect('/')
  })
});

router.get("/cart", async (req, res) => {
  var user = req.session.user;
  totalAmt = await userHelpers.getTotalAmount(req.session.user?._id);
  cartCount = await userHelpers.getCartCount(req.session.user?._id);
  wishlistCount = await userHelpers.getWishlistCount(req.session.user?._id);
  let wallet = await userHelpers.walletDtls(req.session.user?._id).catch(() => { console.log('wallet= 0'); })
  if (totalAmt > wallet) {
    amountPayable = totalAmt - wallet
  } else {
    amountPayable = 0.00
  }
  userHelpers.getCartProducts(req.session.user?._id).then((products) => {
    res.render("user/cart", { products, user, wishlistCount, cartCount, totalAmt, wallet, amountPayable });
  });
});

router.get("/add-to-cart/:id", async (req, res) => {
  if (req.session.user) {
    count = await userHelpers.getCartCount(req.session.user?._id);
    product = await userHelpers.productView(req.params?.id)
    console.log(product);
    userHelpers.addToCart(req.params.id, req.session.user._id, product).then(() => {
      res.json({ status: true, count });
      console.log(count + "/*/*/*/");
    });
  } else {
    res.json({ status: false });
  }
});

router.post("/change-product-quantity", (req, res, next) => {
  console.log("1 Hi quantity");
  userHelpers.changePdoductQuantity(req.body).then(async (response) => {
    let totalAmt = await userHelpers.getTotalAmount(req.body.user);
    let wallet = await userHelpers.walletDtls(req.session.user?._id).catch(() => { console.log('wallet= 0'); })
    if (totalAmt > wallet) {
      amountPayable = totalAmt - wallet
    } else {
      amountPayable = 0.00
    }
    res.json({ status: true, totalAmt, amountPayable });
  });
});

router.post("/remove-from-cart", (req, res) => {
  userHelpers.removeFromCart(req.body).then((response) => {
    res.json(response);
    console.log("\n 0011");
  });
});

router.get("/payment", verifyLogin, async (req, res) => {
  let couponcode = req.flash.couponcode
  let address = await userHelpers.getAddressDetails(req.session.user?._id);
  totalAmt = await userHelpers.getTotalAmount(req.session.user?._id);
  let wallet = await userHelpers.walletDtls(req.session.user?._id).catch(() => { console.log('wallet= 0'); })
  if (totalAmt > wallet) {
    amountPayable = totalAmt - wallet
  } else {
    amountPayable = 0.00
  }
  if (!totalAmt) {
    res.redirect('/')
  } else if (req.flash.discount) {
    let totalAmt = req.flash.discount
    if (totalAmt > wallet) {
      amountPayable = totalAmt - wallet
    } else {
      amountPayable = 0.00
    }
    res.render("user/payment", { totalAmt, user: req.session.user, address, couponcode, wallet, amountPayable });
  } else {
    res.render("user/payment", { totalAmt, user: req.session.user, address, wallet, amountPayable });
  }
});

router.post("/payment", verifyLogin, async (req, res) => {
  let products = await userHelpers.getCartProductList(req.session.user?._id);
  if (products) {
    let address = await userHelpers.getUserAddressDetails(req.query.addressId, req.session.user?._id);
    let actualAmnt = totalAmt = await userHelpers.getTotalAmount(req.session.user?._id);
    let deductAmount = req.body.totalAmt - req.body.amount
    userHelpers.deductFromWallet(deductAmount, req.session.user?._id)
    totalAmt = parseInt(req.body.amount)
    console.log(totalAmt);
    req.flash.totalAmt = totalAmt
    totalPrice = totalAmt * 100
    userHelpers.placeOrder(address, products, totalAmt, actualAmnt, deductAmount, req.query.payment).then((orderId) => {
      req.flash.couponcode = ""
      req.flash.discount = false
      req.flash.orderId = orderId
      if (req.query.payment === "COD") {
        res.json({ codSuccess: true });
      } else if (req.query.payment === 'ONLINE') {
        userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
          console.log('\n line 232');
          response.user = req.session?.user
          response.razorpaySuccess = true

          console.log(response);
          res.json({ response })
        })
      } else {
        console.log('Paypal', req.query.payment);
        var create_payment_json = {
          "intent": "sale",
          "payer": {
            "payment_method": "paypal"
          },
          "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/payment"
          },
          "transactions": [{
            "item_list": {
              "items": [{
                "name": "item",
                "sku": "001",
                "price": totalAmt,
                "currency": "USD",
                "quantity": 1
              }]
            },
            "amount": {
              "currency": "USD",
              "total": totalAmt
            },
            "description": "This is the payment description."
          }]
        };
        paypal.payment.create(create_payment_json, function (error, payment) {
          if (error) {
            throw error;
          } else {
            payment.razorpaySuccess = false
            res.json(payment)
          }
        });
      }
    });
  } else {
    res.json({ falspayment: true })
  }
});

// Paypal Success
router.get('/success', (req, res) => {
  console.log('Hi paypal');
  var totalAmt = req.flash.totalAmt
  var orderId = req.flash.orderId
  const payerId = req.query.PayerID
  const paymentId = req.query.paymentId

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": totalAmt
      }
    }]
  }
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      userHelpers.changePaymentStatus(orderId).then(() => {
        console.log('\n Hi success')
        res.redirect('/order-placed')
      })
    }
  });
})

//Razorpay verification
router.post('/verify-payment', (req, res) => {
  userHelpers.verifyPayment(req.body).then(() => {
    console.log(req.body['order[response][receipt]'], 'recept\n');
    userHelpers.changePaymentStatus(req.body['order[response][receipt]']).then(() => {
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: 'payment failed' })
  })
})

// Order success hbs

router.get('/order-placed',verifyLogin, async (req, res) => {
  // res.render('user/order-success')
  orderId = req.flash.orderId
  if (orderId) {
    cartCount = 0
    wishlistCount = 0
    cartCount = await userHelpers.getCartCount(req.session.user?._id);
    wishlistCount = await userHelpers.getWishlistCount(req.session.user?._id);
    userHelpers.getOrderDetails(orderId).then((orderDetails) => {
      res.render('user/order-success',{orderDetails, wishlistCount, cartCount})
      req.flash.orderId = null
    }).catch(()=>{
      res.render('404')
    })
  }else{
    res.redirect('/')
  }
})

router.get("/addNewAddress", verifyLogin, async (req, res) => {
  let totalAmt = await userHelpers.getTotalAmount(req.session.user?._id);
  res.render("user/Add-address", { totalAmt, user: req.session.user });
});

router.post("/addNewAddress", async (req, res) => {
  let products = await userHelpers.getCartProductList(req.body?.userId);
  let totalAmt = await userHelpers.getTotalAmount(req.body?.userId);
  userHelpers
    .placeOrderWithNewAddress(req.body, products, totalAmt)
    .then(() => {
      res.render("user/order-success", { user: req.session.user });
    });
});

router.get("/order-list", verifyLogin, async (req, res) => {
  var name = req.flash.Name;
  cartCount = 0
  wishlistCount = 0
  cartCount = await userHelpers.getCartCount(req.session.user?._id);
  wishlistCount = await userHelpers.getWishlistCount(req.session.user?._id);
  let user = req.session.user;
  let orders = await userHelpers.userOrders(req.session.user?._id);
  res.render("user/order-history", { user, orders, name, wishlistCount, cartCount });
});

router.get("/user-profile", verifyLogin, async (req, res) => {
  let success = req.flash.success
  let failed = req.flash.failed
  let user = req.session.user;
  var name = req.flash.Name;
  let address = await userHelpers.getAddressDetails(req.session.user?._id);
  let profile = await userHelpers.getProfile(req.session.user?._id);
  cartCount = await userHelpers.getCartCount(req.session.user?._id);
  wishlistCount = await userHelpers.getWishlistCount(req.session.user?._id);
  let wallet = await userHelpers.walletDtls(req.session.user?._id).catch(() => { console.log('wallet= 0'); })
  res.render("user/user-profile", { profile, user, name, address, success, failed, wallet,wishlistCount,cartCount });
});

router.get("/edit-profileAddress", verifyLogin, async (req, res) => {
  let user = req.session.user;
  var name = req.flash.Name;
  var addressId = req.query.id
  let address = await userHelpers.getUserAddressDetails(req.query.id);
  res.render("user/edit-address", { user, name, address, addressId });
});


router.post("/editAddress", async (req, res) => {

  userHelpers.editAddress(req.body).then((respons) => {
    console.log(respons);
    res.json({ updated: true })
  });
});

router.post('/change-userProfile', (req, res) => {
  // var user= req.body.userId
  userHelpers.changeuserProfile(req.body).then((response) => {
    if (response) {
      res.json({ updated: true })
      // req.flash.success =
      //   "Password changed successfully";
      // // res.redirect("/user-profile"); 
    } else {
      res.json({ updated: false })
    }
  });
})



router.post('/change-userPassword', (req, res) => {
  var user = req.body.userId
  userHelpers.changePassword(req.body, user).then((response) => {
    if (response) {
      res.json({ updated: true })
    } else {
      res.json({ updated: false })
    }
  });
})


router.post("/cancel-order", (req, res) => {
  // console.log(req.body.orderId, 'jjkkklll');
  userHelpers.cancelOrder(req.body, req.session.user?._id).then((response) => {
    if (response) {
      res.json({ status: true });
    }
  }).catch((response) => {
    if (response.Shipped) {
      res.json({ Shipped: true });
    } else if (response.Delivered) {
      res.json({ Delivered: true });
    } else if (response.Cancelled) {
      res.json({ Cancelled: true });
    } else {
      res.json({ DateExed: true })
    }
  })
});

router.get('/wishlist', verifyLogin, async (req, res) => {
  cartCount = 0
  wishlistCount = 0
  cartCount = await userHelpers.getCartCount(req.session.user?._id);
  wishlistCount = await userHelpers.getWishlistCount(req.session.user?._id);
  userHelpers.getWishListItems(req.session.user?._id).then((wishlist) => {
    res.render('user/wishlist', { wishlist, cartCount, wishlistCount })
  }).catch((err) => {
    console.log(err);
  })
})


// Add to wishlist


router.post("/add-to-wishlist/:id", async (req, res) => {
  console.log('\n', req.params.id, 'Wishlist id \n');
  count = await userHelpers.getWishlistCount(req.session.user?._id);
  if (req.session.user) {
    userHelpers.addToWishList(req.params.id, req.session.user?._id).then(() => {
      res.json({ status: true, count });
      console.log("Wishlist added\n");
    }).catch(() => {
      console.log('\nErrorrrrrrrrrrrrrrrrrrrrrrrrrrrrrr\n');
      res.json({ status: 'exist' })
    });
  } else {
    res.json({ status: false });
  }
});

// View one Order
router.get('/view-order', verifyLogin, async (req, res) => {
  var name = req.flash.Name;
  cartCount = 0
  wishlistCount = 0
  cartCount = await userHelpers.getCartCount(req.session.user?._id);
  wishlistCount = await userHelpers.getWishlistCount(req.session.user?._id);
  userHelpers.getOrderDetails(req.query).then((orderDetails) => {
    console.log(orderDetails, 'Ordersss');
    res.render('user/view-order', { orderDetails, name, cartCount, wishlistCount })
  })
})

// coupon
router.post('/validate-coupon', verifyLogin, async (req, res) => {
  console.log(req.body, 'Hi');
  let totalAmt = await userHelpers.getTotalAmount(req.session.user?._id);
  userHelpers.validateCoupon(req.body, req.session.user?._id).then((couponDtls) => {
    let percentage = parseInt(couponDtls.Percentage)
    let discount = totalAmt * percentage / 100
    console.log(discount, 'less');
    req.flash.couponcode = couponDtls.CouponCode
    req.flash.discount = discount
    res.json({ status: true })
  }).catch((response) => {
    if (response.used) {
      res.json({ usedCoupon: true })
    } else if (!response.valid)
      res.json({ status: false })
  })
})

// Remove Coupon
router.post('/remove-coupon', (req, res) => {
  console.log('Hi');
  console.log(req.body);
  userHelpers.removeCoupon(req.body, req.session.user?._id).then(() => {
    res.json({ status: true })
    req.flash.couponcode = ""
    req.flash.discount = false
  })
})

// Referral generator
let referralCodeGenerator = require('referral-code-generator')
router.post('/referral', (req, res) => {
  let name = req.flash.Name
  let length = parseInt(name.length + 8)
  let referrall = 'referrall'
  let code = referralCodeGenerator.custom('uppercase', length, 12, name + referrall)
  userHelpers.userReferral(code, req.session.user?._id).then(() => {
    res.json(code)
  }).catch((reff) => {
    res.json(reff)
  })
})

// remove form wishlist

router.post('/remove-wishlist', async (req, res) => {
  userHelpers.removeFromWishlist(req.body, req.session.user?._id).then((response) => {
    res.json(response)

  })
})


module.exports = router;
