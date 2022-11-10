const fs = require('fs');
const db = require("../../config/connection");
const middleware = require("../../middleware/authentication");
const {
	getVideoDurationInSeconds
} = require('get-video-duration')
var bodyParser = require('body-parser');
const multer = require('fastify-multer');
const crypto = require("crypto");
var path = require('path');
var document = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, '../uploads/document/');
	},
	filename: function(req, file, cb) {
		cb(null, "document_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
	}
});
exports.add_tagged_friend = async (req, res) => {
	try {
		let upload = multer({
			storage: document,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.tagged_user_id) {
					db.query(`INSERT INTO tbl_tagged_friend SET ?`, req.body, function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							console.log(results);
							return res.status(200).send({
								status: 200,
								msg: "Success",
								taggedFriendId: results.insertId
							});
						}
					});
				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail",
						taggedFriendId: 0
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
exports.add_visiting = async (req, res) => {
	try {
		let upload = multer({
			storage: document,
		}).single('');
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.visiting_user_id) {
					db.query(`INSERT INTO tbl_visiting_place SET ?`, req.body, function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							console.log(results);
							return res.status(200).send({
								status: 200,
								msg: "Success",
								visitingPlaceId: results.insertId
							});
						}
					});
				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail",
						visitingPlaceId: 0
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
exports.get_visiting = async (req, res) => {
	try {
		if (req.query.user_id) {
			{

				db.query(`SELECT * From tbl_visiting_place where visiting_user_id = ? AND visiting_delete_status=? `, [req.query.user_id, '0'], function(error, results, fields) {
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
								visitingList: results
							});
						} else {
							return res.status(404).send({
								status: 404,
								msg: "Record not found",
								visitingList: []
							});
						}
					}
				});
			}
		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail1",
				visitingList: []
			});
		}

	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.delete_visiting_list = async (req, res) => {
	try {
		if (req.query.user_id) {
			db.query(`SELECT *  from tbl_visiting_place where visiting_user_id = ?  AND visiting_delete_status =?`, [req.query.user_id, '0'], function(error, results1, fields) {
				if (error) throw error;

				if (results1.length > 0) {
					db.query(`update tbl_visiting_place SET visiting_delete_status =? where visiting_user_id = ? `, ['1', req.query.user_id], function(error, results, fields) {
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
					return res.status(409).send({
						status: 409,
						msg: "Record not found"
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
exports.delete_visiting_record = async (req, res) => {
	try {
		if (req.query.visiting_id) {

			db.query(`SELECT *  from tbl_visiting_place where visiting_id = ? AND visiting_delete_status =?`, [req.query.visiting_id, '0'], function(error, results1, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results1.length > 0) {
						db.query(`update tbl_visiting_place SET visiting_delete_status =? where visiting_id = ?`, ['1', req.query.visiting_id], function(error, results, fields) {
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
						return res.status(409).send({
							status: 409,
							msg: "Record not found"
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
exports.delete_document = async (req, res) => {
	try {
		if (req.query.document_id && req.query.user_id) {
			db.query(`SELECT *  from tbl_documents where document_id = ? AND user_id = ? AND document_delete =?`, [req.query.document_id, req.query.user_id, '0'], function(error, results1, fields) {
				if (error) throw error;
				if (results1.length > 0) {
					db.query(`update tbl_documents SET document_delete =? where document_id = ? AND user_id = ?`, ['1', req.query.document_id, req.query.user_id], function(error, results, fields) {
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
					return res.status(409).send({
						status: 409,
						msg: "Record not found"
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
exports.add_document = async (req, res) => {
	try {
		let upload = multer({
			storage: document,
		}).fields([{
			name: 'document_media',
			maxCount: 20
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
				if (req.body.user_id && req.body.document_folder_id) {
					var document_media = [];

					if (typeof req.files.document_media !== 'undefined') {
						Object.keys(req.files.document_media).forEach(function(key, idx1, array1) {
							var result_file = req.files.document_media[key];
							let video_file_path = result_file.path;

							let arr = {
								document_name: result_file.filename,
								document_url: define.BASE_URL + "document/" + result_file.filename,
								user_id: req.body.user_id,
								document_folder_id: req.body.document_folder_id
							};
							db.query(`INSERT INTO tbl_documents SET ?`, arr, function(error, results, fields) {
								if (error) {

								} else {
									document_media.push({
										id: results.insertId,
										image: define.BASE_URL + "document/" + result_file.filename
									});
									if (idx1 === array1.length - 1) {
										return res.status(200).send({
											status: 200,
											msg: "Success",
											document_media: document_media
										});
									}
								}
							});

						});
					} else {
						db.query(`INSERT INTO tbl_documents SET ?`, req.body, function(error, results, fields) {
							if (error) {
								return res.status(400).send({
									status: 400,
									msg: error
								});
							} else {
								return res.status(200).send({
									status: 200,
									msg: "Success",
									document_media: ""
								});
							}
						});
					}
				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail",
						document_media: ""
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
exports.get_document = async (req, res) => {
	try {
		if (req.query.user_id) {
			{
				db.query(`SELECT * From tbl_documents where user_id = ? AND document_delete=? `, [req.query.user_id, '0'], function(error, results, fields) {
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
								documentList: results
							});
						} else {
							return res.status(404).send({
								status: 404,
								msg: "Record not found",
								documentList: []
							});
						}

					}
				});
			}
		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail1",
				documentList: []
			});
		}

	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.add_document_folder = async (req, res) => {
	try {
		let upload = multer({
			storage: document,
		}).fields([{
			name: 'document_media',
			maxCount: 20
		}]);
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.user_id) {
					var document_media = [];
					db.query(`INSERT INTO tbl_documents_folder SET ?`, req.body, function(error, results, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								document_folder_id: results.insertId
							});
						}
					});
				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail",
						document_folder_id: 0
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
exports.get_document_folder = async (req, res) => {
	try {
		var final_array = [];
		if (req.query.user_id) {
			{

				db.query(`SELECT * From tbl_documents_folder where user_id = ? AND document_folder_delete =? `, [req.query.user_id, '0'], function(error, results, fields) {
					if (error) {
						return res.status(400).send({
							status: 400,
							msg: error
						});
					} else {
						if (results.length > 0) {
							Object.keys(results).forEach(function(key, idx, array) {
								var result123 = results[key];
								db.query(`SELECT * From tbl_documents where document_folder_id = ? AND document_delete=?`, [result123.document_folder_id, '0'], function(error, results_rat, fields) {
									if (error) {
										return res.status(400).send({
											status: 400,
											msg: error
										});
									} else {
										if (results_rat.length > 0)
											result123.document_list = results_rat;
										else
											result123.document_list = [];

										final_array.push(result123);
										if (idx == array.length - 1) {
											return res.status(200).send({
												status: 200,
												msg: "Success",
												documenFoldertListCount: final_array.length,
												documenFoldertList: final_array
											});
										}
									}
								});

							});
						} else {
							return res.status(404).send({
								status: 404,
								msg: "Record not found",
								documenFoldertListCount: final_array.length,
								documenFoldertList: final_array
							});
						}

					}
				});
			}
		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail1",
				documenFoldertListCount: final_array.length,
				documenFoldertList: final_array
			});
		}

	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.update_document_folder = async (req, res) => {
	try {
		let upload = multer({
			storage: document,
		}).fields([{
			name: 'document_media',
			maxCount: 20
		}]);
		upload(req, res, function(err) {
			if (err) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (req.body.document_folder_id) {
					var sql = db.query(`SELECT * FROM tbl_documents_folder where document_folder_id=? and document_folder_delete=?`, [req.body.document_folder_id, '0'], function(error, results_get, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "fail"
							});
						} else {
							console.log(sql.sql);
							if (results_get.length > 0) {
								var document_folder_id = req.body.document_folder_id;
								delete(req.body.document_folder_id);
								db.query(`UPDATE tbl_documents_folder SET ? where document_folder_id=?`, [req.body, document_folder_id], function(error, results, fields) {
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
									msg: "Record not found."
								});
							}
						}
					});
				} else {
					return res.status(400).send({
						status: 400,
						msg: "fail",
						document_folder_id: 0
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