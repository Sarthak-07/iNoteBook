const express = require('express');
const router = express.Router();
const Note = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

// ROUTE: 1 - Get all the Notes : GET "/api/notes/fetchallnotes". Login Required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// ROUTE: 2 - Add a new Note using : POST "/api/notes/addnote". Login Required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Enter a valid description').isLength({ min: 5 }),
    body('tag', 'Enter a valid tag'),
], async (req, res) => {
    // If there are errors, return Bad Request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { title, description, tag } = req.body;

        const note = new Note({
            title, description, tag, user: req.user.id
        })

        const saveNote = await note.save()

        res.json(saveNote)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// ROUTE: 3 - Update an existing Note : PUT "/api/notes/updatenote". Login Required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    // If there are errors, return Bad Request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { title, description, tag } = req.body;

        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") };

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// ROUTE: 4 - Delete an existing Note : DELETE "/api/notes/deletenote". Login Required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    // If there are errors, return Bad Request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") };

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }

        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note has been Deleted", "Note": note });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router