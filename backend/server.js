require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');


const app = express();
connectDB();


app.use(cors());          
app.use(express.json()); 


const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use('/api/users', userRoutes); 
app.use('/api/tasks', taskRoutes); 


app.get('/', (req, res) => {
    res.json({ message: 'TaskMaster API is running ✅' });
});


app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});


app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ message: 'Internal server error' });
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});