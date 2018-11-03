const SocketIO = require('socket.io');
const axios = require('axios');

module.exports = (server, app, sessionMiddleware) => {
    const io = SocketIO(server, {
        path: '/socket.io'
    });

    app.set('io', io);
    const room = io.of('/roomasdf');
    const chat = io.of('/chat');

    
    io.use((socket, next) => {
        sessionMiddleware(socket.request, socket.request.res, next);
    });

    room.on('connection', (socket) => {
        console.log("주소?" + socket.request.headers.referer);
        console.log('roomasdf 네임스페이스에 접속');
        socket.on('disconnect', () => {
            console.log('room 네임스페이스 접속 해제');
        });
    });

    chat.on('connection', (socket) => {
        console.log('chat 네임스페이스에 접속');
/*        console.log("챗커넥션 주소?1" + socket.request.headers.referer);
        console.log("챗커넥션 주소?2" + socket);
        console.log("챗커넥션 주소?3" + socket.request);*/
        const req = socket.request;
/*        const {
            headers: {
                referer
            }
        } = req;
        const roomId = referer
            .split('/')[referer.split('/').length - 1]
            .replace(/\?.+/, '');*/
        const roomId = "5bdd5a72748b3c2e7cf71fd2";
        socket.join(roomId);
        socket.to(roomId).emit('join', {
            user: 'system',
            chat: `${req.session.color}님이 입장하셨습니다.`,
        });
        socket.on('disconnect', () => {
            console.log('chat 네임스페이스 접속 해제');
            socket.leave(roomId);
            const currentRoom = socket.adapter.rooms[roomId];
            const userCount = currentRoom ? currentRoom.length : 0;
            if (userCount === 0) {
                /* axios.delete(`http://localhost:8005/room/${roomId}`)
                     .then(() => {
                         console.log('방 제거 요청 성공');
                     })
                     .catch((error) => {
                         console.error(error);
                     });*/
            } else {
                socket.to(roomId).emit('exit', {
                    user: 'system',
                    chat: `${req.session.color}님이 퇴장하셨습니다.`,
                });
            }
        });
    });
};
