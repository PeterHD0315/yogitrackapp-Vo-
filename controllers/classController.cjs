const Class = require("../models/classModel.cjs");
const Instructor = require("../models/instructorModel.cjs");

// Get class by classId
exports.getClass = async (req, res) => {
  try {
    const classId = req.query.classId;
    const classDetail = await Class.findOne({ classId: classId });

    res.json(classDetail);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Add new class
exports.add = async (req, res) => {
  try {
    const {
      classId,
      className,
      instructorId,
      classType,
      description,
      daytime
    } = req.body;

    // Basic validation
    if (!className || !instructorId || !classType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify instructor exists
    const instructor = await Instructor.findOne({ instructorId: instructorId });
    if (!instructor) {
      return res.status(400).json({ message: "Instructor not found" });
    }

    // Create a new class document
    const newClass = new Class({
      classId,
      className,
      instructorId,
      classType,
      description,
      daytime: daytime || []
    });

    // Save to database
    await newClass.save();
    res.status(201).json({ message: "Class added successfully", class: newClass });
  } catch (err) {
    console.error("Error adding class:", err.message);
    res.status(500).json({ message: "Failed to add class", error: err.message });
  }
};

// Get all class IDs for dropdown
exports.getClassIds = async (req, res) => {
  try {
    const classes = await Class.find(
      {},
      { classId: 1, className: 1, instructorId: 1, classType: 1, _id: 0 }
    ).sort({ classId: 1 });

    // Get instructor names for display
    const classesWithInstructor = await Promise.all(
      classes.map(async (cls) => {
        const instructor = await Instructor.findOne(
          { instructorId: cls.instructorId },
          { firstname: 1, lastname: 1, _id: 0 }
        );
        return {
          ...cls.toObject(),
          instructorName: instructor ? `${instructor.firstname} ${instructor.lastname}` : 'Unknown'
        };
      })
    );

    res.json(classesWithInstructor);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Get next available class ID
exports.getNextId = async (req, res) => {
  try {
    const lastClass = await Class.find({})
      .sort({ classId: -1 })
      .limit(1);

    let maxNumber = 1;
    if (lastClass.length > 0) {
      const lastId = lastClass[0].classId;
      const match = lastId.match(/\d+$/);
      if (match) {
        maxNumber = parseInt(match[0]) + 1;
      }
    }
    const nextId = `A${maxNumber.toString().padStart(3, '0')}`;
    res.json({ nextId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Update class
exports.update = async (req, res) => {
  try {
    const { 
      classId, 
      className, 
      instructorId, 
      classType, 
      description, 
      daytime 
    } = req.body;

    // Verify instructor exists if instructorId is being updated
    if (instructorId) {
      const instructor = await Instructor.findOne({ instructorId: instructorId });
      if (!instructor) {
        return res.status(400).json({ message: "Instructor not found" });
      }
    }
    
    const updatedClass = await Class.findOneAndUpdate(
      { classId },
      { 
        className, 
        instructorId, 
        classType, 
        description, 
        daytime 
      },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.json({ message: "Class updated successfully", class: updatedClass });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete class
exports.deleteClass = async (req, res) => {
  try {
    const { classId } = req.query;
    const result = await Class.findOneAndDelete({ classId });
    
    if (!result) {
      return res.status(404).json({ error: "Class not found" });
    }
    
    res.json({ message: "Class deleted", classId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get classes by instructor
exports.getClassesByInstructor = async (req, res) => {
  try {
    const { instructorId } = req.query;
    const classes = await Class.find({ instructorId: instructorId });
    
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get weekly schedule
exports.getWeeklySchedule = async (req, res) => {
  try {
    const classes = await Class.find({});
    
    // Create a weekly schedule object
    const weeklySchedule = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };

    // Populate the schedule
    for (const cls of classes) {
      const instructor = await Instructor.findOne(
        { instructorId: cls.instructorId },
        { firstname: 1, lastname: 1, _id: 0 }
      );
      
      cls.daytime.forEach(schedule => {
        const dayKey = getDayKey(schedule.day);
        if (weeklySchedule[dayKey]) {
          weeklySchedule[dayKey].push({
            classId: cls.classId,
            className: cls.className,
            instructor: instructor ? `${instructor.firstname} ${instructor.lastname}` : 'Unknown',
            time: schedule.time,
            duration: schedule.duration,
            classType: cls.classType,
            description: cls.description
          });
        }
      });
    }

    // Sort each day by time
    Object.keys(weeklySchedule).forEach(day => {
      weeklySchedule[day].sort((a, b) => a.time.localeCompare(b.time));
    });

    res.json(weeklySchedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function to convert day abbreviations to full names
function getDayKey(day) {
  const dayMap = {
    'Mon': 'Monday',
    'Tue': 'Tuesday', 
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday',
    'Sun': 'Sunday'
  };
  return dayMap[day] || day;
}