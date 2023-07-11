const jwt = require('jsonwebtoken');

const validateDoctorToken = (req, res, next) => {
  const doctortoken = req.headers.authorization.split(' ')[1] || null;
  if (!doctortoken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(doctortoken, process.env.DOCTOR_SECRET);
    req.params = decoded; 
    next(); 
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
  validateDoctorToken
};
