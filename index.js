const express = require('express')
const app = express()
const cors = require('cors')
const user_route = require('./Routes/userRoute')
const doctor_route = require('./Routes/doctorRoute')
const admin_route = require('./Routes/adminRoute')
const spec_route = require('./Routes/specRoute')
const booking_route = require('./Routes/bookingRoute')
const connectDB = require('./config/dbConnection')
const {initializeSocket } = require('./Socket/Socket')

connectDB()
require('dotenv').config()


//middlewares
app.use(cors())
app.use(express.json());


//routes
app.use('/', user_route);
app.use('/doctor', doctor_route);
app.use('/admin', admin_route);
app.use('/specialization', spec_route);
app.use('/booking', booking_route);


const server = app.listen(process.env.PORT, () => {
    console.log("Server Started");
});


initializeSocket(server)

