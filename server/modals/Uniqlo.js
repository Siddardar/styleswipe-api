const mongoose = require("mongoose")

const UniqloSchema = mongoose.Schema({}, {collection: 'clothes_data'});

const UniqloModel = mongoose.model("Uniqlo", UniqloSchema);
module.exports = UniqloModel;