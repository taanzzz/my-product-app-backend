const express = require('express');
const router = express.Router();

const { registerUser, loginUser, logoutUser, verifyEmail,googleLogin } = require('../controllers/userController'); 


router.post('/register', registerUser);


router.post('/login', loginUser);


router.post('/logout', logoutUser);


router.post('/verify-email', verifyEmail);


router.post('/google-login', googleLogin);

module.exports = router;