const express = require('express');
const usrhelper = require('../../helpers/user-helpers')
const router = express.Router();
const path = require('path')

// const XLSX=require("xlsx")
const pdf = require("pdf-creator-node");
const fs = require("fs");
const async = require('hbs/lib/async');
const { json } = require('body-parser');
const adminHelpers = require('../../helpers/admin-helpers');
const productHelper = require('../../helpers/products.helpers')

const verifyAdmin = (req, res, next) => {
    if (req.session.admin) {
        next()
    }
    else {
        res.redirect('/admin')
    }
}

router.post('/get-report', async (req, res) => {

    let fromDate = new Date(req.body.FromDate)
    let tillDate = new Date(req.body.ToDate)
    var orders = await adminHelpers.salesReport(fromDate, tillDate)
    console.log(orders);
    res.render('admin/salesreport', {orders, admin: true })

    
})



module.exports = router;