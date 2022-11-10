const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const define = require("../config/constants");
const jwt_decode = require('jwt-decode');
const db = require("../config/connection");
dotenv.config();
const generateAccessToken = function(username) {
	return jwt.sign(JSON.parse(JSON.stringify(username)), process.env.TOKEN_SECRET_DASHBOARD, {
		expiresIn: '86000s'
	});
}
const authenticateToken = function(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	const bearer = authHeader && authHeader.split(' ')[0];
	if (typeof bearer !== "undefined" && bearer == 'Bearer') {
		if (typeof token !== "undefined" && typeof token !== null) {
			jwt.verify(token, process.env.TOKEN_SECRET_DASHBOARD, (err, user) => {
				if (err) {
					res.status(203).send({
						status: 203,
						msg: "Unauthorized !! Access Token is not valid",
						err
					});
				} else {
					res.userData = {
						access_token: token,
						token_type: "Bearer",
						issued_at: user.iat,
						expires_in: user.exp
					};
					var tklmjn = jwt_decode(token);
					if (req.query.user_id) {
					     res.user_id=  req.query.user_id;
						if (parseInt(req.query.user_id) === parseInt(tklmjn.user_id)) {
							res.user_id = tklmjn.user_id;

							db.query(`SELECT user_id,user_identification_key FROM tbl_user_profile WHERE user_id = ?;`, [tklmjn.user_id], function(error, results_comment_re, fields) {
								if (error) {} else {
									if (results_comment_re.length > 0 && tklmjn.user_identification_key === results_comment_re[0].user_identification_key) {
									} else {
										res.status(203).send({
											status: 203,
											msg: "Unauthorized !! Zktor user is not valid",
											err: {
												name: "ZktorTokenError",
												message: "Valid user must be provided"
											}
										});
									}
								}
							});
						} else {
							res.status(203).send({
								status: 203,
								msg: "Unauthorized !! Zktor user is not valid",
								err: {
									name: "ZktorTokenError",
									message: "Valid user must be provided"
								}
							});
						}
					} else {
						res.user_id = tklmjn.user_id;
					}
					db.query(`SELECT * FROM tbl_user_profile inner join country_time_zones  on tbl_user_profile.country_code=country_time_zones.country_code where user_id=?`, [tklmjn.user_id], function(error, results, fields) {
						if (error) {
							process.env.TZ = "Asia/Kolkata";
							next();
						} else {
							if (results.length > 0) {
								if (results[0].time_zone != '') {
									process.env.TZ = results[0].time_zone;
									next();
								} else {
									process.env.TZ = "Asia/Kolkata";
									next();
								}
							} else {
								process.env.TZ = "Asia/Kolkata";
								next();
							}
						}
					});
				}
			});
		} else {
			res.status(203).send({
				status: 203,
				msg: "Unauthorized !! Access Token is not valid",
				err: {
					name: "ZktorTokenError",
					message: "zktor token must be provided"
				}
			});
		}
	} else {
		res.status(203).send({
			status: 203,
			msg: "Unauthorized !! Access Token is not valid",
			err: {
				name: "ZktorTokenError",
				message: "zktor token must be provided"
			}
		});
	}
}
module.exports = {
	generateAccessToken,
	authenticateToken
};