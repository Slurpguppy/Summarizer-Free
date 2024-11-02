const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_jwt_secret'; // Use a strong secret in production

// Serve static files from the "public" directory
app.use(express.static('public'));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://wlratkowski:mc3H1mKsgbR6it8R@summydata.u5zjk.mongodb.net/?retryWrites=true&w=majority&appName=summydata', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Access denied, token missing!' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}



// Protect the members-only route
app.get('/members', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html')); // Serve the members-only HTML page
});

// Registration Endpoint
app.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        email,
        username,
        password: hashedPassword,
    });

    try {
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error registering user' });
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    const { emailOrUsername, password } = req.body;
    const user = await User.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token }); // Send JWT token
    } else {
        res.status(401).json({ message: 'Invalid email/username or password' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
