const express = require('express');
const user_route = express();
const { userVerify } = require('../Middleware/userMiddleware');
const userController = require('../Controller/userController');

const multer = require("multer");
const upload = multer({ dest: '../client/public/UserImages' });


user_route.post('/register',userController.userRegister);
// user_route.post('/register', upload.single('image') ,userController.userRegister);
user_route.post('/login',userController.userLogin);
user_route.post('/resend-otp',userController.resendOtp);
user_route.post('/google-login',userController.loadGoogleLogin);
user_route.post('/verify',userController.verifyLogin);

user_route.get('/profile', userVerify, userController.findUser);
user_route.post('/add-more-info',userVerify,userController.addMoreData);
user_route.post('/edit-user-profile',userVerify,userController.profileEdit);
// user_route.post('/edit-user-profile',userVerify,upload.single('image'),userController.profileEdit);
user_route.get('/view-doctors-spec/:specialName',userVerify,userController.loadDoctors);
user_route.get('/view-doctor-slots/:docId',userVerify,userController.viewDocSlot);
user_route.get('/view-specialization',userVerify,userController.loadDocSpec);




module.exports = user_route;