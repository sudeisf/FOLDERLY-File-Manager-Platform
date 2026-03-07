const express = require('express');
require('dotenv').config();
const app = express();
const session = require('express-session');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const authRoute = require('./routes/auth');
const cors = require('cors');
const fileRoute = require("./routes/files");
const folderRoute = require("./routes/folders");
const shareRoute = require("./routes/share");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const { apiLimiter } = require('./middleware/rateLimiter');

const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 3000);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-insecure-session-secret';

// Required when running behind nginx/reverse proxies to get real client IP.
app.set('trust proxy', 1);

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,              
  allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],  
  exposedHeaders :['Content-Disposition']            
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,  
    },
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,  
      dbRecordIdIsSessionId: true,
    }),
  })
);


app.use(passport.initialize());
app.use(passport.session());
app.use(['/api', '/share'], apiLimiter);

// Routes
app.use('/api/auth', authRoute);
app.use('/api/files', fileRoute);
app.use('/api/folders', folderRoute);
app.use('/share', shareRoute);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
