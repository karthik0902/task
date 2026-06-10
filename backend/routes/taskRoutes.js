const express = require('express');
const router = express.Router();
const Task = require('../model/Task');
const { protect } = require('../middleware/authMiddleware');












router.get('/', protect, async (req, res) => {
    try {
        const { status, priority, sort } = req.query;

        
        const filter = { user: req.user._id };

        if (status)   filter.status   = status;
        if (priority) filter.priority = priority;

        
        let sortOption = { createdAt: -1 }; 
        if (sort === 'oldest')  sortOption = { createdAt: 1 };
        if (sort === 'dueDate') sortOption = { dueDate: 1 };

        const tasks = await Task.find(filter).sort(sortOption);

        res.status(200).json({
            count: tasks.length,
            tasks,
        });
    } catch (error) {
        console.error('Get Tasks Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching tasks' });
    }
});






router.get('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this task' });
        }

        res.status(200).json(task);
    } catch (error) {
        
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid task ID format' });
        }
        console.error('Get Task Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching task' });
    }
});







router.post('/', protect, async (req, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body;

        
        if (!title || title.trim() === '') {
            return res.status(400).json({ message: 'Task title is required' });
        }

        const task = await Task.create({
            user: req.user._id, 
            title,
            description,
            status,
            priority,
            dueDate,
        });

        res.status(201).json(task);
    } catch (error) {
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        console.error('Create Task Error:', error.message);
        res.status(500).json({ message: 'Server error while creating task' });
    }
});







router.put('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        
        const { title, description, status, priority, dueDate } = req.body;

        
        if (title       !== undefined) task.title       = title;
        if (description !== undefined) task.description = description;
        if (status      !== undefined) task.status      = status;
        if (priority    !== undefined) task.priority    = priority;
        if (dueDate     !== undefined) task.dueDate     = dueDate;

        const updatedTask = await task.save();

        res.status(200).json(updatedTask);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid task ID format' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        console.error('Update Task Error:', error.message);
        res.status(500).json({ message: 'Server error while updating task' });
    }
});






router.delete('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this task' });
        }

        await task.deleteOne();

        res.status(200).json({
            message: 'Task deleted successfully',
            id: req.params.id,
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid task ID format' });
        }
        console.error('Delete Task Error:', error.message);
        res.status(500).json({ message: 'Server error while deleting task' });
    }
});







router.patch('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = ['todo', 'in-progress', 'done'];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
            });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        task.status = status;
        const updatedTask = await task.save();

        res.status(200).json(updatedTask);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid task ID format' });
        }
        console.error('Update Status Error:', error.message);
        res.status(500).json({ message: 'Server error while updating task status' });
    }
});






router.post('/:id/comments', protect, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to comment on this task' });
        }

        task.comments.push({
            text,
            user: req.user.name,
        });

        const updatedTask = await task.save();
        res.status(201).json(updatedTask);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid task ID format' });
        }
        console.error('Add Comment Error:', error.message);
        res.status(500).json({ message: 'Server error while adding comment' });
    }
});

module.exports = router;
