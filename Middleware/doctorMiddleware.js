const jwt = require('jsonwebtoken');
const Doctor = require('../Model/doctorModel');


const doctorVerify = async (req, res, next) => {
  const doctortoken = req.headers.authorization.split(' ')[1] || null;
  if (!doctortoken) {
    return res.status(401).json({ message: 'Unauthorized', user:'doctor' });
  }

  try {
    const decoded = jwt.verify(doctortoken, process.env.DOCTOR_SECRET);

    const { role } = decoded;

    if (role !=='doctor' ) {
      return res.status(403).json({ message: 'Forbidden', user:'doctor' });
    }

    const doctor = await Doctor.findById(decoded.doctorId);
    if (!doctor) {
      return res.status(403).json({ message: 'Forbidden', user:'doctor' });
    }

    if (doctor.isBlocked === true) {
      return res.status(403).json({ message: 'Doctor Blocked', user:'doctor' });
    }

    // req.params = decoded; 
    req.decodedDoctor = decoded
    next(); 
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', user:'doctor' });
  }
};

module.exports = {
  doctorVerify
};
