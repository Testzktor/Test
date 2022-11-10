const fastify = require('fastify')({
	logger: true
});
var bodyParser = require('body-parser');
const multer = require('fastify-multer');
const crypto = require("crypto");
const jwt_decode = require('jwt-decode');
const db = require("../config/connection");
const words = require("naughty-words");
var resultArray = Array.prototype.concat.apply([], [words.ar, words.zh, words.cs, words.da, words.nl, words.en, words.eo, words.fil, words.fi, words.fr, words.de, words.hi, words.hu, words.it, words.ja, words.kab, words.tlh, words.ko, words.no, words.fa, words.pl, words.pt, words.ru, words.es, words.sv, words.th, words.tr]);
const Filter = require('bad-words'),
    filter = new Filter({
        list: resultArray
    });
var auth = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../uploads/auth/');
    },
    filename: function(req, file, cb) {
        cb(null, "cook_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
    }
});

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const tokenList = {}
exports.refresh_token = async (req, res) => {
	try {
    let upload = multer({
        storage: auth,
    }).fields([{
        name: 'auth',
        maxCount: 10
    }]);
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail"
            });
        } else {
            // refresh the damn token
            console.log(req.body);
            const postData = req.body
            // if refresh token exists
            if ((postData.refresh_token) && (postData.user_id)) {
                const refresh_token = postData.refresh_token;
	          	var tklmjn = jwt_decode(refresh_token);
	         	console.log(req.body.user_id);
	        	console.log(tklmjn);
	        	 res.user_id=  req.query.user_id;
				// 		if (parseInt(req.body.user_id) === parseInt(tklmjn.user_id)) {
				// 			res.user_id = tklmjn.user_id;
				// 				db.query(`SELECT user_id,user_identification_key FROM tbl_user_profile WHERE user_id = ?;`, [tklmjn.user_id], function(error, results_comment_re, fields) {
				// 				if (error) {} else {
				// 					if (results_comment_re.length > 0 && tklmjn.user_identification_key === results_comment_re[0].user_identification_key) {
				// 					} else {
				// 						res.status(403).send({
				// 							status: 403,
				// 							msg: "Unauthorized !! Zktor user is not valid",
				// 							err: {
				// 								name: "ZktorTokenError",
				// 								message: "Valid user must be provided1"
				// 							}
				// 						});
				// 					}
				// 				}
				// 			});
				// 		} else {
				// 			res.status(403).send({
				// 				status: 403,
				// 				msg: "Unauthorized !! Zktor user is not valid",
				// 				err: {
				// 					name: "ZktorTokenError",
				// 					message: "Valid user must be provided2"
				// 				}
				// 			});
				// 		}
                jwt.verify(refresh_token, process.env.TOKEN_SECRET, (err, user1) => {
                    if (err) {
                        console.log(err);
                        if (err.name == 'TokenExpiredError') {
                            db.query(`SELECT * from tbl_user_profile where user_id = ?`, [postData.user_id], function(error, resultsData, fields) {
                                if (error) {
                                    return res.status(400).send({
                                        status: 400,
                                        msg: "fail"
                                    });
                                } else {
                                    if (resultsData.length > 0) {
                                        const user = JSON.parse(JSON.stringify(resultsData[0]))
                                        const token = jwt.sign(user, process.env.TOKEN_SECRET, {
                                            expiresIn: '864000s'
                                        });
                                        jwt.verify(token, process.env.TOKEN_SECRET, (err, user11) => {
                                            if (err) {
                                                res.status(403).send({
                                                    status: 403,
                                                    msg: "Unauthorized !! Refresh Token is not valid",
                                                    err
                                                });
                                            } else {
                                                return res.status(200).send({
                                                    status: 200,
                                                    msg: "Success",
                                                    app_auth: resultsData[0].app_auth,
                                                    refresh_token: token,
                                                    token_type: "Bearer",
                                                    issued_at: new Date(user11.iat * 1000).toString(),
                                                    expires_in: new Date(user11.exp * 1000).toString()
                                                });
                                            }
                                        });
                                    } else {
                                        return res.status(400).send({
                                            status: 400,
                                            msg: "User not found."
                                        });
                                    }
                                }
                            });
                        } else {
                            res.status(403).send({
                                status: 403,
                                msg: "Unauthorized !! Refresh Token is not valid",
                                err
                            });
                        }
                    } else {
                        db.query(`SELECT * from tbl_user_profile where user_id = ?`, [postData.user_id], function(error, resultsData, fields) {
                            if (error) {
                                return res.status(400).send({
                                    status: 400,
                                    msg: "fail"
                                });
                            } else {
                                if (resultsData.length > 0) {
                                    const user = JSON.parse(JSON.stringify(resultsData[0]))
                                    const token = jwt.sign(user, process.env.TOKEN_SECRET, {
                                        expiresIn: '86000s'
                                    });
                                    jwt.verify(token, process.env.TOKEN_SECRET, (err, user11) => {
                                        if (err) {
                                            res.status(403).send({
                                                status: 403,
                                                msg: "Unauthorized !! Refresh Token is not valid",
                                                err
                                            });
                                        } else {
                                            return res.status(200).send({
                                                status: 200,
                                                msg: "Success",
                                                app_auth: resultsData[0].app_auth,
                                                refresh_token: token,
                                                token_type: "Bearer",
                                                issued_at: new Date(user11.iat * 1000).toString(),
                                                expires_in: new Date(user11.exp * 1000).toString()
                                            });
                                        }
                                    });
                                } else {
                                    return res.status(400).send({
                                        status: 400,
                                        msg: "User not found."
                                    });
                                }
                            }
                        });
                    }
                });

            } else {
                return res.status(400).send({
                    status: 400,
                    msg: "Invalid request."
                });
            }
        }
    });
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.check_words = async (req, res) => {
	try {
    if (req.query.word) {
        var me = req.query.word;
        var s1 = filter.clean(req.query.word),
            s2 = req.query.word,
            string1 = [],
            string2 = [],
            diff = [],
            longString, rep;
        string1 = s1.split(" ");
        string2 = s2.split(" ");

        if (s1.length > s2.length) {
            longString = string1;
        } else {
            longString = string2;
        }
        for (x = 0; x < longString.length; x++) {
            if (string1[x] != string2[x]) {
                diff.push(string2[x]);
                var d = string2[x].substring(0, 2);
                var k = d + string1[x].substring(2);
                me = me.replace(string2[x], k);
            }
        }
        return res.status(200).send({
            status: 200,
            msg: "Success",
            is_bad_word: (filter.isProfane(req.query.word)) ? 1 : 0,
            filtered_word: filter.clean(me)
        });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail"
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};