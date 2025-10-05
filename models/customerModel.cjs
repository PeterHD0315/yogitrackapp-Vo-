const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

const customerModel = new mongoose.Schema({
    customerId: String,
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    senior: Boolean,
    address: String,
    preferredContact: String,
    classBalance: Number
}, {collection:"customer"});

module.exports = mongoose.model("Customer", customerModel);