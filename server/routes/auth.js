const router = require('express').Router();
const { loginController, registerController} = require('../controller/authController');
const  authenticateUser  = require('../middleware/authenticator');
const { authLimiter } = require('../middleware/rateLimiter');

const tokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.SESSION_COOKIE_SAMESITE || 'lax',
};

router.post('/register', authLimiter, registerController);
router.post('/login', authLimiter, loginController);

router.get('/logout', (req, res) => {
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