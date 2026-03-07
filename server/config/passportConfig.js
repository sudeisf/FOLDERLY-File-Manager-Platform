const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prismaClient = new PrismaClient();

// Load the public key for JWT verification (RS256)
const pathToPubKey = path.join(__dirname, '../utils', 'public.pem');
const publicKey = fs.readFileSync(pathToPubKey, 'utf8');

// Passport serialization and deserialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prismaClient.user.findUnique({
      where: {
        id: id,
      },
    });
    done(null, user);
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error, null);
  }
});

// JWT strategy options
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: publicKey,  // Public key for verifying JWT signature
  algorithms: ['RS256'],   // Specify the algorithm used for signing the JWT
};

// JWT Strategy (used to authenticate using JWT tokens)
passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      console.log('Decoded JWT Payload:', jwt_payload);  // Log the payload for debugging

      // Check if the required fields exist in the payload (e.g., sub)
      if (!jwt_payload || !jwt_payload.sub) {
        console.error('JWT Payload is missing expected fields:', jwt_payload);
        return done(null, false);  // Reject if required fields are missing
      }

      // Look up the user using the sub field (or your unique field)
      const user = await prismaClient.user.findUnique({
        where: {
          id: jwt_payload.sub,  // Use the sub field as the user's ID
        },
      });

      if (user) {
        console.log('User found:', user);  // Log user found for debugging
        return done(null, user);  // Successful authentication
      } else {
        console.log('User not found with ID:', jwt_payload.sub);
        return done(null, false);  // User not found, authentication failed
      }
    } catch (err) {
      console.error('Error during authentication:', err);
      return done(err, false);  // Handle any errors during authentication
    }
  })
);

module.exports = passport;
