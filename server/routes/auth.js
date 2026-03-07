const router = require('express').Router();
const { loginController, registerController} = require('../controller/authController');
const  authenticateUser  = require('../middleware/authenticator');

router.post('/register', registerController);
router.post('/login', loginController);

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
    }); 
    req.clearCookie('jwt');
    res.status(200).send({success: true, message: 'Logout successful'});
});

router.get('/protected',authenticateUser,(req, res) => {
    res.status(200).send({success: true, message: 'Protected route'});
});
module.exports = router;