const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../../config/cloudinary');

// Cloudinary-তে স্টোরেজ কনফিগার করা হচ্ছে
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'product-store-app', // Cloudinary-তে যে ফোল্ডারে ছবি সেভ হবে
    allowed_formats: ['jpeg', 'png', 'jpg'],
    // public_id ইউনিক রাখার জন্য একটি ফাংশন (ঐচ্ছিক)
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return file.fieldname + '-' + uniqueSuffix;
    },
  },
});

// multer ইনস্ট্যান্স তৈরি করা হচ্ছে
const upload = multer({ 
  storage: storage,
  // ফাইল সাইজ লিমিট (যেমন: 5MB)
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  // ফাইল ফিল্টার (ঐচ্ছিক)
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only JPEG, PNG, and JPG are allowed!'), false);
    }
  }
});

// সঠিকভাবে multer ইনস্ট্যান্সটি এক্সপোর্ট করা হচ্ছে
module.exports = upload;