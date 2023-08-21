const express = require('express');
const doctor_route = express();
 const { doctorVerify } = require('../Middleware/doctorMiddleware');
const doctorController = require('../Controller/doctorController');

const multer = require("multer");
const upload = multer({ dest: '../client/public/DocImages' });


doctor_route.post('/register', upload.fields([{ name: 'profileimg', maxCount: 1 }]) , doctorController.doctorRegister);
doctor_route.post('/verify', doctorController.verifyLogin);
doctor_route.post('/login', doctorController.doctorLogin);
doctor_route.post('/send-verifyemail',doctorController.sendVerifyMail);
doctor_route.post('/resend-otp',doctorController.resendOtp);

doctor_route.get('/profile', doctorVerify, doctorController.findDoctor);
doctor_route.post('/start-journey',doctorVerify,upload.single('certificate'), doctorController.addMoreData );
doctor_route.post('/set-schedule',doctorVerify,doctorController.setSchedule);
doctor_route.put('/update-schedule',doctorVerify,doctorController.updateSchedule);
doctor_route.get('/schedule-data',doctorVerify,doctorController.viewDocSchedule);
doctor_route.put('/edit-profile',doctorVerify , upload.fields([{ name: 'profileimg', maxCount: 1 },{name:'certificate' ,maxCount:1 }]),doctorController.loadDocEdit);
doctor_route.get('/load-all-bookings',doctorVerify, doctorController.loadAllBookings);
doctor_route.get('/find-dayslots',doctorVerify,doctorController.loadTimeSlots);
doctor_route.get('/view-doc-schedulestatus',doctorVerify,doctorController.viewScheduleStatus);
doctor_route.put('/change-doc-schedulestatus',doctorVerify,doctorController.changeScheduleStatus);


module.exports = doctor_route;