const mongoose = require("mongoose")

const UniqloSchema = mongoose.Schema({}, {collection: 'uniqlo_men_tops'});

const UniqloMenTops = mongoose.model("UniqloMenTops", UniqloSchema);
module.exports = UniqloMenTops;