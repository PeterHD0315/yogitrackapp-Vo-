const Customer = require("../models/customerModel.cjs");

// Get customer by customerId
exports.getCustomer = async (req, res) => {
  try {
    const customerId = req.query.customerId;
    const customerDetail = await Customer.findOne({ customerId: customerId });

    res.json(customerDetail);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Add new customer
exports.add = async (req, res) => {
  try {
    const {
      customerId,
      firstName,
      lastName,
      email,
      phone,
      senior,
      address,
      preferredContact,
      classBalance
    } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create a new customer document
    const newCustomer = new Customer({
      customerId,
      firstName,
      lastName,
      email,
      phone,
      senior: senior || false,
      address,
      preferredContact,
      classBalance: classBalance || 0
    });

    // Save to database
    await newCustomer.save();
    res.status(201).json({ message: "Customer added successfully", customer: newCustomer });
  } catch (err) {
    console.error("Error adding customer:", err.message);
    res.status(500).json({ message: "Failed to add customer", error: err.message });
  }
};

// Get all customer IDs for dropdown
exports.getCustomerIds = async (req, res) => {
  try {
    const customers = await Customer.find(
      {},
      { customerId: 1, firstName: 1, lastName: 1, classBalance: 1, _id: 0 }
    ).sort({ customerId: 1 });

    res.json(customers);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Get next available customer ID
exports.getNextId = async (req, res) => {
  try {
    const lastCustomer = await Customer.find({})
      .sort({ customerId: -1 })
      .limit(1);

    let maxNumber = 1;
    if (lastCustomer.length > 0) {
      const lastId = lastCustomer[0].customerId;
      const match = lastId.match(/\d+$/);
      if (match) {
        maxNumber = parseInt(match[0]) + 1;
      }
    }
    const nextId = `Y${maxNumber.toString().padStart(3, '0')}`;
    res.json({ nextId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Update customer
exports.update = async (req, res) => {
  try {
    const { 
      customerId, 
      firstName, 
      lastName, 
      email, 
      phone, 
      senior, 
      address, 
      preferredContact, 
      classBalance 
    } = req.body;
    
    const updatedCustomer = await Customer.findOneAndUpdate(
      { customerId },
      { 
        firstName, 
        lastName, 
        email, 
        phone, 
        senior, 
        address, 
        preferredContact, 
        classBalance 
      },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Customer updated successfully", customer: updatedCustomer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.query;
    const result = await Customer.findOneAndDelete({ customerId });
    
    if (!result) {
      return res.status(404).json({ error: "Customer not found" });
    }
    
    res.json({ message: "Customer deleted", customerId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update class balance (for check-ins)
exports.updateClassBalance = async (req, res) => {
  try {
    const { customerId, newBalance } = req.body;
    
    const updatedCustomer = await Customer.findOneAndUpdate(
      { customerId },
      { classBalance: newBalance },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Class balance updated", customer: updatedCustomer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};