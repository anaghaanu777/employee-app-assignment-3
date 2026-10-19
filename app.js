// Task 1: Initiate app and run server at 3000

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'dist', 'FrontEnd')));

// Task 2: Create MongoDB connection

const Employee = mongoose.model(
    'Employee',
    new mongoose.Schema({
        name: { type: String, required: true },
        location: { type: String, required: true },
        position: { type: String, required: true },
        salary: { type: Number, required: true }
    })
);

// GET: Retrieve all employees
app.get('/api/employeelist', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch employees' });
    }
});

// GET: Retrieve one employee by ID
app.get('/api/employeelist/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        res.status(400).json({ message: 'Invalid employee ID or request' });
    }
});

// POST: Add an employee
app.post('/api/employeelist', async (req, res) => {
    try {
        const { name, location, position, salary } = req.body;

        if (
            !name || !location || !position ||
            salary === undefined || salary === null ||
            salary === '' || !Number.isFinite(Number(salary))
        ) {
            return res.status(400).json({
                message: 'Please provide name, location, position and a valid salary'
            });
        }

        const employee = await Employee.create({
            name,
            location,
            position,
            salary: Number(salary)
        });

        res.status(201).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add employee' });
    }
});

// DELETE: Remove an employee by ID
app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json({ message: 'Employee deleted successfully', employee });
    } catch (error) {
        res.status(400).json({ message: 'Invalid employee ID or request' });
    }
});

// PUT: Update an employee
app.put('/api/employeelist', async (req, res) => {
    try {
        const { _id, id, name, location, position, salary } = req.body;
        const employeeId = _id || id;

        if (!employeeId) {
            return res.status(400).json({
                message: 'Employee ID (_id or id) is required to update'
            });
        }

        if (
            !name || !location || !position ||
            salary === undefined || salary === null ||
            salary === '' || !Number.isFinite(Number(salary))
        ) {
            return res.status(400).json({
                message: 'Please provide name, location, position and a valid salary'
            });
        }

        const employee = await Employee.findByIdAndUpdate(
            employeeId,
            { name, location, position, salary: Number(salary) },
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update employee; check the ID and data' });
    }
});

// Error handler for unexpected errors
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
});

// Keep the frontend connection at the end.
// If you install Express 4, the original wildcard route works.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'dist', 'Frontend', 'index.html'));
});

// Start server after connecting to MongoDB
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
    });