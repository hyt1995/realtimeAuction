const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const { sequelize } = require('./models');
const db = require('./models');
require('dotenv').config();
const webSocket = require('./socket');
const { LOADIPHLPAPI } = require('dns');
const { verifyToken } = require('./router/middlewares');
// const Good = require("./models/good");
// const CompanyName = require("./models/companyUser");

const app = express();

sequelize.sync();

const sessionMiddleware = session({
	resave: false,
	saveUninitialized: false,
	secret: process.env.AUCTION_SESSION,
	cookie: {
		httpOnly: true,
		secure: false,
		maxAge: 3.6e6 * 24,
	},
});

app.set('port', process.env.PORT || 8083);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
//  https://backback.tistory.com/338
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.AUCTION_SESSION));
app.use(sessionMiddleware);
app.use(cors());

app.get('/qwe', async (req, res, next) => {
	try {
		console.log('내가 실시간 경매에서 받아온 데이터', req);
		console.log('실시간 경매 상품 주소', req.params.id);

		return res.status(200).json({
			code: 200,
			data: '요청이 제대로 왔습니다..',
		});
	} catch (err) {
		console.log('/realTime/:id', err);
	}
});

// 입찰 완료시 실행되는 라우터
app.post('/biddingPrice', async (req, res, next) => {
	console.log('현재 입찰한 브랜드', req.body);

	try {
		// 브랜드 이름을 저장하는 부분
		const user = await db.CompanyUser.create({
			companyUserName: 'ddd',
		});
		if (user) {
			res.status(200).json({
				code: 200,
				result: true,
			});
		}

		// const findBrand = await db.CompanyUser.findOne({
		//     where:{
		//         companyUserName:"qqq"
		//     }
		// });
		// console.log(findBrand.dataValues.id)
		// const result = await db.Good.create({
		//     // companyUserId:findBrand.dataValues.id,
		//     goodName:req.body.goodName,
		//     goodPrice:req.body.price,
		// })
		// if(result){
		//     // console.log("내가 저장한 정보 확인",result);
		//     // const findResult = await db.Good.findAll({
		//     //     where:{
		//     //         goodName:"sdfsdfd"
		//     //     },
		//     //     include:{
		//     //         model: db.CompanyUser
		//     //     }
		//     // })
		//     // if(findResult){
		// req.app.get("io").of('/').emit('bidCompleted',{
		//     data:true
		// })
		//         return res.status(200).json({
		//             code : 200,
		//             result: true,
		//             // data: findResult
		//         });
		//     // }
		// }
	} catch (err) {
		console.log('저장 에러', err);
		res.status(403).json({
			code: 403,
			result: false,
		});
	}
});

app.post('/successfullBidding', async (req, res) => {
	console.log('낙찰 버튼 클릭', req.body);

	try {
		// 우선 브랜드 이름 아이디 부터 찾고
		const findbrand = await db.CompanyUser.findOne({
			where: {
				companyUserName: req.body.brandName,
			},
		});
		if (findbrand) {
			// 상품 이름이 없으면 저장하고 있으면 관련 정보를 저장한다.
			console.log('여기서 브랜드 이름 출력', findbrand);

			const saveGoodName = await db.Good.findOrCreate({
				where: {
					goodName: req.body.goodName,
				},
				defaults: {
					goodName: req.body.goodName,
					goodPrice: req.body.price,
					companyUserId: findbrand.dataValues.id, // 브랜드 아이디 저장
				},
			});
			console.log('여기서 결과 확인', saveGoodName);

			if (saveGoodName) {
				req.app.get('io').of('/').emit('bidCompleted', {
					code: 200,
					result: saveGoodName,
					data: true,
					price: req.body.price,
					success: true,
				});
				return res.status(200).json({
					code: 200,
				});
			}
		}
	} catch (err) {
		console.log('successfullBidding 낙찰 버튼 클릭 에러', err);
		return res.status(40).json({
			code: 403,
			result: '다시 한번 확인해주세요',
			data: false,
		});
	}
});

// 토큰 발급 후 client로 보냄
app.post('/getTokenResult', async (req, res, next) => {
	try {
		// 토큰이 저장이 안되어 있다면
		if (!req.session.jwt) {
			const tokenResult = await axios.post(
				'http://localhost:8082/tokenIssued',
				{
					clientSecert: process.env.JWT_SECRET,
				}
			);
			if (tokenResult.data && tokenResult.data.code === 200) {
				req.session.jwt = tokenResult.data;
			} else {
				// 에러를 반환
				return res.status(401).json(tokenResult.data);
			}
		}
		// 토큰이 저장이 되어 있다면
		// const result = await axios.get("http://localhost:8082/test",{
		//     headers:{
		//         authorization: req.session.jwt.data
		//     },
		// })
		return res.status(200).json({
			code: 200,
			data: req.session.jwt,
			message: '날것의 토큰',
		});
	} catch (err) {
		// if(err.response.status === 419 ){
		//     return res.status(419).json({
		// code :419,
		// data: "토큰 auction에 저장에러"
		//     })
		// }
		console.log('토큰을 가져오는 에러', err);
		return res.status(419).json({
			code: 419,
			data: '토큰 auction에 저장에러',
		});
	}
});

app.get('/test', verifyToken, (req, res) => {
	// verifyToken 에서 req.decoded에 저장을 해준다.
	return res.status(200).json(req.decoded);
});

const server = app.listen(app.get('port'), () => {
	console.log(`서버가 ${app.get('port')}포트에서 실행중입니다.`);
});

webSocket(server, app);
