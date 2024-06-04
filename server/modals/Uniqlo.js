const mongoose = require("mongoose")

const UniqloSchema = mongoose.Schema({}, {collection: 'clothes_data'});

const Uniqlo = mongoose.model("Uniqlo", UniqloSchema);
module.exports = Uniqlo;