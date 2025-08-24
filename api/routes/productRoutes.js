const express = require('express');
const router = express.Router();
const { getProducts, addProduct, getMyProducts, deleteProduct, updateProduct, getProductById } = require('../controllers/productController');
const upload = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getProducts);
router.post('/', protect, upload.single('image'), addProduct);
router.get('/my-products', protect, getMyProducts);
router.delete('/:id', protect, deleteProduct);
router.put('/:id', protect, upload.single('image'), updateProduct);
// ... router.get('/', getProducts); এর নিচে যোগ করুন
router.get('/:id', getProductById); // <-- এই নতুন লাইনটি যোগ করুন

module.exports = router;