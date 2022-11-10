const fs = require('fs');
const db = require("../../config/connection");
const request = require('request');
const {
	getVideoDurationInSeconds
} = require('get-video-duration')
const multer = require('fastify-multer');
const crypto = require("crypto");
const mail = require("../../config/mailer");
const {
	exec
} = require("child_process");
var path = require('path')
// UPLOAD FILE CONFIUGRATION
var job = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, '../uploads/job_company_image/');
	},
	filename: function(req, file, cb) {
		cb(null, "job_company_image_" + crypto.createHash('md5').update('1903332cf4ced82311a949443e04f7').digest('hex') + Date.now() + path.extname(file.originalname));
	}
});
var csv = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, '../uploads/user_cv/');
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname);
	}
});
exports.create_job = async (req, res) => {
	try {
		let upload = multer({
			storage: job,
		}).fields([{
			name: 'job_company_image',
			maxCount: 20
		}]);
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: err
				});
			} else {
				if (req.body.job_title) {
					////console.log(req.files);
					var i = 0;
					var job_company_image = [];
					var totalfriendsList = [];
					var job_company_image_type = '';
					if (typeof req.files.job_company_image !== 'undefined') {
						Object.keys(req.files.job_company_image).forEach(function(key, idx1, array1) {
							var result_file = req.files.job_company_image[key];
							job_company_image.push(define.BASE_URL + "job_company_image/" + result_file.filename);
							if (idx1 === array1.length - 1) {
								req.body.job_company_image = job_company_image.toString();
							}

						});
					}
					db.query(`INSERT INTO tbl_job_create SET ?`, req.body, function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							if (req.body.job_user_id) {
								db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [req.body.job_user_id, req.body.job_user_id, '1'], function(error, results12, fields) {
									if (error) {
										return res.status(200).send({
											status: 200,
											msg: "Success"

										});
									} else {

										if (results12.length > 0) {
											var final_array = [];
											var totalfriendsList = [];
											Object.keys(results12).forEach(function(key) {
												var result = results12[key];
												if (req.body.job_user_id == result.receiver_user_id) {
													final_array.push(result.sender_user_id);
												} else if (req.body.job_user_id == result.sender_user_id) {
													final_array.push(result.receiver_user_id);
												}
											});
											//console.log(final_array);
											totalfriendsList = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
											//console.log(totalfriendsList);
											totalfriendsList.forEach((element, index, array) => {
												db.query(`SELECT * from tbl_user_profile where user_id=? `, [element], function(error, results68, fields) {
													if (error) throw error;
													if (results68.length > 0) {

														var options = {
															'method': 'POST',
															'url': 'https://fcm.googleapis.com/fcm/send',
															'headers': {
																'Authorization': 'key=AAAAWRGw03M:APA91bETShIEhgnkyCStvphR_OAZ72XaUx_Quj3TgdB7CexvvhFx9REavNhecH35uIi-0N5CAXuT4B71CFpSyHLJEpY93TPgAjEVAMBJfjU_hCEdS7_ah2-ziKVryMchyfJ1btrvyGou',
																'Content-Type': 'application/json'
															},
															body: JSON.stringify({
																"to": "/topics/" + results68[0].user_register_id,
																"data": {
																	"title": "Zktor Job",
																	"body": "Company Name - " + (req.body.job_company_name) ? req.body.job_company_name : " " + " Description - " + (req.body.job_description) ? req.body.job_description : " " + " Job Title" + (req.body.job_title) ? req.body.job_title : " "
																}
															})

														};
														request(options, function(error, response) {
															if (error) throw new Error(error);
															//console.log(element);
															//console.log(response.body);
														});

													}
												});
											});

										}
										return res.status(200).send({
											status: 200,
											msg: "Success"

										});
									}

								});
							} else {
								return res.status(200).send({
									status: 200,
									msg: "Success"

								});
							}
						}
					});

				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail11"
					});
				}
			}
		});
	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;

		return res.status(400).send({
			status: 400,
			error: errorName,
			msg: errorMessage

		});
	}
};
exports.report_job = async (req, res) => {
	try {
		let upload = multer({
			storage: job,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.job_user_id) {
					db.query(`INSERT INTO tbl_job_report SET ?`, req.body, function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								job_report_id: results.insertId
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
exports.hide_job_user = async (req, res) => {
	try {
		let upload = multer({
			storage: job,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.job_hide_user_id) {
					db.query(`INSERT INTO tbl_job_hide SET ?`, req.body, function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								job_hide_id: results.insertId
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
exports.shortlist_job = async (req, res) => {
	try {
		let upload = multer({
			storage: job,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.job_shortlist_user_id) {
					if (req.body.check_status && req.body.check_status == '1') {

						delete(req.body.check_status);
						db.query(`INSERT INTO tbl_job_shortlist SET ?`, req.body, function(error, results, fields) {
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
					} else if (req.body.check_status && req.body.check_status == '0') {
						db.query(`DELETE FROM tbl_job_shortlist where job_shortlist_user_id=? AND job_shortlist_job_id=?`, [req.body.job_shortlist_user_id, req.body.job_shortlist_job_id], function(error, results, fields) {
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
exports.delete_job = async (req, res) => {
	try {
		if (req.query.job_id) {
			db.query(`SELECT * from tbl_job_create where job_id=? `, [req.query.job_id], function(error, results1, fields) {
				if (error) throw error;
				if (results1.length > 0) {
					db.query(`delete from tbl_job_create where job_id= ?`, [req.query.job_id], function(error, results, fields) {
						if (error) {

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
exports.get_job = async (req, res) => {
	try {
		if (req.query.job_id) {
			db.query(`SELECT * from tbl_job_create where job_id=? `, [req.query.job_id], function(error, results1, fields) {
				if (error) throw error;
				if (results1.length > 0) {
					return res.status(200).send({
						status: 200,
						msg: "Success",
						createJobList: results1[0]
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
exports.get_all_expired = async (req, res) => {
	try {
		if (req.query.job_user_id) {
			db.query(`SELECT * FROM tbl_job_create where job_user_id=?`, [req.query.job_user_id], function(error, results, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {

					if (results.length > 0) {
						var regular = [];
						var expired = [];
						var closed = [];
						var totalfriendsList = [];
						Object.keys(results).forEach(function(key, index, array) {
							var result = results[key];
							if (result.Job_expire_date != null && result.job_hide_flag == 1) {
								var date2 = new Date().toISOString().split("T")[0];
								date1 = result.Job_expire_date.split('-');
								date2 = date2.split('-');
								date1 = new Date(date1[0], date1[1], date1[2]);
								date2 = new Date(date2[0], date2[1], date2[2]);
								date1_unixtime = parseInt(date1.getTime() / 1000);
								date2_unixtime = parseInt(date2.getTime() / 1000);

								if (date1_unixtime >= date2_unixtime) {
									regular.push(result);
								} else {
									expired.push(result);
								}
							} else if (result.job_hide_flag == 1) {
								regular.push(result);
							} else {
								closed.push(result);
							}
							if (index === array.length - 1) {
								return res.status(200).send({
									status: 200,
									msg: "Success",
									expiredJobList: expired,
									validJobList: regular,
									closedJobList: closed
								});
							}
						});
					} else {

						return res.status(404).send({
							status: 404,
							msg: "Record not found"
						});

					}
				}
			});
		} else {
			return res.status(404).send({
				status: 404,
				msg: "Page no missing or Its incorrect"
			});
		}

	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.save_job = async (req, res) => {
	try {
		let upload = multer({
			storage: job,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.job_id && req.body.save_job_user_id) {
					db.query(`SELECT *  from tbl_job_save where save_job_user_id = ? AND job_id = ?`, [req.body.save_job_user_id, req.body.job_id], function(error, results1, fields) {
						if (error) throw error;
						if (results1.length <= 0) {
							db.query(`INSERT INTO tbl_job_save SET ?`, req.body, function(error, results, fields) {
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
							return res.status(422).send({
								status: 422,
								msg: "Record already exists"
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
exports.get_save_job = async (req, res) => {
	try {
		if (!req.query.save_job_user_id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`SELECT * FROM tbl_job_save  WHERE save_job_user_id = ?`, [req.query.save_job_user_id], function(error, results, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results.length > 0) {
						var final_array1 = [];
						var cc = 0;
						Object.keys(results).forEach(function(key, idx, array) {
							var result_data = results[key];
							db.query(`SELECT * FROM tbl_job_create inner join tbl_job_save on  tbl_job_create.job_id=tbl_job_save.job_id WHERE tbl_job_create.job_id = ?`, [result_data.job_id], function(err, rows, fields) {
								if (err) {
									return res.status(400).send({
										status: 400,
										msg: err
									});
								} else {
									if (rows.length > 0) {
										final_array1.push(rows[0]);

										if (idx === array.length - 1) {
											return res.status(200).send({
												status: 200,
												msg: "Success",
												saveJobListCount: final_array1.length,
												saveJobList: final_array1
											});
										}
									} else {
										if (idx === array.length - 1) {
											return res.status(200).send({
												status: 200,
												msg: "Success",
												saveJobListCount: final_array1.length,
												saveJobList: final_array1
											});
										}
									}
								}
							});
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
exports.get_company_job = async (req, res) => {
	try {
		db.query(`SELECT * from tbl_job_company_name `, function(error, results1, fields) {
			if (error) throw error;
			if (results1.length > 0) {
				return res.status(200).send({
					status: 200,
					msg: "Success",
					companyJobAllListCount: results1.length,
					companyJobAllList: results1
				});
			} else {
				return res.status(400).send({
					status: 400,
					msg: "Record not found"
				});
			}
		});
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.add_company_job = async (req, res) => {
	try {
		let upload = multer({
			storage: job,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.job_company_name) {
					db.query(`INSERT INTO tbl_job_company_name SET ?`, req.body, function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								job_company_id: results.insertId
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
exports.add_share_job = async (req, res) => {
	try {
		let upload = multer({
			storage: job,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.user_id) {
					db.query(`INSERT INTO tbl_job_share SET ?`, req.body, function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								share_job_id: results.insertId
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
exports.get_share_job = async (req, res) => {
	try {
		if (req.query.job_id) {
			db.query(`SELECT * from tbl_job_share where job_id=? `, [req.query.job_id], function(error, results1, fields) {
				if (error) throw error;
				if (results1.length > 0) {
					var final = [];
					Object.keys(results1).forEach(function(key, index, array) {
						var result = results1[key];
						db.query(`SELECT * from tbl_user_profile where user_id=? `, [result.user_id], function(error, results12, fields) {
							if (error) throw error;
							if (results12.length > 0) {
								result.user_name = results12[0].user_name;
								result.user_profile_img = results12[0].user_profile_img;
							} else {
								result.user_name = '';
								result.user_profile_img = '';
							}
							final.push(result);
							if (index === array.length - 1) {
								return res.status(200).send({
									status: 200,
									msg: "Success",
									shareJobCount: final.length,
									shareJobList: final
								});
							}
						});
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
exports.delete_save_job = async (req, res) => {
	try {
		if (req.query.save_job_id) {
			db.query(`SELECT * from tbl_job_save where save_job_id=? `, [req.query.save_job_id], function(error, results1, fields) {
				if (error) throw error;
				if (results1.length > 0) {
					db.query(`delete from tbl_job_save where save_job_id= ?`, [req.query.save_job_id], function(error, results, fields) {
						if (error) {

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
exports.delete_save_job_with_user = async (req, res) => {
	try {
		if (req.query.job_id && req.query.save_job_user_id) {
			db.query(`SELECT * from tbl_job_save where job_id=? AND save_job_user_id=?`, [req.query.job_id, req.query.save_job_user_id], function(error, results1, fields) {
				if (error) throw error;
				if (results1.length > 0) {
					db.query(`delete from tbl_job_save where job_id= ? AND save_job_user_id=?`, [req.query.job_id, req.query.save_job_user_id], function(error, results, fields) {
						if (error) {

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
exports.job_comment = async (req, res) => {
	try {
		let upload = multer({
			storage: job,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.job_id && req.body.job_comment_user_id && req.body.job_comment_msg) {
					db.query(`INSERT INTO tbl_job_comment SET ?;SELECT * FROM tbl_user_profile where user_id=?`, [req.body, req.body.job_comment_user_id], function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								job_comment_id: results[0].insertId.toString(),
								job_comment_msg: req.body.job_comment_msg,
								user_name: (results[1].length > 0) ? results[1][0].user_name : '',
								user_profile_img: (results[1].length > 0) ? results[1][0].user_profile_img : '',
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
exports.add_job_comment_reply = async (req, res) => {
	try {
		let upload = multer({
			storage: job,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.comment_reply_user_id && req.body.comment_id && req.body.comment_reply) {
					db.query(`INSERT INTO tbl_job_comment_reply SET ?`, req.body, function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							db.query(`SELECT * from tbl_user_profile where user_id = ?`, [req.body.comment_reply_user_id], function(error, resultsData, fields) {
								return res.status(200).send({
									status: 200,
									msg: "Success",
									comment_reply_id: results.insertId,
									comment_reply: req.body.comment_reply,
									user_name: (resultsData.length > 0) ? resultsData[0].user_name : '',
									user_profile_img: (resultsData.length > 0) ? resultsData[0].user_profile_img : ''
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
			}
		});
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.appliers_job = async (req, res) => {
	try {
		if (req.query.job_id) {
			var array_f = [];
			db.query(`SELECT * from tbl_job_submit where submit_job_id=? `, [req.query.job_id], function(error, results1, fields) {
				if (error) {} else {
					if (results1.length > 0) {
						Object.keys(results1).forEach(function(key, idx1, array1) {
							var result_file = results1[key];
							db.query(`SELECT * from tbl_job_shortlist where job_shortlist_job_id=? and job_shortlist_user_id=?`, [req.query.job_id, result_file.submit_user_id], function(error, results11, fields) {
								if (error) {} else {
									if (results11.length <= 0) {
										array_f.push(result_file);
									}
									if (idx1 === array1.length - 1) {
										return res.status(200).send({
											status: 200,
											msg: "Success",
											applierJob: array_f
										});
									}
								}
							});
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
exports.send_mail = async (req, res) => {
	try {
		let upload = multer({
			storage: job,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.user_ids && req.body.creator_id && req.body.job_id && req.body.text && req.body.schedule_date) {
					//console.log(req.body);
					db.query(`SELECT * from tbl_user_profile where user_id = ?;SELECT * from tbl_job_create where job_id = ?`, [req.body.creator_id, req.body.job_id], function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							if (results[0].length > 0 && results[1].length > 0) {
								var totalfriendsList = req.body.user_ids.split(',');
								//console.log(req.body.user_ids);
								//console.log(totalfriendsList);
								totalfriendsList.forEach((element, index, array) => {
									//console.log(element);
									db.query(`SELECT * from tbl_user_profile where user_id = ?`, [element], function(error, results1, fields) {
										if (error) {
											return res.status(400).send({
												status: 400,
												msg: "fail1"
											});
										} else {
											if (results1.length > 0) {
												res.render('../views/jobNotification.ejs', {
													user_name: results1[0].user_name,
													job_title: results[1][0].job_title,
													job_role: results[1][0].job_role,
													job_skills: results[1][0].job_skills,
													job_max_package: results[1][0].job_max_package,
													job_description: results[1][0].job_description,
													job_city: results[1][0].job_city,
													job_state: results[1][0].job_state,
													job_country: results[1][0].job_country,
													job_city: results[1].job_city,
													job_min_package: results[1][0].job_min_package,
													job_company_name: results[1][0].job_company_name,
													cuser_name: results[0][0].user_name,
													cuser_email: results[0][0].user_email,
													schedule_date: req.body.schedule_date
												}, function(err, html) {
													if (err) {
														return res.status(400).send({
															status: 400,
															msg: err
														});
													} else {
														mail.sendMail('ZKTOR JOB NOTIFICATION <' + results[0][0].user_email + '>', results1[0].user_email, html, 'ZKTOR JOB NOTIFICATION');
														if (index === array.length - 1) {
															return res.status(200).send({
																status: 200,
																msg: "Success"
															});
														}
													}
												});
											} else {
												return res.status(404).send({
													status: 404,
													msg: "No Record Found"
												});
											}
										}
									});
								});
							} else {
								return res.status(404).send({
									status: 404,
									msg: "No Record Found"
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
exports.get_user_job = async (req, res) => {
	try {
		if (req.query.user_id) {

			var comment_re = [];
			db.query(`SELECT * FROM tbl_job_create WHERE job_user_id = ?`, [req.query.user_id], function(error, results_comment_re, fields) {
				if (error) throw error;
				if (results_comment_re.length > 0) {
					Object.keys(results_comment_re).forEach(function(key_re, idx_re, array_re) {
						var results_data = results_comment_re[key_re];
						db.query(`SELECT  COUNT(*) AS numrows FROM tbl_job_save where save_job_user_id=? and job_id=?;SELECT  COUNT(*) AS numrows  FROM tbl_job_share where job_id=?;SELECT  COUNT(*) AS numrows  FROM tbl_job_comment where job_id=?;SELECT  COUNT(*) AS numrows  FROM tbl_job_like where like_job_id=? and like_user_id=?`, [req.query.user_id, results_data.job_id, results_data.job_id, results_data.job_id, results_data.job_id, req.query.user_id], function(error, results_comment_reply, fields) {
							if (error) throw error;

							results_data.is_in_save_list = (results_comment_reply[0][0].numrows > 0) ? 1 : 0;
							results_data.is_in_liked_job = (results_comment_reply[3][0].numrows > 0) ? 1 : 0;
							results_data.share_count = results_comment_reply[1][0].numrows;
							results_data.comment_count = results_comment_reply[2][0].numrows;
							if (results_data.job_hide_flag == 1 && results_data.Job_expire_date != '') {
								var date1 = new Date();
								var date2 = new Date(results_data.Job_expire_date);
								if (date1.getTime() <= date2.getTime()) {
									comment_re.push(results_data);
								}

							} else if (results_data.job_hide_flag == 1) {
								comment_re.push(results_data);
							}
							if (idx_re === array_re.length - 1) {

								return res.status(200).send({
									status: 200,
									msg: "Success",
									userJobAllListCount: comment_re.length,
									userJobAllList: comment_re
								});
							}

						});
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
exports.get_comment = async (req, res) => {
	try {
		if (req.query.job_id) {
			var comment = [];
			db.query(`SELECT * FROM tbl_job_comment where job_id=?`, [req.query.job_id], function(error, results_comment, fields) {
				if (error) throw error;
				if (results_comment.length > 0) {
					Object.keys(results_comment).forEach(function(key12, idx12, array12) {
						var results_comment_data = results_comment[key12];
						db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [results_comment_data.job_comment_user_id], function(error, results_comment1, fields) {
							if (error) throw error;
							if (results_comment1.length > 0) {
								results_comment_data.user_name = results_comment1[0].user_name;
								results_comment_data.user_profile_img = results_comment1[0].user_profile_img;
							} else {
								results_comment_data.user_name = '';
								results_comment_data.user_profile_img = '';
							}
							var comment_re = [];
							var k = 0;
							db.query(`SELECT * FROM tbl_job_comment_reply where comment_id=? `, [results_comment_data.job_comment_id], function(error, results_comment_re, fields) {
								if (error) throw error;
								if (results_comment_re.length <= 0) {
									k = 1;
									results_comment_re[0] = {
										comment_reply_id: '',
										comment_id: '',
										comment_reply: '',
										comment_reply_user_id: '',
										created_date: '',
										modified_date: ''
									};
								}
								if (results_comment_re.length > 0) {
									Object.keys(results_comment_re).forEach(function(key_re, idx_re, array_re) {
										var results_comment_reply_data = results_comment_re[key_re];
										db.query(`SELECT * FROM tbl_user_profile where user_id=?`, [results_comment_reply_data.comment_reply_user_id, results_comment_reply_data.comment_reply_id], function(error, results_comment_reply, fields) {
											if (error) throw error;
											if (results_comment_reply.length > 0) {
												results_comment_reply_data.user_name = results_comment_reply[0].user_name;
												results_comment_reply_data.user_profile_img = results_comment_reply[0].user_profile_img;
											} else {
												results_comment_reply_data.user_name = '';
												results_comment_reply_data.user_profile_img = '';
											}
											comment_re.push(results_comment_reply_data);
											if (idx_re === array_re.length - 1) {
												if (k == 0)
													results_comment_data.comment_replies = comment_re;
												else
													results_comment_data.comment_replies = [];
												comment.push(results_comment_data);
												if (idx12 === array12.length - 1) {
													return res.status(200).send({
														status: 200,
														msg: "Success",
														jobCommentListCount: comment.length,
														jobCommentList: comment
													});
												}
											}

										});
									});
								} else {
									results_comment_data.comment_replies = [];
									comment.push(results_comment_data);
									if (idx12 === array12.length - 1) {
										return res.status(200).send({
											status: 200,
											msg: "Success",
											commentListCount: comment.length,
											commentList: comment
										});
									}
								}

							});
						});
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
exports.get_job_comment_reply = async (req, res) => {
	try {
		if (req.query.comment_id) {
			var comment_re = [];
			db.query(`SELECT * FROM tbl_job_comment_reply where comment_id=?`, [req.query.comment_id], function(error, results_comment_re, fields) {
				if (error) throw error;
				if (results_comment_re.length > 0) {
					Object.keys(results_comment_re).forEach(function(key_re, idx_re, array_re) {
						var results_comment_reply_data = results_comment_re[key_re];
						db.query(`SELECT * FROM tbl_user_profile where user_id=?`, [results_comment_reply_data.comment_reply_user_id, results_comment_reply_data.comment_reply_id], function(error, results_comment_reply, fields) {
							if (error) throw error;
							if (results_comment_reply.length > 0) {
								results_comment_reply_data.user_name = results_comment_reply[0].user_name;
								results_comment_reply_data.user_profile_img = results_comment_reply[0].user_profile_img;
							} else {
								results_comment_reply_data.user_name = '';
								results_comment_reply_data.user_profile_img = '';
							}
							comment_re.push(results_comment_reply_data);
							if (idx_re === array_re.length - 1) {

								return res.status(200).send({
									status: 200,
									msg: "Success",
									commentReplyListCount: comment_re.length,
									commentReplyList: comment_re
								});
							}

						});
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
exports.job_like = async (req, res) => {
	try {
		if (req.query.like_user_id && req.query.job_id) {
			db.query(`select * From tbl_job_like where like_user_id= ? and like_job_id=?; select * From tbl_job_create where job_id= ?`, [req.query.like_user_id, req.query.job_id, req.query.job_id], function(error, results, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: error
					});
				} else {
					if (req.query.flag == 1) {
						if (results[0].length <= 0) {
							if (results[1].length > 0) {
								var count = results[1][0].job_like_count + 1;
								var d = {
									job_like_count: count
								};
								db.query(`UPDATE tbl_job_create SET ? where job_id= ?`, [d, req.query.job_id], function(error, results_update, fields) {
									if (error) {

									} else {}
								});
								req.query.like_job_id = req.query.job_id;
								delete(req.query.flag);
								delete(req.query.job_id);
								db.query(`INSERT INTO tbl_job_like SET ?`, req.query, function(error, results, fields) {
									if (error) {
										return res.status(400).send({
											status: 400,
											msg: "fail"
										});
									} else {
										return res.status(200).send({
											status: 200,
											msg: "Success",
											likeCount: count
										});
									}
								});
							} else {
								return res.status(400).send({
									status: 400,
									msg: 'fail'
								});
							}
						} else {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								likeCount: (results[1].length > 0) ? results[1][0].job_like_count : 0
							});
						}
					} else {
						if (results[1].length > 0) {
							var count = 0;
							if (results[1][0].job_like_count > 0) {
								count = results[1][0].job_like_count - 1;
							}
							var d = {
								job_like_count: count
							};
							db.query(`UPDATE tbl_job_create SET ? where job_id= ?`, [d, req.query.job_id], function(error, results_update, fields) {
								if (error) {

								} else {}
							});
							db.query(`DELETE from tbl_job_like where like_job_id=? and like_user_id = ?`, [req.query.job_id, req.query.like_user_id], function(error, results, fields) {
								if (error) {
									return res.status(400).send({
										status: 400,
										msg: "fail"
									});
								} else {
									return res.status(200).send({
										status: 200,
										msg: "Success",
										likeCount: count
									});
								}
							});

						} else {
							return res.status(400).send({
								status: 400,
								msg: 'fail'
							});
						}
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
exports.job_view = async (req, res) => {
	try {
		if (req.query.job_view_user_id && req.query.job_id) {
			db.query(`select * From tbl_job_view where job_view_user_id= ? and job_id=?; select * From tbl_job_create where job_id= ?`, [req.query.job_view_user_id, req.query.job_id, req.query.job_id], function(error, results, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results[0].length <= 0) {
						if (results[1].length > 0) {
							var count = results[1][0].job_view_count + 1;
							var d = {
								job_view_count: count
							};
							db.query(`UPDATE tbl_job_create SET ? where job_id= ?`, [d, req.query.job_id], function(error, results_update, fields) {
								if (error) {

								} else {}
							});
							delete(req.query.flag);
							db.query(`INSERT INTO tbl_job_view SET ?`, req.query, function(error, results, fields) {
								if (error) {
									return res.status(400).send({
										status: 400,
										msg: "fail"
									});
								} else {
									return res.status(200).send({
										status: 200,
										msg: "Success",
										viewCount: count
									});
								}
							});
						} else {
							return res.status(400).send({
								status: 400,
								msg: 'fail'
							});
						}
					} else {
						return res.status(200).send({
							status: 200,
							msg: "Success",
							viewCount: (results[1].length > 0) ? results[1][0].job_view_count : 0
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
exports.get_group_images = async (req, res) => {
	try {
		var comment_re = [];
		db.query(`SELECT * FROM tbl_group_image WHERE group_image_status = ?`, ['1'], function(error, results_comment_re, fields) {
			if (error) throw error;
			if (results_comment_re.length > 0) {
				Object.keys(results_comment_re).forEach(function(key_re, idx_re, array_re) {
					var results_data = results_comment_re[key_re];
					comment_re.push(results_data.group_image_url);
					if (idx_re === array_re.length - 1) {

						return res.status(200).send({
							status: 200,
							msg: "Success",
							groupImageListCount: comment_re.length,
							groupImageList: comment_re
						});
					}
				});
			} else {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			}

		});
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_shortlist_data = async (req, res) => {
	try {
		if (req.query.job_shortlist_job_id) {
			var comment_re = [];
			db.query(`SELECT * FROM tbl_job_shortlist where job_shortlist_job_id=?`, [req.query.job_shortlist_job_id], function(error, results_comment_re, fields) {
				if (error) throw error;
				if (results_comment_re.length > 0) {
					Object.keys(results_comment_re).forEach(function(key_re, idx_re, array_re) {
						var results_comment_reply_data = results_comment_re[key_re];
						db.query(`SELECT * FROM tbl_user_profile where user_id=?`, [results_comment_reply_data.job_shortlist_user_id], function(error, results_comment_reply, fields) {
							if (error) throw error;
							if (results_comment_reply.length > 0) {
								results_comment_reply_data.user_name = results_comment_reply[0].user_name;
								results_comment_reply_data.user_profile_img = results_comment_reply[0].user_profile_img;
								results_comment_reply_data.user_email = results_comment_reply[0].user_email;
							} else {
								results_comment_reply_data.user_name = '';
								results_comment_reply_data.user_profile_img = '';
								results_comment_reply_data.user_email = '';
							}
							comment_re.push(results_comment_reply_data);
							if (idx_re === array_re.length - 1) {

								return res.status(200).send({
									status: 200,
									msg: "Success",
									shortlistJobCount: comment_re.length,
									shortlistJob: comment_re
								});
							}

						});
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
exports.edit_job = async (req, res) => {
	try {
		let upload = multer({
			storage: job,
		}).fields([{
			name: 'job_company_image',
			maxCount: 20
		}]);
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: err
				});
			} else {
				if (req.body.job_id) {
					////console.log(req.files);
					var i = 0;
					var job_company_image = [];
					var totalfriendsList = [];
					var job_company_image_type = '';
					if (typeof req.files.job_company_image !== 'undefined') {
						Object.keys(req.files.job_company_image).forEach(function(key, idx1, array1) {
							var result_file = req.files.job_company_image[key];
							job_company_image.push(define.BASE_URL + "job_company_image/" + result_file.filename);
							if (idx1 === array1.length - 1) {
								req.body.job_company_image = job_company_image.toString();
							}

						});
					}
					var job_id = req.body.job_id;
					delete(req.body.job_id);
					db.query(`UPDATE tbl_job_create SET ? where job_id=?`, [req.body, job_id], function(error, results, fields) {
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
						msg: "fail11"
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
exports.get_all_job_search = async (req, res) => {
	try {
		if (req.query.user_id) {
			var comment_re = [];
			db.query(`SELECT * FROM tbl_job_create`, [], function(error, results_comment_re, fields) {
				if (error) throw error;
				if (results_comment_re.length > 0) {
					Object.keys(results_comment_re).forEach(function(key_re, idx_re, array_re) {
						var results_data = results_comment_re[key_re];
						db.query(`SELECT  COUNT(*) AS numrows FROM tbl_job_save where save_job_user_id=? and job_id=?;SELECT  COUNT(*) AS numrows  FROM tbl_job_share where job_id=?;SELECT  COUNT(*) AS numrows  FROM tbl_job_comment where job_id=?;SELECT  COUNT(*) AS numrows  FROM tbl_job_like where like_job_id=? and like_user_id=?`, [req.query.user_id, results_data.job_id, results_data.job_id, results_data.job_id, results_data.job_id, req.query.user_id], function(error, results_comment_reply, fields) {
							if (error) throw error;

							results_data.is_in_save_list = (results_comment_reply[0][0].numrows > 0) ? 1 : 0;
							results_data.is_in_liked_job = (results_comment_reply[3][0].numrows > 0) ? 1 : 0;
							results_data.share_count = results_comment_reply[1][0].numrows;
							results_data.comment_count = results_comment_reply[2][0].numrows;
							if (results_data.job_hide_flag == 1 && results_data.Job_expire_date != '') {
								var date1 = new Date();
								var date2 = new Date(results_data.Job_expire_date);
								if (date1.getTime() <= date2.getTime()) {
									comment_re.push(results_data);
								}

							} else if (results_data.job_hide_flag == 1) {
								comment_re.push(results_data);
							}
							if (idx_re === array_re.length - 1) {

								return res.status(200).send({
									status: 200,
									msg: "Success",
									createJobAllListCount: comment_re.length,
									createJobAllList: comment_re
								});
							}

						});
					});
				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail2"
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
exports.get_all_job = async (req, res) => {
	try {
		if (req.query.user_id && req.query.page_no) {
			var date2 = new Date().toISOString().split("T")[0];
			var no_of_records_per_page = 5;
			var rowno = req.query.page_no;
			if (rowno != 0) {
				rowno = (rowno - 1) * no_of_records_per_page;
			}
			var comment_re = [];
			if (req.query.search_string && req.query.search_string != '') {
				var kl = "%" + req.query.search_string + "%";
				var sql = db.query(`SELECT * FROM tbl_job_create where job_role LIKE ? and job_hide_flag=? and Job_expire_date >= ? order by job_id desc LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows  FROM tbl_job_create where job_role LIKE ? and job_hide_flag=? and Job_expire_date >= ?`, [kl, '1', date2, no_of_records_per_page, rowno, kl, '1', date2], function(error, results, fields) {
					if (error) throw error;
					//console.log(sql);
					if (results[0].length > 0) {
						Object.keys(results[0]).forEach(function(key_re, idx_re, array_re) {
							var results_data = results[0][key_re];
							db.query(`SELECT  COUNT(*) AS numrows FROM tbl_job_save where save_job_user_id=? and job_id=?;
                        SELECT  COUNT(*) AS numrows  FROM tbl_job_share where job_id=?;
                        SELECT  COUNT(*) AS numrows  FROM tbl_job_comment where job_id=?;
                        SELECT  COUNT(*) AS numrows  FROM tbl_job_like where like_job_id=? and like_user_id=?;
                        SELECT  COUNT(*) AS numrows  FROM tbl_job_submit where submit_job_id=? and submit_user_id=?`,
								[req.query.user_id, results_data.job_id,
									results_data.job_id,
									results_data.job_id,
									results_data.job_id, req.query.user_id,
									results_data.job_id, req.query.user_id
								],
								function(error, results_comment_reply, fields) {
									if (error) throw error;
									results_data.isApplied = (results_comment_reply[4][0].numrows > 0) ? 1 : 0;
									results_data.is_in_save_list = (results_comment_reply[0][0].numrows > 0) ? 1 : 0;
									results_data.is_in_liked_job = (results_comment_reply[3][0].numrows > 0) ? 1 : 0;
									results_data.share_count = results_comment_reply[1][0].numrows;
									results_data.comment_count = results_comment_reply[2][0].numrows;
									if (results_data.job_hide_flag == 1 && results_data.Job_expire_date != '') {
										var date1 = new Date();
										var date2 = new Date(results_data.Job_expire_date);
										if (date1.getTime() <= date2.getTime()) {
											comment_re.push(results_data);
										}

									} else if (results_data.job_hide_flag == 1) {
										comment_re.push(results_data);
									}
									if (idx_re === array_re.length - 1) {
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
											return res.status(200).send({
												status: 200,
												msg: "Success",
												searchCount: comment_re.length,
												createJobAllListCount: comment_re.length,
												createJobAllList: comment_re,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect."
											});
										}
									}

								});
						});
					} else {
						var sql = db.query(`SELECT * FROM tbl_job_create where job_hide_flag=? and Job_expire_date >= ? order by job_id desc LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows  FROM tbl_job_create where job_hide_flag=? and Job_expire_date >= ?`, ['1', date2, no_of_records_per_page, rowno, '1', date2], function(error, results, fields) {
							if (error) throw error;
							//console.log(sql);
							if (results[0].length > 0) {
								Object.keys(results[0]).forEach(function(key_re, idx_re, array_re) {
									var results_data = results[0][key_re];
									db.query(`SELECT  COUNT(*) AS numrows FROM tbl_job_save where save_job_user_id=? and job_id=?;
                        SELECT  COUNT(*) AS numrows  FROM tbl_job_share where job_id=?;
                        SELECT  COUNT(*) AS numrows  FROM tbl_job_comment where job_id=?;
                        SELECT  COUNT(*) AS numrows  FROM tbl_job_like where like_job_id=? and like_user_id=?;
                        SELECT  COUNT(*) AS numrows  FROM tbl_job_submit where submit_job_id=? and submit_user_id=?`,
										[req.query.user_id, results_data.job_id,
											results_data.job_id,
											results_data.job_id,
											results_data.job_id, req.query.user_id,
											results_data.job_id, req.query.user_id
										],
										function(error, results_comment_reply, fields) {
											if (error) throw error;
											results_data.isApplied = (results_comment_reply[4][0].numrows > 0) ? 1 : 0;
											results_data.is_in_save_list = (results_comment_reply[0][0].numrows > 0) ? 1 : 0;
											results_data.is_in_liked_job = (results_comment_reply[3][0].numrows > 0) ? 1 : 0;
											results_data.share_count = results_comment_reply[1][0].numrows;
											results_data.comment_count = results_comment_reply[2][0].numrows;
											// if (results_data.job_hide_flag == 1 && results_data.Job_expire_date != '') {
											//     var date1 = new Date();
											//     var date2 = new Date(results_data.Job_expire_date);
											//     if (date1.getTime() <= date2.getTime()) {
											//         comment_re.push(results_data);
											//     }

											// } else if (results_data.job_hide_flag == 1) {
											comment_re.push(results_data);
											// }
											if (idx_re === array_re.length - 1) {
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
													return res.status(200).send({
														status: 200,
														msg: "Success",
														searchCount: 0,
														createJobAllListCount: comment_re.length,
														createJobAllList: comment_re,
														pagination: pagination
													});
												} else {
													return res.status(404).send({
														status: 404,
														msg: "Page no missing or Its incorrect."
													});
												}
											}

										});
								});
							} else {
								return res.status(400).send({
									status: 400,
									msg: "fail2"
								});
							}

						});
					}

				});
			} else {
				var sql = db.query(`SELECT * FROM tbl_job_create where job_hide_flag=? and Job_expire_date >= ? order by job_id desc LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows  FROM tbl_job_create where job_hide_flag=? and Job_expire_date >= ?`, ['1', date2, no_of_records_per_page, rowno, '1', date2], function(error, results, fields) {
					if (error) throw error;
					console.log(sql.sql);
					if (results[0].length > 0) {
						Object.keys(results[0]).forEach(function(key_re, idx_re, array_re) {
							var results_data = results[0][key_re];
							db.query(`SELECT  COUNT(*) AS numrows FROM tbl_job_save where save_job_user_id=? and job_id=?;
                        SELECT  COUNT(*) AS numrows  FROM tbl_job_share where job_id=?;
                        SELECT  COUNT(*) AS numrows  FROM tbl_job_comment where job_id=?;
                        SELECT  COUNT(*) AS numrows  FROM tbl_job_like where like_job_id=? and like_user_id=?;
                        SELECT  COUNT(*) AS numrows  FROM tbl_job_submit where submit_job_id=? and submit_user_id=?`,
								[req.query.user_id, results_data.job_id,
									results_data.job_id,
									results_data.job_id,
									results_data.job_id, req.query.user_id,
									results_data.job_id, req.query.user_id
								],
								function(error, results_comment_reply, fields) {
									if (error) throw error;
									results_data.isApplied = (results_comment_reply[4][0].numrows > 0) ? 1 : 0;
									results_data.is_in_save_list = (results_comment_reply[0][0].numrows > 0) ? 1 : 0;
									results_data.is_in_liked_job = (results_comment_reply[3][0].numrows > 0) ? 1 : 0;
									results_data.share_count = results_comment_reply[1][0].numrows;
									results_data.comment_count = results_comment_reply[2][0].numrows;
									// if (results_data.job_hide_flag == 1 && results_data.Job_expire_date != '') {
									//     var date1 = new Date();
									//     var date2 = new Date(results_data.Job_expire_date);
									//     if (date1.getTime() <= date2.getTime()) {
									//         comment_re.push(results_data);
									//     }

									// } else if (results_data.job_hide_flag == 1) {
									comment_re.push(results_data);
									//}
									if (idx_re === array_re.length - 1) {
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
											return res.status(200).send({
												status: 200,
												msg: "Success",
												searchCount: 0,
												createJobAllListCount: results[1][0].numrows,
												createJobAllList: comment_re,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect."
											});
										}
									}

								});
						});
					} else {
						return res.status(400).send({
							status: 400,
							msg: "fail2"
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
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.submit_job = async (req, res) => {
	try {
		let upload = multer({
			storage: csv,
		}).single('submit_user_cv');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.submit_job_name) {
					if (typeof req.file !== 'undefined') {
						req.body.submit_user_cv = define.BASE_URL + "user_cv/" + req.file.filename;
						d = define.BASE_URL + "user_cv/" + req.file.filename;
					}
					req.body.submit_reference_id = "ZKTOR" + ((crypto.createHash('md5').update('1903332cf4ced82311a949443e04f7').digest('hex') + Date.now()).substring(0, 11)).toUpperCase();
					db.query(`INSERT INTO tbl_job_submit SET ?;SELECT * FROM tbl_user_profile where user_id=? `, [req.body, req.body.submit_user_id], function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							if (results[1].length > 0 && typeof req.file !== 'undefined') {
								db.query(`UPDATE tbl_user_profile SET ? where user_id=?`, [{
									user_cv: req.body.submit_user_cv
								}, req.body.submit_user_id], function(error, results12, fields) {
									if (error) {}
									return res.status(200).send({
										status: 200,
										msg: "Success",
										submit_id: results[0].insertId,
										submitJob: req.body.submit_reference_id
									});
								});
							} else {
								return res.status(200).send({
									status: 200,
									msg: "Success",
									submit_id: results[0].insertId,
									submitJob: req.body.submit_reference_id
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
exports.get_submit_job = async (req, res) => {
	try {
		if (req.query.submit_user_id) {
			db.query(`SELECT * from tbl_job_submit where submit_user_id=? `, [req.query.submit_user_id], function(error, results1, fields) {
				if (error) throw error;
				if (results1.length > 0) {
					return res.status(200).send({
						status: 200,
						msg: "Success",
						submitJobListCount: results1.length,
						submitJobList: results1
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