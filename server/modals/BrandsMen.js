const mongoose = require("mongoose")

const BrandsSchema = mongoose.Schema({}, {collection: 'brands_men'});

const BrandsMen = mongoose.model("BrandsMen", BrandsSchema);
module.exports = BrandsMen;