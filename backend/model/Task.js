const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', 
        },

        title: {
            type: String,
            required: [true, 'Please add a task title'],
            trim: true,
        },

        description: {
            type: String,
            default: '',
            trim: true,
        },

        
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'done'],
            default: 'todo',
        },

        
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },

        
        dueDate: {
            type: Date,
            default: null,
        },
        comments: [
            {
                text: { type: String, required: true },
                user: { type: String, required: true },
                createdAt: { type: Date, default: Date.now },
            }
        ],
    },
    {
        timestamps: true, 
    }
);

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
