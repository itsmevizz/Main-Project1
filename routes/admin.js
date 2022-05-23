var express = require("express");
var multer = require("multer");
var router = express.Router();
const title = "Admin_panel";
const upload = require("../middleware/multer");
var productHelper = require("../helpers/products.helpers");
const userHelpers = require("../helpers/user-helpers");
const { response } = require("../app");
const { getAllProducts } = require("../helpers/products.helpers");
const async = require("hbs/lib/async");

/* GET users listing. */
router.get("/", function (req, res, next) {
  if(req.session.admin){
    res.redirect('admin/add-product')
  }else{
    res.render("admin/admin-login",{adminlogin:true, err: req.session.err});
    req.session.err = false;
  }
});

router.get("/admin-home",async (req, res) => {
  console.log('hi');
  let totalRevanue =await productHelper.totalRevenue()
  let pay =await productHelper.topPayMethod()
  let monthlySales= await productHelper.getMonthlySales()
  let dailySales = await productHelper.getDailySales()
  let yearlySales = await productHelper.getYearlySales()
  // Change array to object
  var topPayMethod =await pay.reduce(function(r, e) {
    r[e._id] = e.count;
    return r;
  }, {});
  // 

  console.log(topPayMethod,'/*/*/*/');
  res.render("admin/admin-home",{admin:true,topPayMethod,totalRevanue});
});

router.get('/view-allproducts',(req,res)=>{
  productHelper.getAllCategory().then((categorys)=>{
    let category = categorys
    productHelper.getAllProducts().then((product)=>{
      res.render("admin/view-allproducts",{admin:true, category, product});
      req.flash.success = false
      req.flash.failed =false
    })
  })
})

router.get("/admin-login", (req, res) => {
  res.render("admin/admin-login", { title, adminlogin: true });
});

router.get("/add-product", (req, res) => {
  success=req.flash.success
  failed = req.flash.failed
  productHelper.getAllCategory().then((categorys)=>{
    let category = categorys
    productHelper.getAllProducts().then((product)=>{
      res.render("admin/add-product",{admin:true, success,failed, category, product});
      req.flash.success = false
      req.flash.failed =false
    })
  })
});

router.post("/add-product", upload.array("Image", 10), (req, res) => {
  if (req.body.Category && req.files && req.body.Price ) {
  productHelper.addProduct(req.body,req.files, () => {
    req.flash.success = "Product added successfully";
    res.redirect("/admin/add-product");
    console.log('all don');
  });
  }else{
    req.flash.failed = "Please give the details";
    res.redirect("/admin/add-product");
  }
});

router.get('/all-users',(req, res)=>{
  userHelpers.getAllUsers().then((users)=>{
      res.render('admin/all-users',{admin:true, users})
  })
})

router.get('/Block-user',(req,res)=>{
  Id = req.query.id
  userHelpers.blockUser(Id).then((response)=>{
    console.log(response+'/*/*/');
    res.redirect('/admin/all-users')

  })
})
router.get('/unblock-user',(req,res)=>{
  Id = req.query.id
  userHelpers.unBlockUser(Id).then((response)=>{
    console.log("hi daa kuttaaa");
    res.redirect('/admin/all-users')
  })
})
router.get('/delete-user',(req,res)=>{
  let userId = req.query.id;
  console.log(userId);
  userHelpers.deleteUser(userId).then((response) => {
    res.redirect("/admin/all-users");
  });
})
// Category management

router.get('/category-manage',(req,res)=>{
  productHelper.getAllCategory().then((category)=>{
    console.log(category);
    res.render('admin/category-manage',{admin:true,category, failed:req.flash.failed, success: req.flash.success})
    req.flash.success = false;
      req.flash.failed = false;
  })
})
router.post('/add-category',upload.single('Image'),(req,res)=>{
  if(req.file && req.body){
    productHelper.addCategory(req.body,req.file,).then((data)=>{
      console.log(data+'#%$%%$$$');
      req.flash.success = "Product added successfully";
      res.redirect("/admin/category-manage");
    })
  }else{
    req.flash.failed = 'Please choose file'
    res.redirect("/admin/category-manage");
  }
})

router.get('/view-category',(req,res)=>{
  productHelper.getAllCategory().then((category)=>{
    console.log(category);
    res.render('admin/view-category',{admin:true,category})
  })
})



const credential = {
  username: "admin",
  password: "admin",
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
router.get("/delete-product", (req, res) => {
  let productId = req.query.id;
  productHelper.deleteProduct(productId).then((response) => {
    res.redirect("/admin");
  });
});
router.get("/edit-product", async (req, res) => {
  if (req.session.admin) {
    let product =await  productHelper.getProDetails(req.query.id);
    console.log(product);
    res.render("admin/edit-product", { admin: true, product });
  } else {
    res.redirect("/admin");
  }
});
router.post("/edit-product", (req, res) => {
  console.log(JSON.stringify(req.body));
  productHelper.updateProduct(req.query.id, req.body).then((response) => {
    console.log(response+'/*/*/*/*');
    res.redirect("/admin/add-product");
  });
});


// order manegement
router.get('/all-orders',(req,res)=>{
  productHelper.getAllorders().then((orders)=>{
   
    res.render('admin/all-orders',{admin:true,orders})
  })
})  

// delevery status
router.post('/deleveryStatusUpdate',(req,res)=>{
  console.log('Hi status');
  let status=req.body.status
  let orderId=req.body.orderId  
  productHelper.statusUpdate(status,orderId).then((response)=>{
   res.json(true)
  })
})


// Chart data page
router.get('/chartdata',(req,res)=>{
  res.render('admin/charts',{admin:true})
})

// Get dart data ajax call
router.get('/getChartData',async(req,res)=>{
  let monthlySales= await productHelper.getMonthlySales()
  let dailySales = await productHelper.getDailySales()
  let yearlySales = await productHelper.getYearlySales()
  let allSales = await productHelper.getAllSales()


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

      let  growth =Math.round( monthlyAmount[0]/monthlyAmount[1]*10 )

      let sales = Math.round(sale[0]/sale[1])
      

  console.log(dailyAmt,"daily \n", date,"date \n", monthlyAmount,'monyhly\n',month,'month\n',growth,'growth');

  res.json({dailyAmt,date,monthlyAmount,month,yearlyAmount,year,growth, sales})

})

module.exports = router;
