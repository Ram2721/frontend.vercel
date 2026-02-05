const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());

// Helper to read data
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// GET all menu items
app.get('/api/menu', (req, res) => {
    res.json(readData());
});

// POST new menu item
app.post('/api/menu', (req, res) => {
    const items = readData();
    const newItem = { ...req.body, id: Date.now() };
    items.push(newItem);
    writeData(items);
    res.json(newItem);
});

// PUT update menu item
app.put('/api/menu/:id', (req, res) => {
    const items = readData();
    const index = items.findIndex(i => i.id == req.params.id);
    if (index !== -1) {
        items[index] = { ...items[index], ...req.body };
        writeData(items);
        res.json(items[index]);
    } else {
        res.status(404).send('Item not found');
    }
});

// DELETE menu item
app.delete('/api/menu/:id', (req, res) => {
    let items = readData();
    items = items.filter(i => i.id != req.params.id);
    writeData(items);
    res.send('Item deleted');
});

// Proxy for Online Search (MealDB)
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.s || '';
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error searching recipes');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
