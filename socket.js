const SocketIO = require("socket.io");
const axios = require("axios");
const db = require("./models");



module.exports = (server,app)=>{
    const io = SocketIO(server, {
        path: "/socket.io",
        cors:{
            origin:"*"
        },
    });

    app.set("io",io);
    
    io.on("connection", (socket)=>{
        const req = socket.request; //req 에 이렇게 접근을 해야한다.
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        console.log("새로운 클라이언트 접속",ip, socket.id, req.id);
        // const {  headers : { referer } } = req;
        // req.cookies, req.session에 접근이 불가능하다.
        // 그래서 io.use로 미들웨어를 연결을 해주어야한다.
        // const roomId = referer.split("/")[referer.split("/").length -1];

        // socket.join(roomId);
        socket.on("disconnect", ()=>{
            // socket.leave(roomId);
            console.log("클라이언트 접속 해제 disconnect", ip, socket.id);
            clearInterval(socket.interval)
        })
        socket.on("error", (error)=>{
            console.log("소켓 error",error)
        });
        socket.on("bid",(data)=>{ 
            console.log("브랜드 테이블 reply",data);
        });

        socket.on("inspectionBid",(data)=>{
            io.emit("test","테스트를 위한 임시로 보내는 메세지");
        })
        // 프론트에서 메세지를 socket로 보내면 이벤트에서
        // clearInterval 하고 다시 socket.interval = setInterval(sendIntervalCountDown, 1000)
        // 을 실행시킨다.

        let count = 10;

        const sendIntervalCountDown  = () => {
            if(count !== 0){
                io.emit('intervalCountDown', count);
                count -= 1;
            }else {
                io.emit('intervalCountDown', "낙찰이 완료되었습니다.");
                clearInterval(socket.interval);
            }
        }

        socket.interval = setInterval(sendIntervalCountDown, 1000);


        // socket.interval = setInterval(()=>{
        //     // socket.emit('news', Date.now().toString());
        //     const newDate = new Date();
        //     socket.emit('news', newDate);
        // },1000)
    });
}



// 접속된 모든 클라이언트에게 메시지를 전송한다
// io.emit('event_name', msg);
// 메시지를 전송한 클라이언트에게만 메시지를 전송한다
// socket.emit('event_name', msg);
// 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
// socket.broadcast.emit('event_name', msg);
// 특정 클라이언트에게만 메시지를 전송한다
// io.to(id).emit('event_name', data);