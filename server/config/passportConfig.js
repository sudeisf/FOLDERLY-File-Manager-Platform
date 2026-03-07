const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const utils = require('../utils/utils');

const prismaClient = new PrismaClient();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prismaClient.user.findUnique({
      where: { id },
    });
    done(null, user || null);
  } catch (error) {
    done(error, null);
  }
});

const googleClientID = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback';

const createUniqueUsername = async (seed) => {
  const cleanSeed = (seed || 'googleuser')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 14) || 'googleuser';

  let candidate = `g_${cleanSeed}`;
  let attempt = 1;

  while (true) {
    const existing = await prismaClient.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    attempt += 1;
    candidate = `g_${cleanSeed}${attempt}`.slice(0, 30);
  }
};

if (googleClientID && googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientID,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackURL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) {
            return done(new Error('Google account email is required'), null);
          }

          let user = await prismaClient.user.findUnique({
            where: { email },
          });

          if (!user) {
            const usernameSeed = profile.displayName || email.split('@')[0];
            const username = await createUniqueUsername(usernameSeed);
            const randomSecret = crypto.randomBytes(32).toString('hex');
            const hashedPassword = await utils.generatePassword(randomSecret);

            user = await prismaClient.user.create({
              data: {
                username,
                email,
                password: hashedPassword,
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

module.exports = passport;
