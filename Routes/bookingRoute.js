const express = require('express');
const booking_route = express();
const bookingController = require('../Controller/bookingController');
const { userVerify } = require('../Middleware/userMiddleware');
const { doctorVerify} = require('../Middleware/doctorMiddleware')

booking_route.get('/load-doctors/:docId',bookingController.loadDoctor);
booking_route.post('/bookings-data',userVerify,bookingController.bookConsultation);
booking_route.post('/check-doc-availability',bookingController.checDocAvailability);
booking_route.get('/load-doc-bookings',doctorVerify,bookingController.loadDoctorBooking);
booking_route.get('/load-user-bookings',userVerify,bookingController.loadUserBooking);
booking_route.put('/cancel-booking/:bookingId',bookingController.cancelBooking);


module.exports = booking_route;