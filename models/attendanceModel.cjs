const mongoose = require("mongoose");
require("../config/mongodbconn.cjs");

const attendanceModel = new mongoose.Schema({
    checkinId: Number,
    customerId: String,
    classId: String,
    datetime: String,
    status: {
        type: String,
        enum: ['checked-in', 'cancelled', 'no-show'],
        default: 'checked-in'
    }
}, {collection:"attendance"});

module.exports = mongoose.model("Attendance", attendanceModel);