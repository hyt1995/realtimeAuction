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


        // 접속하면 뒤에 상품이름을 네임스페이스로 만들어서 방을 따로 관리하는 것은 어떻게 생각을 함


        const req = socket.request; //req 에 이렇게 접근을 해야한다.
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        console.log("새로운 클라이언트 접속",ip, socket.id, req.id);
        console.log("뭐가 있는지 확인하기 위한 ", req)
        // const {  headers : { referer } } = req;
        // req.cookies, req.session에 접근이 불가능하다.
        // 그래서 io.use로 미들웨어를 연결을 해주어야한다.
        // const roomId = referer.split("/")[referer.split("/").length -1];

        socket.on("disconnect", ()=>{
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
            clearInterval(socket.interval);

            // 서버에 보낼 현재 브랜드 이름 저장
            app.set("resentBrandUser",data.brandName);
            // 서버에 보낼 현재 상품 이름
            app.set("resentGoodName",data.goodName);

            if(data.price === 1000){
                app.set("resentPrice",1000);
                console.log("첫번째",data, app.get("resentPrice"));
                io.emit('bidCompleted', {
                    price:data.price + 1000
                })
            } else if(app.get("resentPrice") <= data.price){ // 가격이 더 크거나 같으면 올라간 가격을 제공
                app.set("resentPrice",data.price);
                console.log("두번째",data, app.get("resentPrice"), app.get("resentBrandUser"));
                io.emit('bidCompleted', {
                    price:data.price + 1000
                })
            }
        })

        app.set("forCount",20);

        const sendIntervalCountDown  = () => {
            let forSend = app.get("forCount");
            if(forSend !== 0){
                io.emit('intervalCountDown', forSend);
                app.set("forCount",forSend -1);
            }else {
                io.emit('intervalCountDown', "낙찰이 완료되었습니다.");
                clearInterval(socket.interval);
                axios.post('http://localhost:8083/successfullBidding',{
                    price:app.get("resentPrice") + 1000,
                    goodName:app.get("resentGoodName") || "",
                    brandName:app.get("resentBrandUser") || ""
                })
                .then(res=>console.log("낙찰에 성공했습니다."))
                .catch(err=>console.log("낙찰 성공 에러 실패",err))
            }
        }

        socket.interval = setInterval(sendIntervalCountDown, 1000);


        // 실시간 채팅을 위한 socket
        socket.on("realtimeChatting",(data)=>{})


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