const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// GET /api/notes - Get all notes
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
    };

    const notes = await Note.find()
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .exec();

    const total = await Note.countDocuments();

    res.status(200).json({
      notes,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      total,
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// GET /api/notes/:id - Get a specific note
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(200).json(note);
  } catch (error) {
    console.error('Error fetching note:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid note ID format' });
    }

    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// POST /api/notes - Create a new note
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Title and content are required',
      });
    }

    const note = new Note({
      title: title.trim(),
      content: content.trim(),
    });

    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error('Error creating note:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }

    res.status(500).json({ error: 'Failed to create note' });
  }
});

// PUT /api/notes/:id - Update a note
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Title and content are required',
      });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        content: content.trim(),
        updatedAt: Date.now(),
      },
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
      }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid note ID format' });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }

    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);

    if (!deletedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(200).json({
      message: 'Note deleted successfully',
      deletedNote,
    });
  } catch (error) {
    console.error('Error deleting note:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid note ID format' });
    }

    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
