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
    console.log('ghhghghghhghgghghhgh');
    var html = fs.readFileSync("./views/admin/template.html", "utf8");
    var options = {
        format: "A4",
        orientation: "portrait",
        border: "10mm",
        header: {
            height: "45mm",
            contents: '<div style="text-align: center;">Author: Sparkle in</div>'
        },
        footer: {
            height: "28mm",
            contents: {
                first: 'Cover page',
                2: 'Second page', // Any page number is working. 1-based index
                default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                last: 'Last Page'
            }
        }
    };
    var filename1 = Math.random() + 'doc' + '.pdf'
    var filepath = './public/documents/' + filename1

    let fromDate = new Date(req.body.FromDate)
    let tillDate = new Date(req.body.ToDate)
    var orders = await adminHelpers.salesReport(fromDate, tillDate)
    var document = {
        html: html,
        data: {
            orders: orders,
        },
        path: filepath,
        type: "",
    };

    pdf.create(document, options)
        .then((res) => {
            console.log(res);

        })
        .catch((error) => {
            console.error(error);
            res.render('errors/error404', { title: 'Error', admin: true })
        });
    let pay = await productHelper.topPayMethod()
    // Change array to object
    var topPayMethod = await pay.reduce(function (r, e) {
        r[e._id] = e.count;
        return r;
    }, {});
    // 
    res.render('admin/admin-home', { path: filename1,topPayMethod, admin: true })
})



module.exports = router;