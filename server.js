require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 MongoDB Connected!"))
    .catch(err => console.log("❌ DB Error:", err));

// Supplier Schema (Database ka structure)
const supplierSchema = new mongoose.Schema({
    name: String,
    category: String,
    location: String,
    rating: Number
});

const Supplier = mongoose.model('Supplier', supplierSchema);

// --- API ROUTES ---

// 1. GET ALL
app.get('/api/suppliers', async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// 2. CREATE (POST)
app.post('/api/suppliers', async (req, res) => {
    try {
        const newSupplier = new Supplier(req.body);
        await newSupplier.save();
        res.json(newSupplier);
    } catch (err) {
        res.status(500).json({ error: "Failed to save" });
    }
});

// 3. DELETE (Using MongoDB _id)
app.delete("/api/suppliers/:id", async (req, res) => {
    try {
        await Supplier.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete" });
    }
});

// 4. UPDATE (Using MongoDB _id)
app.put("/api/suppliers/:id", async (req, res) => {
    try {
        const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Update failed" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));