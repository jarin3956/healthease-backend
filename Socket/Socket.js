const { Server } = require('socket.io');

function initializeSocket(server) {

    const io = new Server(server, { cors: true });

    const emailToSocketIdMap = new Map();
    const socketIdEmailMap = new Map();

    io.on('connection', (socket) => {
        // console.log(`socket connected`, socket.id);
        socket.on('room:join', (data) => {
            const { email, room } = data
            emailToSocketIdMap.set(email, socket.id)
            socketIdEmailMap.set(socket.id, email)
            io.to(room).emit('user:joined', { email, id: socket.id })
            socket.join(room)
            io.to(socket.id).emit('room:join', data)
        });

        socket.on('user:call', ({ to, offer }) => {
            io.to(to).emit('incomming:call', { from: socket.id, offer })
        })

        socket.on('call:accepted', ({ to, ans }) => {
            io.to(to).emit('call:accepted', { from: socket.id, ans })
        })

        socket.on('peer:nego:needed', ({ to, offer }) => {
            io.to(to).emit('peer:nego:needed', { from: socket.id, offer })
        })

        socket.on('peer:nego:done', ({ to, ans }) => {
            io.to(to).emit('peer:nego:final', { from: socket.id, ans })
        })


    })
}

module.exports = { initializeSocket }