const express = require('express');
const booking_route = express();
const bookingController = require('../Controller/bookingController');
const { userVerify } = require('../Middleware/userMiddleware');

booking_route.get('/load-doctors/:docId',bookingController.loadDoctor);
booking_route.post('/bookings-data',userVerify,bookingController.bookConsultation)


module.exports = booking_route;