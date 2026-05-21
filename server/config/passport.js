import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // Update tokens
        user.accessToken = accessToken;
        if (refreshToken) user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      }

      // Create new user
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        picture: profile.photos[0].value,
        accessToken,
        refreshToken,
        lastLogin: new Date(),
      });

      await user.save();
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log('Deserializing user:', id);
  try {
    const user = await User.findById(id);
    if (!user) {
      console.log('User not found during deserialization');
      return done(null, false);
    }
    done(null, user);
  } catch (err) {
    console.error('Deserialization error:', err);
    done(err, null);
  }
});
