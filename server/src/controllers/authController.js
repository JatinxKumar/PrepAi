const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const Resume = require('../models/Resume');

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      })
    });
  } catch (e) {
    console.warn("Firebase Admin Init failed. Google Login will use fallback verification if keys are missing.");
  }
}

// Helper to check if DB is connected
const isDbConnected = () => mongoose.connection.readyState === 1;

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database is currently offline. Please try again later.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database is currently offline. Real login requires a database connection.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    let name, email, googleId;

    try {
      // Verify Firebase ID Token
      if (process.env.FIREBASE_PROJECT_ID) {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        name = decodedToken.name;
        email = decodedToken.email;
        googleId = decodedToken.uid;
      } else {
        // DEMO FALLBACK: Trusting the frontend if backend keys are missing
        const mockPayload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
        name = mockPayload.name || 'Google User';
        email = mockPayload.email;
        googleId = mockPayload.sub || mockPayload.user_id;
      }
    } catch (e) {
      console.error("Token verification failed:", e.message);
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    if (!isDbConnected()) {
      // For Google, we can allow a stateless session even if DB is down for the demo
      const token = jwt.sign({ id: googleId, email, name }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.status(200).json({ message: 'Google Login successful (Stateless)', token, user: { id: googleId, name, email } });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, googleId, password: Math.random().toString(36).slice(-8) });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Google Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Google Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ user: req.user });
    }
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const latestResume = await Resume.findOne({ user: String(req.user.id) }).sort({
      updatedAt: -1,
      createdAt: -1,
    });

    res.json({ user, latestResume });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};
