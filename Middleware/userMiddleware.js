const jwt = require('jsonwebtoken');

const validateToken = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1] || null;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.USER_SECRET);
    req.params = decoded; 
    next(); 
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
  validateToken
};
