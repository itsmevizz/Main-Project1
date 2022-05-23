var collection = require("../model/collection");
var db = require("../config/database");
const async = require("hbs/lib/async");
var objectId = require("mongodb").ObjectId;

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
                .sort({_id:-1})
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

            }resolve()
        })
    })
}