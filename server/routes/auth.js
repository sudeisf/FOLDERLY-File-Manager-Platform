const router = require('express').Router();
const {
    loginController,
    registerController,
    forgotPasswordRequestController,
    forgotPasswordVerifyController,
    forgotPasswordResetController,
} = require('../controller/authController');
const  authenticateUser  = require('../middleware/authenticator');
const { authLimiter } = require('../middleware/rateLimiter');
const passport = require('../config/passportConfig');
const utils = require('../utils/utils');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const CLIENT_REDIRECT_URL = FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean)[0] || 'http://localhost:5173';
const isGoogleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

const tokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.SESSION_COOKIE_SAMESITE || 'lax',
    maxAge: 1000 * 60 * 60 * 24,
};

router.post('/register', authLimiter, registerController);
router.post('/login', authLimiter, loginController);
router.post('/forgot-password/request', authLimiter, forgotPasswordRequestController);
router.post('/forgot-password/verify', authLimiter, forgotPasswordVerifyController);
router.post('/forgot-password/reset', authLimiter, forgotPasswordResetController);

router.get('/google', (req, res, next) => {
    if (!isGoogleConfigured) {
        return res.status(503).send({ message: 'Google OAuth is not configured on the server' });
    }

    return passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: true,
    })(req, res, next);
});

router.get('/google/callback',
    (req, res, next) => {
        if (!isGoogleConfigured) {
            return res.redirect(`${CLIENT_REDIRECT_URL}/login?error=google_not_configured`);
        }

        return passport.authenticate('google', {
            failureRedirect: `${CLIENT_REDIRECT_URL}/login?error=google_auth_failed`,
            session: true,
        })(req, res, next);
    },
    (req, res) => {
        if (!req.user) {
            return res.redirect(`${CLIENT_REDIRECT_URL}/login?error=google_auth_failed`);
        }

        const token = utils.issueToken(req.user);
        res.cookie('token', token.token, tokenCookieOptions);
        return res.redirect(`${CLIENT_REDIRECT_URL}/protected/home`);
    }
);

router.get('/logout', (req, res) => {
    req.logout(() => {});
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
    }); 
    res.clearCookie('token', tokenCookieOptions);
    res.status(200).send({success: true, message: 'Logout successful'});
});

router.get('/protected',authenticateUser,(req, res) => {
    res.status(200).send({success: true, message: 'Protected route'});
});
module.exports = router;