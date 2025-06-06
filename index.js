const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Static file serving middleware
app.use(express.static('static'));

// --- In-memory "database" for contacts ---
let contacts = []; // This array will hold our contact objects
let nextContactId = 1; // Simple counter for generating IDs

// --- Existing Endpoints (keeping them for context, modify as needed) ---

// GET request to the homepage
app.get('/api', (req, res) => {
    res.send('<h1>Hello World!</h1>');
});

// POST request to /users (existing endpoint)
app.post('/api/users', (req, res) => {
    let resp = {
        message: 'User created successfully',
        date: new Date(),
        user: req.body
    }
    res.send(resp);
});

// POST request to /api/compound-interest (existing endpoint)
app.post('/api/compound-interest', (req, res) => {
    const { prin, rate, time } = req.body;
    const amount = prin * Math.pow((1 + rate / 100), time);
    const result = Math.round(amount);

    let resp = {
        result: result,
        date: new Date().toLocaleString()
    };
    res.send(resp);
});


// --- NEW ADDRESS BOOK API ENDPOINTS ---

// i. Save (POST) - Create a new contact
// POST /api/contacts
app.post('/api/contacts', (req, res) => {
    const newContact = req.body; // The request body is the contact object
    newContact.id = String(nextContactId++); // Assign a unique ID using the counter and increment
    contacts.push(newContact); // Add the new contact to our in-memory array

    res.status(201).send({
        message: 'Contact created successfully',
        contact: newContact
    });
});

// ii. Search (GET)
// 1. List all contacts: GET /api/contacts
app.get('/api/contacts', (req, res) => {
    res.status(200).send(contacts); // Send the entire contacts array
});

// 2. Show single contact by ID: GET /api/contacts/<contact id>
app.get('/api/contacts/:id', (req, res) => {
    const contactId = req.params.id; // Get the ID from the URL parameters (will be a string)
    const contact = contacts.find(c => c.id === contactId); // Find the contact by ID

    if (contact) {
        res.status(200).send(contact);
    } else {
        res.status(404).send({ message: 'Contact not found' });
    }
});

// iii. Update (PUT) - Update an existing contact
// PUT /api/contacts/<contact id>
app.put('/api/contacts/:id', (req, res) => {
    const contactId = req.params.id; // Get the ID from the URL
    const updatedContactData = req.body; // The request body contains the updated data

    const contactIndex = contacts.findIndex(c => c.id === contactId); // Find the index of the contact

    if (contactIndex !== -1) {
        // Update the contact, ensuring the ID remains the same
        contacts[contactIndex] = { ...contacts[contactIndex], ...updatedContactData, id: contactId };
        res.status(200).send({
            message: 'Contact updated successfully',
            contact: contacts[contactIndex]
        });
    } else {
        res.status(404).send({ message: 'Contact not found' });
    }
});

// iv. Delete (DELETE) - Delete a contact
// DELETE /api/contacts/<contact id>
app.delete('/api/contacts/:id', (req, res) => {
    const contactId = req.params.id; // Get the ID from the URL
    const initialLength = contacts.length;

    contacts = contacts.filter(c => c.id !== contactId); // Filter out the contact with the given ID

    if (contacts.length < initialLength) {
        res.status(200).send({ message: 'Contact deleted successfully' });
    } else {
        res.status(404).send({ message: 'Contact not found' });
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});