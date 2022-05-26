let createError = require("http-errors");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
let hbs = require("express-handlebars");
let session = require("express-session");
let bodyParser = require("body-parser");
let db = require("./config/database");
let flash = require("connect-flash");
let helpers = require("handlebars-helpers")();

let adminRouter = require("./routes/admin");
let usersRouter = require("./routes/users");

let app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({helpers:{
    inc: function (value, options) {
      return parseInt(value) + 1;
    }
  },
    extname: "hbs",
    defaultLayout: "layouts",
    layoutsDis: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
  })
);
app.use((req, res, next) => {
  if (!req.user) {
    res.header(
      "Cache-Control",
      "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
  }
  next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({ secret: "Key", cookie: { maxAge: 900000 } }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());

app.use("/admin", adminRouter);
app.use("/", usersRouter);
const { error } = require("console");

//db connect
db.connect((err) => {
  if (err) {
    console.log("Connection Error" + err);
  } else console.log("Database Connected to port 27017");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.render('404',{error:true})
  // next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render("error");
    // render the error page
    //  (err.status || 500);
    res.render("500",{error:true});
});

module.exports = app;
