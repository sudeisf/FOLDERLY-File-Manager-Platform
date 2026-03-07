const express = require('express');
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

const prisma = new PrismaClient();

app.use(cors({
  origin: 'http://localhost:5173' || process.env.FRONTEND_URL,  
  credentials: true,              
  allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],  
  exposedHeaders :['Content-Disposition']            
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure:false,  
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

// Routes
app.use('/api/auth', authRoute);
app.use('/api/files', fileRoute);
app.use('/api/folders', folderRoute);
app.use('/share', shareRoute);

// Start server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
