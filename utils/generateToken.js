const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  // একটি নতুন JWT তৈরি করা হচ্ছে যেখানে ইউজারের আইডি থাকবে
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d', // টোকেনটি ৩০ দিন পর্যন্ত কার্যকর থাকবে
  });

  // টোকেনটিকে একটি HTTP-Only cookie-তে সেট করা হচ্ছে
  res.cookie('jwt', token, {
    httpOnly: true, // এটি নিশ্চিত করে যে ক্লায়েন্ট-সাইড স্ক্রিপ্ট থেকে cookie অ্যাক্সেস করা যাবে না
    secure: process.env.NODE_ENV !== 'development', // প্রোডাকশনে শুধুমাত্র HTTPS কানেকশনে cookie পাঠানো হবে
    sameSite: 'strict', // CSRF অ্যাটাক থেকে সুরক্ষা প্রদান করে
    maxAge: 30 * 24 * 60 * 60 * 1000, // ৩০ দিন (মিলিসেকেন্ডে)
  });
};

module.exports = generateToken;