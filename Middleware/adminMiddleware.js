const jwt = require('jsonwebtoken');

const adminverify = async (req, res, next) => {
  const admintoken = req.headers.authorization.split(' ')[1] || null;
  if (!admintoken) {
    return res.status(401).json({ message: 'Unauthorized', user:'admin' });
  }

  try {
    const decoded = jwt.verify(admintoken, process.env.ADMIN_SECRET);
   
    const { role } = decoded;

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden', user:'admin' });
    }
    
    // req.params = decoded; 
    req.decodedAdmin = decoded;
    next(); 
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' , user:'admin' });
  }
};

module.exports = {
  adminverify
};
