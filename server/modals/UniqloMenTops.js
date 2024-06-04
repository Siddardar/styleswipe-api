const mongoose = require("mongoose")

const UniqloSchema = mongoose.Schema({}, {collection: 'uniqlo_men_tops'});

const UniqloModel = mongoose.model("Uniqlo", UniqloSchema);
module.exports = UniqloModel;