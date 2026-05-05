const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allows your website to talk to this server
app.use(express.json()); // Allows the server to understand JSON data sent from the form

// Path to your database file
const DATA_FILE = path.join(__dirname, "suppliers.json");

/**
 * INITIALIZATION
 * If suppliers.json doesn't exist, create an empty one so the app doesn't crash.
 */
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

/**
 * ROUTE 1: GET ALL SUPPLIERS
 * This is triggered when the website loads (initApp)
 */
app.get("/api/suppliers", (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    const suppliers = JSON.parse(data);
    res.json(suppliers);
  } catch (error) {
    console.error("Read Error:", error);
    res.status(500).json({ error: "Could not read supplier data." });
  }
});

/**
 * ROUTE 2: ADD A NEW SUPPLIER
 * This is triggered when you click "Add to Directory"
 */
app.post("/api/suppliers", (req, res) => {
  try {
    // 1. Read existing data
    const data = fs.readFileSync(DATA_FILE, "utf8");
    const suppliers = JSON.parse(data);

    // 2. Add the new supplier sent from the frontend
    const newSupplier = req.body;
    suppliers.push(newSupplier);

    // 3. Save the updated list back to the file
    fs.writeFileSync(DATA_FILE, JSON.stringify(suppliers, null, 2));

    res.status(201).json({ message: "Supplier saved successfully!" });
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ error: "Could not save supplier data." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// UPDATED DELETE ROUTE
app.delete("/api/suppliers/:index", (req, res) => {
  try {
    // Force the index to be a number
    const index = parseInt(req.params.index);

    const data = fs.readFileSync(DATA_FILE, "utf8");
    let suppliers = JSON.parse(data);

    // Check if the index actually exists in our list
    if (index >= 0 && index < suppliers.length) {
      suppliers.splice(index, 1); // Remove the item
      fs.writeFileSync(DATA_FILE, JSON.stringify(suppliers, null, 2));
      console.log(`🗑️ Deleted item at index: ${index}`);
      res.json({ message: "Deleted successfully" });
    } else {
      res.status(404).json({ error: "Supplier not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// This tells the server how to UPDATE an existing item
app.put("/api/suppliers/:index", (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const updatedData = req.body; // The new name/location from the form

    const data = fs.readFileSync(DATA_FILE, "utf8");
    let suppliers = JSON.parse(data);

    if (index >= 0 && index < suppliers.length) {
      // Replace the old supplier with the updated one
      suppliers[index] = updatedData;

      fs.writeFileSync(DATA_FILE, JSON.stringify(suppliers, null, 2));
      res.json({ message: "Updated successfully!" });
    } else {
      res.status(404).json({ error: "Supplier not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});
