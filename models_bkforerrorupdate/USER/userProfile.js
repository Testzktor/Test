const fastify = require('fastify')({
	logger: true
});
const db = require("../../config/connection");
const mail = require("../../config/mailer");
var bodyParser = require('body-parser');
const middleware = require("../../middleware/authentication");
var timeAgo = require('node-time-ago');
const multer = require('fastify-multer');
const crypto = require("crypto");
const nodeBase64 = require('nodejs-base64-converter');
var path = require('path');
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, '../uploads/profile/');
	},
	filename: function(req, file, cb) {
		cb(null, "profile_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
	}
});
exports.profile_list = async (req, res) => {
	try {
		if (!req.params.id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`SELECT count(*) totalRecords from tbl_user_profile where app_auth = ?`, [req.params.id], function(error, results, fields) {
				if (error) throw error;
				if (results[0].totalRecords > 0) {
					db.query(`SELECT * from tbl_user_profile where app_auth = ?`, [req.params.id], function(error, results1, fields) {
						if (error) throw error;
						results1[0].user_id = results1[0].user_id.toString();
						return res.status(200).send({
							status: 200,
							msg: "Success",
							profileList: results1[0]
						});
					});
				} else {
					db.query(`SELECT count(*) totalRecords from tbl_user_profile where app_auth = ?`, [req.params.id], function(error, results11, fields) {
						if (error) throw error;
						if (results11[0].totalRecords > 0) {
							db.query(`SELECT * from tbl_user_profile where app_auth = ?`, [req.params.id], function(error, results111, fields) {
								if (error) throw error;
								results1[0].user_id = results1[0].user_id.toString();
								return res.status(200).send({
									status: 200,
									msg: "Success",
									profileList: results111[0]
								});
							});
						} else {
							return res.status(404).send({
								status: 404,
								msg: "No Record Found",
								profileList: []
							});
						}
					});
				}
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.profile_delete = async (req, res) => {
	try {
		if (!req.params.id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`SELECT count(*) totalRecords from tbl_user_profile where user_id = ?`, [req.params.id], function(error, results, fields) {
				if (error) throw error;
				if (results[0].totalRecords > 0) {
					db.query(`DELETE FROM tbl_user_profile WHERE user_id= '${req.params.id}'`, function(error, results1, fields) {
						if (error) throw error;
						return res.status(200).send({
							status: 200,
							msg: "Success"
						});
					});
				} else {
					return res.status(404).send({
						status: 404,
						msg: "No Record Found"
					});
				}
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.profile_check = async (req, res) => {
	try {
		if (req.query.app_auth) {
			var comment_re = [];
			db.query(`SELECT user_id,app_first_fill,user_logined_method,user_name FROM tbl_user_profile WHERE app_auth = ?;SELECT * from tbl_user_profile where app_auth = ?`, [req.query.app_auth, req.query.app_auth], function(error, results_comment_re, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results_comment_re[0].length > 0) {
						results_comment_re[0][0].user_id = results_comment_re[0][0].user_id.toString();
						return res.status(200).send({
							status: 200,
							msg: "Success",
							access_token: middleware.generateAccessToken(results_comment_re[1][0]),
							userProfileCheck: results_comment_re[0][0],
						});
					} else {
						return res.status(400).send({
							status: 400,
							msg: "fail"
						});
					}
				}
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
exports.profile_insert = async (req, res) => {
	try {
		if (req.body.app_auth) {
			db.query(`SELECT count(*) totalRecords from tbl_user_profile where app_auth = ?`, [req.body.app_auth], function(error, results1, fields) {
				if (error) throw error;
				if (results1[0].totalRecords <= 0) {
					//res.send(req.query.user_id);
					if (req.body.user_password && req.body.user_password != '') {
						req.body.user_password = nodeBase64.encode(req.body.user_password);
					}
					db.query(`INSERT INTO tbl_user_profile SET ?`, req.body, function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail1",
								err: error
							});
						} else {
							db.query(`SELECT * from tbl_user_profile where user_id = ?`, [results.insertId], function(error, resultsData, fields) {
								return res.status(200).send({
									status: 200,
									msg: "Success",
									user_id: results.insertId.toString(),
									access_token: middleware.generateAccessToken(resultsData[0]),
									app_auth: resultsData[0].app_auth,
									app_first_fill: resultsData[0].app_first_fill,
									flag: 'new'
								});
							});
						}
					});
				} else {
					db.query(`SELECT count(*) totalRecords,user_id from tbl_user_profile where app_auth = ? GROUP BY user_id`, [req.body.app_auth], function(error, results16, fields) {
						db.query(`SELECT * from tbl_user_profile where user_id = ?`, [results16[0].user_id], function(error, resultsData, fields) {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								user_id: results16[0].user_id.toString(),
								access_token: middleware.generateAccessToken(resultsData[0]),
								app_auth: resultsData[0].app_auth,
								app_first_fill: resultsData[0].app_first_fill,
								flag: 'old'
							});
						});
					});
				}
			});

		} else if (req.body.app_auth) {
			db.query(`SELECT count(*) totalRecords from tbl_user_profile where app_auth = ?`, [req.body.app_auth], function(error, results1, fields) {
				if (error) throw error;
				if (results1[0].totalRecords <= 0) {
					//res.send(req.query.user_id);
					if (req.body.user_password && req.body.user_password != '') {
						req.body.user_password = nodeBase64.encode(req.body.user_password);
					}
					db.query(` INSERT INTO tbl_user_profile SET ?`, req.body, function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail2"
							});
						} else {
							db.query(`SELECT * from tbl_user_profile where user_id = ?`, [results.insertId], function(error, resultsData, fields) {
								return res.status(200).send({
									status: 200,
									msg: "Success",
									user_id: results.insertId.toString(),
									access_token: middleware.generateAccessToken(resultsData[0]),
									app_auth: resultsData[0].app_auth,
									app_first_fill: resultsData[0].app_first_fill,
									flag: 'new'
								});
							});
						}
					});
				} else {
					db.query(`SELECT count(*) totalRecords,user_id from tbl_user_profile where app_auth = ? GROUP BY user_id`, [req.body.app_auth], function(error, results16, fields) {
						db.query(`SELECT * from tbl_user_profile where user_id = ?`, [results16[0].user_id], function(error, resultsData, fields) {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								user_id: results16[0].user_id.toString(),
								access_token: middleware.generateAccessToken(resultsData[0]),
								app_auth: resultsData[0].app_auth,
								app_first_fill: resultsData[0].app_first_fill,
								flag: 'old'
							});
						});
					});
				}
			});
		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail3"
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.profile_insert2 = async (req, res) => {
	try {
		if (req.body.app_auth) {
			db.query(`SELECT count(*) totalRecords from tbl_user_profile where app_auth = ?`, [req.body.app_auth], function(error, results1, fields) {
				if (error) throw error;
				if (results1[0].totalRecords <= 0) {
					//res.send(req.query.user_id);
					if (req.body.user_password && req.body.user_password != '') {
						req.body.user_password = nodeBase64.encode(req.body.user_password);
					}
					db.query(`SET SQL_MODE = ''; INSERT INTO tbl_user_profile SET ?`, req.body, function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							db.query(`SELECT * from tbl_user_profile where user_id = ?`, [results.insertId], function(error, resultsData, fields) {
								return res.status(200).send({
									status: 200,
									msg: "Success",
									user_id: results.insertId.toString(),
									access_token: middleware.generateAccessToken(resultsData[0]),
									app_auth: resultsData[0].app_auth,
									app_first_fill: resultsData[0].app_first_fill,
									flag: 'new'
								});
							});
						}
					});
				} else {
					db.query(`SELECT count(*) totalRecords,user_id from tbl_user_profile where app_auth = ? GROUP BY user_id`, [req.body.app_auth], function(error, results16, fields) {
						db.query(`SELECT * from tbl_user_profile where user_id = ?`, [results16[0].user_id], function(error, resultsData, fields) {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								user_id: results16[0].user_id.toString(),
								access_token: middleware.generateAccessToken(resultsData[0]),
								app_auth: resultsData[0].app_auth,
								app_first_fill: resultsData[0].app_first_fill,
								flag: 'old'
							});
						});
					});
				}
			});

		} else if (req.body.app_auth) {
			db.query(`SELECT count(*) totalRecords from tbl_user_profile where app_auth = ?`, [req.body.app_auth], function(error, results1, fields) {
				if (error) throw error;
				if (results1[0].totalRecords <= 0) {
					//res.send(req.query.user_id);
					if (req.body.user_password && req.body.user_password != '') {
						req.body.user_password = nodeBase64.encode(req.body.user_password);
					}
					db.query(`SET SQL_MODE = ''; INSERT INTO tbl_user_profile SET ?`, req.body, function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							db.query(`SELECT * from tbl_user_profile where user_id = ?`, [results.insertId], function(error, resultsData, fields) {
								return res.status(200).send({
									status: 200,
									msg: "Success",
									user_id: results.insertId.toString(),
									access_token: middleware.generateAccessToken(resultsData[0]),
									app_auth: resultsData[0].app_auth,
									app_first_fill: resultsData[0].app_first_fill,
									flag: 'new'
								});
							});
						}
					});
				} else {
					db.query(`SELECT count(*) totalRecords,user_id from tbl_user_profile where app_auth = ? GROUP BY user_id`, [req.body.app_auth], function(error, results16, fields) {
						db.query(`SELECT * from tbl_user_profile where user_id = ?`, [results16[0].user_id], function(error, resultsData, fields) {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								user_id: results16[0].user_id.toString(),
								access_token: middleware.generateAccessToken(resultsData[0]),
								app_auth: resultsData[0].app_auth,
								app_first_fill: resultsData[0].app_first_fill,
								flag: 'old'
							});
						});
					});
				}
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

exports.profile_update = async (req, res) => {
	try {
		if (req.body.user_id) {
			db.query(`SELECT count(*) totalRecords from tbl_user_profile where user_id = ?`, [req.body.user_id], function(error, results1, fields) {
				if (error) throw error;
				if (results1[0].totalRecords > 0) {
					var user_id = req.body.user_id;
					delete req.body.user_id;
					delete req.body.user_id;
					if (req.body.user_password && req.body.user_password != '') {
						req.body.user_password = nodeBase64.encode(req.body.user_password);
					}
					db.query(`UPDATE tbl_user_profile SET ? where user_id = ?`, [req.body, user_id], function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: error
							});
						} else {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								flag: "Updated"
							});
						}
					});
				} else {
					return res.status(404).send({
						status: 404,
						msg: "No Record Found",
						flag: ''
					});
				}
			});
		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail",
				flag: ''
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};

exports.profile_image11 = async (req, res) => {
	try {
		if (req.body.user_id) {
			db.query(`SELECT count(*) totalRecords from tbl_user_profile where user_id = ?`, [req.body.user_id], function(error, results1, fields) {

				if (results1[0].totalRecords > 0) {
					db.query(`UPDATE tbl_user_profile SET user_profile_img= ? where user_id = ?`, [req.file.originalname, req.body.user_id], function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: error
							});
						} else {
							return res.status(200).send({
								status: 200,
								msg: "Success"
							});
						}
					});
				} else {
					return res.status(404).send({
						status: 404,
						msg: "No Record Found"
					});
				}
			});
		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail1"
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};

exports.profile_image = async (req, res) => {
	try {
		console.log(req.body);
		let upload = multer({
			storage: storage,
		}).single('user_profile_img');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else if (!req.file) {
			    	console.log(req.body);
				return res.status(400).send({
					status: 400,
					msg: "Please select an image to upload"
				});
			} else {
				console.log(req.body);
				if (req.body.user_id) {
					db.query(`SELECT count(*) totalRecords from tbl_user_profile where user_id = ?`, [req.body.user_id], function(error, results1, fields) {
						if (error) throw error;
						if (results1[0].totalRecords > 0) {
							db.query(`UPDATE tbl_user_profile SET user_profile_img= ? where user_id = ?`, [define.BASE_URL + "profile/" + req.file.filename, req.body.user_id], function(error, results, fields) {
								if (error) {
									return res.status(400).send({
										status: 400,
										msg: error
									});
								} else {
									return res.status(200).send({
										status: 200,
										msg: "Success"
									});
								}
							});
						} else {
							return res.status(404).send({
								status: 404,
								msg: "No Record Found"
							});
						}
					});
				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail"
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
exports.profile_back_image = async (req, res) => {
	try {
		let upload = multer({
			storage: storage,
		}).single('user_profile_background');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else if (!req.file) {
				return res.status(400).send({
					status: 400,
					msg: "Please select an image to upload"
				});
			} else {
				if (req.body.user_id) {
					db.query(`SELECT count(*) totalRecords from tbl_user_profile where user_id = ?`, [req.body.user_id], function(error, results1, fields) {
						if (error) throw error;
						if (results1[0].totalRecords > 0) {
							db.query(`UPDATE tbl_user_profile SET user_profile_background= ? where user_id = ?`, [define.BASE_URL + "profile/" + req.file.filename, req.body.user_id], function(error, results, fields) {
								if (error) {
									return res.status(400).send({
										status: 400,
										msg: error
									});
								} else {
									return res.status(200).send({
										status: 200,
										msg: "Success"
									});
								}
							});
						} else {
							return res.status(404).send({
								status: 404,
								msg: "No Record Found"
							});
						}
					});
				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail"
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
fastify.register(require("@fastify/view"), {
	engine: {
		ejs: require("ejs"),
	},
});
exports.forgot_password = async (req, res) => {
	try {
		if (!req.query.user_email) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`SELECT * from tbl_user_profile where user_email = ?`, [req.query.user_email], function(error, results, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results.length > 0) {
						const html = fastify.view("../views/email.ejs", {
							name: results[0].user_name,
							email: results[0].user_email,
							password: nodeBase64.decode(results[0].user_password)
						});
						//  const html = '../views/email.ejs';
						//  res.view('../views/email.ejs', {
						//         name: results[0].user_name,
						//         email: results[0].user_email,
						//         password: nodeBase64.decode(results[0].user_password)
						//     });
						mail.sendMail('ZKTOR PROJECT <admin@zktor.com>', results[0].user_email, html, 'ZKTOR APP Password Request');
						return res.status(200).send({
							status: 200,
							msg: 'Success'
						});
					} else {
						return res.status(404).send({
							status: 404,
							msg: "No Record Found"
						});
					}
				}
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.full_profile = async (req, res) => {
	try {
		if (!req.query.user_id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			var getSlaveURL = async function() {
				let result = await totalFriendCount((req.query.user_id));

			};
			return res.status(200).send({
				status: 200,
				msg: 'Success',
				totalFriend: res.totalfriend,
				followers: '0',
				profileData: {
					profileList: res.profileList,

					languageList: res.languageList,
					othersList: res.othersList,
					workList: res.workList,
					educationList: res.educationList
				}
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_user_details = async (req, res) => {
	try {
		if (!req.query.user_id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			if (res.profileList.length <= 0) {
				return res.status(404).send({
					status: 404,
					msg: "No Record Found"
				});
			} else {
				return res.status(200).send({
					status: 200,
					msg: 'Success',
					userDetails: res.profileList[0]
				});
			}
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_all_user_data = async (req, res) => {
	try {
		if (req.query.user_id && req.query.viewer_id) {
			const intersection = (res.totalfriendsList).filter(element => (res.totalfriendsListViewer).includes(element));
			if (intersection.length <= 0) {
				intersection.push('0');
			}
			db.query(`SELECT * FROM tbl_followers WHERE followered_to_id = ? AND follower_status = ?;
        SELECT * FROM tbl_followers WHERE followered_to_id = ? AND follower_status = ?;
        SELECT * FROM tbl_followers WHERE follower_by_id = ? AND follower_status = ?;
        SELECT * FROM tbl_friend_request WHERE (sender_user_id = ? AND receiver_user_id = ? OR sender_user_id = ? AND receiver_user_id = ?) ;
        SELECT user_id,user_name,user_profile_img FROM tbl_user_profile where user_id IN (?);`, [req.query.user_id, '1', req.query.user_id, '0', req.query.user_id, '1', req.query.viewer_id, req.query.user_id, req.query.user_id, req.query.viewer_id, intersection], function(error, results1, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: error
					});
				} else {
					console.log(res.totalfriendsList);
					console.log(res.totalfriendsListViewer);
					console.log(intersection);
					return res.status(200).send({
						status: 200,
						msg: "Success",

						is_friend: (res.totalfriendsList.indexOf(req.query.viewer_id)) >= 0 ? 1 : 0,
						request_status: (results1[3].length > 0) ? results1[3][0].request_status : '',
						sender_user_id: (results1[3].length > 0) ? results1[3][0].sender_user_id : '',
						receiver_user_id: (results1[3].length > 0) ? results1[3][0].receiver_user_id : '',
						totalFriendCount: res.totalfriendsList.length,
						totalFollwersCount: results1[0].length,
						totalFollowingCount: results1[2].length,
						totalUnfollowersCount: results1[1].length,
						userdata: res.pro,
						comman_friend_list: results1[4],
						friendList: res.totalfriendsListData,
						followersList: res.followListD,
						unFollowersList: res.unFollowListD
					});

				}
			});
		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail",
				is_friend: 0,
				totalFriendCount: 0,
				totalFollwersCount: 0,
				totalFollowingCount: 0,
				totalUnfollowersCount: 0,
				userdata: {},
				friendList: [],
				followersList: [],
				unFollowersList: []
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_follower_list = async (req, res) => {
	try {
		if (req.query.user_id) {
			db.query(`SELECT * FROM tbl_followers WHERE followered_to_id = ? AND follower_status = ? group by follower_by_id;`, [req.query.user_id, '1'], function(error, results1, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results1.length > 0) {
						// console.log(res.totalfriendsList.indexOf(req.query.viewer_id));
						return res.status(200).send({
							status: 200,
							msg: "Success",
							followerListCount: res.followListDataForA.length,
							followerList: res.followListDataForA
						});
					} else {
						return res.status(404).send({
							status: 404,
							msg: "No Record Found",
							followerListCount: 0,
							followerList: []
						});
					}

				}
			});
		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail",
				followerListCount: 0,
				followerList: []
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_user_being_followed_list = async (req, res) => {
	try {
		if (req.query.user_id) {
			db.query(`SELECT * FROM tbl_followers WHERE follower_by_id = ? AND follower_status = ? group by followered_to_id;`, [req.query.user_id, '1'], function(error, results1, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results1.length > 0) {
						// console.log(res.totalfriendsList.indexOf(req.query.viewer_id));
						return res.status(200).send({
							status: 200,
							msg: "Success",
							followerListCount: res.followListDataForA.length,
							followerList: res.followListDataForA
						});
					} else {
						return res.status(404).send({
							status: 404,
							msg: "No Record Found",
							followerListCount: 0,
							followerList: []
						});
					}

				}
			});
		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail",
				followerListCount: 0,
				followerList: []
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_unfollower_list = async (req, res) => {
	try {
		if (req.query.user_id) {
			db.query(`SELECT * FROM tbl_followers WHERE followered_to_id = ? AND follower_status = ? ;`, [req.query.user_id, '0'], function(error, results1, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results1.length > 0) {
						return res.status(200).send({
							status: 200,
							msg: "Success",
							unFollowerListCount: res.unfollowListDataForA.length,
							unFollowerList: res.unfollowListDataForA
						});
					} else {
						return res.status(404).send({
							status: 404,
							msg: "No Record Found",
							unFollowerListCount: 0,
							unFollowerList: []
						});
					}
				}
			});
		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail",
				unFollowerListCount: 0,
				unFollowerList: []
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.follow_unfollow = async (req, res) => {
	try {
		if (req.query.followered_to_id && req.query.follower_by_id) {
			db.query(`UPDATE tbl_followers SET ? WHERE followered_to_id = ? AND follower_by_id = ?`, [{
				follower_status: req.query.follower_status
			}, req.query.followered_to_id, req.query.follower_by_id], function(error, results, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					return res.status(200).send({
						status: 200,
						msg: "Success"
					});
				}
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
exports.delete_bazar = async (req, res) => {
	try {
		if (req.query.table && req.query.parameter && req.query.value) {
			var qu = "DELETE FROM tbl_bazar_" + req.query.table + " WHERE " + req.query.parameter + "= ?";
			db.query(qu, [req.query.value], function(error, results, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					return res.status(200).send({
						status: 200,
						msg: "Success"
					});
				}
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
exports.delete = async (req, res) => {
	try {
		if (!req.query.user_id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`DELETE FROM tbl_works WHERE user_id= '${req.query.user_id}'`, function(error, results1, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					db.query(`DELETE FROM tbl_user_coordinates WHERE coordinate_user_id= '${req.query.user_id}'`, function(error, results1, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							db.query(`DELETE FROM tbl_others WHERE user_id= '${req.query.user_id}'`, function(error, results1, fields) {
								if (error) {
									return res.status(400).send({
										status: 400,
										msg: "fail"
									});
								} else {
									db.query(`DELETE FROM tbl_education WHERE user_id= '${req.query.user_id}'`, function(error, results1, fields) {
										if (error) {
											return res.status(400).send({
												status: 400,
												msg: "fail"
											});
										} else {
											db.query(`DELETE FROM tbl_feed WHERE feed_user_id= '${req.query.user_id}'`, function(error, results1, fields) {
												if (error) {
													return res.status(400).send({
														status: 400,
														msg: "fail"
													});
												} else {
													db.query(`DELETE FROM tbl_documents WHERE user_id= '${req.query.user_id}'`, function(error, results1, fields) {
														if (error) {
															return res.status(400).send({
																status: 400,
																msg: "fail"
															});
														} else {
															db.query(`DELETE FROM tbl_events WHERE event_user_id= '${req.query.user_id}'`, function(error, results1, fields) {
																if (error) {
																	return res.status(400).send({
																		status: 400,
																		msg: "fail"
																	});
																} else {
																	db.query(`DELETE FROM tbl_group WHERE group_admin_user_id= '${req.query.user_id}'`, function(error, results1, fields) {
																		if (error) {
																			return res.status(400).send({
																				status: 400,
																				msg: "fail"
																			});
																		} else {
																			db.query(`DELETE FROM tbl_languages WHERE user_id= '${req.query.user_id}'`, function(error, results1, fields) {
																				if (error) {
																					return res.status(400).send({
																						status: 400,
																						msg: "fail"
																					});
																				} else {

																					db.query(`DELETE FROM tbl_friend_request WHERE sender_user_id= '${req.query.user_id}'`, function(error, results1, fields) {
																						if (error) {
																							return res.status(400).send({
																								status: 400,
																								msg: "fail"
																							});
																						} else {
																							db.query(`DELETE FROM tbl_friend_request WHERE receiver_user_id= '${req.query.user_id}'`, function(error, results1, fields) {
																								if (error) {
																									return res.status(400).send({
																										status: 400,
																										msg: "fail"
																									});
																								} else {
																									return res.status(200).send({
																										status: 200,
																										msg: "Success"
																									});
																								}
																							});
																						}
																					});

																				}
																			});

																		}
																	});

																}
															});

														}
													});

												}
											});

										}
									});

								}
							});

						}
					});

				}
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_user_profile = async (req, res) => {
	try {
		if (req.query.user_login_history_id && req.query.user_logined_method) {
			var comment_re = [];
			db.query(`SELECT user_email, user_password, user_phone, app_auth FROM tbl_user_profile WHERE user_login_history_id = ? AND user_logined_method =?`, [req.query.user_login_history_id, req.query.user_logined_method], function(error, results_comment_re, fields) {
				if (error) throw error;
				if (results_comment_re.length > 0) {
					Object.keys(results_comment_re).forEach(function(key_re, idx_re, array_re) {
						var results_data = results_comment_re[key_re];
						results_data.user_password = nodeBase64.decode(results_data.user_password);
						comment_re.push(results_data);
						if (idx_re === array_re.length - 1) {

							return res.status(200).send({
								status: 200,
								msg: "Success",
								last_login_details_count: comment_re.length,
								last_login_details: comment_re
							});
						}
					});
				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail",
						last_login_details_count: 0,
						last_login_details: []
					});
				}

			});
		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail",
				last_login_details_count: 0,
				last_login_details: []
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_profile_percentage = async (req, res) => {
	try {
		if (req.query.user_id) {
			var comment_re = [];
			// console.log(res.profilePer);
			//  console.log(res.educationPer);
			// console.log(res.workPer);
			// console.log(res.othersPer);
			myObj = new Object()
			myObj['profile'] = (res.profilePer[0].profile);
			myObj['education'] = (res.educationPer[0].education);
			myObj['work'] = (res.workPer[0].work);
			myObj['others'] = (res.othersPer[0].others);
			var total = res.profilePer[0].profile.total + res.educationPer[0].education.total + res.workPer[0].work.total + res.othersPer[0].others.total;
			var empty = res.profilePer[0].profile.empty + res.educationPer[0].education.empty + res.workPer[0].work.empty + res.othersPer[0].others.empty;
			var notempty = res.profilePer[0].profile.notempty + res.educationPer[0].education.notempty + res.workPer[0].work.notempty + res.othersPer[0].others.notempty;
			var p = notempty / total;
			myObj['total'] = {
				total: total,
				completed_total_percentage: parseFloat(p * 100).toFixed(2) + "%",
				notempty: notempty,
				empty: empty
			};
			return res.status(200).send({
				status: 200,
				msg: "Success",
				profile_details: myObj
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

exports.profile_verify = async (req, res) => {
	try {
		if (req.query.user_password && req.query.user_email) {
			var comment_re = [];
			db.query(`SELECT user_email, user_password, user_phone, app_auth FROM tbl_user_profile WHERE user_password = ? AND user_email =? and user_status=? and soft_delete=?`, [nodeBase64.encode(req.query.user_password), req.query.user_email, '1', '0'], function(error, results_comment_re, fields) {
				if (error) throw error;
				if (results_comment_re.length > 0) {
					return res.status(200).send({
						status: 200,
						msg: "Success",
						verifiedProfile: results_comment_re[0]
					});

				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				}

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
exports.get_user_setting = async (req, res) => {
	try {
		if (req.query.user_id) {
			var comment_re = [];
			db.query(`SELECT user_status, soft_delete, user_lock, user_blocked FROM tbl_user_profile WHERE user_id = ?`, [req.query.user_id], function(error, results_comment_re, fields) {
				if (error) throw error;
				if (results_comment_re.length > 0) {
					return res.status(200).send({
						status: 200,
						msg: "Success",
						userProfileSetting: results_comment_re[0]
					});

				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				}

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
exports.insert_update_coordinates = async (req, res) => {
	try {
		if (req.query.coordinate_user_id) {
			db.query(`Select * From tbl_user_coordinates where coordinate_user_id= ?`, [req.query.coordinate_user_id], function(error, results, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results.length <= 0) {
						db.query(`SET SQL_MODE = ''; INSERT INTO tbl_user_coordinates SET ?`, [req.query], function(error, results66, fields) {
							if (error) {
								return res.status(400).send({
									status: 400,
									msg: "fail"
								});
							} else {
								return res.status(200).send({
									status: 200,
									msg: "Success"
								});
							}
						});
					} else {

						db.query(`UPDATE tbl_user_coordinates SET ? where coordinate_user_id=?`, [req.query, req.query.coordinate_user_id], function(error, results66, fields) {
							if (error) {
								return res.status(400).send({
									status: 400,
									msg: "fail"
								});
							} else {
								return res.status(200).send({
									status: 200,
									msg: "Success"
								});
							}
						});
					}
				}
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
exports.profile_report = async (req, res) => {
	try {
		if (req.query.user_id && req.query.report_user_id && req.query.report_msg) {
			db.query(`SET SQL_MODE = ''; INSERT INTO tbl_user_report SET ?`, [req.query], function(error, results66, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					return res.status(200).send({
						status: 200,
						msg: "Success",
						user_report_id: results66.insertId
					});
				}
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
exports.get_profile_report = async (req, res) => {
	try {
		if (req.query.user_id) {
			db.query(`SELECT tbl_user_report.*, tbl_user_profile.user_name,tbl_user_profile.user_profile_img,tbl_user_profile.user_email from tbl_user_report inner join tbl_user_profile on tbl_user_report.report_user_id=tbl_user_profile.user_id  where tbl_user_report.user_id=?`, [req.query.user_id], function(error, results66, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results66.length > 0) {
						return res.status(200).send({
							status: 200,
							msg: "Success",
							user_reported_list_count: results66.length,
							user_reported_list: results66
						});
					} else {
						return res.status(400).send({
							status: 400,
							msg: "fail",
							user_reported_list_count: 0,
							user_reported_list: []
						});
					}
				}
			});
		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail",
				user_reported_list_count: 0,
				user_reported_list: []
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.insert_visited_person = async (req, res) => {
	try {
		let upload = multer({
			storage: storage,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: err
				});
			} else {
				if (req.body.visited_person_id && req.body.profile_person_id) {
					db.query(`select * from tbl_visited_person where  visited_person_id= ? and profile_person_id=?`, [req.body.visited_person_id, req.body.profile_person_id], function(error, results45, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: error
							});
						} else {
							if (results45.length <= 0) {
								db.query(`SET SQL_MODE = ''; INSERT INTO tbl_visited_person SET ?`, [req.body], function(error, results, fields) {
									if (error) {
										return res.status(400).send({
											status: 400,
											msg: error
										});
									} else {
										return res.status(200).send({
											status: 200,
											msg: "Success",
											person_id: results.insertId
										});
									}
								});

							} else {
								db.query(`update tbl_visited_person SET ? where visited_person_id= ? and profile_person_id=?`, [req.body, req.body.visited_person_id, req.body.profile_person_id], function(error, results, fields) {
									if (error) {
										return res.status(400).send({
											status: 400,
											msg: error
										});
									} else {
										return res.status(200).send({
											status: 200,
											msg: "Success",
											person_id: ''
										});
									}
								});
							}
						}
					});

				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail"
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
exports.get_visited_person = async (req, res) => {
	try {
		if (req.query.user_id) {
			var final_array = [];
			db.query(`SELECT tbl_visited_person.*,tbl_user_profile.user_profile_img,tbl_user_profile.user_name  from tbl_visited_person inner join tbl_user_profile ON tbl_visited_person.visited_person_id=tbl_user_profile.user_id where profile_person_id=? order by 1 desc;
    SELECT count(*) as numofrows  from tbl_visited_person inner join tbl_user_profile ON tbl_visited_person.visited_person_id=tbl_user_profile.user_id where profile_person_id=? and date(tbl_visited_person.created_date) = CURDATE()`, [req.query.user_id, req.query.user_id], function(error, results1, fields) {
				if (error) throw error;
				if (results1[0].length > 0) {

					Object.keys(results1[0]).forEach(function(key, idx, array) {
						var result_data = results1[0][key];
						result_data.duration = timeAgo(new Date(result_data.created_date).toISOString());
						db.query(`SELECT * from tbl_friend_request where (sender_user_id=? and receiver_user_id=? or sender_user_id=? and receiver_user_id=?)`, [result_data.visited_person_id, result_data.profile_person_id, result_data.profile_person_id, result_data.visited_person_id], function(error, results14, fields) {
							if (error) {
								return res.status(400).send({
									status: 400,
									msg: error
								});
							} else {

								if (result_data.user_profile_img != '') {
									if ((result_data.user_profile_img).includes("profile/")) {

									} else {
										result_data.user_profile_img = define.BASE_URL + "profile/" + result_data.user_profile_img;
									}
								}
								if (results14.length > 0) {
									result_data.request_status = results14[0].request_status;
								} else {
									result_data.request_status = '';
								}
								final_array.push(result_data);
								if (idx === array.length - 1) {
									return res.status(200).send({
										status: 200,
										msg: "Success",
										visitedProfilePersonsCount: final_array.length,
										todayVisitedProfilePersonsCount: results1[1][0].numofrows,
										visitedProfilePersonsList: final_array
									});
								}
							}
						});
					});

				} else {

					return res.status(404).send({
						status: 404,
						msg: "Record not found"
					});
				}
			});
		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail3"
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};