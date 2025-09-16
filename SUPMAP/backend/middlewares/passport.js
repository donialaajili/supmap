
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const axios = require('axios'); // déplacé ici car déjà présent plus bas

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      telephone: user.telephone,
      loginMethod: user.loginMethod,
      firstName: user.firstName // ✅ Ajouté ici
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// 🔹 GOOGLE
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    if (!profile.emails || profile.emails.length === 0) {
      return done(new Error('Email Google manquant'), null);
    }

    let user = await User.findOne({ googleId: profile.id }) || await User.findOne({ email: profile.emails[0].value });

    const firstName = profile.name?.givenName || profile.displayName.split(' ')[0];

    if (!user) {
      user = await User.create({
        username: profile.displayName,
        firstName, // ✅
        email: profile.emails[0].value,
        googleId: profile.id,
        oauthAccessToken: accessToken,
        loginMethod: 'google'
      });
    } else {
      user.googleId = profile.id;
      user.oauthAccessToken = accessToken;
      user.loginMethod = 'google';
      user.firstName = user.firstName || firstName; // met à jour si manquant
      await user.save();
    }

    const token = generateToken(user);
    user.token = token;
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// 🔹 FACEBOOK
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'displayName', 'email', 'first_name']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error('Email Facebook manquant'), null);

    let user = await User.findOne({ facebookId: profile.id }) || await User.findOne({ email });

    const firstName = profile.name?.givenName || profile.displayName.split(' ')[0];

    if (!user) {
      user = await User.create({
        username: profile.displayName,
        firstName, // ✅
        email,
        facebookId: profile.id,
        oauthAccessToken: accessToken,
        loginMethod: 'facebook'
      });
    } else {
      user.facebookId = profile.id;
      user.oauthAccessToken = accessToken;
      user.loginMethod = 'facebook';
      user.firstName = user.firstName || firstName;
      await user.save();
    }

    const token = generateToken(user);
    user.token = token;

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// 🔐 SERIALIZE / DESERIALIZE
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// 🔐 JWT STRATEGY
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const user = await User.findById(jwt_payload.id);
    if (user) return done(null, user);
    return done(null, false);
  } catch (err) {
    return done(err, false);
  }
}));

module.exports = passport;
