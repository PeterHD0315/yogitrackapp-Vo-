const Package = require("../models/packageModel.cjs");

// Get package by packageId
exports.getPackage = async (req, res) => {
  try {
    const packageId = req.query.packageId;
    const packageDetail = await Package.findOne({ packageId: packageId });

    res.json(packageDetail);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Add new package
exports.add = async (req, res) => {
  try {
    const {
      packageId,
      packageName,
      description,
      price
    } = req.body;

    // Basic validation
    if (!packageName || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create a new package document
    const newPackage = new Package({
      packageId,
      packageName,
      description,
      price
    });

    // Save to database
    await newPackage.save();
    res.status(201).json({ message: "Package added successfully", package: newPackage });
  } catch (err) {
    console.error("Error adding package:", err.message);
    res.status(500).json({ message: "Failed to add package", error: err.message });
  }
};

// Get all package IDs for dropdown
exports.getPackageIds = async (req, res) => {
  try {
    const packages = await Package.find(
      {},
      { packageId: 1, packageName: 1, price: 1, _id: 0 }
    ).sort({ packageId: 1 });

    res.json(packages);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Get next available package ID
exports.getNextId = async (req, res) => {
  try {
    const lastPackage = await Package.find({})
      .sort({ packageId: -1 })
      .limit(1);

    let maxNumber = 1;
    if (lastPackage.length > 0) {
      const lastId = lastPackage[0].packageId;
      const match = lastId.match(/\d+$/);
      if (match) {
        maxNumber = parseInt(match[0]) + 1;
      }
    }
    const nextId = `P${maxNumber.toString().padStart(3, '0')}`;
    res.json({ nextId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Update package
exports.update = async (req, res) => {
  try {
    const { packageId, packageName, description, price } = req.body;
    
    const updatedPackage = await Package.findOneAndUpdate(
      { packageId },
      { packageName, description, price },
      { new: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.json({ message: "Package updated successfully", package: updatedPackage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete package
exports.deletePackage = async (req, res) => {
  try {
    const { packageId } = req.query;
    const result = await Package.findOneAndDelete({ packageId });
    
    if (!result) {
      return res.status(404).json({ error: "Package not found" });
    }
    
    res.json({ message: "Package deleted", packageId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};