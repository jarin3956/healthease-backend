const jwt = require('jsonwebtoken');
const Doctor = require('../Model/doctorModel');


const doctorVerify = async (req, res, next) => {
  const doctortoken = req.headers.authorization.split(' ')[1] || null;
  if (!doctortoken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(doctortoken, process.env.DOCTOR_SECRET);

    const doctor = await Doctor.findById(decoded.doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    req.params = decoded; 
    next(); 
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
  doctorVerify
};
