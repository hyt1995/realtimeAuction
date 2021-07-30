const jwt = require('jsonwebtoken');

// 토큰 검증을 위한
exports.verifyToken = (req, res, next) => {
	try {
		// req.headers.authorization에 넣어서 서버로 보내준다 그걸 받아서 검증
		req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
		console.log('검증 확인을 위한', req.headers.authorization, req.decoded);
		return next();
	} catch (err) {
		if (err) {
			if (err.name === 'TokenExpiredError') {
				return res.status(419).json({
					code: 419,
					message: '토큰이 완료되었습니다.',
				});
			}
			return res.status(419).json({
				code: 419,
				message: '유효하지 않은 토큰입니다.',
			});
		}
	}
};
