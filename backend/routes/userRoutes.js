const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../model/User');


const generateToken = (id) => {
    
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};



router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        
        const user = await User.create({
            name,
            email,
            password,
        });

        
        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data received' });
        }
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});



router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        
        const user = await User.findOne({ email });

        
        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
});


const { protect } = require('../middleware/authMiddleware');
const Task = require('../model/Task');




router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, role } = req.body;
        if (name) user.name = name;
        if (role) user.role = role;

        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: 'Server error during profile update' });
    }
});




router.put('/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please enter all password fields' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error("Update Password Error:", error);
        res.status(500).json({ message: 'Server error during password update' });
    }
});




router.delete('/profile', protect, async (req, res) => {
    try {
        
        await Task.deleteMany({ user: req.user._id });

        
        await User.findByIdAndDelete(req.user._id);

        res.status(200).json({ message: 'Account and all associated tasks deleted successfully' });
    } catch (error) {
        console.error("Delete Account Error:", error);
        res.status(500).json({ message: 'Server error during account deletion' });
    }
});

module.exports = router;