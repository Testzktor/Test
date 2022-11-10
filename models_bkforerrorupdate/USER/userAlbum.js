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
		cb(null, '../uploads/video/');
	},

	// By default, multer removes file extensions so let's add them back
	filename: function(req, file, cb) {
		cb(null, "user_video" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
	}
});
var album = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, '../uploads/album/');
	},

	// By default, multer removes file extensions so let's add them back
	filename: function(req, file, cb) {
		cb(null, "user_album" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
	}
});
exports.get_album_friend = async (req, res) => {
	try {
		if (req.query.user_id && req.query.viewer_id) {
			var comment = [];
			db.query(`SELECT * FROM tbl_media_album_list where album_list_user_id=? and album_delete_status=?`, [req.query.user_id, '0'], function(error, results_comment, fields) {
				if (error) throw error;
				if (results_comment.length > 0) {
					Object.keys(results_comment).forEach(function(key12, idx12, array12) {
						var results_comment_data = results_comment[key12];
						db.query(`SELECT * FROM tbl_user_album where album_user_id=? AND album_img_status=? and album_list_id=? limit ?`, [req.query.user_id, '0', results_comment_data.album_list_id, 1], function(error, results_comment1, fields) {
							if (error) throw error;
							if (results_comment1.length > 0) {
								results_comment_data.first_image = results_comment1[0].album_img_name;
							} else {
								results_comment_data.first_image = '';
							}
							results_comment_data.album_list_id = results_comment_data.album_list_id.toString();
							results_comment_data.album_list_user_id = results_comment_data.album_list_user_id.toString();
							comment.push(results_comment_data);
							if (idx12 === array12.length - 1) {
								return res.status(200).send({
									status: 200,
									msg: "Success",
									is_friend: (res.totalfriendsList.includes(req.query.viewer_id)) ? "1" : "0",
									albumList: comment
								});
							}
						});
					});


				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail",
						is_friend: "0",
						albumList: []
					});
				}
			});
		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail",
				is_friend: "0",
				albumList: []
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.album_img_delete = async (req, res) => {
	try {
		if (!req.params.id) {
			return res.status(400).send({
				status: 400,
				msg: "fail",
			});
		} else {
			db.query(`SELECT count(*) totalRecords from tbl_user_album where album_id = ?`, [req.params.id], function(error, results, fields) {
				if (error) throw error;
				if (results[0].totalRecords > 0) {
					db.query(`DELETE FROM tbl_user_album WHERE album_id= '${req.params.id}'`, function(error, results1, fields) {
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

exports.album_access_update = async (req, res) => {
	try {
		if (req.body.album_user_id) {
			db.query(`SELECT count(*) totalRecords from tbl_user_album where album_user_id = ?`, [req.body.album_user_id], function(error, results1, fields) {
				if (error) throw error;
				if (results1[0].totalRecords > 0) {
					var album_user_id = req.body.album_user_id;
					delete req.body.album_user_id;
					db.query(`UPDATE tbl_user_album SET album_access= ? where album_user_id = ?`, [req.body.album_access, album_user_id], function(error, results, fields) {
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
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.album_video = async (req, res) => {
	try {
		let upload = multer({
			storage: storage,
		}).single('album_img_name');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else if (!req.file) {
				return res.status(400).send({
					status: 400,
					msg: "Please select an image to upload",
					album_id: 0
				});
			} else {
				if (req.body.album_user_id) {
					db.query(`SET SQL_MODE = ''; INSERT INTO tbl_user_album (album_user_id, album_img_name,album_type,album_name) VALUES (?,?,?,?)`, [req.body.album_user_id, define.BASE_URL + "video/" + req.file.filename, 'video', 'video'], function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: error
							});
						} else {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								album_id: results.insertId
							});
						}
					});
				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail",
						album_id: 0
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

exports.album_single = async (req, res) => {
	try {
		if (!req.query.user_id || !req.query.viwer_id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			if (req.query.user_id == req.query.viwer_id) {
				db.query(`SELECT * FROM tbl_user_album WHERE album_user_id = ? and album_img_status = ? AND album_type = ?`, [req.query.user_id, '0', 'single'], function(error, results, fields) {
					if (error) {
						return res.status(400).send({
							status: 400,
							msg: error
						});
					} else {
						if (results.length > 0) {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								imageList: results
							});
						} else {
							return res.status(404).send({
								status: 404,
								msg: "No Record Found",
								imageList: []
							});
						}
					}
				});
			} else if (res.totalfriendsList.includes(req.query.viwer_id)) {
				db.query(`SELECT * FROM tbl_user_album WHERE album_user_id = ? and album_img_status = ? AND album_type = ? and (album_access = ? or album_access = ?)`, [req.query.user_id, '0', 'single', '0', '2'], function(error, results, fields) {
					if (error) {
						return res.status(400).send({
							status: 400,
							msg: error
						});
					} else {
						if (results.length > 0) {
							console.log(res.totalfriendsList);
							return res.status(200).send({
								status: 200,
								msg: "Success",
								imageList: results
							});
						} else {
							return res.status(404).send({
								status: 404,
								msg: "No Record Found",
								imageList: []
							});
						}
					}
				});
			} else {
				db.query(`SELECT * FROM tbl_user_album WHERE album_user_id = ? and album_img_status = ? AND album_type = ? and album_access = ? `, [req.query.user_id, '0', 'single', '0'], function(error, results, fields) {
					if (error) {
						return res.status(400).send({
							status: 400,
							msg: error
						});
					} else {
						if (results.length > 0) {
							console.log(res.totalfriendsList);
							return res.status(200).send({
								status: 200,
								msg: "Success",
								imageList: results
							});
						} else {
							return res.status(404).send({
								status: 404,
								msg: "No Record Found",
								imageList: []
							});
						}
					}
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

exports.album_view_video = async (req, res) => {
	try {
		if (!req.query.user_id || !req.query.viwer_id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			if (req.query.user_id == req.query.viwer_id) {
				db.query(`SELECT * FROM tbl_user_album WHERE album_user_id = ? and album_img_status = ? AND album_type = ?`, [req.query.user_id, '0', 'video'], function(error, results, fields) {
					if (error) {
						return res.status(400).send({
							status: 400,
							msg: error
						});
					} else {
						if (results.length > 0) {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								imageList: results
							});
						} else {
							return res.status(404).send({
								status: 404,
								msg: "No Record Found",
								imageList: []
							});
						}
					}
				});
			} else if (res.totalfriendsList.includes(req.query.viwer_id)) {
				db.query(`SELECT * FROM tbl_user_album WHERE album_user_id = ? and album_img_status = ? AND album_type = ? and (album_access = ? or album_access = ?)`, [req.query.user_id, '0', 'video', '0', '2'], function(error, results, fields) {
					if (error) {
						return res.status(400).send({
							status: 400,
							msg: error
						});
					} else {
						if (results.length > 0) {
							console.log(res.totalfriendsList);
							return res.status(200).send({
								status: 200,
								msg: "Success",
								imageList: results
							});
						} else {
							return res.status(404).send({
								status: 404,
								msg: "No Record Found",
								imageList: []
							});
						}
					}
				});
			} else {
				db.query(`SELECT * FROM tbl_user_album WHERE album_user_id = ? and album_img_status = ? AND album_type = ? and album_access = ? `, [req.query.user_id, '0', 'video', '0'], function(error, results, fields) {
					if (error) {
						return res.status(400).send({
							status: 400,
							msg: error
						});
					} else {
						if (results.length > 0) {
							console.log(res.totalfriendsList);
							return res.status(200).send({
								status: 200,
								msg: "Success",
								imageList: results
							});
						} else {
							return res.status(404).send({
								status: 404,
								msg: "No Record Found",
								imageList: []
							});
						}
					}
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
exports.album_view_album = async (req, res) => {
	try {
		if (!req.query.user_id || !req.query.viwer_id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			if (req.query.user_id == req.query.viwer_id) {
				db.query(`SELECT * FROM tbl_user_album WHERE album_user_id = ? and album_img_status = ? AND album_type = ?; SELECT * FROM tbl_user_album WHERE album_user_id = ? and album_img_status = ? AND album_type = ?`, [req.query.user_id, '0', 'New Album 2', req.query.user_id, '0', 'New Album 3'], function(error, results, fields) {
					if (error) {
						return res.status(400).send({
							status: 400,
							msg: error
						});
					} else {
						if (results.length > 0) {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								imageList: {
									"New Album 2": results[0],
									"New Album 3": results[1]
								}
							});
						} else {
							return res.status(404).send({
								status: 404,
								msg: "No Record Found",
								imageList: {
									"New Album 2": {},
									"New Album 3": {}
								}
							});
						}
					}
				});
			} else if (res.totalfriendsList.includes(req.query.viwer_id)) {
				db.query(`SELECT * FROM tbl_user_album WHERE album_user_id = ? and album_img_status = ? AND album_type = ? and (album_access = ? or album_access = ?) ; SELECT * FROM tbl_user_album WHERE album_user_id = ? and album_img_status = ? AND album_type = ? and (album_access = ? or album_access = ?)`, [req.query.user_id, '0', 'New Album 2', '0', '2', req.query.user_id, '0', 'New Album 3', '0', '2'], function(error, results, fields) {
					if (error) {
						return res.status(400).send({
							status: 400,
							msg: error
						});
					} else {
						if (results.length > 0) {
							console.log(res.totalfriendsList);
							return res.status(200).send({
								status: 200,
								msg: "Success",
								imageList: {
									"New Album 2": results[0],
									"New Album 3": results[1]
								}
							});
						} else {
							return res.status(404).send({
								status: 404,
								msg: "No Record Found",
								imageList: {
									"New Album 2": {},
									"New Album 3": {}
								}
							});
						}
					}
				});
			} else {
				db.query(`SELECT * FROM tbl_user_album WHERE album_user_id = ? and album_img_status = ? AND album_type = ? and album_access = ? ; SELECT * FROM tbl_user_album WHERE album_user_id = ? and album_img_status = ? AND album_type = ? and album_access = ? `, [req.query.user_id, '0', 'New Album 2', '0', req.query.user_id, '0', 'New Album 3', '0'], function(error, results, fields) {
					if (error) {
						return res.status(400).send({
							status: 400,
							msg: error
						});
					} else {
						if (results.length > 0) {
							console.log(res.totalfriendsList);
							return res.status(200).send({
								status: 200,
								msg: "Success",
								imageList: {
									"New Album 2": results[0],
									"New Album 3": results[1]
								}
							});
						} else {
							return res.status(404).send({
								status: 404,
								msg: "No Record Found",
								imageList: {
									"New Album 2": {},
									"New Album 3": {}
								}
							});
						}
					}
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
exports.profile_data = async (req, res) => {
	try {
		let upload = multer({
			storage: album,
		}).fields([{
			name: 'imageList',
			maxCount: 25
		}]);
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.userId) {
					var album_id = [];
					var imag = [];
					req.body.album_user_id = req.body.userId;
					delete(req.body.userId);

					if (typeof req.files.imageList !== 'undefined') {
						Object.keys(req.files.imageList).forEach(function(key, idx1, array1) {
							var result_file = req.files.imageList[key];
							req.body.album_img_name = define.BASE_URL + "album/" + result_file.filename;
							imag.push(define.BASE_URL + "album/" + result_file.filename);
							if (!req.body.album_access)
								req.body.album_access = 0;
							db.query(`SET SQL_MODE = ''; INSERT INTO tbl_user_album SET ?`, [req.body], function(error, results, fields) {
								if (error) {} else {
									album_id.push(results.insertId);
									if (idx1 === array1.length - 1) {
										return res.status(200).send({
											status: 200,
											msg: "Success",
											mediaNames: imag,
											album_id: album_id
										});
									}
								}
							});
						});
					} else {
						db.query(`SET SQL_MODE = ''; INSERT INTO tbl_user_album SET ?`, [req.body], function(error, results, fields) {
							if (error) {
								return res.status(400).send({
									status: 400,
									msg: "fail"
								});
							} else {
								console.log(results);
								album_id.push(results.insertId);
								return res.status(200).send({
									status: 200,
									msg: "Success",
									mediaNames: imag,
									album_id: album_id
								});

							}
						});

					}
				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail",
						mediaNames: '',
						album_id: 0
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
exports.update_album = async (req, res) => {
	try {
		let upload = multer({
			storage: album,
		}).fields([{
			name: 'imageList',
			maxCount: 25
		}]);
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.album_id) {
					var album_id = [];
					var imag = [];
					var alb = req.body.album_id;
					delete(req.body.album_id);
					if (req.body.userId) {
						req.body.album_user_id = req.body.userId;
						delete(req.body.userId);
					}

					if (typeof req.files.imageList !== 'undefined') {
						Object.keys(req.files.imageList).forEach(function(key, idx1, array1) {
							var result_file = req.files.imageList[key];
							req.body.album_img_name = define.BASE_URL + "album/" + result_file.filename;
							imag.push(define.BASE_URL + "album/" + result_file.filename);
							if (!req.body.album_access)
								req.body.album_access = 0;
							db.query(`UPDATE tbl_user_album SET ? where album_id=?`, [req.body, alb], function(error, results, fields) {
								if (error) {} else {
									//   album_id.push(results.insertId);
									if (idx1 === array1.length - 1) {
										return res.status(200).send({
											status: 200,
											msg: "Success",
											mediaNames: imag,
											album_id: album_id
										});
									}
								}
							});
						});
					} else {
						db.query(`UPDATE tbl_user_album SET ? where album_id=?`, [req.body, alb], function(error, results, fields) {
							if (error) {
								return res.status(400).send({
									status: 400,
									msg: "fail"
								});
							} else {
								// album_id.push(results.insertId);
								return res.status(200).send({
									status: 200,
									msg: "Success",
									mediaNames: imag,
									album_id: album_id
								});

							}
						});

					}
				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail",
						mediaNames: '',
						album_id: 0
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