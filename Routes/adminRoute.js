const express = require('express');
const admin_route = express();
const adminController = require('../Controller/adminController');
const { adminverify } = require('../Middleware/adminMiddleware')


admin_route.post('/register',adminController.adminRegister);
admin_route.post('/login', adminController.adminLogin);
admin_route.get('/dashboard',adminverify,adminController.findAdmin);
admin_route.get('/users',adminController.loadUsers);
admin_route.get('/doctors',adminController.loadDoctors);
admin_route.put('/change-user-status/:userId',adminController.changeUserStatus);
admin_route.put('/change-doctor-status/:doctorId',adminController.changeDoctorStatus);
admin_route.get('/bookings',adminController.loadBooking);
admin_route.get('/view-doctor-profile/:doctorId',adminController.loadDoctorProfile);
admin_route.get('/view-user-profile/:userId',adminController.loadUserProfile)



module.exports = admin_route;