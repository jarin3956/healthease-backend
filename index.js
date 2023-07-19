const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const user_route = require('./Routes/userRoute')
const doctor_route = require('./Routes/doctorRoute')
const admin_route = require('./Routes/adminRoute')
const spec_route = require('./Routes/specRoute')
const booking_route = require('./Routes/bookingRoute')

app.use(cors())
app.use(express.json());
app.use('/',user_route);
app.use('/doctor',doctor_route);
app.use('/admin',admin_route);
app.use('/specialization',spec_route);
app.use('/booking',booking_route);
require('dotenv').config()


mongoose.connect(process.env.MONGO_URL);

app.listen(3001, () => {
    console.log("server started");
})
 
