const jwt = require('jsonwebtoken');

const adminvalidateToken = (req, res, next) => {
  const admintoken = req.headers.authorization.split(' ')[1] || null;
  if (!admintoken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(admintoken, process.env.ADMIN_SECRET);
    req.params = decoded; 
    next(); 
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
    adminvalidateToken
};
