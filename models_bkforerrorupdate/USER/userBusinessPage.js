const fastify = require('fastify')({
	logger: true
});
const db = require("../../config/connection");
const middleware = require("../../middleware/authentication");
var bodyParser = require('body-parser');
const full = require("./userFullProfile");
const multer = require('fastify-multer');
const crypto = require("crypto");
var path = require('path')
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, '../uploads/business_post/');
	},
	filename: function(req, file, cb) {
		cb(null, "business_post_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
	}
});
var personal_page = multer.diskStorage({
	destination: function(req, file, cb) {
		if (file.fieldname === 'page_profile_picture')
			cb(null, '../uploads/personal_page/profile_images/');
		else if (file.fieldname === 'page_cover_picture')
			cb(null, '../uploads/personal_page/cover_images/');
	},
	filename: function(req, file, cb) {
		cb(null, "personal_page_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
	}
});
exports.get_page_business = async (req, res) => {
	try {
	if (req.query.business_id) {
		db.query(`SELECT * from tbl_personal_page where business_id= ? LIMIT 1 `, [req.query.business_id], function(error, results, fields) {
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
						businessPageList: results
					});
				} else {
					return res.send({
						status: 200,
						msg: "No Record Found",
						businessPageList: []
					});
				}
			}
		});
	} else {
		return res.status(400).send({
			status: 400,
			msg: "fail1",
			businessPageList: []
		});
	}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_business_pages = async (req, res) => {
	try {
	if (req.query.user_id) {
		db.query(`SELECT * from tbl_personal_page where user_id= ?`, [req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			if (results.length > 0) {
				res.send({
					status: 200,
					msg: "Success",
					totalPageCount: results.length,
					pageList: results
				});

			} else {
				res.send({
					status: 200,
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
exports.get_business_listing = async (req, res) => {
	try {
	if (req.query.user_id) {
		db.query(`SELECT page_name,page_profile_picture from tbl_personal_page where user_id= ?`, [req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			if (results.length > 0) {
				res.send({
					status: 200,
					msg: "Success",
					totalPageCount: results.length,
					pageList: results
				});

			} else {
				return res.send({
					status: 200,
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
exports.insert_post = async (req, res) => {
	try {
	let upload = multer({
		storage: storage,
	}).array('business_post_media');
	upload(req, res, function(err) {
		if (err) {
			return res.status(400).send({
				status: 400,
				msg: err
			});
		} else {
			if (req.body.user_id && req.body.business_id) {
				//console.log(req.files);
				var final_array = [];
				if (req.files.length > 0) {
					Object.keys(req.files).forEach(function(key, idx, array) {
						var result_file = req.files[key];
						final_array.push(define.BASE_URL + "business_post/" + result_file.filename);
						let ext = result_file.originalname.substring(result_file.originalname.lastIndexOf('.'), result_file.originalname.length);
						if (idx === array.length - 1) {
							req.body.business_post_media = final_array.toString();
							if (ext == ".png" || ext == ".jpg" || ext == ".jpeg") {
								req.body.business_post_media_type = 'image';
							}
							if (ext === '.mov' || ext === '.avchd' || ext === '.mkv' || ext === '.webm' || ext === '.gif' || ext === '.mp4' || ext === '.ogg' || ext === '.wmv' || ext === '.x-flv' || ext === '.avi') {
								req.body.business_post_media_type = 'video';
							}
							db.query(`SET SQL_MODE = ''; INSERT INTO tbl_business_post SET ?`, req.body, function(error, results, fields) {
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
						}
					});
				} else {
					db.query(`SET SQL_MODE = ''; INSERT INTO tbl_business_post SET ?`, req.body, function(error, results, fields) {
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
				}
			} else {
				return res.status(400).send({
					status: 400,
					msg: "fail1"
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
exports.edit_post = async (req, res) => {
	try {
	let upload = multer({
		storage: storage,
	}).array('business_post_media');
	upload(req, res, function(err) {
		if (err) {
			return res.status(400).send({
				status: 400,
				msg: err
			});
		} else {
			if (req.body.user_id && req.body.business_post_id) {
				//console.log(req.files);
				db.query(`SELECT * from tbl_business_post where user_id= ? AND business_post_id = ?  AND business_post_is_deleted = ?`, [req.body.user_id, req.body.business_post_id, '0'], function(error, resultsd, fields) {
					if (error) throw error;
					if (resultsd.length > 0) {
						var final_array = [];
						if (req.files.length > 0) {
							Object.keys(req.files).forEach(function(key, idx, array) {
								var result_file = req.files[key];
								let ext = result_file.originalname.substring(result_file.originalname.lastIndexOf('.'), result_file.originalname.length);
								final_array.push(define.BASE_URL + "business_post/" + result_file.filename);
								if (idx === array.length - 1) {
									req.body.business_post_media = final_array.toString();
									if (ext == ".png" || ext == ".jpg" || ext == ".jpeg") {
										req.body.business_post_media_type = 'image';
									}
									if (ext === '.mov' || ext === '.avchd' || ext === '.mkv' || ext === '.webm' || ext === '.gif' || ext === '.mp4' || ext === '.ogg' || ext === '.wmv' || ext === '.x-flv' || ext === '.avi') {
										req.body.business_post_media_type = 'video';
									}
									var business_post_id = req.body.business_post_id;
									delete req.body.business_post_id;
									db.query(`UPDATE tbl_business_post SET ? where business_post_id = ?`, [req.body, business_post_id], function(error, results, fields) {
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
								}
							});
						} else {
							var business_post_id = req.body.business_post_id;
							delete req.body.business_post_id;
							db.query(`UPDATE tbl_business_post SET ? where business_post_id = ?`, [req.body, business_post_id], function(error, results, fields) {
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
						}
					} else {
						return res.send({
							status: 200,
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
exports.insert_post_comment = async (req, res) => {
	try {
	let upload = multer({
		storage: storage,
	}).array('business_comment_media');
	upload(req, res, function(err) {
		if (err) {
			return res.status(400).send({
				status: 400,
				msg: err
			});
		} else {
			if (req.body.user_id && req.body.business_post_id && req.body.business_comment) {
				//console.log(req.files);
				var final_array = [];
				if (req.files.length > 0) {
					Object.keys(req.files).forEach(function(key, idx, array) {
						var result_file = req.files[key];
						final_array.push(define.BASE_URL + "business_post/" + result_file.filename);
						if (idx === array.length - 1) {
							req.body.business_comment_media = final_array.toString();

							db.query(`SET SQL_MODE = ''; INSERT INTO tbl_business_post_comment SET ?`, req.body, function(error, results, fields) {
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
						}
					});
				} else {
					db.query(`SET SQL_MODE = ''; INSERT INTO tbl_business_post_comment SET ?`, req.body, function(error, results, fields) {
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
				}
			} else {
				return res.status(400).send({
					status: 400,
					msg: "fail1"
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
exports.insert_post_comment_reply = async (req, res) => {
	try {
	let upload = multer({
		storage: storage,
	}).array('business_reply_comment_media');
	upload(req, res, function(err) {
		if (err) {
			return res.status(400).send({
				status: 400,
				msg: err
			});
		} else {
			if (req.body.business_comment_id && req.body.business_comment_reply_user_id) {
				//console.log(req.files);
				var final_array = [];
				if (req.files.length > 0) {
					Object.keys(req.files).forEach(function(key, idx, array) {
						var result_file = req.files[key];
						final_array.push(define.BASE_URL + "business_post/" + result_file.filename);
						if (idx === array.length - 1) {
							req.body.business_reply_comment_media = final_array.toString();


							db.query(`SET SQL_MODE = ''; INSERT INTO tbl_business_post_comment_reply SET ?`, req.body, function(error, results, fields) {
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
						}
					});
				} else {
					db.query(`SET SQL_MODE = ''; INSERT INTO tbl_business_post_comment_reply SET ?`, req.body, function(error, results, fields) {
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
				}
			} else {
				return res.status(400).send({
					status: 400,
					msg: "fail1"
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
exports.create_page = async (req, res) => {
	try {
	let upload = multer({
		storage: personal_page,
	}).fields([{
		name: 'page_cover_picture'
	}, {
		name: 'page_profile_picture'
	}]);
	upload(req, res, function(err) {
		if (err) {
			return res.status(400).send({
				status: 400,
				msg: err
			});
		} else {
			if (req.body.user_id && req.body.business_id) {
				//console.log(req.files);
				var final_array = [];

				if (typeof req.files.page_cover_picture !== 'undefined') {
					req.body.page_cover_picture = define.BASE_URL + "personal_page/cover_images/" + req.files.page_cover_picture[0].filename;
					console.log(req.body.page_cover_picture);
				}

				if (typeof req.files.page_profile_picture !== 'undefined') {
					req.body.page_profile_picture = define.BASE_URL + "personal_page/profile_images/" + req.files.page_profile_picture[0].filename;
					console.log(req.body.page_profile_picture);
				}

				db.query(`SET SQL_MODE = ''; INSERT INTO tbl_personal_page SET ?`, req.body, function(error, results, fields) {
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
				return res.status(400).send({
					status: 400,
					msg: "fail1"
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