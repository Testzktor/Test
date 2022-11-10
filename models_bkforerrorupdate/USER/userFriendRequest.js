const fastify = require('fastify')({
	logger: true
});
const db = require("../../config/connection");
const middleware = require("../../middleware/authentication");
var bodyParser = require('body-parser');
const merge = require('deepmerge');
var timeAgo = require('node-time-ago');
const multer = require('fastify-multer');
const crypto = require("crypto");
var path = require('path')

// UPLOAD FILE CONFIUGRATION
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, '../uploads/video/');
	},

	// By default, multer removes file extensions so let's add them back
	filename: function(req, file, cb) {
		cb(null, crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
	}
});
// END UPLOAD FILE CONFIUGRATION
exports.sent_list = async (req, res) => {
	try {
		if (!req.params.id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`SELECT * from tbl_friend_request where sender_user_id = ?`, [req.params.id], function(error, results, fields) {
				if (error) throw error;
				if (results.length > 0) {
					return res.status(200).send({
						status: 200,
						msg: "Success",
						sentRequestList: results
					});

				} else {
					return res.status(404).send({
						status: 404,
						msg: "No Record Found",
						sentRequestList: []
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
exports.receive_list = async (req, res) => {
	try {
		if (!req.params.id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`SELECT * from tbl_friend_request where receiver_user_id = ?`, [req.params.id], function(error, results, fields) {
				if (error) throw error;
				if (results.length > 0) {
					return res.status(200).send({
						status: 200,
						msg: "Success",
						receiveRequestList: results
					});

				} else {
					return res.status(404).send({
						status: 404,
						msg: "No Record Found",
						receiveRequestList: []
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
exports.accepted_list = async (req, res) => {
	try {
		if (!req.params.id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`SELECT * from tbl_friend_request where sender_user_id = ? AND request_status= ?`, [req.params.id, '1'], function(error, results, fields) {
				if (error) throw error;
				if (results.length > 0) {
					return res.status(200).send({
						status: 200,
						msg: "Success",
						acceptedRequestList: results
					});

				} else {
					return res.status(404).send({
						status: 404,
						msg: "No Record Found",
						acceptedRequestList: []
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
exports.cancel_list = async (req, res) => {
	try {
		if (!req.params.id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`SELECT * from tbl_friend_request where sender_user_id = ? AND request_status= ?`, [req.params.id, '0'], function(error, results, fields) {
				if (error) throw error;
				if (results.length > 0) {
					return res.status(200).send({
						status: 200,
						msg: "Success",
						cancelRequestList: results
					});

				} else {
					return res.status(404).send({
						status: 404,
						msg: "No Record Found",
						cancelRequestList: []
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
exports.pending_list = async (req, res) => {
	try {
		if (!req.params.id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`SELECT * from tbl_friend_request where sender_user_id = ? AND request_status= ?`, [req.params.id, '2'], function(error, results, fields) {
				if (error) throw error;
				if (results.length > 0) {
					return res.status(200).send({
						status: 200,
						msg: "Success",
						pendingRequestList: results
					});

				} else {
					return res.status(404).send({
						status: 404,
						msg: "No Record Found",
						pendingRequestList: []
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
exports.users_list = async (req, res) => {
	try {
		var final_array = [];
		if (req.query.user_id) {

		} else {
			req.query.user_id = '';
		}
		db.query(`SELECT user_id as id, user_name as name,user_profile_img as image , 'user' as type from tbl_user_profile where user_status = ? and user_id!=?;
    SELECT contructor_id as id, contructor_name as name,contructor_image as image , 'contructor' as type FROM tbl_bazar_contructor limit 50;
     SELECT cook_id as id, cook_name as name,cook_image as image , 'cook' as type FROM  tbl_bazar_cook limit 50;
      SELECT doctors_id as id, doctors_name as name,doctors_images as image , 'doctor' as type FROM tbl_bazar_doctor limit 50;
       SELECT health_care_id as id, health_care_name as name,health_care_images as image , 'health_care' as type FROM tbl_bazar_health_care limit 50;
        SELECT hotel_stay_id as id, hotel_stay_name as name,hotel_stay_images as image , 'hotel_stay' as type FROM tbl_bazar_hotel_stay limit 50;
         SELECT labour_id as id, labour_name as name,labour_image as image , 'labour' as type FROM tbl_bazar_labour limit 50;
          SELECT medicals_id as id, medicals_name as name,medicals_images as image , 'medicals' as type FROM tbl_bazar_medicals limit 50;
           SELECT play_school_id as id, play_school_name as name,play_school_images as image , 'play_school' as type FROM tbl_bazar_play_school limit 50;
            SELECT common_product_id as id, common_product_title as name,common_product_images as image , 'common_product' as type FROM tbl_bazar_product_buy_sell limit 50;
             SELECT rent_id as id, rent_title as name,rent_properties_images as image , 'rent' as type FROM tbl_bazar_rent limit 50;
              SELECT restaurants_id as id, restaurants_name as name,restaurants_images as image , 'restaurants' as type FROM tbl_bazar_restaurants limit 50;
              SELECT school_college_id as id, school_college_name as name,school_college_images as image , 'school_college' as type FROM tbl_bazar_school_college limit 50;
              SELECT self_employee_id as id, self_employee_name as name,self_employee_image as image , 'self_employee' as type FROM tbl_bazar_self_employee limit 50;
              SELECT tour_travel_id as id, tour_travel_name as name,tour_travel_images as image , 'tour_travel' as type FROM tbl_bazar_tour_travel limit 50;
              SELECT group_id as id, group_name as name,group_cover_page_image as image , 'group' as type FROM tbl_group limit 50;
               SELECT vehicle_rental_id as id, vehicle_company_name as name,vehicle_rental_images as image , 'vehicle_rental' as type FROM tbl_bazar_vehicle_rental limit 50;`, ['1', req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			if (results.length > 0) {}
			if (results[0].length > 0) {
				final_array = merge(final_array, results[0]);
			}
			if (results[1].length > 0) {
				final_array = merge(final_array, results[1]);
			}
			if (results[2].length > 0) {
				final_array = merge(final_array, results[2]);
			}
			if (results[3].length > 0) {
				final_array = merge(final_array, results[3]);
			}
			if (results[4].length > 0) {
				final_array = merge(final_array, results[4]);
			}
			if (results[5].length > 0) {
				final_array = merge(final_array, results[5]);
			}
			if (results[6].length > 0) {
				final_array = merge(final_array, results[6]);
			}
			if (results[7].length > 0) {
				final_array = merge(final_array, results[7]);
			}
			if (results[8].length > 0) {
				final_array = merge(final_array, results[8]);
			}
			if (results[9].length > 0) {
				final_array = merge(final_array, results[9]);
			}
			if (results[10].length > 0) {
				final_array = merge(final_array, results[10]);
			}
			if (results[11].length > 0) {
				final_array = merge(final_array, results[11]);
			}
			if (results[12].length > 0) {
				final_array = merge(final_array, results[12]);
			}
			if (results[13].length > 0) {
				final_array = merge(final_array, results[13]);
			}

			if (results[14].length > 0) {
				final_array = merge(final_array, results[14]);
			}
			if (results[15].length > 0) {
				final_array = merge(final_array, results[15]);
			}
			if (results[16].length > 0) {
				final_array = merge(final_array, results[16]);
			}

			return res.status(200).send({
				status: 200,
				msg: "Success",
				userList: final_array
			});


		});
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.request_insert = async (req, res) => {
	try {

		if (req.body.sender_user_id) {
			//res.send(req.body.sender_user_id);
			db.query(`SELECT * From tbl_friend_request where sender_user_id=? and receiver_user_id=?`, [req.body.sender_user_id, req.body.receiver_user_id], function(error, results12, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results12.length <= 0) {
						db.query(`SET SQL_MODE = ''; INSERT INTO tbl_friend_request SET ?`, req.body, function(error, results, fields) {
							if (error) {
								return res.status(400).send({
									status: 400,
									msg: "fail"
								});
							} else {
								return res.status(200).send({
									status: 200,
									msg: "Success",
									request_id: results.insertId
								});
							}
						});
					} else {
						db.query(`UPDATE tbl_friend_request SET ? where sender_user_id=? and receiver_user_id=?`, [req.body, req.body.sender_user_id, req.body.receiver_user_id], function(error, results, fields) {
							if (error) {
								return res.status(400).send({
									status: 400,
									msg: "fail"
								});
							} else {
								return res.status(200).send({
									status: 200,
									msg: "Success",
									request_id: results12[0].request_id
								});
							}
						});
					}
				}
			});

		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail",
				request_id: 0
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.request_update = async (req, res) => {
	try {
		if (req.body.receiver_user_id && req.body.sender_user_id) {
			db.query(`SELECT count(*) totalRecords from tbl_friend_request where (sender_user_id = ? AND receiver_user_id = ?) or (sender_user_id = ? AND receiver_user_id = ?)`, [req.body.sender_user_id, req.body.receiver_user_id, req.body.receiver_user_id, req.body.sender_user_id], function(error, results1, fields) {
				if (error) throw error;
				if (results1[0].totalRecords > 0) {
					var request_id = req.body.request_id;
					delete req.body.request_id;
					db.query(`UPDATE tbl_friend_request SET ? WHERE (sender_user_id = ? AND receiver_user_id = ?) or (sender_user_id = ? AND receiver_user_id = ?)`, [req.body, req.body.sender_user_id, req.body.receiver_user_id, req.body.receiver_user_id, req.body.sender_user_id], function(error, results, fields) {
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

exports.friend_request_list = async (req, res) => {
	try {
		if (!req.query.receiver_user_id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`SELECT DISTINCT sender_user_id as sender_user_id FROM tbl_friend_request WHERE receiver_user_id = ? and request_status = ? `, [req.query.receiver_user_id, req.query.request_status], function(error, results, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: error
					});
				} else {
					if (results.length > 0) {

						var final_array = [];
						Object.keys(results).forEach(function(key, idx, array) {
							var result = results[key];
							db.query(`SELECT * FROM tbl_user_profile WHERE user_id = ?`, [result.sender_user_id], function(err, rows, fields) {
								if (err) {
									return res.status(400).send({
										status: 400,
										msg: err
									});
								} else {
									if (rows.length > 0) {
										db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [result.sender_user_id, result.sender_user_id, '1'], function(error, results11, fields) {
											if (error) {
												rows[0].totalfriend = 0;


											} else {
												rows[0].totalfriend = results11.length;


											}

											if (results11.length > 0) {
												rows[0].sentDate = timeAgo(new Date(results11[0].created_date).toISOString());;
											} else {
												rows[0].sentDate = '';
											}
											final_array.push(rows[0]);
											if (idx === array.length - 1) {
												return res.status(200).send({
													status: 200,
													msg: "Success",
													friendRequestList: final_array
												});
											}
										});
									}
								}
							});

						});

					} else {
						return res.status(404).send({
							status: 404,
							msg: "No Record Found",
							friendRequestList: []
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
exports.friend_list = async (req, res) => {
	try {
		if (!req.query.receiver_user_id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			if (res.totalfriendsList.length > 0) {
				var final_array = [];
				var array = res.totalfriendsList;
				res.totalfriendsList.forEach(function(element, index) {
					db.query(`SELECT * FROM tbl_user_profile WHERE user_id = ?`, [element], function(err, rows, fields) {
						if (err) {
							return res.status(400).send({
								status: 400,
								msg: err
							});
						} else {
							if (rows.length <= 0) {
								rows[0] = {
									user_id: ''
								};
							}
							if (rows.length > 0) {
								db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [element, element, '1'], function(error, results11, fields) {
									if (error) {
										rows[0].totalfriend = 0;


									} else {
										rows[0].totalfriend = results11.length;


									}
									if (rows[0].user_id != '')
										final_array.push(rows[0]);
									if (index === array.length - 1) {
										return res.status(200).send({
											status: 200,
											msg: "Success",
											friendList: final_array
										});
									}
								});
							}
						}
					});

				});

			} else {
				return res.status(404).send({
					status: 404,
					msg: "No Record Found",
					friendList: []
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

exports.suggestion_list = async (req, res) => {
	try {
		if (!req.params.id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [req.params.id, req.params.id, '1'], function(error, results, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: error
					});
				} else {
					if (results.length > 0) {

						var final_array1 = [];
						Object.keys(results).forEach(function(key) {
							var result = results[key];
							if (req.params.id == result.receiver_user_id) {
								final_array1.push(result.sender_user_id);
							} else if (req.params.id == result.sender_user_id) {
								final_array1.push(result.receiver_user_id);
							}
						});
						final_array1.push(req.params.id);
						var totalfriendsList = final_array1.filter((item, i, ar) => ar.indexOf(item) === i);
						console.log(totalfriendsList);
						db.query(`SELECT * FROM tbl_user_profile ORDER BY rand() LIMIT 30`, function(err, rows, fields) {
							if (err) {
								return res.status(400).send({
									status: 400,
									msg: err
								});
							} else {
								if (rows.length > 0) {
									var final_array = [];
									var k = 1;
									var j = 0;
									Object.keys(rows).forEach(function(key, idx, array) {
										var final = rows[key];
										var me = false;

										for (var i = 0; i < totalfriendsList.length; i++) {
											if (totalfriendsList[i] == final.user_id) {
												me = true;
											}
										}

										if (me) {
											//  console.log('if'+final.user_id);
										} else {
											// console.log('else'+final.user_id);
											console.log('dd' + totalfriendsList.indexOf(final.user_id));
											db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [final.user_id, final.user_id, '1'], function(error, results11, fields) {
												if (error) {
													final.totalfriend = 0;
												} else {
													final.totalfriend = results11.length;
												}

												if (req.params.id != final.user_id) {
													j++;
													final_array.push(final);
												}

												if (idx === array.length - 1) {
													return res.status(200).send({
														status: 200,
														msg: "Success",
														totalSuggestionProfiles: j,
														suggestionProfiles: final_array
													});
												}
											});
										}
									});
								}
							}
						});
					} else {
						var totalfriendsList = [];
						console.log(totalfriendsList);
						db.query(`SELECT * FROM tbl_user_profile ORDER BY rand() LIMIT 30`, function(err, rows, fields) {
							if (err) {
								return res.status(400).send({
									status: 400,
									msg: err
								});
							} else {
								if (rows.length > 0) {
									var final_array = [];
									var k = 1;
									var j = 0;
									Object.keys(rows).forEach(function(key, idx, array) {
										var final = rows[key];
										var me = false;

										for (var i = 0; i < totalfriendsList.length; i++) {
											if (totalfriendsList[i] == final.user_id) {
												me = true;
											}
										}

										if (me) {
											//  console.log('if'+final.user_id);
										} else {
											// console.log('else'+final.user_id);
											console.log('dd' + totalfriendsList.indexOf(final.user_id));
											db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [final.user_id, final.user_id, '1'], function(error, results11, fields) {
												if (error) {
													final.totalfriend = 0;
												} else {
													final.totalfriend = results11.length;
												}

												if (req.params.id != final.user_id) {
													j++;
													final_array.push(final);
												}

												if (idx === array.length - 1) {
													return res.status(200).send({
														status: 200,
														msg: "Success",
														totalSuggestionProfiles: j,
														suggestionProfiles: final_array
													});
												}
											});
										}
									});
								}
							}
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
exports.user_profile_list = async (req, res) => {
	try {
		if (!req.params.id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [req.params.id, req.params.id, '1'], function(error, results, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: error
					});
				} else {
					if (results.length > 0) {

						var final_array1 = [];
						Object.keys(results).forEach(function(key) {
							var result = results[key];
							if (req.params.id == result.receiver_user_id) {
								final_array1.push(result.sender_user_id);
							} else if (req.params.id == result.sender_user_id) {
								final_array1.push(result.receiver_user_id);
							}
						});
						//final_array1.push(64);
						var totalfriendsList = final_array1.filter((item, i, ar) => ar.indexOf(item) === i);
						//console.log(totalfriendsList);
						db.query(`SELECT user_id,user_name,user_profile_img FROM tbl_user_profile ORDER BY rand() LIMIT 30`, function(err, rows, fields) {
							if (err) {
								return res.status(400).send({
									status: 400,
									msg: err
								});
							} else {
								if (rows.length > 0) {
									var final_array = [];
									var k = 1;
									var j = 0;
									Object.keys(rows).forEach(function(key, idx, array) {
										var final = rows[key];
										var me = false;

										for (var i = 0; i < totalfriendsList.length; i++) {
											if (totalfriendsList[i] == final.user_id) {
												me = true;
											}
										}

										if (me) {
											//  console.log('if'+final.user_id);
										} else {

											final.isChecked = false;
											j++;
											 if(req.params.id!=final.user_id){
											final_array.push(final);
											 }

											if (idx === array.length - 1) {
												return res.status(200).send({
													status: 200,
													msg: "Success",
													totalSuggestionProfiles: j,
													totalFriendProfiles: totalfriendsList.length,
													suggestionProfiles: final_array
												});
											}
										}
									});
								}
							}
						});
					} else {
						return res.status(404).send({
							status: 404,
							msg: "No Record Found",
							totalSuggestionProfiles: 0,
							totalFriendProfiles: 0,
							suggestionProfiles: []
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
exports.get_all_friend_status = async (req, res) => {
	try {
    if (req.query.user_id) {
        var final_array = [];
        if (res.totalFriendList != '' && res.totalFriendList.length > 0) {
            (res.totalFriendList).forEach((element, index, array) => {
                db.query(`SELECT user_id,user_name,user_profile_img,user_chat_status FROM tbl_user_profile where user_id=?`, [element], function(error, results_comment_reply, fields) {
                    if (error) {} else {
                        var results_comment_reply_data = [];
                        if (results_comment_reply.length > 0) {
                            results_comment_reply[0].request_status = res.requestStatus[index];
                            results_comment_reply[0].request_status_duration = timeAgo(new Date(res.createdDate[index]).toISOString());
                            final_array.push(results_comment_reply[0]);
                        }
                        // final_array.push(results_comment_reply_data);
                        if (index === array.length - 1) {
                            return res.status(200).send({
                                status: 200,
                                msg: "Success",
                                totalFriendCount: final_array.length,
                                friendChatList: final_array
                            });
                        }
                    }
                });
            });
        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail",
                 totalFriendCount:0,
                        friendChatList: []
            });
        }
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
              totalFriendCount:0,
                        friendChatList: []
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_friend_list = async (req, res) => {
	try {
    if (req.query.user_id) {
        var final_array = [];
        if (res.totalfriendsList != '') {
            (res.totalfriendsList).forEach((element, index, array) => {
                db.query(`SELECT user_id,user_name,user_profile_img,user_chat_status FROM tbl_user_profile where user_id=?`, [element], function(error, results_comment_reply, fields) {
                    if (error) {} else {
                        var results_comment_reply_data = [];
                        if (results_comment_reply.length > 0) {
                            final_array.push(results_comment_reply[0]);

                        }

                        // final_array.push(results_comment_reply_data);
                        if (index === array.length - 1) {
                            return res.status(200).send({
                                status: 200,
                                msg: "Success",
                                totalFriendCount: final_array.length,
                                friendChatList: final_array
                            });
                        }


                    }
                });
            });
        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail",
                   totalFriendCount: 0,
                                friendChatList: []
            });
        }
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
             totalFriendCount: 0,
                                friendChatList: []
        });
    }

	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};