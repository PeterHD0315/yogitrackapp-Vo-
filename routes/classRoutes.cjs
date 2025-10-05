const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController.cjs");

router.get("/getClass", classController.getClass);
router.get("/getNextId", classController.getNextId);
router.post("/add", classController.add);
router.put("/update", classController.update);
router.get("/getClassIds", classController.getClassIds);
router.delete("/deleteClass", classController.deleteClass);
router.get("/getClassesByInstructor", classController.getClassesByInstructor);
router.get("/getWeeklySchedule", classController.getWeeklySchedule);

module.exports = router;