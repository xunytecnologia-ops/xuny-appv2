import express from 'express';
import passport from 'passport';
import { google } from 'googleapis';
import User from '../models/User.js';
import { getGoogleClient } from '../config/google.js';

const router = express.Router();

// @desc    Auth with Google Token (from frontend)
// @route   POST /auth/google/token
router.post('/google/token', async (req, res) => {
  console.log('--- LOGIN ATTEMPT START ---');
  console.log('Body received:', req.body);
  
  // Accept both "token" and "accessToken"
  const { accessToken, token } = req.body;
  const idToken = accessToken || token;
  
  console.log('Token received (first 50 chars):', idToken?.substring(0, 50));
  
  if (!idToken) {
    console.log('Token not provided');
    return res.status(400).json({ error: 'Token not provided' });
  }
  
  try {
    const oauth2Client = getGoogleClient(idToken);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    let data;
    try {
      const userInfoResponse = await oauth2.userinfo.get();
      data = userInfoResponse.data;
    } catch (googleError) {
      console.error('Google UserInfo API Error:', googleError);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.log('Google user info retrieved:', data.email);

    let user = await User.findOne({ googleId: data.id });

    if (user) {
      console.log('User found, updating token and profile');
      user.email = data.email;
      user.name = data.name;
      user.picture = data.picture;
      user.accessToken = idToken;
      user.lastLogin = new Date();
      await user.save();
    } else {
      console.log('New user, creating record');
      user = new User({
        googleId: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
        accessToken: idToken,
        lastLogin: new Date(),
      });
      await user.save();
    }

    console.log('Logging in user via passport');
    req.login(user, (err) => {
      if (err) {
        console.error('Passport login error:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log('Login successful');
      res.json(user);
    });
  } catch (error) {
    console.error('Auth Token Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', {
  scope: [
    'openid',
    'profile',
    'email',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/calendar.events'
  ],
  accessType: 'offline',
  prompt: 'consent'
}));

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
  }
);

// @desc    Get current user
// @route   GET /auth/user
router.get('/user', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// @desc    Logout user
// @route   GET /auth/logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    const done = () => {
      res.clearCookie('connect.sid', { path: '/' });
      res.json({ message: 'Logged out' });
    };

    if (req.session) {
      req.session.destroy(() => done());
      return;
    }

    done();
  });
});

export default router;
