const express = require('express')
const app = express()
const cors = require('cors')
const user_route = require('./Routes/userRoute')
const doctor_route = require('./Routes/doctorRoute')
const admin_route = require('./Routes/adminRoute')
const spec_route = require('./Routes/specRoute')
const booking_route = require('./Routes/bookingRoute')
const connectDB = require('./config/dbConnection')
const { Server } = require('socket.io')

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

const io = new Server(server, { cors: true });

const emailToSocketIdMap = new Map();
const socketIdEmailMap = new Map()

io.on('connection',(socket) => {
    console.log(`socket connected`, socket.id);
    socket.on('room:join', (data) => {
        const { email, room } = data
        emailToSocketIdMap.set(email, socket.id)
        socketIdEmailMap.set(socket.id, email)
        io.to(room).emit('user:joined', {email, id:socket.id})
        socket.join(room)
        io.to(socket.id).emit('room:join', data)
    });

    socket.on('user:call', ({ to ,offer }) => {
        io.to(to).emit('incomming:call', { from: socket.id, offer })
    })

    socket.on('call:accepted', ({to , ans}) => {
        io.to(to).emit('call:accepted', { from: socket.id, ans })
    })

    socket.on('peer:nego:needed', ({ to, offer }) => {
        io.to(to).emit('peer:nego:needed', { from: socket.id, offer })
    })

    socket.on('peer:nego:done', ({to, ans}) => {
        io.to(to).emit('peer:nego:final', { from: socket.id, ans })
    })

    
})