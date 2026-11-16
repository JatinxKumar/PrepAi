const axios = require('axios');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const Resume = require('../models/Resume');

// Initialize Firebase Admin if service account credentials are provided
if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, '\n') : null;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        })
      });
      console.log("Firebase Admin initialized successfully.");
    } else {
      console.log("Firebase Admin credentials not fully configured; using Google public key cryptographic verification.");
    }
  } catch (e) {
    console.warn("Firebase Admin Init failed. Google Login will use cryptographic public key verification:", e.message);
  }
}

// In-memory cache for Google public certificates used to verify Firebase ID tokens
let cachedGoogleCertificates = null;
let googleCertificatesExpiry = 0;

const fetchGoogleCertificates = async () => {
  const now = Date.now();
  if (cachedGoogleCertificates && now < googleCertificatesExpiry) {
    return cachedGoogleCertificates;
  }
  const certUrl = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
  const response = await axios.get(certUrl, { timeout: 7000 });
  cachedGoogleCertificates = response.data;
  // Cache for 6 hours
  googleCertificatesExpiry = now + 6 * 3600 * 1000;
  return cachedGoogleCertificates;
};

// Cryptographically verify a Firebase / Google ID token against Google's public certificates
const verifyGoogleTokenCryptographically = async (idToken, expectedProjectId) => {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('ID Token is missing or invalid');
  }

  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error('Malformed token header: missing key identifier (kid)');
  }

  const certificates = await fetchGoogleCertificates();
  const cert = certificates[decoded.header.kid];
  if (!cert) {
    throw new Error('Public key certificate not found for token kid');
  }

  const verifyOptions = {
    algorithms: ['RS256'],
  };

  if (expectedProjectId) {
    verifyOptions.audience = expectedProjectId;
    verifyOptions.issuer = `https://securetoken.google.com/${expectedProjectId}`;
  }

  return jwt.verify(idToken, cert, verifyOptions);
};

// Helper to check if DB is connected
const isDbConnected = () => mongoose.connection.readyState === 1;

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter.' });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one lowercase letter.' });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one number.' });
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

    const expectedProjectId = process.env.FIREBASE_PROJECT_ID || 'codedna-76e18';

    try {
      // 1. If Firebase Admin initialized with service account credentials, use it
      if (admin.apps.length && admin.apps[0]?.options?.credential) {
        try {
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          name = decodedToken.name || decodedToken.email?.split('@')[0] || 'Google User';
          email = decodedToken.email;
          googleId = decodedToken.uid || decodedToken.sub;
        } catch (adminErr) {
          console.warn("Firebase Admin verifyIdToken error, falling back to cryptographic public key verification:", adminErr.message);
          const decoded = await verifyGoogleTokenCryptographically(idToken, expectedProjectId);
          name = decoded.name || decoded.email?.split('@')[0] || 'Google User';
          email = decoded.email;
          googleId = decoded.sub || decoded.user_id;
        }
      } else {
        // 2. Cryptographically verify signature, audience, issuer, expiration against Google's public certs
        const decoded = await verifyGoogleTokenCryptographically(idToken, expectedProjectId);
        name = decoded.name || decoded.email?.split('@')[0] || 'Google User';
        email = decoded.email;
        googleId = decoded.sub || decoded.user_id;
      }

      if (!email) {
        return res.status(400).json({ error: 'Google account did not provide an email address' });
      }
    } catch (e) {
      console.error("Token verification failed:", e.message);
      return res.status(401).json({ error: 'Invalid or expired Google authentication token' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET environment variable is missing on server");
      return res.status(500).json({ error: 'Server authentication configuration error. Please contact support.' });
    }

    if (!isDbConnected()) {
      // For Google, allow a stateless verified session if DB is connecting
      const token = jwt.sign({ id: googleId, email, name }, jwtSecret, { expiresIn: '7d' });
      return res.status(200).json({ message: 'Google Login successful (Stateless)', token, user: { id: googleId, name, email } });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, googleId, password: Math.random().toString(36).slice(-8) });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      jwtSecret,
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
