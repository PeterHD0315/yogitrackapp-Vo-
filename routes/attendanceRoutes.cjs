const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController.cjs");

router.get("/getAttendance", attendanceController.getAttendance);
router.post("/checkin", attendanceController.checkin);
router.get("/getAttendanceRecords", attendanceController.getAttendanceRecords);
router.put("/updateStatus", attendanceController.updateAttendanceStatus);
router.put("/cancelCheckin", attendanceController.cancelCheckin);
router.get("/getCustomerHistory", attendanceController.getCustomerAttendanceHistory);
router.get("/getClassAttendance", attendanceController.getClassAttendance);
router.get("/getStats", attendanceController.getAttendanceStats);

module.exports = router;