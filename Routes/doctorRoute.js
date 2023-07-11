const express = require('express');
const doctor_route = express();
 const { validateDoctorToken } = require('../Middleware/doctorMiddleware');
const doctorController = require('../Controller/doctorController');

const multer = require("multer");
const upload = multer({ dest: '../healthease/public/DocImages' });


doctor_route.post('/register', upload.fields([{ name: 'profileimg', maxCount: 1 }]) , doctorController.doctorRegister);
doctor_route.post('/verify', doctorController.verifyLogin);
doctor_route.post('/login', doctorController.doctorLogin);
doctor_route.get('/profile', validateDoctorToken, doctorController.findDoctor );
doctor_route.post('/send-verifyemail',doctorController.sendVerifyMail)
doctor_route.post('/resend-otp',doctorController.resendOtp);
doctor_route.post('/start-journey',upload.single('certificate'), doctorController.addMoreData )


module.exports = doctor_route;