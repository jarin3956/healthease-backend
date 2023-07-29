const jwt = require('jsonwebtoken');
const User = require('../Model/userModel');


const userVerify = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1] || null;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.USER_SECRET);

    const user = await User.findById(decoded.userId); 

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isBlocked === true) {
      return res.json({ error: 'User Blocked' });
    }

    req.params = decoded; 
    next(); 
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
  userVerify
};
