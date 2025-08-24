const express = require('express');
const router = express.Router();
// আমরা কন্ট্রোলারটি পরের ধাপে তৈরি করব
const { registerUser, loginUser, logoutUser, verifyEmail,googleLogin } = require('../controllers/userController'); 

// ইউজার রেজিস্ট্রেশন
router.post('/register', registerUser);

// ইউজার লগইন
router.post('/login', loginUser);

// ইউজার লগআউট
router.post('/logout', logoutUser);

// ইমেইল ভেরিফাই করার জন্য নতুন রুট
router.post('/verify-email', verifyEmail);

// গুগল লগইনের জন্য নতুন রুট
router.post('/google-login', googleLogin);

module.exports = router;