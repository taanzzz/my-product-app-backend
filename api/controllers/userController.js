const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { getCollections, getObjectId } = require('../../config/db');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../utils/sendEmail');

// @desc    Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }
    const { usersCollection } = getCollections();
    const userExists = await usersCollection.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const newUser = {
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      emailVerificationToken,
      emailVerificationTokenExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      createdAt: new Date(),
    };
    await usersCollection.insertOne(newUser);
    const verificationURL = `http://localhost:3000/verify-email?token=${emailVerificationToken}`;
    const message = `<p>Please verify your email by clicking on the following link:</p> <a href="${verificationURL}">${verificationURL}</a>`;
    await sendEmail({
      email: newUser.email,
      subject: 'Email Verification - Premium Store',
      html: message,
    });
    res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Auth user & get token (Login)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { usersCollection } = getCollections();
    const user = await usersCollection.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email before logging in.' });
      }

      // টোকেনটি সরাসরি JSON-এর সাথে পাঠানো হচ্ছে
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token, // <-- টোকেন এখানে
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Verify user email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const { usersCollection } = getCollections();
    const user = await usersCollection.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true },
        $unset: { emailVerificationToken: 1, emailVerificationTokenExpires: 1 }
      }
    );
    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

// @desc    Logout user
const logoutUser = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

const googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;
    const { usersCollection } = getCollections();

    let user = await usersCollection.findOne({ email });

    // যদি ইউজার না থাকে, তাহলে নতুন একটি তৈরি করা হবে
    if (!user) {
      const newUser = {
        name,
        email,
        password: null, // গুগল ইউজারদের পাসওয়ার্ড থাকে না
        isVerified: true, // গুগল ইমেইল ভেরিফাইড হিসেবে ধরা হয়
        createdAt: new Date(),
      };
      const result = await usersCollection.insertOne(newUser);
      user = { _id: result.insertedId, ...newUser };
    }

    // JWT টোকেন তৈরি করে পাঠানো হচ্ছে
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during Google login', error: error.message });
  }
};


module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  logoutUser,
  googleLogin,
};