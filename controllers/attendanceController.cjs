const Attendance = require("../models/attendanceModel.cjs");
const Customer = require("../models/customerModel.cjs");
const Class = require("../models/classModel.cjs");
const Instructor = require("../models/instructorModel.cjs");

// Get attendance record by checkinId
exports.getAttendance = async (req, res) => {
  try {
    const checkinId = req.query.checkinId;
    const attendanceDetail = await Attendance.findOne({ checkinId: checkinId });

    res.json(attendanceDetail);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Check-in a customer to a class
exports.checkin = async (req, res) => {
  try {
    const {
      customerId,
      classId,
      datetime
    } = req.body;

    // Basic validation
    if (!customerId || !classId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify customer exists and has class balance
    const customer = await Customer.findOne({ customerId: customerId });
    if (!customer) {
      return res.status(400).json({ message: "Customer not found" });
    }

    if (customer.classBalance <= 0) {
      return res.status(400).json({ message: "Customer has no remaining class balance" });
    }

    // Verify class exists
    const classDetail = await Class.findOne({ classId: classId });
    if (!classDetail) {
      return res.status(400).json({ message: "Class not found" });
    }

    // Get next checkin ID
    const lastAttendance = await Attendance.find({})
      .sort({ checkinId: -1 })
      .limit(1);

    let nextCheckinId = 1;
    if (lastAttendance.length > 0) {
      nextCheckinId = lastAttendance[0].checkinId + 1;
    }

    // Create attendance record
    const newAttendance = new Attendance({
      checkinId: nextCheckinId,
      customerId,
      classId,
      datetime: datetime || new Date().toISOString().split('T')[0],
      status: 'checked-in'
    });

    // Save attendance record
    await newAttendance.save();

    // Update customer class balance
    await Customer.findOneAndUpdate(
      { customerId },
      { $inc: { classBalance: -1 } }
    );

    res.status(201).json({ 
      message: "Check-in successful", 
      attendance: newAttendance,
      remainingBalance: customer.classBalance - 1
    });
  } catch (err) {
    console.error("Error checking in:", err.message);
    res.status(500).json({ message: "Failed to check in", error: err.message });
  }
};

// Get all attendance records with customer and class details
exports.getAttendanceRecords = async (req, res) => {
  try {
    const { customerId, classId, date } = req.query;
    let filter = {};

    if (customerId) filter.customerId = customerId;
    if (classId) filter.classId = classId;
    if (date) filter.datetime = date;

    const attendanceRecords = await Attendance.find(filter).sort({ checkinId: -1 });

    // Enrich with customer and class details
    const enrichedRecords = await Promise.all(
      attendanceRecords.map(async (record) => {
        const customer = await Customer.findOne(
          { customerId: record.customerId },
          { firstName: 1, lastName: 1, classBalance: 1, _id: 0 }
        );
        const classDetail = await Class.findOne(
          { classId: record.classId },
          { className: 1, instructorId: 1, _id: 0 }
        );
        const instructor = classDetail ? await Instructor.findOne(
          { instructorId: classDetail.instructorId },
          { firstname: 1, lastname: 1, _id: 0 }
        ) : null;

        return {
          ...record.toObject(),
          customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
          customerBalance: customer ? customer.classBalance : 0,
          className: classDetail ? classDetail.className : 'Unknown',
          instructorName: instructor ? `${instructor.firstname} ${instructor.lastname}` : 'Unknown'
        };
      })
    );

    res.json(enrichedRecords);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Update attendance status
exports.updateAttendanceStatus = async (req, res) => {
  try {
    const { checkinId, status } = req.body;

    const updatedAttendance = await Attendance.findOneAndUpdate(
      { checkinId },
      { status },
      { new: true }
    );

    if (!updatedAttendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    res.json({ message: "Attendance status updated", attendance: updatedAttendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel check-in and restore class balance
exports.cancelCheckin = async (req, res) => {
  try {
    const { checkinId } = req.body;

    const attendance = await Attendance.findOne({ checkinId });
    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    if (attendance.status === 'cancelled') {
      return res.status(400).json({ message: "Check-in already cancelled" });
    }

    // Update attendance status
    await Attendance.findOneAndUpdate(
      { checkinId },
      { status: 'cancelled' }
    );

    // Restore customer class balance only if it was a successful check-in
    if (attendance.status === 'checked-in') {
      await Customer.findOneAndUpdate(
        { customerId: attendance.customerId },
        { $inc: { classBalance: 1 } }
      );
    }

    res.json({ message: "Check-in cancelled and balance restored" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get customer's attendance history
exports.getCustomerAttendanceHistory = async (req, res) => {
  try {
    const { customerId } = req.query;
    
    const attendanceHistory = await Attendance.find({ customerId }).sort({ datetime: -1 });
    
    // Enrich with class details
    const enrichedHistory = await Promise.all(
      attendanceHistory.map(async (record) => {
        const classDetail = await Class.findOne(
          { classId: record.classId },
          { className: 1, instructorId: 1, _id: 0 }
        );
        const instructor = classDetail ? await Instructor.findOne(
          { instructorId: classDetail.instructorId },
          { firstname: 1, lastname: 1, _id: 0 }
        ) : null;

        return {
          ...record.toObject(),
          className: classDetail ? classDetail.className : 'Unknown',
          instructorName: instructor ? `${instructor.firstname} ${instructor.lastname}` : 'Unknown'
        };
      })
    );

    res.json(enrichedHistory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get class attendance for a specific class
exports.getClassAttendance = async (req, res) => {
  try {
    const { classId, date } = req.query;
    let filter = { classId };
    
    if (date) filter.datetime = date;
    
    const classAttendance = await Attendance.find(filter).sort({ datetime: -1 });
    
    // Enrich with customer details
    const enrichedAttendance = await Promise.all(
      classAttendance.map(async (record) => {
        const customer = await Customer.findOne(
          { customerId: record.customerId },
          { firstName: 1, lastName: 1, phone: 1, email: 1, _id: 0 }
        );

        return {
          ...record.toObject(),
          customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
          customerPhone: customer ? customer.phone : '',
          customerEmail: customer ? customer.email : ''
        };
      })
    );

    res.json(enrichedAttendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get attendance statistics
exports.getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = {};
    
    if (startDate && endDate) {
      filter.datetime = { $gte: startDate, $lte: endDate };
    }

    const totalCheckins = await Attendance.countDocuments({ ...filter, status: 'checked-in' });
    const totalCancellations = await Attendance.countDocuments({ ...filter, status: 'cancelled' });
    const totalNoShows = await Attendance.countDocuments({ ...filter, status: 'no-show' });

    // Get most popular classes
    const popularClasses = await Attendance.aggregate([
      { $match: { ...filter, status: 'checked-in' } },
      { $group: { _id: '$classId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Enrich popular classes with class names
    const enrichedPopularClasses = await Promise.all(
      popularClasses.map(async (item) => {
        const classDetail = await Class.findOne(
          { classId: item._id },
          { className: 1, _id: 0 }
        );
        return {
          classId: item._id,
          className: classDetail ? classDetail.className : 'Unknown',
          attendanceCount: item.count
        };
      })
    );

    res.json({
      totalCheckins,
      totalCancellations,
      totalNoShows,
      popularClasses: enrichedPopularClasses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};