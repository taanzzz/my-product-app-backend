const { getCollections, getObjectId } = require('../../config/db');
const cloudinary = require('../../config/cloudinary');

const getProducts = async (req, res) => {
  try {
    
    const keyword = req.query.search 
      ? {
          name: {
            $regex: req.query.search, 
            $options: 'i', 
          },
        }
      : {}; 

    const { productsCollection } = getCollections();
    const products = await productsCollection.find({ ...keyword }).toArray();
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error("--- GET PRODUCTS ERROR ---", error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching products',
    });
  }
};

const addProduct = async (req, res) => {
  try {
    if (!req.body || !req.file) {
      return res.status(400).json({ message: 'Form data or image is missing.' });
    }
    const { name, description, price, category } = req.body;
    const { path: imageUrl, filename: imagePublicId } = req.file;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Please fill all required text fields.' });
    }
    const newProduct = {
      name, description, price: parseFloat(price), category,
      imageUrl, imagePublicId, user: req.user._id,
      createdAt: new Date(), updatedAt: new Date(),
    };
    const { productsCollection } = getCollections();
    const result = await productsCollection.insertOne(newProduct);
    if (!result.insertedId) { throw new Error('Database insertion failed.'); }
    const insertedProduct = { _id: result.insertedId, ...newProduct };
    res.status(201).json({ success: true, message: 'Product added successfully!', product: insertedProduct });
  } catch (error) {
    console.error("--- ADD PRODUCT CRITICAL ERROR ---");
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    res.status(500).json({ success: false, message: 'A critical server error occurred while adding the product.' });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const { productsCollection } = getCollections();
    const products = await productsCollection.find({ user: req.user._id }).toArray();
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user products' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productsCollection } = getCollections();
    const productId = getObjectId(req.params.id);
    const product = await productsCollection.findOne({ _id: productId });
    if (!product) { return res.status(404).json({ message: 'Product not found' }); }
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this product' });
    }
    if (product.imagePublicId) { await cloudinary.uploader.destroy(product.imagePublicId); }
    await productsCollection.deleteOne({ _id: productId });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { productsCollection } = getCollections();
    const productId = getObjectId(req.params.id);

    const product = await productsCollection.findOne({ _id: productId });

    if (product) {
      res.status(200).json({ success: true, data: product });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




const updateProduct = async (req, res) => {
  try {
    const { productsCollection } = getCollections();
    const productId = getObjectId(req.params.id);
    const { name, description, price, category } = req.body;

    const product = await productsCollection.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    
    const updatedFields = {
      name: name || product.name,
      description: description || product.description,
      price: price ? parseFloat(price) : product.price,
      category: category || product.category,
      updatedAt: new Date(),
    };

    
    if (req.file) {
      
      if (product.imagePublicId) {
        await cloudinary.uploader.destroy(product.imagePublicId);
      }
      
      updatedFields.imageUrl = req.file.path;
      updatedFields.imagePublicId = req.file.filename;
    }

    
    await productsCollection.updateOne(
      { _id: productId },
      { $set: updatedFields }
    );
    
    const updatedProduct = await productsCollection.findOne({ _id: productId });

    res.status(200).json({ message: 'Product updated successfully', data: updatedProduct });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getProducts, addProduct, getMyProducts, updateProduct, deleteProduct, getProductById };