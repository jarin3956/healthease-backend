const express = require('express');
const booking_route = express();
const bookingController = require('../Controller/bookingController');
const { userVerify } = require('../Middleware/userMiddleware');
const { doctorVerify} = require('../Middleware/doctorMiddleware')

booking_route.get('/load-doctors/:docId',userVerify,bookingController.loadDoctor);
booking_route.post('/bookings-data',userVerify,bookingController.bookConsultation);
booking_route.get('/check-wallet',userVerify,bookingController.loadUserWallet);
booking_route.post('/wallet-booking-data',userVerify,bookingController.walletBookConsultation);
booking_route.post('/check-doc-availability',userVerify,bookingController.checDocAvailability);
booking_route.get('/load-doc-bookings',doctorVerify,bookingController.loadDoctorBooking);
booking_route.get('/load-doc-nextbooking',doctorVerify,bookingController.loadNextBooking)
booking_route.get('/load-user-bookings',userVerify,bookingController.loadUserBooking);
booking_route.put('/cancel-booking-user/:bookingId',userVerify,bookingController.cancelBooking);
booking_route.put('/cancel-booking-doctor/:bookingId',doctorVerify,bookingController.cancelBooking);
booking_route.post('/completed-booking/:bookingConfirmId',bookingController.updateCompleted);
booking_route.post('/submit-feedback',userVerify,bookingController.updateFeedback);
booking_route.post('/submit-prescription',doctorVerify, bookingController.uploadPrescription);
booking_route.get('/view-user-prescription/:bookingId',userVerify, bookingController.viewUserPrescription);
booking_route.get('/load-booking/:bookingId',userVerify,bookingController.loadTheBooking);
booking_route.post('/follow-up-booking',doctorVerify,bookingController.followUpBooking);
booking_route.get('/followup-bookingData/:bookingId',userVerify,bookingController.loadFollowUpData);
booking_route.post('/followUp-paymentdata',userVerify,bookingController.followUpPayment);
booking_route.post('/followup-walletBooking',userVerify,bookingController.followUpWalletPayment);


module.exports = booking_route;