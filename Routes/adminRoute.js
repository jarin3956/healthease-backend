const express = require('express');
const admin_route = express();
const adminController = require('../Controller/adminController');
const { adminverify } = require('../Middleware/adminMiddleware');


admin_route.post('/register',adminController.adminRegister);
admin_route.post('/login', adminController.adminLogin);
admin_route.get('/dashboard',adminverify,adminController.findAdmin);
admin_route.get('/users',adminverify,adminController.loadUsers);
admin_route.get('/doctors',adminverify,adminController.loadDoctors);
admin_route.put('/change-user-status/:userId',adminverify,adminController.changeUserStatus);
admin_route.put('/change-doctor-status/:doctorId',adminverify,adminController.changeDoctorStatus);
admin_route.put('/change-doctor-blocking/:doctorId',adminverify, adminController.handleBlocking);
admin_route.get('/bookings',adminverify,adminController.loadBooking);
admin_route.get('/view-doctor-profile/:doctorId',adminverify,adminController.loadDoctorProfile);
admin_route.get('/view-user-profile/:userId',adminverify,adminController.loadUserProfile);
admin_route.get('/linechart-data',adminverify,adminController.loadChartData);



module.exports = admin_route;