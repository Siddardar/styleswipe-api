const mongoose = require("mongoose")

const UniqloSchema = mongoose.Schema({}, {collection: 'uniqlo_women_tops'});

const UniqloWomenTops = mongoose.model("UniqloWomenTops", UniqloSchema);
module.exports = UniqloWomenTops;