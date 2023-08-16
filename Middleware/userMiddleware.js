const jwt = require('jsonwebtoken');
const User = require('../Model/userModel');


const userVerify = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1] || null;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized', user:'user' });
  }

  try {
    const decoded = jwt.verify(token, process.env.USER_SECRET);

    const { role } = decoded;

    if (role !== 'user') {
      return res.status(403).json({ message: 'Forbidden', user:'user' });
    }

    const user = await User.findById(decoded.userId); 

    if (!user) {
      return res.status(403).json({ message: 'Forbidden', user:'user' });
    }

    if (user.isBlocked === true) {
      return res.status(403).json({ message: 'User Blocked',user:'user' });
    }

    // req.params = decoded;
    req.decodedUser = decoded 
    next(); 
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', user:'user' });
  }
};

module.exports = {
  userVerify
};
