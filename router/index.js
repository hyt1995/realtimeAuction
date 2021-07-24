const { Router } = require("express");

router.use((req,res,next)=>{
    res.locals.user = req.user;
    next();
}) // app.use처럼 사용하지만 그 라우터에만 적용되는 거다
// app.use는 전체에 적용되지만