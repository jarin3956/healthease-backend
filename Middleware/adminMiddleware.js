const jwt = require('jsonwebtoken');
const Admin = require('../Model/adminModel');

const adminverify = async (req, res, next) => {
  const admintoken = req.headers.authorization.split(' ')[1] || null;
  if (!admintoken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(admintoken, process.env.ADMIN_SECRET);

    const admin = await Admin.findById(decoded.adminId)

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    req.params = decoded; 
    next(); 
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
  adminverify
};
