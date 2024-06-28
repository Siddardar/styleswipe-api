const mongoose = require("mongoose")

const BrandsSchema = mongoose.Schema({}, {collection: 'brands_women'});

const BrandsWomen = mongoose.model("BrandsWomen", BrandsSchema);
module.exports = BrandsWomen;