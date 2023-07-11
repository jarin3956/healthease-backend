const express = require('express');
const user_route = express();
const { validateToken } = require('../Middleware/userMiddleware');
const userController = require('../Controller/userController');

const multer = require("multer");
const upload = multer({ dest: '../healthease/public/UserImages' });


user_route.post('/register', upload.single('image') , userController.userRegister);
user_route.post('/login', userController.userLogin);
user_route.get('/profile', validateToken, userController.findUser );
user_route.post('/verify', userController.verifyLogin);
user_route.post('/add-more-info/:userId',userController.addMoreData);
user_route.post('/edit-user-profile/:userId',upload.single('image'),userController.profileEdit)
user_route.post('/resend-otp',userController.resendOtp);
user_route.get('/specialization',userController.viewSpec);
user_route.get('/view-doctors-spec/:specialId',userController.loadDoctors)



module.exports = user_route;