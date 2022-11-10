const fs = require('fs');
const db = require("../../config/connection");
var timeAgo = require('node-time-ago');
const {
	getVideoDurationInSeconds
} = require('get-video-duration')
var bodyParser = require('body-parser');
const multer = require('fastify-multer');
const crypto = require("crypto");
const {
	exec
} = require("child_process");
var path = require('path')
var reel = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, '../uploads/reel/');
	},
	filename: function(req, file, cb) {
		cb(null, "reel_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
	}
});
exports.insert_zktor_reel = async (req, res) => {
	try {
		let upload = multer({
			storage: reel,
		}).fields([{
			name: 'zktor_reel_video',
			maxCount: 10
		}, {
			name: 'zktor_reel_audio'
		}, {
			name: 'zktor_reel_thumbnail'
		}]);
		upload(req, res, function(err) {
			if (err) {
				return res.code(400).send({
					status: 400,
					msg: err
				});
			} else {
				if (req.body.zktor_reel_user_id) {
					console.log(req.body);
					var i = 0;
					var pt = define.BASE_URL + "reel/";
					var zktor_reel_video = [];
					var zktor_reel_video_type = '';
					var zktor_short_reel_video = [];
					var zktor_reel_length = [];
					if (typeof req.files.zktor_reel_video !== 'undefined') {
						Object.keys(req.files.zktor_reel_video).forEach(function(key, idx1, array1) {
							var result_file = req.files.zktor_reel_video[key];
							let ext = result_file.originalname.substring(result_file.originalname.lastIndexOf('.'), result_file.originalname.length);
							//console.log(result_file);
							if (ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".tif" || ext == ".bmp" || ext == ".raw" || ext == ".cr2" || ext == ".sr2") {
								let image_file_path = result_file.path;
								//console.log(result_file.path);
								let ext = (result_file.filename).substring((result_file.filename).lastIndexOf('.'), (result_file.filename).length);
								let image = "feed_image_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + ext;
								let path_to_store_generated_width = "../uploads/reel/" + image;
								let cmd = "ffmpeg -i " + image_file_path + " -vf scale=iw*2:ih*2 " + path_to_store_generated_width;
								exec(cmd, (error, stdout, stderr) => {
									if (error) {
										i++;
									}
									if (stderr) {
										console.log(`stderr: ${stderr}`);
									}
								});
								zktor_reel_video.push(define.BASE_URL + "reel/" + image);
								if (zktor_reel_video_type == '')
									zktor_reel_video_type = 'image';
							}
							let video_file_path = result_file.path;
							getVideoDurationInSeconds(video_file_path).then((duration) => {
								if (ext === '.mov' || ext === '.avchd' || ext === '.mkv' || ext === '.webm' || ext === '.gif' || ext === '.mp4' || ext === '.ogg' || ext === '.wmv' || ext === '.x-flv' || ext === '.avi') {
									let video_file_path = result_file.path;
									let ext = (result_file.filename).substring((result_file.filename).lastIndexOf('.'), (result_file.filename).length);
									//console.log(result_file.path);
									let video = "zktor_reel_video_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + ext;
									let path_to_store_generated_width = "../uploads/reel/" + video;
									let cmd = "ffmpeg -i " + video_file_path + " -max_muxing_queue_size 21512512 -vf scale=iw*2:ih*2 -preset slow -crf 40 " + path_to_store_generated_width;
									exec(cmd, (error, stdout, stderr) => {
										if (error) {
											i = 1;
										}
										if (stderr) {
											console.log(`stderr: ${stderr}`);
										}
									});
									let video2 = "zktor_short_reel_video_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + ext;
									let path_to_store_generated_short_video = "../uploads/reel/" + video2;
									let cmd2 = "ffmpeg -i " + video_file_path + " -max_muxing_queue_size 21512512 -vf scale=iw*2:ih*2  -ss 00:01 -to 00:05 -c:v libx264 -crf 40 " + path_to_store_generated_short_video;
									// exec(cmd2);
									exec(cmd2, (error, stdout, stderr) => {
										if (error) {
											i = 1;
											//console.log(`error: ${error.message}`);
											//  return;
										}
										if (stderr) {
											//console.log(`stderr short video: ${stderr}`);
											// return;
										}
										//console.log(`stdout: ${stdout}`);
									});
									zktor_reel_length.push(Math.round(duration));
									if (zktor_reel_video_type == '')
										zktor_reel_video_type = 'video';
									zktor_reel_video.push(define.BASE_URL + "reel/" + video);
									// zktor_reel_video_thumbnail.push(video1);
									zktor_short_reel_video.push(define.BASE_URL + "reel/" + video2);
									// fs.unlink(video_file_path);
									//console.log('test');
								}
								if (idx1 === array1.length - 1) {
									if (i == 0) {
										if (typeof req.files.zktor_reel_thumbnail !== 'undefined') {
											//console.log(req.files.zktor_reel_thumbnail);
											req.body.zktor_reel_thumbnail = pt + (req.files.zktor_reel_thumbnail[0].filename);
										}


										if (req.body.zktor_reel_audio_url && req.body.zktor_reel_audio_url != '') {
											req.body.zktor_reel_audio = req.body.zktor_reel_audio_url;
										} else {
											if (typeof req.files.zktor_reel_audio !== 'undefined') {
												req.body.zktor_reel_audio = pt + req.files.zktor_reel_audio[0].filename;
											}
										}
										delete(req.body.zktor_reel_audio_url);
										req.body.zktor_reel_video = zktor_reel_video.toString();
										req.body.zktor_short_reel_video = zktor_short_reel_video.toString();
										//console.log(zktor_reel_length);
										req.body.zktor_reel_length = zktor_reel_length.toString();
										//req.body.zktor_reel_video_type = zktor_reel_video_type;
										db.query(`INSERT INTO tbl_zktor_reel SET ?`, req.body, function(error, results, fields) {
											if (error) {
												return res.code(400).send({
													status: 400,
													msg: error
												});
											} else {
												return res.code(200).send({
													status: 200,
													msg: "Success",
													zktor_reel_id: results.insertId
												});
											}
										});
									} else {
										return res.code(400).send({
											status: 400,
											msg: "Media file is corrupted ",
											zktor_reel_id: 0
										});
									}
								}
							});
						});
					} else {
						if (typeof req.files.zktor_reel_thumbnail !== 'undefined') {
							//console.log(req.files.zktor_reel_thumbnail);
							req.body.zktor_reel_thumbnail = pt + (req.files.zktor_reel_thumbnail[0].filename);
						}

						if (typeof req.files.zktor_reel_audio !== 'undefined') {
							req.body.zktor_reel_audio = pt + req.files.zktor_reel_audio[0].filename;
						}




						db.query(`INSERT INTO tbl_zktor_reel SET ?`, req.body, function(error, results, fields) {
							if (error) {
								return res.code(400).send({
									status: 400,
									msg: error
								});
							} else {
								return res.code(200).send({
									status: 200,
									msg: "Success",
									zktor_reel_id: results.insertId
								});
							}
						});
					}
				} else {
					return res.code(400).send({
						status: 400,
						msg: "fail1",
						zktor_reel_id: 0
					});
				}
			}
		});
	} catch (err) {
	    console.log(err);
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.update_zktor_reel = async (req, res) => {
	try {
		let upload = multer({
			storage: reel,
		}).fields([{
			name: 'zktor_reel_video',
			maxCount: 10
		}, {
			name: 'zktor_reel_audio'
		}, {
			name: 'zktor_reel_thumbnail'
		}]);
		upload(req, res, function(err) {
			if (err) {
				return res.code(400).send({
					status: 400,
					msg: err
				});
			} else {
				if (req.body.zktor_reel_id) {
					var zktor_reel_id = req.body.zktor_reel_id;
					delete(req.body.zktor_reel_id);
					//console.log(req.body);
					var i = 0;
					var pt = '';
					var zktor_reel_video = [];
					var zktor_reel_video_type = '';
					var zktor_short_reel_video = [];
					var zktor_reel_length = [];
					if (typeof req.files.zktor_reel_video !== 'undefined') {
						Object.keys(req.files.zktor_reel_video).forEach(function(key, idx1, array1) {
							var result_file = req.files.zktor_reel_video[key];
							//console.log(result_file);
							let ext = (result_file.filename).substring((result_file.filename).lastIndexOf('.'), (result_file.filename).length);
							if (ext == ".png" || ext == ".jpg" || ext == ".jpeg") {
								let image_file_path = result_file.path;
								let ext = (result_file.filename).substring((result_file.filename).lastIndexOf('.'), (result_file.filename).length);
								let image = pt + "feed_image_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + ext;
								let path_to_store_generated_width = "../uploads/reel/" + image;
								let cmd = "ffmpeg -i " + image_file_path + " -vf scale=iw*2:ih*2 " + path_to_store_generated_width;
								exec(cmd, (error, stdout, stderr) => {
									if (error) {
										i++;
									}
									if (stderr) {}
								});
								zktor_reel_video.push(image);
								if (zktor_reel_video_type == '')
									zktor_reel_video_type = 'image';
							}
							let video_file_path = result_file.path;
							getVideoDurationInSeconds(video_file_path).then((duration) => {
								if (ext === '.mov' || ext === '.avchd' || ext === '.mkv' || ext === '.webm' || ext === '.gif' || ext === '.mp4' || ext === '.ogg' || ext === '.wmv' || ext === '.x-flv' || ext === '.avi') {
									let video_file_path = result_file.path;
									let ext = (result_file.filename).substring((result_file.filename).lastIndexOf('.'), (result_file.filename).length);

									let video = pt + "zktor_reel_video_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + ext;
									let path_to_store_generated_width = "../uploads/reel/" + video;
									let cmd = "ffmpeg -i " + video_file_path + " -max_muxing_queue_size 21512512 -vf scale=iw*2:ih*2 -preset slow -crf 40 " + path_to_store_generated_width;
									exec(cmd, (error, stdout, stderr) => {
										if (error) {
											i = 1;
										}
										if (stderr) {}
									});
									let video2 = pt + "zktor_short_reel_video_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + ext;
									let path_to_store_generated_short_video = "../uploads/reel/" + video2;
									let cmd2 = "ffmpeg -i " + video_file_path + " -max_muxing_queue_size 21512512 -vf scale=iw*2:ih*2  -ss 00:01 -to 00:05 -c:v libx264 -crf 40 " + path_to_store_generated_short_video;
									// exec(cmd2);
									exec(cmd2, (error, stdout, stderr) => {
										if (error) {
											i = 1;
											//console.log(`error: ${error.message}`);
											//  return;
										}
										if (stderr) {
											//console.log(`stderr short video: ${stderr}`);
											// return;
										}
										//console.log(`stdout: ${stdout}`);
									});
									zktor_reel_length.push(Math.round(duration));
									if (zktor_reel_video_type == '')
										zktor_reel_video_type = 'video';
									zktor_reel_video.push(define.BASE_URL + "reel/" + video);
									// zktor_reel_video_thumbnail.push(video1);
									zktor_short_reel_video.push(define.BASE_URL + "reel/" + video2);
									// fs.unlink(video_file_path);
									//console.log('test');
								}
								if (idx1 === array1.length - 1) {
									if (i == 0) {
										if (typeof req.files.zktor_reel_thumbnail !== 'undefined') {
											//console.log(req.files.zktor_reel_thumbnail);
											req.body.zktor_reel_thumbnail = pt + (req.files.zktor_reel_thumbnail[0].filename);
										}

										if (typeof req.files.zktor_reel_audio !== 'undefined') {
											req.body.zktor_reel_audio = pt + req.files.zktor_reel_audio[0].filename;
										}
										req.body.zktor_reel_video = zktor_reel_video.toString();
										req.body.zktor_short_reel_video = zktor_short_reel_video.toString();
										//console.log(zktor_reel_length);
										req.body.zktor_reel_length = zktor_reel_length.toString();
										//req.body.zktor_reel_video_type = zktor_reel_video_type;
										db.query(`UPDATE tbl_zktor_reel SET ? where zktor_reel_id=?`, [req.body, zktor_reel_id], function(error, results, fields) {
											if (error) {
												return res.code(400).send({
													status: 400,
													msg: error
												});
											} else {
												return res.code(200).send({
													status: 200,
													msg: "Success"
												});
											}
										});
									} else {
										return res.code(400).send({
											status: 400,
											msg: "Media file is corrupted "
										});
									}
								}
							});
						});
					} else {
						if (typeof req.files.zktor_reel_thumbnail !== 'undefined') {
							//console.log(req.files.zktor_reel_thumbnail);
							req.body.zktor_reel_thumbnail = pt + (req.files.zktor_reel_thumbnail[0].filename);
						}

						if (typeof req.files.zktor_reel_audio !== 'undefined') {
							req.body.zktor_reel_audio = pt + req.files.zktor_reel_audio[0].filename;
						}
						db.query(`UPDATE tbl_zktor_reel SET ? where zktor_reel_id=?`, [req.body, zktor_reel_id], function(error, results, fields) {
							if (error) {
								return res.code(400).send({
									status: 400,
									msg: error
								});
							} else {
								return res.code(200).send({
									status: 200,
									msg: "Success"
								});
							}
						});
					}
				} else {
					return res.code(400).send({
						status: 400,
						msg: "fail1"
					});
				}
			}
		});
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.add_rating = async (req, res) => {
	try {
		let upload = multer({
			storage: bazar,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.code(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.cook_rating && req.body.zktor_reel_id) {
					db.query(`INSERT INTO tbl_zktor_reel_rating SET ?`, [req.body], function(error, results, fields) {
						if (error) {
							return res.code(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							var rating = 0;
							var rating_count = 0;
							db.query(`SELECT * FROM tbl_zktor_reel_rating where zktor_reel_id=?;`, [req.body.zktor_reel_id], function(error, results_rating, fields) {
								if (error) throw error;
								if (results_rating.length > 0) {
									var total = 0;
									Object.keys(results_rating).forEach(function(key1, idx1, array1) {
										var result_data_rating = results_rating[key1];
										total = parseFloat(total) + parseFloat(result_data_rating.cook_rating);
										if (idx1 === array1.length - 1) {
											var rating1 = parseFloat(total) / results_rating.length;
											rating = Math.round(rating1 * 100) / 100;
										}
									});
								}
								return res.code(200).send({
									status: 200,
									msg: "Success",
									rating: rating,
									rating_user_count: results_rating.length
								});
							});

						}
					});

				} else {
					return res.code(400).send({
						status: 400,
						msg: "fail",
						rating: 0,
						rating_user_count: 0
					});
				}
			}
		});
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.update_zktor_reel_comment = async (req, res) => {
	try {
		let upload = multer({
			storage: reel,
		}).fields([{
			name: 'comment_media',
			maxCount: 10
		}]);
		upload(req, res, function(err) {
			if (err) {
				return res.code(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.comment_id) {
					var comment_id = req.body.comment_id;
					delete(req.body.comment_id);
					var pt = define.BASE_URL + "reel/";
					if (typeof req.files.comment_media !== 'undefined') {
						req.body.comment_media = pt + req.files.comment_media[0].filename;
					}
					db.query(`UPDATE tbl_zktor_reel_comment SET ? where comment_id=?`, [req.body, comment_id], function(error, results, fields) {
						if (error) {
							return res.code(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							return res.code(200).send({
								status: 200,
								msg: "Success",
								comment_media: (req.body.comment_media) ? req.body.comment_media : ''
							});
						}
					});

				} else {
					return res.code(400).send({
						status: 400,
						msg: "fail"
					});
				}
			}
		});
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.add_zktor_reel_comment = async (req, res) => {
	try {
		let upload = multer({
			storage: reel,
		}).fields([{
			name: 'comment_media',
			maxCount: 10
		}]);
		upload(req, res, function(err) {
			if (err) {
				return res.code(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				req.body.created_date = "hhhh";
				if (req.body.comment && req.body.comment_zktor_reel_id) {
					var pt = define.BASE_URL + "reel/";
					if (typeof req.files.comment_media !== 'undefined') {
						req.body.comment_media = pt + req.files.comment_media[0].filename;
					}
					db.query(`INSERT INTO tbl_zktor_reel_comment SET ?`, [req.body], function(error, results, fields) {
						if (error) {
							return res.code(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							return res.code(200).send({
								status: 200,
								msg: "Success",
								comment_media: (req.body.comment_media) ? req.body.comment_media : '',
								comment_id: results.insertId
							});
						}
					});

				} else {
					return res.code(400).send({
						status: 400,
						msg: "fail",
						comment_media: '',
						comment_id: 0
					});
				}
			}
		});
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.delete_zktor_reel_comment = async (req, res) => {
	try {
		if (req.query.comment_id) {
			var comment = [];
			db.query(`DELETE FROM tbl_zktor_reel_comment where comment_id=?;`, [req.query.comment_id], function(error, results_comment, fields) {
				if (error) throw error;
				return res.code(200).send({
					status: 200,
					msg: "Success"
				});
			});

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail"
			});
		}

	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.report_reel = async (req, res) => {
	try {
		let upload = multer({
			storage: reel,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.code(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.zktor_reel_id && req.body.zktor_reel_report_user_id) {
					db.query(`INSERT INTO tbl_zktor_reel_report SET ?`, [req.body], function(error, results, fields) {
						if (error) {
							return res.code(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							return res.code(200).send({
								status: 200,
								msg: "Success"
							});
						}
					});

				} else {
					return res.code(400).send({
						status: 400,
						msg: "fail"
					});
				}
			}
		});
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.add_reel_comment_report = async (req, res) => {
	try {
		let upload = multer({
			storage: reel,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.code(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.reel_user_id) {
					db.query(`INSERT INTO tbl_zktor_reel_comment_report SET ?`, [req.body], function(error, results, fields) {
						if (error) {
							return res.code(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							return res.code(200).send({
								status: 200,
								msg: "Success",
								reel_comment_report_id: results.insertId
							});
						}
					});

				} else {
					return res.code(400).send({
						status: 400,
						msg: "fail",
						reel_comment_report_id: 0
					});
				}
			}
		});
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.add_schedule = async (req, res) => {
	try {
		let upload = multer({
			storage: bazar,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.code(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.zktor_reel_id) {
					db.query(`INSERT INTO tbl_zktor_reel_schedule SET ?`, [req.body], function(error, results, fields) {
						if (error) {
							return res.code(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							return res.code(200).send({
								status: 200,
								msg: "Success",
								reel_schedule_id: results.insertId
							});
						}
					});

				} else {
					return res.code(400).send({
						status: 400,
						msg: "fail"
					});
				}
			}
		});
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_friend_reel = async (req, res) => {
	try {
		if (req.query.zktor_reel_user_id && req.query.page_no) {
			var no_of_records_per_page = 40;
			var rowno = req.query.page_no;
			if (rowno != 0) {
				rowno = (rowno - 1) * no_of_records_per_page;
			}
			if (res.totalfriendsList.length > 0) {
				//console.log(res.totalfriendsList);
				db.query(`SELECT * FROM tbl_zktor_reel where privacy!=? AND zktor_reel_user_id  IN (?) LIMIT ? OFFSET ?; SELECT COUNT(*) AS numrows FROM tbl_zktor_reel where  privacy!=? AND zktor_reel_user_id  IN (?)`, ['0', res.totalfriendsList, no_of_records_per_page, rowno, '0', res.totalfriendsList], function(error, results, fields) {
					if (error) throw error;
					if (results[0].length > 0) {
						var final_array = [];
						var final_array_one = [];
						var comment = [];
						var rating = 0;
						var rating_count = 0;
						var flag = 2;
						if (results[0].length > 0) {
							const merged = results[0].concat(results[1]);
							//console.log(merged);
							Object.keys(results[0]).forEach(function(key, idx, array) {
								var result_data = results[0][key];
								db.query(`SELECT * FROM tbl_zktor_reel_like where zktor_reel_user_id=? AND zktor_reel_id=?;SELECT * FROM tbl_zktor_reel_like where zktor_reel_id=? ORDER BY zktor_reel_like_id DESC LIMIT 2`, [req.query.zktor_reel_user_id, result_data.zktor_reel_id, result_data.zktor_reel_id, '2'], function(error, results_rating, fields) {
									if (error) throw error;
									if (results_rating[0].length > 0) {
										result_data.user_reaction = results_rating[0][0].reel_feeling_string;
									} else {
										result_data.user_reaction = '';
									}
									if (results_rating[1].length > 0) {
										result_data.first_reel_feeling_string = results_rating[1][0].reel_feeling_string;
									} else {
										result_data.first_reel_feeling_string = '';
									}
									if (results_rating[1].length > 1) {
										result_data.second_reel_feeling_string = results_rating[1][1].reel_feeling_string;
									} else {
										result_data.second_reel_feeling_string = '';
									}
									db.query(`SELECT * FROM tbl_user_profile where user_id=?; SELECT COUNT(*) AS numrows FROM tbl_zktor_reel_comment where comment_zktor_reel_id=? and comment_operation=?;SELECT * FROM tbl_user_profile where user_id=?`, [result_data.zktor_reel_user_id, result_data.zktor_reel_id, '0', results_rating[0].zktor_reel_user_id], function(error, results_comment, fields) {
										if (error) throw error;
										if (results_comment[0].length > 0) {
											result_data.user_name = results_comment[0][0].user_name;
											result_data.user_profile_img = results_comment[0][0].user_profile_img;
											result_data.user_profile_background = results_comment[0][0].user_profile_background;
											result_data.user_channel_id = results_comment[0][0].user_channel_id;
											result_data.user_channel_name = results_comment[0][0].user_channel_name;
										} else {
											result_data.user_name = '';
											result_data.user_profile_img = '';
											result_data.user_profile_background = '';
											result_data.user_channel_id = '';
											result_data.user_channel_name = '';
										}
										if (results_comment[2].length > 0) {
											result_data.last_reacted_user = results_comment[2][0].user_name;
										} else {
											result_data.last_reacted_user = '';
										}
										result_data.comment_count = results_comment[1][0].numrows;
										result_data.zktor_reel_duration = timeAgo(new Date(result_data.created_date).toISOString());
										final_array.push(result_data);
										if (idx === array.length - 1) {
											let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
											if (req.query.page_no && req.query.page_no <= max_pages) {
												let page_no = req.query.page_no;

												// PAGINATION START

												let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
												//  let sliceData = final_array.slice(offset, offset + no_of_records_per_page)
												var pagination = {
													total_rows: results[1][0].numrows,
													total_pages: parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page)),
													per_page: no_of_records_per_page,
													offset: offset,
													current_page_no: page_no
												};
												return res.code(200).send({
													status: 200,
													msg: "Success",
													zktorReelListCount: results[1][0].numrows,
													zktorReelList: final_array,
													pagination: pagination
												});
											} else {
												return res.code(404).send({
													status: 404,
													msg: "Page no missing or Its incorrect.",
													zktorReelListCount: 0,
													zktorReelList: [],
													pagination: {
														total_rows: 0,
														total_pages: 0,
														per_page: 0,
														offset: 0,
														current_page_no: '0'
													}

												});
											}
										}
									});
								});
							});
						} else {
							if (idx === array.length - 1) {
								return res.code(200).send({
									status: 200,
									msg: "Success",
									zktorReelListCount: 0,
									zktorReelList: [],
									pagination: {
										total_rows: 0,
										total_pages: 0,
										per_page: 0,
										offset: 0,
										current_page_no: '0'
									}
								});
							}
						}


					} else {
						return res.code(404).send({
							status: 404,
							msg: "Record not found",
							zktorReelListCount: 0,
							zktorReelList: [],
							pagination: {
								total_rows: 0,
								total_pages: 0,
								per_page: 0,
								offset: 0,
								current_page_no: '0'
							}
						});
					}
				});
			} else {
				return res.code(404).send({
					status: 404,
					msg: "Record not found",
					zktorReelListCount: 0,
					zktorReelList: [],
					pagination: {
						total_rows: 0,
						total_pages: 0,
						per_page: 0,
						offset: 0,
						current_page_no: '0'
					}
				});
			}
		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail",
				zktorReelListCount: 0,
				zktorReelList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_zktor_reel = async (req, res) => {
	try {
		if (req.query.zktor_reel_user_id && req.query.zktor_reel_id && req.query.vistor_user_id && req.query.page_no) {
			var no_of_records_per_page = 40;
			var rowno = req.query.page_no;
			if (rowno != 0) {
				rowno = (rowno - 1) * no_of_records_per_page;
			}
			db.query(`SELECT * FROM tbl_zktor_reel ORDER BY RAND() LIMIT ? OFFSET ?; SELECT COUNT(*) AS numrows FROM tbl_zktor_reel`, [no_of_records_per_page, rowno], function(error, results, fields) {
				if (error) throw error;
				if (results[0].length > 0) {
					var final_array = [];
					var final_array_one = [];
					var comment = [];
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[0].length > 0) {
						const merged = results[0].concat(results[1]);
						//console.log(merged);
						Object.keys(results[0]).forEach(function(key, idx, array) {
							var result_data = results[0][key];
							db.query(`SELECT * FROM tbl_zktor_reel_like where zktor_reel_user_id=? AND zktor_reel_id=?;SELECT * FROM tbl_zktor_reel_like where zktor_reel_id=? ORDER BY zktor_reel_like_id DESC LIMIT 2;SELECT * FROM tbl_zktor_reel_followers where reel_creator_user_id=? and reel_follower_user_id=?;`, [req.query.zktor_reel_user_id, result_data.zktor_reel_id, result_data.zktor_reel_id, result_data.zktor_reel_user_id, req.query.vistor_user_id], function(error, results_rating, fields) {
								if (error) throw error;
								result_data.isFollowed = (results_rating[2].length > 0) ? 1 : 0;

								if (results_rating[0].length > 0) {
									result_data.user_reaction = results_rating[0][0].reel_feeling_string;
								} else {
									result_data.user_reaction = '';
								}
								if (results_rating[1].length > 0) {
									result_data.first_reel_feeling_string = results_rating[1][0].reel_feeling_string;
								} else {
									result_data.first_reel_feeling_string = '';
								}
								if (results_rating[1].length > 1) {
									result_data.second_reel_feeling_string = results_rating[1][1].reel_feeling_string;
								} else {
									result_data.second_reel_feeling_string = '';
								}
								if (results_rating[2].length > 0) {
									result_data.follower_count = results_rating[2].length;
								} else {
									result_data.follower_count = '';
								}

								db.query(`SELECT * FROM tbl_user_profile where user_id=?; SELECT COUNT(*) AS numrows FROM tbl_zktor_reel_comment where comment_zktor_reel_id=? and comment_operation=?;SELECT * FROM tbl_user_profile where user_id=?;`, [result_data.zktor_reel_user_id, result_data.zktor_reel_id, '0', results_rating[0].zktor_reel_user_id], function(error, results_comment, fields) {
									if (error) throw error;
									if (results_comment[0].length > 0) {
										result_data.user_name = results_comment[0][0].user_name;
										result_data.user_profile_img = results_comment[0][0].user_profile_img;
										result_data.user_profile_background = results_comment[0][0].user_profile_background;
										result_data.user_channel_id = results_comment[0][0].user_channel_id;
										result_data.user_channel_name = results_comment[0][0].user_channel_name;
									} else {
										result_data.user_name = '';
										result_data.user_profile_img = '';
										result_data.user_profile_background = '';
										result_data.user_channel_id = '';
										result_data.user_channel_name = '';
									}
									if (results_comment[2].length > 0) {
										result_data.last_reacted_user = results_comment[2][0].user_name;
									} else {
										result_data.last_reacted_user = '';
									}
									result_data.comment_count = results_comment[1][0].numrows;
									result_data.zktor_reel_duration = timeAgo(new Date(result_data.created_date).toISOString());
									final_array.push(result_data);
									if (idx === array.length - 1) {
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no && req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;

											// PAGINATION START

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//  let sliceData = final_array.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page)),
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no
											};
											return res.code(200).send({
												status: 200,
												msg: "Success",
												zktorReelListCount: results[1][0].numrows,
												zktorReelList: final_array,
												pagination: pagination
											});
										} else {
											return res.code(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												zktorReelListCount: 0,
												zktorReelList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}
											});
										}
									}
								});
							});
						});
					} else {
						if (idx === array.length - 1) {
							return res.code(200).send({
								status: 200,
								msg: "Success",
								zktorReelListCount: 0,
								zktorReelList: [],
								pagination: {
									total_rows: 0,
									total_pages: 0,
									per_page: 0,
									offset: 0,
									current_page_no: '0'
								}
							});
						}
					}


				} else {
					return res.code(404).send({
						status: 404,
						msg: "Record not found",
						zktorReelListCount: 0,
						zktorReelList: [],
						pagination: {
							total_rows: 0,
							total_pages: 0,
							per_page: 0,
							offset: 0,
							current_page_no: '0'
						}
					});
				}
			});
		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail",
				zktorReelListCount: 0,
				zktorReelList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_reel_with_user_id = async (req, res) => {
	try {
		var totalLike = 0;
		var totalShare = 0;
		var totalView = 0;
		if (req.query.zktor_reel_user_id && req.query.vistor_user_id && req.query.page_no) {
			var no_of_records_per_page = 10;
			var rowno = req.query.page_no;
			if (rowno != 0) {
				rowno = (rowno - 1) * no_of_records_per_page;
			}
			db.query(`SELECT * FROM tbl_zktor_reel where zktor_reel_user_id=? LIMIT ? OFFSET ?; SELECT COUNT(*) AS numrows FROM tbl_zktor_reel where zktor_reel_user_id=?;SELECT * FROM tbl_zktor_reel_followers where reel_creator_user_id=? and reel_follower_user_id=?;`, [req.query.zktor_reel_user_id, no_of_records_per_page, rowno, req.query.zktor_reel_user_id, req.query.zktor_reel_user_id, , req.query.vistor_user_id], function(error, results, fields) {
				if (error) throw error;
				if (results[0].length > 0) {
					var final_array = [];
					var final_array_one = [];
					var comment = [];
					var rating = 0;

					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[0].length > 0) {
						const merged = results[0].concat(results[1]);
						//console.log(merged);
						Object.keys(results[0]).forEach(function(key, idx, array) {
							var result_data = results[0][key];
							db.query(`SELECT * FROM tbl_zktor_reel_like where zktor_reel_user_id=? AND zktor_reel_id=?;SELECT * FROM tbl_zktor_reel_like where zktor_reel_id=? ORDER BY zktor_reel_like_id DESC LIMIT 2`, [req.query.zktor_reel_user_id, result_data.zktor_reel_id, result_data.zktor_reel_id, '2'], function(error, results_rating, fields) {
								if (error) throw error;
								result_data.isFollowed = (results[2].length > 0) ? 1 : 0;
								if (results_rating[0].length > 0) {
									result_data.user_reaction = results_rating[0][0].reel_feeling_string;
								} else {
									result_data.user_reaction = '';
								}
								if (results_rating[1].length > 0) {
									result_data.first_reel_feeling_string = results_rating[1][0].reel_feeling_string;
								} else {
									result_data.first_reel_feeling_string = '';
								}
								if (results_rating[1].length > 1) {
									result_data.second_reel_feeling_string = results_rating[1][1].reel_feeling_string;
								} else {
									result_data.second_reel_feeling_string = '';
								}
								db.query(`SELECT * FROM tbl_user_profile where user_id=?; SELECT COUNT(*) AS numrows FROM tbl_zktor_reel_comment where comment_zktor_reel_id=? and comment_operation=?;SELECT * FROM tbl_user_profile where user_id=?`, [result_data.zktor_reel_user_id, result_data.zktor_reel_id, '0', results_rating[0].zktor_reel_user_id], function(error, results_comment, fields) {
									if (error) throw error;
									if (results_comment[0].length > 0) {
										result_data.user_name = results_comment[0][0].user_name;
										result_data.user_profile_img = results_comment[0][0].user_profile_img;
										result_data.user_profile_background = results_comment[0][0].user_profile_background;
										result_data.user_channel_id = results_comment[0][0].user_channel_id;
										result_data.user_channel_name = results_comment[0][0].user_channel_name;
									} else {
										result_data.user_name = '';
										result_data.user_profile_img = '';
										result_data.user_profile_background = '';
										result_data.user_channel_id = '';
										result_data.user_channel_name = '';
									}
									if (results_comment[2].length > 0) {
										result_data.last_reacted_user = results_comment[2][0].user_name;
									} else {
										result_data.last_reacted_user = '';
									}
									result_data.comment_count = results_comment[1][0].numrows;
									result_data.zktor_reel_duration = timeAgo(new Date(result_data.created_date).toISOString());
									totalLike = totalLike + result_data.zktor_reel_like_count;
									totalShare = totalShare + result_data.zktor_reel_share_count;
									totalView = totalView + result_data.zktor_reel_view_count;
									final_array.push(result_data);
									if (idx === array.length - 1) {
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no && req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;

											// PAGINATION START

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//  let sliceData = final_array.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page)),
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no
											};
											return res.code(200).send({
												status: 200,
												msg: "Success",
												totalLike: totalLike,
												totalShare: totalShare,
												totalView: totalView,
												zktorReelListCount: results[1][0].numrows,
												zktorReelList: final_array,
												pagination: pagination
											});
										} else {
											return res.code(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												totalLike: totalLike,
												totalShare: totalShare,
												totalView: totalView,
												zktorReelListCount: 0,
												zktorReelList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}
											});
										}
									}
								});
							});
						});
					} else {
						if (idx === array.length - 1) {
							return res.code(200).send({
								status: 200,
								msg: "Success",
								totalLike: totalLike,
								totalShare: totalShare,
								totalView: totalView,
								zktorReelListCount: 0,
								zktorReelList: [],
								pagination: {
									total_rows: 0,
									total_pages: 0,
									per_page: 0,
									offset: 0,
									current_page_no: '0'
								}
							});
						}
					}


				} else {
					return res.code(404).send({
						status: 404,
						msg: "Record not found",
						totalLike: totalLike,
						totalShare: totalShare,
						totalView: totalView,
						zktorReelListCount: 0,
						zktorReelList: [],
						pagination: {
							total_rows: 0,
							total_pages: 0,
							per_page: 0,
							offset: 0,
							current_page_no: '0'
						}
					});
				}
			});
		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail",
				totalLike: totalLike,
				totalShare: totalShare,
				totalView: totalView,
				zktorReelListCount: 0,
				zktorReelList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_zktor_reel_with_id = async (req, res) => {
	try {
		if (req.query.zktor_reel_user_id && req.query.zktor_reel_id) {

			db.query(`SELECT * FROM tbl_zktor_reel where zktor_reel_id=? ORDER BY RAND(); SELECT COUNT(*) AS numrows FROM tbl_zktor_reel`, [req.query.zktor_reel_id], function(error, results, fields) {
				if (error) throw error;
				if (results[0].length > 0) {
					var final_array = [];
					var final_array_one = [];
					var comment = [];
					var totalLike = 0;
					var totalShare = 0;
					var totalView = 0;
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[0].length > 0) {
						const merged = results[0].concat(results[1]);
						//console.log(merged);
						Object.keys(results[0]).forEach(function(key, idx, array) {
							var result_data = results[0][key];
							db.query(`SELECT * FROM tbl_zktor_reel_like where zktor_reel_user_id=? AND zktor_reel_id=?;SELECT * FROM tbl_zktor_reel_like where zktor_reel_id=? ORDER BY zktor_reel_like_id DESC LIMIT 2`, [req.query.zktor_reel_user_id, result_data.zktor_reel_id, result_data.zktor_reel_id, '2'], function(error, results_rating, fields) {
								if (error) throw error;
								if (results_rating[0].length > 0) {
									result_data.user_reaction = results_rating[0][0].reel_feeling_string;
								} else {
									result_data.user_reaction = '';
								}
								if (results_rating[1].length > 0) {
									result_data.first_reel_feeling_string = results_rating[1][0].reel_feeling_string;
								} else {
									result_data.first_reel_feeling_string = '';
								}
								if (results_rating[1].length > 1) {
									result_data.second_reel_feeling_string = results_rating[1][1].reel_feeling_string;
								} else {
									result_data.second_reel_feeling_string = '';
								}
								db.query(`SELECT * FROM tbl_user_profile where user_id=?; SELECT COUNT(*) AS numrows FROM tbl_zktor_reel_comment where comment_zktor_reel_id=? and comment_operation=?;SELECT * FROM tbl_user_profile where user_id=?`, [result_data.zktor_reel_user_id, result_data.zktor_reel_id, '0', results_rating[0].zktor_reel_user_id], function(error, results_comment, fields) {
									if (error) throw error;
									if (results_comment[0].length > 0) {
										result_data.user_name = results_comment[0][0].user_name;
										result_data.user_profile_img = results_comment[0][0].user_profile_img;
										result_data.user_profile_background = results_comment[0][0].user_profile_background;
										result_data.user_channel_id = results_comment[0][0].user_channel_id;
										result_data.user_channel_name = results_comment[0][0].user_channel_name;
									} else {
										result_data.user_name = '';
										result_data.user_profile_img = '';
										result_data.user_profile_background = '';
										result_data.user_channel_id = '';
										result_data.user_channel_name = '';
									}
									if (results_comment[2].length > 0) {
										result_data.last_reacted_user = results_comment[2][0].user_name;
									} else {
										result_data.last_reacted_user = '';
									}
									result_data.comment_count = results_comment[1][0].numrows;
									result_data.zktor_reel_duration = timeAgo(new Date(result_data.created_date).toISOString());

									final_array.push(result_data);
									if (idx === array.length - 1) {
										return res.code(200).send({
											status: 200,
											msg: "Success",
											zktorReelDetails: final_array
										});

									}
								});
							});
						});
					} else {
						if (idx === array.length - 1) {
							return res.code(200).send({
								status: 200,
								msg: "Success",
								zktorReelDetails: final_array
							});
						}
					}


				} else {
					return res.code(404).send({
						status: 404,
						msg: "Record not found",
						zktorReelDetails: []
					});
				}
			});
		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail",
				zktorReelDetails: []
			});
		}
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_reel_random_list = async (req, res) => {
	try {
		if (req.query.zktor_reel_user_id && req.query.vistor_user_id) {

			db.query(`SELECT * FROM tbl_zktor_reel ORDER BY RAND(); SELECT COUNT(*) AS numrows FROM tbl_zktor_reel`, [req.query], function(error, results, fields) {
				if (error) throw error;
				if (results[0].length > 0) {
					var final_array = [];
					var final_array_one = [];
					var comment = [];
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[0].length > 0) {
						const merged = results[0].concat(results[1]);
						//console.log(merged);
						Object.keys(results[0]).forEach(function(key, idx, array) {
							var result_data = results[0][key];
							db.query(`SELECT * FROM tbl_zktor_reel_like where zktor_reel_user_id=? AND zktor_reel_id=?;SELECT * FROM tbl_zktor_reel_like where zktor_reel_id=? ORDER BY zktor_reel_like_id DESC LIMIT 2`, [req.query.zktor_reel_user_id, result_data.zktor_reel_id, result_data.zktor_reel_id, '2'], function(error, results_rating, fields) {
								if (error) throw error;
								if (results_rating[0].length > 0) {
									result_data.user_reaction = results_rating[0][0].reel_feeling_string;
								} else {
									result_data.user_reaction = '';
								}
								if (results_rating[1].length > 0) {
									result_data.first_reel_feeling_string = results_rating[1][0].reel_feeling_string;
								} else {
									result_data.first_reel_feeling_string = '';
								}
								if (results_rating[1].length > 1) {
									result_data.second_reel_feeling_string = results_rating[1][1].reel_feeling_string;
								} else {
									result_data.second_reel_feeling_string = '';
								}
								db.query(`SELECT * FROM tbl_user_profile where user_id=?; SELECT COUNT(*) AS numrows FROM tbl_zktor_reel_comment where comment_zktor_reel_id=? and comment_operation=?;SELECT * FROM tbl_user_profile where user_id=?`, [result_data.zktor_reel_user_id, result_data.zktor_reel_id, '0', results_rating[0].zktor_reel_user_id], function(error, results_comment, fields) {
									if (error) throw error;
									if (results_comment[0].length > 0) {
										result_data.user_name = results_comment[0][0].user_name;
										result_data.user_profile_img = results_comment[0][0].user_profile_img;
										result_data.user_profile_background = results_comment[0][0].user_profile_background;
										result_data.user_channel_id = results_comment[0][0].user_channel_id;
										result_data.user_channel_name = results_comment[0][0].user_channel_name;
									} else {
										result_data.user_name = '';
										result_data.user_profile_img = '';
										result_data.user_profile_background = '';
										result_data.user_channel_id = '';
										result_data.user_channel_name = '';
									}
									if (results_comment[2].length > 0) {
										result_data.last_reacted_user = results_comment[2][0].user_name;
									} else {
										result_data.last_reacted_user = '';
									}
									result_data.comment_count = results_comment[1][0].numrows;
									result_data.zktor_reel_duration = timeAgo(new Date(result_data.created_date).toISOString());
									final_array.push(result_data);
									if (idx === array.length - 1) {
										return res.code(200).send({
											status: 200,
											msg: "Success",
											zktorReelRandomListCount: results[1][0].numrows,
											zktorReelRandomList: final_array
										});

									}
								});
							});
						});
					} else {
						if (idx === array.length - 1) {
							return res.code(200).send({
								status: 200,
								msg: "Success",
								zktorReelRandomListCount: 0,
								zktorReelRandomList: []
							});
						}
					}


				} else {
					return res.code(404).send({
						status: 404,
						msg: "Record not found",
						zktorReelRandomListCount: 0,
						zktorReelRandomList: []
					});
				}
			});
		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail",
				zktorReelRandomListCount: 0,
				zktorReelRandomList: []
			});
		}
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
// exports.profile_delete = async (req, res) => {
// 	try {
// app.get('/cook_follow', middleware.authenticateToken, (req, res, next) => {
//     if (req.query.follower_user_id && req.query.zktor_reel_id) {
//         db.query(`select * From tbl_zktor_reel_followers where follower_user_id= ?; select * From tbl_zktor_reel where zktor_reel_id= ?`, [req.query.follower_user_id, req.query.zktor_reel_id], function(error, results, fields) {
//             if (error) {
//                 return res.code(400).send({
//                     status: 400,
//                     msg: "fail"
//                 });
//             } else {
//                 if (results[0].length <= 0) {
//                     if (results[1].length > 0) {
//                         var count = results[1][0].follower_count + 1;
//                         var d = {
//                             follower_count: count
//                         };
//                         db.query(`UPDATE tbl_zktor_reel SET ? where zktor_reel_id= ?`, [d, req.query.zktor_reel_id], function(error, results_update, fields) {
//                             if (error) {

//                             } else {}
//                         });
//                         req.query.follower_status = 1;
//                         db.query(`INSERT INTO tbl_zktor_reel_followers SET ?`, req.query, function(error, results, fields) {
//                             if (error) {
//                                 return res.code(400).send({
//                                     status: 400,
//                                     msg: "fail"
//                                 });
//                             } else {
//                                 return res.code(200).send({
//                                     status: 200,
//                                     msg: "Success",
//                                     count: count
//                                 });
//                             }
//                         });
//                     } else {
//                         return res.code(400).send({
//                             status: 400,
//                             msg: 'fail'
//                         });
//                     }
//                 } else {
//                     if (results[1].length > 0) {
//                         var follower_status = 1;
//                         var count = 0;
//                         if (results[0][0].follower_status == 1) {
//                             follower_status = 0;
//                         }
//                         if (results[1][0].follower_count > 0 && results[0][0].follower_status == 1) {
//                             count = results[1][0].follower_count - 1;
//                         } else {
//                             count = results[1][0].follower_count + 1;
//                         }
//                         var d = {
//                             follower_count: count
//                         };
//                         db.query(`UPDATE tbl_zktor_reel SET ? where zktor_reel_id= ?`, [d, req.query.zktor_reel_id], function(error, results_update, fields) {
//                             if (error) {

//                             } else {}
//                         });
//                         db.query(`UPDATE tbl_zktor_reel_followers SET ? where follower_user_id = ?`, [{
//                             follower_status: follower_status
//                         }, req.query.follower_user_id], function(error, results, fields) {
//                             if (error) {
//                                 return res.code(400).send({
//                                     status: 400,
//                                     msg: "fail"
//                                 });
//                             } else {
//                                 return res.code(200).send({
//                                     status: 200,
//                                     msg: "Success",
//                                     count: count
//                                 });
//                             }
//                         });

//                     } else {
//                         return res.code(400).send({
//                             status: 400,
//                             msg: 'fail'
//                         });
//                     }
//                 }
//             }
//         });

//     } else {
//         return res.code(400).send({
//             status: 400,
//             msg: "fail"
//         });
//     }

// 	} catch (err) {
// 		return res.code(400).send({
// 			status: 400,
// 			msg: err
// 		});
// 	}
// };
exports.update_share_count = async (req, res) => {
	try {
		if (req.query.zktor_reel_id) {
			db.query(`select * From tbl_zktor_reel where zktor_reel_id= ?`, [req.query.zktor_reel_id], function(error, results, fields) {
				if (error) {
					return res.code(400).send({
						status: 400,
						msg: error
					});
				} else {
					if (results.length > 0) {
						var count = results[0].zktor_reel_share_count + 1;
						var d = {
							zktor_reel_share_count: count
						};
						db.query(`UPDATE tbl_zktor_reel SET ? where zktor_reel_id= ?`, [d, req.query.zktor_reel_id], function(error, results_update, fields) {
							if (error) {

							} else {
								return res.code(200).send({
									status: 200,
									msg: "Success",
									zktor_reel_share_count: count
								});

							}
						});

					} else {
						return res.code(400).send({
							status: 400,
							msg: 'fail'
						});
					}
				}
			});

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail"
			});
		}

	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.comment_reaction = async (req, res) => {
	try {
	      let upload = multer({
        storage: reel,
    }).single('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).json({
                status: 400,
                msg: "fail"
            });
        } else {
		if (req.body.reaction_user_id && req.body.comment_id) {
			if (req.body.flag == 1) {
				db.query(`UPDATE tbl_zktor_reel SET ? where zktor_reel_id= ?`, [req.body, req.query.zktor_reel_id], function(error, results_update, fields) {
					if (error) {

					} else {}
				});
				delete(req.query.flag);
				db.query(`INSERT INTO tbl_zktor_reel_like SET ?`, req.query, function(error, results, fields) {
					if (error) {
						return res.code(400).send({
							status: 400,
							msg: "fail"
						});
					} else {
						return res.code(200).send({
							status: 200,
							msg: "Success",
							likeCount: count
						});
					}
				});
			} else {
				db.query(`UPDATE tbl_zktor_reel SET ? where zktor_reel_id= ?`, [d, req.query.zktor_reel_id], function(error, results_update, fields) {
					if (error) {

					} else {}
				});
				db.query(`DELETE from tbl_zktor_reel_like where zktor_reel_id=? and zktor_reel_user_id = ?`, [req.query.zktor_reel_id, req.query.zktor_reel_user_id], function(error, results, fields) {
					if (error) {
						return res.code(400).send({
							status: 400,
							msg: "fail"
						});
					} else {
						return res.code(200).send({
							status: 200,
							msg: "Success",
							likeCount: count
						});
					}
				});
			}

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail"
			});
		}
        }
    });
	} catch (err) {
	    console.log(err);
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.ztkor_reel_like = async (req, res) => {
	try {
		if (req.query.zktor_reel_user_id && req.query.zktor_reel_id) {
			db.query(`select * From tbl_zktor_reel_like where zktor_reel_user_id= ? and zktor_reel_id=?; select * From tbl_zktor_reel where zktor_reel_id= ?`, [req.query.zktor_reel_user_id, req.query.zktor_reel_id, req.query.zktor_reel_id], function(error, results, fields) {
				if (error) {
					return res.code(400).send({
						status: 400,
						msg: error
					});
				} else {
					if (req.query.flag == 1) {
						if (results[0].length <= 0) {
							if (results[1].length > 0) {
								var count = results[1][0].zktor_reel_like_count + 1;
								var d = {
									zktor_reel_like_count: count
								};
								db.query(`UPDATE tbl_zktor_reel SET ? where zktor_reel_id= ?`, [d, req.query.zktor_reel_id], function(error, results_update, fields) {
									if (error) {

									} else {}
								});
								delete(req.query.flag);
								db.query(`INSERT INTO tbl_zktor_reel_like SET ?`, req.query, function(error, results, fields) {
									if (error) {
										return res.code(400).send({
											status: 400,
											msg: "fail"
										});
									} else {
										return res.code(200).send({
											status: 200,
											msg: "Success",
											likeCount: count
										});
									}
								});
							} else {
								return res.code(400).send({
									status: 400,
									msg: 'fail'
								});
							}
						} else {
							return res.code(200).send({
								status: 200,
								msg: "Success",
								likeCount: (results[1].length > 0) ? results[1][0].zktor_reel_like_count : 0
							});
						}
					} else {
						if (results[1].length > 0) {
							var count = 0;
							if (results[1][0].zktor_reel_like_count > 0) {
								count = results[1][0].zktor_reel_like_count - 1;
							}
							var d = {
								zktor_reel_like_count: count
							};
							db.query(`UPDATE tbl_zktor_reel SET ? where zktor_reel_id= ?`, [d, req.query.zktor_reel_id], function(error, results_update, fields) {
								if (error) {

								} else {}
							});
							db.query(`DELETE from tbl_zktor_reel_like where zktor_reel_id=? and zktor_reel_user_id = ?`, [req.query.zktor_reel_id, req.query.zktor_reel_user_id], function(error, results, fields) {
								if (error) {
									return res.code(400).send({
										status: 400,
										msg: "fail"
									});
								} else {
									return res.code(200).send({
										status: 200,
										msg: "Success",
										likeCount: count
									});
								}
							});

						} else {
							return res.code(400).send({
								status: 400,
								msg: 'fail'
							});
						}
					}
				}
			});

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail"
			});
		}

	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.reel_view = async (req, res) => {
	try {
		if (req.query.zktor_reel_user_id && req.query.zktor_reel_id) {
			db.query(`select * From tbl_zktor_reel_view where zktor_reel_user_id= ? and zktor_reel_id=?; select * From tbl_zktor_reel where zktor_reel_id= ?`, [req.query.zktor_reel_user_id, req.query.zktor_reel_id, req.query.zktor_reel_id], function(error, results, fields) {
				if (error) {
					return res.code(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results[0].length <= 0) {
						if (results[1].length > 0) {
							var count = results[1][0].zktor_reel_view_count + 1;
							var d = {
								zktor_reel_view_count: count
							};
							db.query(`UPDATE tbl_zktor_reel SET ? where zktor_reel_id= ?`, [d, req.query.zktor_reel_id], function(error, results_update, fields) {
								if (error) {

								} else {}
							});
							delete(req.query.flag);
							db.query(`INSERT INTO tbl_zktor_reel_view SET ?`, req.query, function(error, results, fields) {
								if (error) {
									return res.code(400).send({
										status: 400,
										msg: "fail"
									});
								} else {
									return res.code(200).send({
										status: 200,
										msg: "Success",
										viewCount: count
									});
								}
							});
						} else {
							return res.code(400).send({
								status: 400,
								msg: 'fail'
							});
						}
					} else {
						return res.code(200).send({
							status: 200,
							msg: "Success",
							viewCount: (results[1].length > 0) ? results[1][0].zktor_reel_view_count : 0
						});
					}
				}
			});

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail"
			});
		}

	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.delete_reel = async (req, res) => {
	try {
		if (req.query.zktor_reel_user_id && req.query.zktor_reel_id) {
			db.query(`select * From tbl_zktor_reel where zktor_reel_id= ? and zktor_reel_user_id=?`, [req.query.zktor_reel_id, req.query.zktor_reel_user_id], function(error, results, fields) {
				if (error) {
					return res.code(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results.length > 0) {
						db.query(`DELETE FROM tbl_zktor_reel where zktor_reel_id=? and zktor_reel_user_id=?`, [req.query.zktor_reel_id, req.query.zktor_reel_user_id], function(error, results, fields) {
							if (error) {
								return res.code(400).send({
									status: 400,
									msg: "fail"
								});
							} else {
								return res.code(200).send({
									status: 200,
									msg: "Success"
								});
							}
						});
					} else {
						return res.code(400).send({
							status: 400,
							msg: "Record not found."
						});
					}
				}
			});

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail"
			});
		}

	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_follow_like = async (req, res) => {
	try {
		if (req.query.user_id && req.query.zktor_reel_id) {
			db.query(`select * From tbl_zktor_reel where zktor_reel_id=?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?`, [req.query.zktor_reel_id, req.query.user_id], function(error, results, fields) {
				if (error) {
					return res.code(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results[0].length > 0) {



						db.query(`select * From tbl_zktor_reel_followers where zktor_reel_id= ? and follower_user_id=?`, [req.query.zktor_reel_id, req.query.user_id], function(error, follow, fields) {
							if (error) {
								return res.code(400).send({
									status: 400,
									msg: "fail"
								});
							} else {}
							db.query(`select * From tbl_zktor_reel_like where zktor_reel_id= ? and zktor_reel_user_id=?`, [req.query.zktor_reel_id, req.query.user_id], function(error, like, fields) {
								if (error) {
									return res.code(400).send({
										status: 400,
										msg: "fail"
									});
								} else {

								}
								results[0][0].follow = follow.length;
								results[0][0].like = like.length;
								var result_data = results[0][0];
								//console.log(results[0][0]);
								var di = '0.0 km';
								var ti = '0 hours 0 mins';
								var flag = 2;
								if (results[1].length > 0) {
									var origin = result_data.cook_latitude + "," + result_data.cook_longitude;
									var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
									//console.log(destination);
									//console.log(origin);
									var request = require('request');
									var options = {
										'method': 'GET',
										'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=AIzaSyAbpbPIxJM9P79I8K3rng2euGKFIHfAKLQ',
										'headers': {}
									};
								} else {
									var origin = 00;
									var destination = 00;
									var request = require('request');
									var options = {
										'method': 'GET',
										'url': 'https://maps.googleaps.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=AIzaSyAbpPIxJM9P79I8K3rng2euGKFIHfAKLQ',
										'headers': {}
									};
								}
								request(options, function(error, response) {
									if (error) {} else {
										var data_distance = JSON.parse(response.body);
										if (data_distance.rows[0]) {
											if (data_distance.rows[0].elements[0].status == "OK") {
												// if ((Math.round(req.query.distance_range * 1000)) >= (Math.round(data_distance.rows[0].elements[0].distance.value))) {
												di = data_distance.rows[0].elements[0].distance.text;
												ti = data_distance.rows[0].elements[0].duration.text;
												//console.log(data_distance.rows[0].elements[0].distance.text);
												flag = 1;
												//}
											}
										}
									}
									results[0][0].distance = di;
									results[0][0].time = ti;
									return res.code(200).send({
										status: 200,
										msg: "Success",
										cookListWithLikeFollow: results[0][0]
									});
								});
								// } else {
								//     result_data.distance = di;
								//     result_data.time = ti;
								//     return res.code(200).send({
								//         status: 200,
								//         msg: "Success1",
								//         cookListWithLikeFollow: result_data
								//     });
								// }
							});

						});


					} else {
						return res.code(400).send({
							status: 400,
							msg: 'fail2'
						});
					}
				}

			});

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail"
			});
		}
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.zktor_reel_comments = async (req, res) => {
	try {
		var pagination = [];
		if (req.query.comment_zktor_reel_id && req.query.page_no) {
			var no_of_records_per_page = 10;
			var rowno = req.query.page_no;
			if (rowno != 0) {
				rowno = (rowno - 1) * no_of_records_per_page;
			}
			var comment = [];
			db.query(`SELECT * FROM tbl_zktor_reel_comment where comment_zktor_reel_id=? and comment_operation=? LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows FROM tbl_zktor_reel_comment where comment_zktor_reel_id=? and comment_operation=?`, [req.query.comment_zktor_reel_id, '0', no_of_records_per_page, rowno, req.query.comment_zktor_reel_id, '0'], function(error, results_comment, fields) {
				if (error) throw error;
				if (results_comment[0].length > 0) {
					Object.keys(results_comment[0]).forEach(function(key12, idx12, array12) {
						var results_comment_data = results_comment[0][key12];
						//console.log(res.totalfriendsList);
						db.query(`SELECT * FROM tbl_user_profile where user_id=?;SELECT reaction_comment_id, COUNT(*) as total FROM tbl_zktor_reel_comment_reaction WHERE reaction_comment_id = ? GROUP BY reaction_comment_id`, [results_comment_data.comment_user_id, results_comment_data.comment_id], function(error, results_comment1, fields) {
							if (error) throw error;
							if (results_comment1[0].length > 0) {
								results_comment_data.user_name = results_comment1[0][0].user_name;
								results_comment_data.user_profile_img = results_comment1[0][0].user_profile_img;
							} else {
								results_comment_data.user_name = '';
								results_comment_data.user_profile_img = '';
							}
							if (results_comment1[1].length > 0)
								results_comment_data.reaction_count = results_comment1[1][0].total;
							else
								results_comment_data.reaction_count = 0;
							results_comment_data.is_friend = (res.totalfriendsList.includes(results_comment_data.comment_user_id)) ? "1" : "0";
							if (results_comment_data.created_date != '0000-00-00 00:00:00')
								results_comment_data.zktor_video_duration = timeAgo(new Date(results_comment_data.created_date).toISOString());
							else
								results_comment_data.zktor_video_duration = 'just now';
							comment.push(results_comment_data);
							if (idx12 === array12.length - 1) {
								let max_pages = parseInt(Math.ceil((results_comment[1][0].numrows) / no_of_records_per_page));
								if (req.query.page_no && req.query.page_no <= max_pages) {
									let page_no = req.query.page_no;

									// PAGINATION START

									let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
									//  let sliceData = final_array.slice(offset, offset + no_of_records_per_page)
									var pagination = {
										total_rows: results_comment[1][0].numrows,
										total_pages: parseInt(Math.ceil((results_comment[1][0].numrows) / no_of_records_per_page)),
										per_page: no_of_records_per_page,
										offset: offset,
										current_page_no: page_no
									};
									return res.code(200).send({
										status: 200,
										msg: "Success",
										commentListCount: results_comment[1][0].numrows,
										commentList: comment,
										pagination: pagination
									});
								} else {
									return res.code(404).send({
										status: 404,
										msg: "Page no missing or Its incorrect."
									});
								}
							}
						});
					});
				} else {
					return res.code(400).send({
						status: 400,
						msg: "fail"
					});
				}
			});

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail"
			});
		}
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_comment_reaction = async (req, res) => {
	try {
		if (req.query.comment_zktor_reel_id) {
			var comment = [];
			db.query(`SELECT * FROM tbl_zktor_reel_comment where comment_zktor_reel_id=? and comment_operation=?`, [req.query.comment_zktor_reel_id, '0'], function(error, results_comment, fields) {
				if (error) throw error;
				if (results_comment.length > 0) {
					//console.log(timeAgo(new Date('2022-02-22 07:12:49').toISOString()));
					Object.keys(results_comment).forEach(function(key12, idx12, array12) {
						var results_comment_data = results_comment[key12];
						//console.log(res.totalfriendsList);
						db.query(`SELECT * FROM tbl_user_profile where user_id=?;SELECT reaction_comment_id, COUNT(*) as total FROM tbl_zktor_reel_comment_reaction WHERE reaction_comment_id = ? GROUP BY reaction_comment_id`, [results_comment_data.comment_user_id, results_comment_data.comment_id], function(error, results_comment1, fields) {
							if (error) throw error;
							if (results_comment1[0].length > 0) {
								results_comment_data.user_name = results_comment1[0][0].user_name;
								results_comment_data.user_profile_img = results_comment1[0][0].user_profile_img;
							} else {
								results_comment_data.user_name = '';
								results_comment_data.user_profile_img = '';
							}
							if (results_comment1[1].length > 0)
								results_comment_data.reaction_count = results_comment1[1][0].total;
							else
								results_comment_data.reaction_count = 0;
							results_comment_data.is_friend = (res.totalfriendsList.includes(results_comment_data.comment_user_id)) ? "1" : "0";
							if (results_comment_data.created_date != '0000-00-00 00:00:00')
								results_comment_data.comment_ago = timeAgo(new Date(results_comment_data.created_date).toISOString());
							else
								results_comment_data.comment_ago = 'just now';
							comment.push(results_comment_data);
							if (idx12 === array12.length - 1) {
								return res.code(200).send({
									status: 200,
									msg: "Success",
									commentListCount: comment.length,
									commentList: comment
								});
							}
						});
					});
				} else {
					return res.code(400).send({
						status: 400,
						msg: "fail"
					});
				}
			});

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail"
			});
		}

	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_zktor_reel_comment = async (req, res) => {
	try {
		if (req.query.comment_zktor_reel_id) {
			var comment = [];
			db.query(`SELECT * FROM tbl_zktor_reel_comment where comment_zktor_reel_id=? and comment_operation=?`, [req.query.comment_zktor_reel_id, '0'], function(error, results_comment, fields) {
				if (error) throw error;
				if (results_comment.length > 0) {
					//console.log(timeAgo(new Date('2022-02-22 07:12:49').toISOString()));
					Object.keys(results_comment).forEach(function(key12, idx12, array12) {
						var results_comment_data = results_comment[key12];
						//console.log(res.totalfriendsList);
						db.query(`SELECT * FROM tbl_user_profile where user_id=?;SELECT reaction_comment_id, COUNT(*) as total FROM tbl_zktor_reel_comment_reaction WHERE reaction_comment_id = ? GROUP BY reaction_comment_id`, [results_comment_data.comment_user_id, results_comment_data.comment_id], function(error, results_comment1, fields) {
							if (error) throw error;
							if (results_comment1[0].length > 0) {
								results_comment_data.user_name = results_comment1[0][0].user_name;
								results_comment_data.user_profile_img = results_comment1[0][0].user_profile_img;
							} else {
								results_comment_data.user_name = '';
								results_comment_data.user_profile_img = '';
							}
							if (results_comment1[1].length > 0)
								results_comment_data.reaction_count = results_comment1[1][0].total;
							else
								results_comment_data.reaction_count = 0;
							results_comment_data.is_friend = (res.totalfriendsList.includes(results_comment_data.comment_user_id)) ? "1" : "0";
							if (results_comment_data.created_date != '0000-00-00 00:00:00')
								results_comment_data.comment_ago = timeAgo(new Date(results_comment_data.created_date).toISOString());
							else
								results_comment_data.comment_ago = 'just now';
							comment.push(results_comment_data);
							if (idx12 === array12.length - 1) {
								return res.code(200).send({
									status: 200,
									msg: "Success",
									commentListCount: comment.length,
									commentList: comment
								});
							}
						});
					});
				} else {
					return res.code(400).send({
						status: 400,
						msg: "fail"
					});
				}
			});

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail"
			});
		}
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.insert_follow_reel = async (req, res) => {
	try {
		if (req.query.reel_creator_user_id && req.query.reel_follower_user_id) {
			db.query(`select * From tbl_zktor_reel_followers where reel_creator_user_id= ? and reel_follower_user_id=?;`, [req.query.reel_creator_user_id, req.query.reel_follower_user_id], function(error, results, fields) {
				if (error) {
					return res.code(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results.length <= 0) {
						db.query(`INSERT INTO tbl_zktor_reel_followers SET ?`, req.query, function(error, results, fields) {
							if (error) {
								return res.code(400).send({
									status: 400,
									msg: "fail"
								});
							} else {
								return res.code(200).send({
									status: 200,
									msg: "Success"
								});
							}
						});

					} else {
						return res.code(200).send({
							status: 200,
							msg: "Success"
						});
					}
				}
			});

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail"
			});
		}

	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.save_reel = async (req, res) => {
	try {
		if (req.body) {
			db.query(`select * From tbl_zktor_reel_saved where reel_saved_user_id= ? and reel_id=?;`, [req.body.reel_saved_user_id, req.body.reel_id], function(error, results, fields) {
				if (error) {
					return res.code(400).send({
						status: 400,
						msg: "fail1"
					});
				} else {
					if (results.length <= 0) {
						db.query(`INSERT INTO tbl_zktor_reel_saved SET ?`, req.body, function(error, results, fields) {
							if (error) {
								return res.code(400).send({
									status: 400,
									msg: req.body
								});
							} else {
								return res.code(200).send({
									status: 200,
									msg: "Success"
								});
							}
						});

					} else {
						return res.code(200).send({
							status: 200,
							msg: "Duplicate"
						});
					}
				}
			});

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail3"
			});
		}

	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_saved_reels = async (req, res) => {
	try {
		var comment = [];
		if (req.query.reel_saved_user_id) {

			db.query(`SELECT * FROM tbl_zktor_reel_saved where reel_saved_user_id=?`, [req.query.reel_saved_user_id], function(error, results_comment, fields) {
				if (error) throw error;
				if (results_comment.length > 0) {
					Object.keys(results_comment).forEach(function(key12, idx12, array12) {
						var results_comment_data = results_comment[key12];
						results_comment_data.duration = timeAgo(new Date(results_comment_data.created_date).toISOString());
						//console.log(res.totalfriendsList);
						db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [results_comment_data.reel_saved_creator_id], function(error, results_comment1, fields) {
							if (error) throw error;
							if (results_comment1.length > 0) {
								results_comment_data.user_name = results_comment1[0].user_name;
								results_comment_data.user_profile_img = results_comment1[0].user_profile_img;

							} else {
								results_comment_data.user_name = '';
								results_comment_data.user_profile_img = '';
							}
							comment.push(results_comment_data);
							if (idx12 === array12.length - 1) {
								return res.code(200).send({
									status: 200,
									msg: "Success",
									savedListCount: comment.length,
									savedList: comment
								});
							}
						});
					});
				} else {
					return res.code(400).send({
						status: 400,
						msg: "fail",
						savedListCount: comment.length,
						savedList: comment
					});
				}
			});

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail",
				savedListCount: comment.length,
				savedList: comment
			});
		}
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.delete_saved_video = async (req, res) => {
	try {
		if (req.query.reel_saved_id) {
			db.query(`select * From tbl_zktor_reel_saved where reel_saved_id=? `, [req.query.reel_saved_id], function(error, results, fields) {
				if (error) {
					return res.code(400).send({
						status: 400,
						msg: "fail1"
					});
				} else {
					if (results.length > 0) {
						db.query(`DELETE FROM tbl_zktor_reel_saved where reel_saved_id=?`, [req.query.reel_saved_id], function(error, results, fields) {
							if (error) {
								return res.code(400).send({
									status: 400,
									msg: "fail2"
								});
							} else {
								return res.code(200).send({
									status: 200,
									msg: "Success"
								});
							}
						});
					} else {
						return res.code(400).send({
							status: 400,
							msg: "Record not found."
						});
					}
				}
			});

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail3"
			});
		}

	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.delete_follower = async (req, res) => {
	try {
		if (req.query.reel_creator_user_id && req.query.reel_follower_user_id) {
			db.query(`select * From tbl_zktor_reel_followers where reel_creator_user_id=? and reel_follower_user_id=? `, [req.query.reel_creator_user_id, req.query.reel_follower_user_id], function(error, results, fields) {
				if (error) {
					return res.code(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results.length > 0) {
						db.query(`DELETE FROM tbl_zktor_reel_followers where reel_creator_user_id=? and reel_follower_user_id=?`, [req.query.reel_creator_user_id, req.query.reel_follower_user_id], function(error, results, fields) {
							if (error) {
								return res.code(400).send({
									status: 400,
									msg: "fail"
								});
							} else {
								return res.code(200).send({
									status: 200,
									msg: "Success"
								});
							}
						});
					} else {
						return res.code(400).send({
							status: 400,
							msg: "Record not found."
						});
					}
				}
			});

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail"
			});
		}

	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_zktor_reel_followers = async (req, res) => {
	try {
		var comment = [];
		if (req.query.reel_creator_user_id) {

			db.query(`SELECT * FROM tbl_zktor_reel_followers where reel_creator_user_id=?`, [req.query.reel_creator_user_id], function(error, results_comment, fields) {
				if (error) throw error;
				if (results_comment.length > 0) {
					Object.keys(results_comment).forEach(function(key12, idx12, array12) {
						var results_comment_data = results_comment[key12];
						//console.log(res.totalfriendsList);
						db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [results_comment_data.reel_follower_user_id], function(error, results_comment1, fields) {
							if (error) throw error;
							if (results_comment1.length > 0) {
								results_comment_data.user_name = results_comment1[0].user_name;
								results_comment_data.user_profile_img = results_comment1[0].user_profile_img;
							} else {
								results_comment_data.user_name = '';
								results_comment_data.user_profile_img = '';
							}
							comment.push(results_comment_data);
							if (idx12 === array12.length - 1) {
								return res.code(200).send({
									status: 200,
									msg: "Success",
									followerListCount: comment.length,
									followerList: comment
								});
							}
						});
					});
				} else {
					return res.code(400).send({
						status: 400,
						msg: "fail",
						followerListCount: comment.length,
						followerList: comment
					});
				}
			});

		} else {
			return res.code(400).send({
				status: 400,
				msg: "fail",
				followerListCount: comment.length,
				followerList: comment
			});
		}
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};