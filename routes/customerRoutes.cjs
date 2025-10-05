const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController.cjs");

router.get("/getCustomer", customerController.getCustomer);
router.get("/getNextId", customerController.getNextId);
router.post("/add", customerController.add);
router.put("/update", customerController.update);
router.get("/getCustomerIds", customerController.getCustomerIds);
router.delete("/deleteCustomer", customerController.deleteCustomer);
router.put("/updateClassBalance", customerController.updateClassBalance);

module.exports = router;