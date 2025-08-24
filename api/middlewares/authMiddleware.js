const jwt = require('jsonwebtoken');
const { getCollections, getObjectId } = require('../../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 'Bearer <token>' থেকে শুধু টোকেনটি নেওয়া হচ্ছে
      token = req.headers.authorization.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const { usersCollection } = getCollections();
      req.user = await usersCollection.findOne({ _id: getObjectId(decoded.userId) }, { projection: { password: 0 } });
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };