const express = require('express');
const admin_route = express();
const adminController = require('../Controller/adminController');
const { adminvalidateToken } = require('../Middleware/adminMiddleware')


admin_route.post('/register',adminController.adminRegister);
admin_route.post('/login', adminController.adminLogin);
admin_route.get('/dashboard',adminvalidateToken,adminController.findAdmin);
admin_route.get('/users',adminController.loadUsers);
admin_route.get('/doctors',adminController.loadDoctors);
admin_route.put('/change-user-status/:userId',adminController.changeUserStatus);
admin_route.put('/change-doctor-status/:doctorId',adminController.changeDoctorStatus);



module.exports = admin_route;