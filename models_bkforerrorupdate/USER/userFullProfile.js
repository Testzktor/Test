const db = require("../../config/connection");
const multer = require('multer');
const crypto = require("crypto");
var timeAgo = require('node-time-ago');
var feed = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, '../uploads/temp_folder/');
	},
	filename: function(req, file, cb) {
		cb(null, crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
	}
});
const totalFriendCount = function(req, res, next) {

	db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [res.user_id, res.user_id, '1'], function(error, results, fields) {
		if (error) {
			res.totalfriend = 0;
			next();

		} else {
			res.totalfriend = results.length;
			next();

		}
	});
}
const totalFriendsArray14 = function(req, res, next) {
	if (req.query.request_status == '1') {
		db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [req.query.receiver_user_id, req.query.receiver_user_id, req.query.request_status], function(error, results, fields) {
			if (error) {
				res.totalfriendsList = [];
				next();

			} else {
				var final_array = [];
				Object.keys(results).forEach(function(key) {
					var result = results[key];
					if (req.query.receiver_user_id == result.receiver_user_id) {
						final_array.push(result.sender_user_id);
					} else if (req.query.receiver_user_id == result.sender_user_id) {
						final_array.push(result.receiver_user_id);
					}
				});
				res.totalfriendsList = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
				next();

			}
		});
	} else {
		db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ? and request_status_user_id=?`, [req.query.receiver_user_id, req.query.receiver_user_id, req.query.request_status, req.query.receiver_user_id], function(error, results, fields) {
			if (error) {
				res.totalfriendsList = [];
				next();

			} else {
				var final_array = [];
				Object.keys(results).forEach(function(key) {
					var result = results[key];
					if (req.query.receiver_user_id == result.receiver_user_id) {
						final_array.push(result.sender_user_id);
					} else if (req.query.receiver_user_id == result.sender_user_id) {
						final_array.push(result.receiver_user_id);
					}
				});
				res.totalfriendsList = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
				next();

			}
		});
	}
}
const totalFriendsArrayGroup = function(req, res, next) {

	db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [req.query.receiver_user_id, req.query.receiver_user_id, '1'], function(error, results, fields) {
		if (error) {
			res.totalfriendsList = [];
			next();

		} else {
			var final_array = [];
			Object.keys(results).forEach(function(key) {
				var result = results[key];
				if (req.query.receiver_user_id == result.receiver_user_id) {
					final_array.push(result.sender_user_id);
				} else if (req.query.receiver_user_id == result.sender_user_id) {
					final_array.push(result.receiver_user_id);
				}
			});
			res.totalfriendsList = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
			next();

		}
	});
}
const getChatProfiles = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT *
FROM  tbl_chat_details
WHERE  (sender_user_id  =  ? OR receiver_user_id  =  ?)
AND  chat_group_id  = ? UNION SELECT *
FROM  tbl_chat_details
WHERE  (sender_user_id  =  ? OR receiver_user_id  =  ?)
AND  chat_group_id  != ?
ORDER BY  created_date  DESC`, [req.query.user_id, req.query.user_id, '', req.query.user_id, req.query.user_id, ''], function(error, results, fields) {
			if (error) {
				res.getchatdetails = [];
				next();

			} else {
				if (results.length > 0) {
					var final_array = [];
					Object.keys(results).forEach(function(key, idx1, array1) {
						var result = results[key];
						if (req.query.user_id == result.receiver_user_id) {
							final_array.push(result.sender_user_id);
						} else if (req.query.user_id == result.sender_user_id) {
							final_array.push(result.receiver_user_id);
						}
						if (idx1 === array1.length - 1) {
							res.getchatdetails = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
							next();
						}
					});

				} else {
					res.getchatdetails = [];
					next();
				}

			}
		});
	} else {
		res.getchatdetails = [];
		next();
	}
}


const totalFriendsArray = function(req, res, next) {

	if (res.zktor_reel_user_id) {
		res.user_id = res.zktor_reel_user_id;
	}
	db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [res.user_id, res.user_id, '1'], function(error, results, fields) {
		if (error) {
			res.totalfriendsList = [];
			next();

		} else {
			var final_array = [];
			Object.keys(results).forEach(function(key) {
				var result = results[key];
				if (res.user_id == result.receiver_user_id) {
					final_array.push(result.sender_user_id);
				} else if (res.user_id == result.sender_user_id) {
					final_array.push(result.receiver_user_id);
				}
			});
			res.totalfriendsList = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
			next();

		}
	});
}
const totalFriendsArrayViewer = function(req, res, next) {
	console.log(req.query.viewer_id);
	if (res.zktor_reel_user_id) {
		res.user_id = res.zktor_reel_user_id;
	}
	db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [req.query.viewer_id, req.query.viewer_id, '1'], function(error, results, fields) {
		if (error) {
			res.totalfriendsListViewer = [];
			next();

		} else {
			//  console.log(results);
			var final_array = [];
			Object.keys(results).forEach(function(key) {
				var result = results[key];
				if (req.query.viewer_id == result.receiver_user_id) {
					final_array.push(result.sender_user_id);
				} else if (req.query.viewer_id == result.sender_user_id) {
					final_array.push(result.receiver_user_id);
				}
			});
			res.totalfriendsListViewer = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
			//  console.log(final_array);
			next();
		}
	});
}
const totalFriendsArrayOther = function(req, res, next) {

	if (res.zktor_reel_user_id) {
		res.user_id = res.zktor_reel_user_id;
	}
	db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status != ?`, [res.user_id, res.user_id, '1'], function(error, results, fields) {
		if (error) {
			res.totalfriendsList = [];
			next();

		} else {
			var final_array = [];
			var request_status = [];
			var created = [];
			Object.keys(results).forEach(function(key) {
				var result = results[key];
				if (res.user_id == result.receiver_user_id) {
					final_array.push(result.sender_user_id);
					request_status.push(result.request_status);
					created.push(result.created_date);
				} else if (res.user_id == result.sender_user_id) {
					final_array.push(result.receiver_user_id);
					request_status.push(result.request_status);
					created.push(result.created_date);
				}
			});
			//res.totalfriendsList = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
			res.totalFriendList = final_array;
			res.requestStatus = request_status;
			res.createdDate = created;
			next();

		}
	});
}
const totalFriendsArray1 = function(req, res, next) {

	if (res.zktor_reel_user_id) {
		res.user_id = res.zktor_reel_user_id;
	}
	db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [res.user_id, res.user_id, '1'], function(error, results, fields) {
		if (error) {
			res.totalfriendsList = [];
			next();

		} else {
			var final_array = [];
			final_array.push(req.query.user_id);
			var array = [];
			var me = [];
			Object.keys(results).forEach(function(key) {
				var result = results[key];
				if (res.user_id == result.receiver_user_id) {
					final_array.push(result.sender_user_id);
				} else if (res.user_id == result.sender_user_id) {
					final_array.push(result.receiver_user_id);
				}
			});
			array = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
			//array.push(res.user_id);
			if (array.length > 0) {
				array.forEach(function(element, index) {
					db.query(`SELECT  * FROM tbl_zktor_user_status where zktor_user_status_user_id=? and  created_date >= NOW() - INTERVAL 1 DAY order by zktor_user_status_id asc`, [element], function(error, results_comment, fields) {
						if (error) {
							res.totalfriendsList = me;
							next();

						} else {
							if (results_comment.length > 0) {
								me.push(element);
								if (index == array.length - 1) {
									res.totalfriendsList = me;
									next();
								}
							} else {
								if (index == array.length - 1) {
									res.totalfriendsList = me;
									next();
								}
							}
						}
					});
				});
			} else {
				res.totalfriendsList = [];
				next();
			}
		}
	});
}

const totalFriendsDetail = function(req, res, next) {
	db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [res.user_id, res.user_id, '1'], function(error, results, fields) {
		if (error) {
			res.totalfriendsListData = [];
			next();
		} else {
			var final_array = [];
			var comment = [];
			Object.keys(results).forEach(function(key) {
				var result = results[key];
				if (res.user_id == result.receiver_user_id) {
					final_array.push(result.sender_user_id);
				} else if (res.user_id == result.sender_user_id) {
					final_array.push(result.receiver_user_id);
				}
			});
			final_array = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
			if (final_array.length > 0) {
				final_array.forEach(function(elem, index) {
					////////console.log(elem);
					db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [elem], function(error, results_comment, fields) {
						if (error) throw error;
						db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [elem, elem, '1'], function(error, results6, fields) {

							var results_comment_data = [];
							if (results_comment.length > 0) {
								comment.push({
									user_id: elem,
									user_name: results_comment[0].user_name,
									user_profile_img: results_comment[0].user_profile_img,
									friendCount: results6.length
								});
								results_comment_data.user_name = results_comment[0].user_name;
								results_comment_data.user_profile_img = results_comment[0].user_profile_img;
							} else {
								comment.push({
									user_id: elem,
									user_name: '',
									user_profile_img: '',
									friendCount: results6.length
								});
								results_comment_data.user_profile_img = '';
							}

							if (index === final_array.length - 1) {
								res.totalfriendsListData = comment;
								next();
							}
						});
					});
				});
			} else {
				res.totalfriendsListData = final_array;
				next();
			}
		}
	});
}
const followerListData = function(req, res, next) {
	db.query(`SELECT * FROM tbl_followers WHERE followered_to_id = ? AND follower_status = ? `, [res.user_id, '1'], function(error, results, fields) {
		if (error) {
			res.followListD = [];
			next();
		} else {
			var final_array = [];
			var comment = [];
			if (results.length > 0) {
				Object.keys(results).forEach(function(key, index) {
					var result = results[key];
					db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [result.follower_by_id], function(error, results_comment, fields) {
						if (error) throw error;
						db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [result.follower_by_id, result.follower_by_id, '1'], function(error, results6, fields) {
							var results_comment_data = [];
							if (results_comment.length > 0) {
								comment.push({
									user_id: result.follower_by_id,
									user_name: results_comment[0].user_name,
									user_profile_img: results_comment[0].user_profile_img,
									friendCount: results6.length
								});
								results_comment_data.user_name = results_comment[0].user_name;
								results_comment_data.user_profile_img = results_comment[0].user_profile_img;
							} else {
								comment.push({
									user_id: result.follower_by_id,
									user_name: '',
									user_profile_img: '',
									friendCount: results6.length
								});
								results_comment_data.user_profile_img = '';
							}

							if (index === results.length - 1) {
								res.followListD = comment;
								next();
							}
						});
					});
				});
			} else {
				res.followListD = final_array;
				next();
			}
		}
	});
}
const unFollowerListData = function(req, res, next) {
	db.query(`SELECT * FROM tbl_followers WHERE followered_to_id = ? AND follower_status = ? `, [res.user_id, '0'], function(error, results, fields) {
		if (error) {
			res.unFollowListD = [];
			next();
		} else {
			var final_array = [];
			var comment = [];
			if (results.length > 0) {
				Object.keys(results).forEach(function(key, index) {
					var result = results[key];
					db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [result.follower_by_id], function(error, results_comment, fields) {
						if (error) throw error;
						db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [result.follower_by_id, result.follower_by_id, '1'], function(error, results6, fields) {
							var results_comment_data = [];
							if (results_comment.length > 0) {
								comment.push({
									user_id: result.follower_by_id,
									user_name: results_comment[0].user_name,
									user_profile_img: results_comment[0].user_profile_img,
									friendCount: results6.length
								});
								results_comment_data.user_name = results_comment[0].user_name;
								results_comment_data.user_profile_img = results_comment[0].user_profile_img;
							} else {
								comment.push({
									user_id: result.follower_by_id,
									user_name: '',
									user_profile_img: '',
									friendCount: results6.length
								});
								results_comment_data.user_profile_img = '';
							}

							if (index === results.length - 1) {
								res.unFollowListD = comment;
								next();
							}
						});
					});
				});
			} else {
				res.unFollowListD = final_array;
				next();
			}
		}
	});
}
const getAllFrindListForGroup = function(req, res, next) {
	var final_array = [];
	if (req.query.group_id && res.totalfriendsList.length > 0) {
		var sql = db.query(`SELECT * FROM tbl_user_group_members WHERE group_id = ? and is_a_friend=? and user_id IN (?);`, [req.query.group_id, '1', res.totalfriendsList], function(error, results, fields) {
			if (error) {} else {
				if (results.length > 0) {
					Object.keys(results).forEach(function(key, idx, array) {
						var result12 = results[key];
						final_array.push(result12.user_id.toString());
						if (idx === array.length - 1) {
							res.groupdata = final_array;
							next();
						}
					});
				} else {
					res.groupdata = final_array;
					next();
				}
			}
		});
	} else {
		res.groupdata = final_array;
		next();
	}
}
const getAllSharedFeedForNormal = function(req, res, next) {
	if (!req.query.feed_type_number)
		res.feed_type_number = 0;
	res.feed_user_id = req.query.user_id;
	res.page_no = req.query.page_no;
	res.feed_type_number = req.query.feed_type_number;
	res.user_id = req.query.user_id;
	var qu = db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [res.user_id, res.user_id, '1'], function(error, results, fields) {
		if (error) {} else {
			////////console.log(qu.sql);
			var final_array = [];
			var final_array_all_data = [];
			var final_array_share_data = [];
			var totalfriendsList = [];

			//final_array.push(res.user_id);
			if (results.length > 0) {
				Object.keys(results).forEach(function(key, idx, array) {
					var result12 = results[key];
					if (res.user_id == result12.receiver_user_id) {
						final_array.push(result12.sender_user_id);
					} else if (res.user_id == result12.sender_user_id) {
						final_array.push(result12.receiver_user_id);
					}
					if (idx === array.length - 1) {
						////////console.log(final_array);
						totalfriendsList = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
						// //////console.log(totalfriendsList);
						Object.keys(totalfriendsList).forEach(function(key1, idx1, array1) {
							var resu = totalfriendsList[key1];
							if (resu == res.user_id) {

							} else {
								var qu = db.query(`SELECT feed_id FROM tbl_feed_share WHERE feed_share_user_id = ? `, [resu], function(error23, results23, fields23) {
									if (error23) {} else {
										//////console.log(qu.sql);
										if (results23.length > 0) {
											Object.keys(results23).forEach(function(key12, idx12, array12) {
												var resu1 = results23[key12];
												final_array_share_data.push((resu1.feed_id.toString()) + "#1");
												if (idx12 === array12.length - 1) {
													if (idx1 === array1.length - 1) {
														res.allShareData = final_array_share_data;
														next();
													}
												}
											});
										} else {
											if (idx1 === array1.length - 1) {
												res.allShareData = final_array_share_data;
												next();
											}
										}
									}
								});
							}
						});
					}
				});
			} else {
				res.allShareData = final_array_share_data;
				next();
			}

		}
	});
}
const getAllFeedForNormal = function(req, res, next) {
	if (!req.query.feed_type_number)
		req.query.feed_type_number = 0;
	//console.log(req.query.feed_type_number);
	if (req.query.feed_type_number == 1 || req.query.feed_type_number == 0) {

		res.feed_user_id = req.query.user_id;
		res.page_no = req.query.page_no;
		res.feed_type_number = req.query.feed_type_number;
		res.user_id = req.query.user_id;
		var qu = db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [res.user_id, res.user_id, '1'], function(error, results, fields) {
			if (error) {
				res.allData = [];
				next();
			} else {
				////////console.log(qu.sql);
				var final_array = [];
				var final_array_all_data = [];
				var final_array_share_data = [];
				var totalfriendsList = [];
				final_array.push(res.user_id);
				if (results.length <= 0) {
					results[0] = {
						receiver_user_id: '',
						sender_user_id: ''
					}
				}
				if (results.length > 0) {
					Object.keys(results).forEach(function(key, idx, array) {
						var result12 = results[key];
						if (res.user_id == result12.receiver_user_id) {
							final_array.push(result12.sender_user_id);
						} else if (res.user_id == result12.sender_user_id) {
							final_array.push(result12.receiver_user_id);
						}
						//  consol.log(final_array);
						if (idx === array.length - 1) {

							totalfriendsList = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
							//console.log(totalfriendsList);
							Object.keys(totalfriendsList).forEach(function(key1, idx1, array1) {
								var resu = totalfriendsList[key1];
								var query = `SELECT ts.feed_id FROM tbl_feed  ts  WHERE ts.feed_user_id = ? AND ts.feed_is_deleted = ? AND ( ts.feed_privacy = ? OR ts.feed_privacy = ? ) AND ts.feed_type_number = ?  order by ts.feed_id desc`;
								var param = [resu, '0', '2', '0', res.feed_type_number];
								if (resu == res.user_id) {
									var query = `SELECT ts.feed_id FROM tbl_feed  ts  WHERE ts.feed_user_id = ? AND ts.feed_is_deleted = ? AND ts.feed_type_number = ?  order by ts.feed_id desc`;
									var param = [resu, '0', res.feed_type_number];
								}
								//console.log(query);
								var qu = db.query(query, param, function(error23, results23, fields23) {
									if (error23) {
										////console.log(error23);
									} else {
										var fl = 1;
										if (results23.length <= 0) {
											fl = 0;
											results23[0] = {
												feed_id: ''
											};
										}
										//console.log(results23);
										Object.keys(results23).forEach(function(key12, idx12, array12) {
											var resu1 = results23[key12];
											db.query(`SELECT * FROM tbl_feed_hide  WHERE feed_hide_user_id=? and feed_id=?;`, [req.query.user_id, resu1.feed_id], function(error, results_comment45, fields) {
												if (error) {

												} else {
													var fli = 0;
													if (results_comment45.length <= 0) {
														fli = 1;
													}
													if (fl == 1 && fli == 1) {
														final_array_all_data.push((resu1.feed_id.toString()) + "#0");
													}
													if (idx12 === array12.length - 1) {
														if (idx1 === array1.length - 1) {
															res.allData = final_array_all_data;
															next();
														}
													}
												}
											});
										});
									}
								});
							});
						}
					});
				} else {
					res.allData = final_array_all_data;
					next();
				}
			}
		});
	} else if (req.query.feed_type_number == 2) {
		res.feed_user_id = req.query.user_id;
		res.page_no = req.query.page_no;
		res.feed_type_number = req.query.feed_type_number;
		res.user_id = req.query.user_id;
		var qu = db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [res.user_id, res.user_id, '1'], function(error, results, fields) {
			if (error) {
				res.allData = [];
				next();
			} else {
				////////console.log(qu.sql);
				var final_array = [];
				var final_array_all_data = [];
				var final_array_share_data = [];
				var totalfriendsList = [];
				if (results.length <= 0) {
					results[0] = {
						receiver_user_id: '',
						sender_user_id: ''
					}
				}
				final_array.push(res.user_id);
				if (results.length > 0) {
					Object.keys(results).forEach(function(key, idx, array) {
						var result12 = results[key];
						if (res.user_id == result12.receiver_user_id) {
							final_array.push(result12.sender_user_id);
						} else if (res.user_id == result12.sender_user_id) {
							final_array.push(result12.receiver_user_id);
						}
						if (idx === array.length - 1) {

							totalfriendsList = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
							//console.log(totalfriendsList);
							Object.keys(totalfriendsList).forEach(function(key1, idx1, array1) {
								var resu = totalfriendsList[key1];
								var query = `SELECT feed_id FROM tbl_feed WHERE feed_user_id = ? 
                            AND feed_is_deleted = ? 
                            AND ( feed_privacy = ? OR feed_privacy = ? ) 
                            AND feed_type_number = ? AND  feed_group_status  >= ?
                            AND find_in_set(?,feed_type) != ?
                            `;
								var param = [resu, '0', '2', '0', res.feed_type_number, 2, req.query.group_id, '0'];
								if (resu == res.user_id) {
									var query = `SELECT *
FROM  tbl_feed 
WHERE  feed_user_id  = ?
AND  feed_is_deleted  = ?
AND  feed_group_status  >= ?
AND  feed_type_number  = ?
AND find_in_set(?,feed_type) != ?`;
									var param = [resu, '0', 2, res.feed_type_number, req.query.group_id, '0'];
								}
								var qu = db.query(query, param, function(error23, results23, fields23) {
									if (error23) {} else {
										if (results23.length > 0) {
											Object.keys(results23).forEach(function(key12, idx12, array12) {
												var resu1 = results23[key12];
												final_array_all_data.push((resu1.feed_id.toString()) + "#0");
												if (idx12 === array12.length - 1) {
													if (idx1 === array1.length - 1) {
														res.allData = final_array_all_data;
														next();
													}
												}
											});

										} else {
											if (idx1 === array1.length - 1) {
												res.allData = final_array_all_data;
												next();
											}
										}
									}
								});
							});

						}
					});
				} else {
					res.allData = final_array_all_data;
					next();
				}

			}
		});


	}
}
const getAllSharedFeedForNormalNotApproved = function(req, res, next) {
	res.page_no = req.query.page_no;
	res.feed_type_number = 2;
	var qu = db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [req.query.user_id, req.query.user_id, '1'], function(error, results, fields) {
		if (error) {} else {
			////////console.log(qu.sql);
			var final_array = [];
			var final_array_all_data = [];
			var final_array_share_data = [];
			var totalfriendsList = [];
			if (results.length <= 0) {
				results[0] = {
					receiver_user_id: '',
					sender_user_id: ''
				}
			}
			//final_array.push(req.query.user_id);
			if (results.length > 0) {
				Object.keys(results).forEach(function(key, idx, array) {
					var result12 = results[key];
					if (req.query.user_id == result12.receiver_user_id) {
						final_array.push(result12.sender_user_id);
					} else if (req.query.user_id == result12.sender_user_id) {
						final_array.push(result12.receiver_user_id);
					}
					if (idx === array.length - 1) {
						////////console.log(final_array);
						totalfriendsList = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
						// //////console.log(totalfriendsList);
						Object.keys(totalfriendsList).forEach(function(key1, idx1, array1) {
							var resu = totalfriendsList[key1];
							if (resu == req.query.user_id) {

							} else {
								var qu = db.query(`SELECT feed_id FROM tbl_feed_share WHERE feed_share_user_id = ? `, [resu], function(error23, results23, fields23) {
									if (error23) {} else {
										//////console.log(qu.sql);
										if (results23.length > 0) {
											Object.keys(results23).forEach(function(key12, idx12, array12) {
												var resu1 = results23[key12];
												final_array_share_data.push((resu1.feed_id.toString()) + "#1");
												if (idx12 === array12.length - 1) {
													if (idx1 === array1.length - 1) {
														res.allShareData = final_array_share_data;
														next();
													}
												}
											});
										} else {
											if (idx1 === array1.length - 1) {
												res.allShareData = final_array_share_data;
												next();
											}
										}
									}
								});
							}
						});
					}
				});
			} else {
				res.allShareData = final_array_share_data;
				next();
			}

		}
	});
}
const getAllFeedForNormalNotApproved = function(req, res, next) {
	if (req.query.group_id) {
		res.feed_type_number = 2;
		var qu = db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [req.query.user_id, req.query.user_id, '1'], function(error, results, fields) {
			if (error) {
				res.allData = [];
				next();
			} else {
				////////console.log(qu.sql);
				var final_array = [];
				var final_array_all_data = [];
				var final_array_share_data = [];
				var totalfriendsList = [];
				if (results.length <= 0) {
					results[0] = {
						receiver_user_id: '',
						sender_user_id: ''
					}
				}
				final_array.push(req.query.user_id);
				if (results.length > 0) {
					Object.keys(results).forEach(function(key, idx, array) {
						var result12 = results[key];
						if (req.query.user_id == result12.receiver_user_id) {
							final_array.push(result12.sender_user_id);
						} else if (req.query.user_id == result12.sender_user_id) {
							final_array.push(result12.receiver_user_id);
						}
						if (idx === array.length - 1) {

							totalfriendsList = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
							//console.log(totalfriendsList);
							Object.keys(totalfriendsList).forEach(function(key1, idx1, array1) {
								var resu = totalfriendsList[key1];
								var query = `SELECT feed_id FROM tbl_feed WHERE feed_user_id = ?
                            AND feed_is_deleted = ?
                            AND ( feed_privacy = ? OR feed_privacy = ? )
                            AND feed_type_number = ?
                            AND feed_type= ? and feed_group_status=?
                            `;
								var param = [resu, '0', '2', '0', '2', req.query.group_id, '0'];
								if (resu == req.query.user_id) {
									var query = `SELECT *
FROM  tbl_feed
WHERE  feed_user_id  = ?
AND  feed_is_deleted  = ?
AND  feed_group_status  = ?
AND  feed_type_number  = ?
AND feed_type= ?`;
									var param = [resu, '0', 0, '2', req.query.group_id];
								}
								var qu = db.query(query, param, function(error23, results23, fields23) {
									if (error23) {} else {
										if (results23.length > 0) {
											Object.keys(results23).forEach(function(key12, idx12, array12) {
												var resu1 = results23[key12];
												final_array_all_data.push((resu1.feed_id.toString()) + "#0");
												if (idx12 === array12.length - 1) {
													if (idx1 === array1.length - 1) {
														res.allData = final_array_all_data;
														next();
													}
												}
											});

										} else {
											if (idx1 === array1.length - 1) {
												res.allData = final_array_all_data;
												next();
											}
										}
									}
								});
							});
						}
					});
				} else {
					res.allData = final_array_all_data;
					next();
				}

			}
		});
	} else {
		res.allData = final_array_all_data;
		next();
	}
}
const getAllSharedFeedForNormalBusiness = function(req, res, next) {
	res.page_no = req.query.page_no;
	res.feed_type_number = 1;
	var qu = db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [req.query.user_id, req.query.user_id, '1'], function(error, results, fields) {
		if (error) {} else {
			////////console.log(qu.sql);
			var final_array = [];
			var final_array_all_data = [];
			var final_array_share_data = [];
			var totalfriendsList = [];
			if (results.length <= 0) {
				results[0] = {
					receiver_user_id: '',
					sender_user_id: ''
				}
			}
			//final_array.push(req.query.user_id);
			if (results.length > 0) {
				Object.keys(results).forEach(function(key, idx, array) {
					var result12 = results[key];
					if (req.query.user_id == result12.receiver_user_id) {
						final_array.push(result12.sender_user_id);
					} else if (req.query.user_id == result12.sender_user_id) {
						final_array.push(result12.receiver_user_id);
					}
					if (idx === array.length - 1) {
						////////console.log(final_array);
						totalfriendsList = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
						// //////console.log(totalfriendsList);
						Object.keys(totalfriendsList).forEach(function(key1, idx1, array1) {
							var resu = totalfriendsList[key1];
							if (resu == req.query.user_id) {

							} else {
								var qu = db.query(`SELECT feed_id FROM tbl_feed_share WHERE feed_share_user_id = ? `, [resu], function(error23, results23, fields23) {
									if (error23) {} else {
										//////console.log(qu.sql);
										if (results23.length > 0) {
											Object.keys(results23).forEach(function(key12, idx12, array12) {
												var resu1 = results23[key12];
												final_array_share_data.push((resu1.feed_id.toString()) + "#1");
												if (idx12 === array12.length - 1) {
													if (idx1 === array1.length - 1) {
														res.allShareData = final_array_share_data;
														next();
													}
												}
											});
										} else {
											if (idx1 === array1.length - 1) {
												res.allShareData = final_array_share_data;
												next();
											}
										}
									}
								});
							}
						});
					}
				});
			} else {
				res.allShareData = final_array_share_data;
				next();
			}

		}
	});
}
const getAllFeedForNormalBusiness = function(req, res, next) {
	if (req.query.user_id) {
		res.feed_type_number = 1;
		var qu = db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [req.query.user_id, req.query.user_id, '1'], function(error, results, fields) {
			if (error) {
				res.allData = [];
				next();
			} else {
				////////console.log(qu.sql);
				var final_array = [];
				var final_array_all_data = [];
				var final_array_share_data = [];
				var totalfriendsList = [];
				if (results.length <= 0) {
					results[0] = {
						receiver_user_id: '',
						sender_user_id: ''
					}
				}
				final_array.push(req.query.user_id);
				if (results.length > 0) {
					Object.keys(results).forEach(function(key, idx, array) {
						var result12 = results[key];
						if (req.query.user_id == result12.receiver_user_id) {
							final_array.push(result12.sender_user_id);
						} else if (req.query.user_id == result12.sender_user_id) {
							final_array.push(result12.receiver_user_id);
						}
						if (idx === array.length - 1) {

							totalfriendsList = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
							//////console.log(totalfriendsList);
							Object.keys(totalfriendsList).forEach(function(key1, idx1, array1) {
								var resu = totalfriendsList[key1];
								var query = `SELECT feed_id FROM tbl_feed WHERE feed_user_id = ?
                            AND feed_is_deleted = ?
                            AND ( feed_privacy = ? OR feed_privacy = ? )
                            AND feed_type_number = ?
                            AND feed_type= ? 
                            `;
								var param = [resu, '0', '2', '0', '1', 'business_event'];
								if (resu == req.query.user_id) {
									var query = `SELECT *
FROM  tbl_feed
WHERE  feed_user_id  = ?
AND  feed_is_deleted  = ?
AND  feed_type_number  = ?
AND feed_type= ?`;
									var param = [resu, '0', '1', 'business_event'];
								}
								var qu = db.query(query, param, function(error23, results23, fields23) {
									if (error23) {} else {
										if (results23.length > 0) {
											Object.keys(results23).forEach(function(key12, idx12, array12) {
												var resu1 = results23[key12];
												final_array_all_data.push((resu1.feed_id.toString()) + "#0");
												if (idx12 === array12.length - 1) {
													if (idx1 === array1.length - 1) {
														res.allData = final_array_all_data;
														next();
													}
												}
											});

										} else {
											if (idx1 === array1.length - 1) {
												res.allData = final_array_all_data;
												next();
											}
										}
									}
								});
							});
						}
					});
				} else {
					res.allData = final_array_all_data;
					next();
				}

			}
		});
	} else {
		res.allData = final_array_all_data;
		next();
	}
}
const profileListFun = function(req, res, next) {
	db.query(`SELECT * from tbl_user_profile where user_id = ?`, [res.user_id], function(error, results1, fields) {
		if (error) {
			res.profileList = '';
			next();
		} else {
			res.profileList = results1;
			next();
		}
	});
}
const educationListFun = function(req, res, next) {
	db.query(`SELECT * from tbl_education where user_id = ?`, [res.user_id], function(error, results1, fields) {
		if (error) {
			res.educationList = '';
			next();
		} else {
			res.educationList = results1;
			next();
		}
	});
}
const languageListFun = function(req, res, next) {
	db.query(`SELECT * from tbl_languages where user_id = ?`, [res.user_id], function(error, results1, fields) {
		if (error) {
			res.languageList = '';
			next();
		} else {
			res.languageList = results1;
			next();
		}
	});
}
const othersListFun = function(req, res, next) {
	db.query(`SELECT * from tbl_others where user_id = ?`, [res.user_id], function(error, results1, fields) {
		if (error) {
			res.othersList = '';
			next();
		} else {
			res.othersList = results1;
			next();
		}
	});
}
const workListFun = function(req, res, next) {
	db.query(`SELECT * from tbl_works where user_id = ?`, [res.user_id], function(error, results1, fields) {
		if (error) {
			res.workList = '';
			next();
		} else {
			res.workList = results1;
			next();
		}
	});
}
const fullProfileData = function(req, res, next) {
	db.query(`SELECT * from tbl_user_profile where user_id = ?;SELECT * from tbl_works where user_id = ?;SELECT * from tbl_education where user_id = ?`, [res.user_id, res.user_id, res.user_id], function(error, results, fields) {
		if (error) {
			res.pro = [];
			next();
		} else {
			if (results[0].length > 0) {
				if (results[2].length > 0)
					results[0][0].education_school_name = results[2][0].education_school_name;
				else
					results[0][0].education_school_name = '';

				if (results[1].length > 0)
					results[0][0].work_company_name = results[1][0].work_company_name;
				else
					results[0][0].work_company_name = '';

				res.pro = results[0][0];
				next();
			} else {
				res.pro = [];
				next();
			}
		}
	});
}

const checkUser = function(req, res, next) {
	db.query(`SELECT * from tbl_zktor_video where zktor_video_id = ?`, [res.comment_zktor_video_id], function(error, results, fields) {
		if (error) {
			res.pro = 'SELECT * FROM tbl_zktor_video_comment where comment_zktor_video_id=? and comment_operation=0 order by comment_id DESC LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows FROM tbl_zktor_video_comment where comment_zktor_video_id=? and comment_operation=0';
			next();
		} else {
			if (results.length > 0) {
				if (results[0].zktor_video_user_id = res.user_id) {
					res.pro = 'SELECT * FROM tbl_zktor_video_comment where comment_zktor_video_id=? and comment_operation!=2 order by comment_id DESC LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows FROM tbl_zktor_video_comment where comment_zktor_video_id=? and comment_operation!=2';
				} else {
					res.pro = 'SELECT * FROM tbl_zktor_video_comment where comment_zktor_video_id=? and comment_operation=0 order by comment_id DESC LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows FROM tbl_zktor_video_comment where comment_zktor_video_id=? and comment_operation=0';
				}
				next();
			} else {
				res.pro = 'SELECT * FROM tbl_zktor_video_comment where comment_zktor_video_id=? and comment_operation=0 order by comment_id DESC LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows FROM tbl_zktor_video_comment where comment_zktor_video_id=? and comment_operation=0';
				next();
			}
		}
	});
}
const followerListDataForAdditionalSetting = function(req, res, next) {
	db.query(`SELECT * FROM tbl_followers WHERE followered_to_id = ? AND follower_status = ? `, [res.user_id, '1'], function(error, results, fields) {
		if (error) {
			res.followListDataForA = [];
			next();
		} else {
			var final_array = [];
			var comment = [];
			if (results.length > 0) {
				Object.keys(results).forEach(function(key, index) {
					var result = results[key];
					db.query(`SELECT * FROM tbl_user_profile where user_id=?;SELECT * from tbl_works where user_id = ?;SELECT * from tbl_education where user_id = ?`, [result.follower_by_id, result.follower_by_id, result.follower_by_id], function(error, results_comment, fields) {
						if (error) throw error;
						//   db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [result.follower_by_id, result.follower_by_id, '1'], function(error, results6, fields) {
						var results_comment_data = [];
						if (results_comment[0].length > 0) {


							if (results_comment[2].length > 0)
								results_comment[0][0].education_school_name = results_comment[2][0].education_school_name;
							else
								results_comment[0][0].education_school_name = '';

							if (results_comment[1].length > 0)
								results_comment[0][0].work_company_name = results_comment[1][0].work_company_name;
							else
								results_comment[0][0].work_company_name = '';



							result.user_details = results_comment[0][0];
							comment.push(result);
							// results_comment_data.user_name = results_comment[0].user_name;
							// results_comment_data.user_profile_img = results_comment[0].user_profile_img;
						} else {
							result.user_details = [];

							comment.push(result);
							// results_comment_data.user_profile_img = '';
						}

						if (index === results.length - 1) {
							res.followListDataForA = comment;
							next();
						}

					});
				});
			} else {
				res.followListDataForA = final_array;
				next();
			}
		}
	});
}
const getFeedShare = function(req, res, next) {
	var final_array = [];
	if (req.query.feed_id) {
		db.query(`SELECT * FROM tbl_feed_share WHERE feed_id = ?;`, [req.query.feed_id], function(error, results, fields) {
			if (error) {
				res.feedshare = [];
				next();
			} else {
				var comment = [];
				if (results.length > 0) {
					Object.keys(results).forEach(function(key, index) {
						var result = results[key];
						db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [result.feed_share_user_id], function(error, results_comment, fields) {
							if (error) throw error;
							if (results_comment.length > 0) {
								result.user_name = results_comment[0].user_name;
								result.user_profile_img = results_comment[0].user_profile_img;
							} else {
								result.user_name = '';
								result.user_profile_img = '';
							}
							var kll = "0";
							if (result.feed_share_user_id && res.totalFriendList) {
								if (res.totalFriendList.indexOf(result.feed_share_user_id) !== -1) {
									kll = res.requestStatus[res.totalFriendList.indexOf(result.feed_share_user_id)];
								}
							}
							result.is_friend = kll;
							result.shared_ago = timeAgo(new Date(result.created_date).toISOString());
							comment.push(result);

							if (index === results.length - 1) {
								res.feedshare = comment;
								next();
							}
						});
					});
				} else {
					res.feedshare = final_array;
					next();
				}
			}
		});
	} else {
		res.feedshare = final_array;
		next();
	}
}
const getFeedfollower = function(req, res, next) {
	var final_array = [];
	if (req.query.feed_id) {
		db.query(`SELECT * FROM tbl_followers WHERE feed_id = ?;`, [req.query.feed_id], function(error, results, fields) {
			if (error) {
				res.feedfollower = [];
				next();
			} else {
				var comment = [];
				if (results.length > 0) {
					Object.keys(results).forEach(function(key, index) {
						var result = results[key];
						db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [result.follower_by_id], function(error, results_comment, fields) {
							if (error) throw error;
							if (results_comment.length > 0) {
								result.user_name = results_comment[0].user_name;
								result.user_profile_img = results_comment[0].user_profile_img;
							} else {
								result.user_name = '';
								result.user_profile_img = '';
							}
							if (res.totalfriendsList)
								result.is_friend = (res.totalfriendsList.includes(result.follower_by_id)) ? "1" : "0";
							else
								result.is_friend = "0";
							result.followed_ago = timeAgo(new Date(result.created_date).toISOString());
							comment.push(result);

							if (index === results.length - 1) {
								res.feedfollower = comment;
								next();
							}
						});
					});
				} else {
					res.feedfollower = final_array;
					next();
				}
			}
		});
	} else {
		res.feedfollower = final_array;
		next();
	}
}
const getFeedReaction = function(req, res, next) {
	var final_array = [];
	if (req.query.feed_id) {
		db.query(`SELECT * FROM tbl_like_details WHERE like_details_feed_id = ?;`, [req.query.feed_id], function(error, results, fields) {
			if (error) {
				res.feedreaction = [];
				next();
			} else {
				var comment = [];
				if (results.length > 0) {
					Object.keys(results).forEach(function(key, index) {
						var result = results[key];
						db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [result.like_details_liked_user_id], function(error, results_comment, fields) {
							if (error) throw error;
							if (results_comment.length > 0) {
								result.user_name = results_comment[0].user_name;
								result.user_profile_img = results_comment[0].user_profile_img;
							} else {
								result.user_name = '';
								result.user_profile_img = '';
							}
							var kll = "0";
							if (result.like_details_liked_user_id && res.totalFriendList) {
								if (res.totalFriendList.indexOf(result.like_details_liked_user_id) !== -1) {
									kll = res.requestStatus[res.totalFriendList.indexOf(result.like_details_liked_user_id)];
								}
							}
							//console.log(res.totalFriendList.indexOf(result.like_details_liked_user_id));
							result.is_friend = kll;
							result.reacted_ago = timeAgo(new Date(result.created_date).toISOString());
							comment.push(result);

							if (index === results.length - 1) {
								res.feedreaction = comment;
								next();
							}
						});
					});
				} else {
					res.feedreaction = final_array;
					next();
				}
			}
		});
	} else {
		res.feedreaction = final_array;
		next();
	}
}
const followerListDataForAdditionalSetting11 = function(req, res, next) {
	db.query(`SELECT * FROM tbl_followers WHERE follower_by_id = ? AND follower_status = ? group by followered_to_id`, [req.query.user_id, '1'], function(error, results, fields) {
		if (error) {
			res.followListDataForA = [];
			next();
		} else {
			var final_array = [];
			var comment = [];
			if (results.length > 0) {
				Object.keys(results).forEach(function(key, index) {
					var result = results[key];
					db.query(`SELECT * FROM tbl_user_profile where user_id=?;SELECT * from tbl_works where user_id = ?;SELECT * from tbl_education where user_id = ?`, [result.followered_to_id, result.followered_to_id, result.followered_to_id], function(error, results_comment, fields) {
						if (error) throw error;
						//   db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [result.follower_by_id, result.follower_by_id, '1'], function(error, results6, fields) {
						var results_comment_data = [];
						if (results_comment[0].length > 0) {


							if (results_comment[2].length > 0)
								results_comment[0][0].education_school_name = results_comment[2][0].education_school_name;
							else
								results_comment[0][0].education_school_name = '';

							if (results_comment[1].length > 0)
								results_comment[0][0].work_company_name = results_comment[1][0].work_company_name;
							else
								results_comment[0][0].work_company_name = '';



							result.user_details = results_comment[0][0];
							comment.push(result);
							// results_comment_data.user_name = results_comment[0].user_name;
							// results_comment_data.user_profile_img = results_comment[0].user_profile_img;
						} else {
							result.user_details = [];

							comment.push(result);
							// results_comment_data.user_profile_img = '';
						}

						if (index === results.length - 1) {
							res.followListDataForA = comment;
							next();
						}

					});
				});
			} else {
				res.followListDataForA = final_array;
				next();
			}
		}
	});
}
const unFollowerListDataForAdditionalSetting = function(req, res, next) {
	db.query(`SELECT * FROM tbl_followers WHERE followered_to_id = ? AND follower_status = ? `, [res.user_id, '0'], function(error, results, fields) {
		if (error) {
			res.unfollowListDataForA = [];
			next();
		} else {
			var final_array = [];
			var comment = [];
			if (results.length > 0) {
				Object.keys(results).forEach(function(key, index) {
					var result = results[key];
					db.query(`SELECT * FROM tbl_user_profile where user_id=?;SELECT * from tbl_works where user_id = ?;SELECT * from tbl_education where user_id = ?`, [result.follower_by_id, result.follower_by_id, result.follower_by_id], function(error, results_comment, fields) {
						if (error) throw error;
						//   db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [result.follower_by_id, result.follower_by_id, '1'], function(error, results6, fields) {
						var results_comment_data = [];
						if (results_comment.length > 0) {


							if (results_comment[2].length > 0)
								results_comment[0][0].education_school_name = results_comment[2][0].education_school_name;
							else
								results_comment[0][0].education_school_name = '';

							if (results_comment[1].length > 0)
								results_comment[0][0].work_company_name = results_comment[1][0].work_company_name;
							else
								results_comment[0][0].work_company_name = '';



							result.user_details = results_comment[0][0];
							comment.push(result);
							// results_comment_data.user_name = results_comment[0].user_name;
							// results_comment_data.user_profile_img = results_comment[0].user_profile_img;
						} else {
							result.user_details = [];

							comment.push(result);
							// results_comment_data.user_profile_img = '';
						}

						if (index === results.length - 1) {
							res.unfollowListDataForA = comment;
							next();
						}

					});
				});
			} else {
				res.unfollowListDataForA = final_array;
				next();
			}
		}
	});
}
const profilePer = function(req, res, next) {
	if (res.user_id) {
		var comment_re = [];
		db.query(`SELECT *  FROM tbl_user_profile WHERE user_id = ? AND user_status =? AND soft_delete=?;Select Count(*) as num From INFORMATION_SCHEMA.COLUMNS Where TABLE_NAME=?`, [res.user_id, '1', '0', 'tbl_user_profile'], function(error, results_comment_re, fields) {
			if (error) {
				comment_re.push({
					profile: {
						total: results_comment_re[1][0].num,
						completed_profile_percentage: parseFloat(0 * 100).toFixed(2) + "%",
						notempty: 0,
						empty: results_comment_re[1][0]
					}
				});
				res.profilePer = comment_re;
				next();
			} else {
				if (results_comment_re[0].length > 0) {
					var notempty = 0;
					var empty = 0;
					Object.keys(results_comment_re[0][0]).forEach(function(key_re, idx_re, array_re) {
						var results_data = results_comment_re[0][0][key_re];
						////////console.log(results_data);
						if (results_data != '' && results_data != null) {
							notempty++;
						} else {
							empty++;
						}

						if (idx_re === array_re.length - 1) {
							var p = notempty / results_comment_re[1][0].num;
							results_data.profile = {
								total: results_comment_re[1],
								completed_profile_percentage: parseFloat(p).toFixed(2),
								notempty: notempty,
								empty: empty
							};
							comment_re.push({
								profile: {
									total: results_comment_re[1][0].num,
									completed_profile_percentage: parseFloat(p * 100).toFixed(2) + "%",
									notempty: notempty,
									empty: empty
								}
							});
							res.profilePer = comment_re;
							next();
						}
					});
				} else {
					comment_re.push({
						profile: {
							total: results_comment_re[1][0].num,
							completed_profile_percentage: parseFloat(0 * 100).toFixed(2) + "%",
							notempty: 0,
							empty: results_comment_re[1][0].num
						}
					});
					res.profilePer = comment_re;
					next();
				}
			}
		});
	} else {
		comment_re.push({
			profile: {
				total: results_comment_re[1][0].num,
				completed_profile_percentage: parseFloat(0 * 100).toFixed(2) + "%",
				notempty: 0,
				empty: results_comment_re[1][0].num
			}
		});
		res.profilePer = comment_re;
		next();
	}
}
const educationPer = function(req, res, next) {
	if (res.user_id) {
		var comment_re = [];
		db.query(`SELECT *  FROM tbl_education WHERE user_id = ?;Select Count(*) as num From INFORMATION_SCHEMA.COLUMNS Where TABLE_NAME=?`, [res.user_id, 'tbl_education'], function(error, results_comment_re, fields) {
			if (error) {
				comment_re.push({
					education: {
						total: results_comment_re[1][0].num,
						completed_education_percentage: parseFloat(0 * 100).toFixed(2) + "%",
						notempty: 0,
						empty: results_comment_re[1][0]
					}
				});
				res.educationPer = comment_re;
				next();
			} else {
				if (results_comment_re[0].length > 0) {
					var notempty = 0;
					var empty = 0;
					Object.keys(results_comment_re[0][0]).forEach(function(key_re, idx_re, array_re) {
						var results_data = results_comment_re[0][0][key_re];
						//console.log(results_data);
						if (results_data != '' && results_data != null) {
							notempty++;
						} else {
							empty++;
						}

						if (idx_re === array_re.length - 1) {
							var p = notempty / results_comment_re[1][0].num;
							results_data.education = {
								total: results_comment_re[1],
								completed_education_percentage: parseFloat(p).toFixed(2),
								notempty: notempty,
								empty: empty
							};
							comment_re.push({
								education: {
									total: results_comment_re[1][0].num,
									completed_education_percentage: parseFloat(p * 100).toFixed(2) + "%",
									notempty: notempty,
									empty: empty
								}
							});
							res.educationPer = comment_re;
							next();
						}
					});
				} else {
					comment_re.push({
						education: {
							total: results_comment_re[1][0].num,
							completed_education_percentage: parseFloat(0 * 100).toFixed(2) + "%",
							notempty: 0,
							empty: results_comment_re[1][0].num
						}
					});
					res.educationPer = comment_re;
					next();
				}
			}
		});
	} else {
		comment_re.push({
			education: {
				total: results_comment_re[1][0].num,
				completed_education_percentage: parseFloat(0 * 100).toFixed(2) + "%",
				notempty: 0,
				empty: results_comment_re[1][0].num
			}
		});
		res.educationPer = comment_re;
		next();
	}
}
const workPer = function(req, res, next) {
	if (res.user_id) {
		var comment_re = [];
		db.query(`SELECT *  FROM tbl_works WHERE user_id = ?;Select Count(*) as num From INFORMATION_SCHEMA.COLUMNS Where TABLE_NAME=?`, [res.user_id, 'tbl_works'], function(error, results_comment_re, fields) {
			if (error) {
				comment_re.push({
					work: {
						total: results_comment_re[1][0].num,
						completed_work_percentage: parseFloat(0 * 100).toFixed(2) + "%",
						notempty: 0,
						empty: results_comment_re[1][0]
					}
				});
				res.workPer = comment_re;
				next();
			} else {
				if (results_comment_re[0].length > 0) {
					var notempty = 0;
					var empty = 0;
					Object.keys(results_comment_re[0][0]).forEach(function(key_re, idx_re, array_re) {
						var results_data = results_comment_re[0][0][key_re];
						////////console.log(results_data);
						if (results_data != '' && results_data != null) {
							notempty++;
						} else {
							empty++;
						}

						if (idx_re === array_re.length - 1) {
							var p = notempty / results_comment_re[1][0].num;
							results_data.work = {
								total: results_comment_re[1],
								completed_work_percentage: parseFloat(p).toFixed(2),
								notempty: notempty,
								empty: empty
							};
							comment_re.push({
								work: {
									total: results_comment_re[1][0].num,
									completed_work_percentage: parseFloat(p * 100).toFixed(2) + "%",
									notempty: notempty,
									empty: empty
								}
							});
							res.workPer = comment_re;
							next();
						}
					});
				} else {
					comment_re.push({
						work: {
							total: results_comment_re[1][0].num,
							completed_work_percentage: parseFloat(0 * 100).toFixed(2) + "%",
							notempty: 0,
							empty: results_comment_re[1][0].num
						}
					});
					res.workPer = comment_re;
					next();
				}
			}
		});
	} else {
		comment_re.push({
			work: {
				total: results_comment_re[1][0].num,
				completed_work_percentage: parseFloat(0 * 100).toFixed(2) + "%",
				notempty: 0,
				empty: results_comment_re[1][0].num
			}
		});
		res.workPer = comment_re;
		next();
	}
}
const othersPer = function(req, res, next) {
	if (res.user_id) {
		var comment_re = [];
		db.query(`SELECT *  FROM tbl_others WHERE user_id = ?;Select Count(*) as num From INFORMATION_SCHEMA.COLUMNS Where TABLE_NAME=?`, [res.user_id, 'tbl_others'], function(error, results_comment_re, fields) {
			if (error) {
				comment_re.push({
					others: {
						total: results_comment_re[1][0].num,
						completed_others_percentage: parseFloat(0 * 100).toFixed(2) + "%",
						notempty: 0,
						empty: results_comment_re[1][0]
					}
				});
				res.othersPer = comment_re;
				next();
			} else {
				if (results_comment_re[0].length > 0) {
					var notempty = 0;
					var empty = 0;
					Object.keys(results_comment_re[0][0]).forEach(function(key_re, idx_re, array_re) {
						var results_data = results_comment_re[0][0][key_re];
						////////console.log(results_data);
						if (results_data != '' && results_data != null) {
							notempty++;
						} else {
							empty++;
						}

						if (idx_re === array_re.length - 1) {
							var p = notempty / results_comment_re[1][0].num;
							results_data.others = {
								total: results_comment_re[1],
								completed_others_percentage: parseFloat(p).toFixed(2),
								notempty: notempty,
								empty: empty
							};
							comment_re.push({
								others: {
									total: results_comment_re[1][0].num,
									completed_others_percentage: parseFloat(p * 100).toFixed(2) + "%",
									notempty: notempty,
									empty: empty
								}
							});
							res.othersPer = comment_re;
							next();
						}
					});
				} else {
					comment_re.push({
						others: {
							total: results_comment_re[1][0].num,
							completed_others_percentage: parseFloat(0 * 100).toFixed(2) + "%",
							notempty: 0,
							empty: results_comment_re[1][0].num
						}
					});
					res.othersPer = comment_re;
					next();
				}
			}
		});
	} else {
		comment_re.push({
			others: {
				total: results_comment_re[1][0].num,
				completed_others_percentage: parseFloat(0 * 100).toFixed(2) + "%",
				notempty: 0,
				empty: results_comment_re[1][0].num
			}
		});
		res.othersPer = comment_re;
		next();
	}
}
const commentList = function(req, res, next) {

	var comment = [];
	db.query(`SELECT * FROM tbl_feed_comment where comment_feed_id=? and comment_operation=?`, [req.query.feed_id, '0'], function(error, results_comment, fields) {
		if (error) {
			res.commentList = [];
			next();
		} else {
			if (results_comment.length > 0) {
				////////console.log(timeAgo(new Date('2022-02-22 07:12:49').toISOString()));
				Object.keys(results_comment).forEach(function(key12, idx12, array12) {
					var results_comment_data = results_comment[key12];
					db.query(`SELECT * FROM tbl_user_profile where user_id=?;SELECT reaction_comment_id, COUNT(*) as total FROM tbl_comment_reaction WHERE reaction_comment_id = ? GROUP BY reaction_comment_id;SELECT * FROM tbl_comment_reaction WHERE reaction_comment_id = ? and reaction_user_id=?`, [results_comment_data.comment_user_id, results_comment_data.comment_id, results_comment_data.comment_id, req.query.user_id], function(error, results_comment1, fields) {
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

						if (results_comment1[2].length > 0)
							results_comment_data.user_reaction_string = results_comment1[2][0].comment_feeling_string;
						else
							results_comment_data.user_reaction_string = '';
						var kll = "0";
						if (results_comment_data.comment_user_id && res.totalFriendList) {
							if (res.totalFriendList.indexOf(results_comment_data.comment_user_id) !== -1) {
								kll = res.requestStatus[res.totalFriendList.indexOf(results_comment_data.comment_user_id)];
							}
						}
						results_comment_data.is_friend = kll;

						if (results_comment_data.created_date != '0000-00-00 00:00:00')
							results_comment_data.comment_ago = timeAgo(new Date(results_comment_data.created_date).toISOString());
						else
							results_comment_data.comment_ago = 'just now';


						var comment_re = [];
						db.query(`SELECT * FROM tbl_feed_comment_reply where comment_id=? and comment_reply_operation!=?`, [results_comment_data.comment_id, '2'], function(error, results_comment_re, fields) {
							if (error) throw error;
							if (results_comment_re.length > 0) {
								Object.keys(results_comment_re).forEach(function(key_re, idx_re, array_re) {
									var results_comment_reply_data = results_comment_re[key_re];
									db.query(`SELECT * FROM tbl_user_profile where user_id=?;SELECT reaction_comment_id, COUNT(*) as total FROM tbl_comment_reply_reaction WHERE reaction_comment_reply_id = ? GROUP BY reaction_comment_reply_id;SELECT * FROM tbl_comment_reply_reaction WHERE reaction_comment_reply_id = ? and reaction_user_id=?`, [results_comment_reply_data.comment_reply_user_id, results_comment_reply_data.comment_reply_id, results_comment_reply_data.comment_reply_id, req.query.user_id], function(error, results_comment_reply, fields) {
										if (error) throw error;
										if (results_comment_reply[0].length > 0) {
											results_comment_reply_data.user_name = results_comment_reply[0][0].user_name;
											results_comment_reply_data.user_profile_img = results_comment_reply[0][0].user_profile_img;
										} else {
											results_comment_reply_data.user_name = '';
											results_comment_reply_data.user_profile_img = '';
										}
										if (results_comment_reply[1].length > 0)
											results_comment_reply_data.reaction_count = results_comment_reply[1][0].total;
										else
											results_comment_reply_data.reaction_count = 0;

										if (results_comment_reply[2].length > 0)
											results_comment_reply_data.user_reaction_string = results_comment_reply[2][0].comment_reply_feeling_string;
										else
											results_comment_reply_data.user_reaction_string = '';
										results_comment_reply_data.is_friend = (res.totalfriendsList.includes(results_comment_reply_data.comment_reply_user_id)) ? "1" : "0";
										if (results_comment_reply_data.created_date != '0000-00-00 00:00:00')
											results_comment_reply_data.comment_reply_ago = timeAgo(new Date(results_comment_reply_data.created_date).toISOString());
										else
											results_comment_reply_data.comment_reply_ago = 'just now';
										comment_re.push(results_comment_reply_data);
										if (idx_re === array_re.length - 1) {
											results_comment_data.comment_replies = comment_re;
											comment.push(results_comment_data);

											if (idx12 === array12.length - 1) {
												res.commentList = comment;
												next();
											}
										}

									});
								});
							} else {
								results_comment_data.comment_replies = [];
								comment.push(results_comment_data);
								if (idx12 === array12.length - 1) {
									res.commentList = comment;
									next();
								}
							}

						});
					});
				});
			} else {
				res.commentList = [];
				next();
			}
		}
	});

}
const cook = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT * FROM tbl_bazar_cook where cook_user_id=? and business_type=? order by cook_id desc LIMIT ?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?;`, [req.query.user_id, 'service', 50, req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			var final_array = [];
			if (results[0].length > 0) {
				Object.keys(results[0]).forEach(function(key, idx, array) {
					var result_data = results[0][key];
					result_data.table_name = "cook";
					var di = '0.0 km';
					var ti = '0 hours 0 mins';
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[1].length > 0) {
						var origin = result_data.cook_latitude + "," + result_data.cook_longitude;
						var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
						////console.log(destination);
						////console.log(origin);
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					} else {
						var origin = 00;
						var destination = 00;
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					}
					request(options, function(error, response) {
						if (error) {
							result_data.distance = di;
							result_data.time = ti;
							flag = 1;
						} else {
							var data_distance = JSON.parse(response.body);
							if (data_distance.rows[0] && data_distance.rows[0].elements[0].status == "OK") {
								if (data_distance.rows[0].elements[0].status == "OK") {
									di = data_distance.rows[0].elements[0].distance.text;
									ti = data_distance.rows[0].elements[0].duration.text;
									result_data.distance = di;
									result_data.time = ti;
									flag = 1;
								}
							} else {
								flag = 1;
								result_data.distance = di;
								result_data.time = ti;
							}
						}
						db.query(`SELECT * FROM tbl_bazar_cook_rating where cook_id=?;`, [result_data.cook_id], function(error, results_rating, fields) {
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
							result_data.rating = rating;
							result_data.rating_user_count = results_rating.length;
							//if (flag == 1)
							final_array.push(result_data);
							if (idx === array.length - 1) {
								setTimeout(function() {
									res.cook = final_array;
									next();
								}, 100);
							}
						});
					});
				});
			} else {
				res.cook = final_array;
				next();
			}
		});
	} else {
		res.cook = final_array;
		next();
	}
}
const contructor = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT * FROM tbl_bazar_contructor where contructor_user_id=? and business_type=? order by contructor_id desc LIMIT ?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?;`, [req.query.user_id, 'service', 50, req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			var final_array = [];
			if (results[0].length > 0) {
				Object.keys(results[0]).forEach(function(key, idx, array) {
					var result_data = results[0][key];
					result_data.table_name = "contructor";
					var di = '0.0 km';
					var ti = '0 hours 0 mins';
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[1].length > 0) {
						var origin = result_data.contructor_latitude + "," + result_data.contructor_longitude;
						var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
						////console.log(destination);
						////console.log(origin);
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					} else {
						var origin = 00;
						var destination = 00;
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					}
					request(options, function(error, response) {
						if (error) {
							result_data.distance = di;
							result_data.time = ti;
							flag = 1;
						} else {
							var data_distance = JSON.parse(response.body);
							if (data_distance.rows[0] && data_distance.rows[0].elements[0].status == "OK") {
								if (data_distance.rows[0].elements[0].status == "OK") {
									di = data_distance.rows[0].elements[0].distance.text;
									ti = data_distance.rows[0].elements[0].duration.text;
									result_data.distance = di;
									result_data.time = ti;
									flag = 1;
								}
							} else {
								flag = 1;
								result_data.distance = di;
								result_data.time = ti;
							}
						}
						db.query(`SELECT * FROM tbl_bazar_contructor_rating where contructor_id=?;`, [result_data.contructor_id], function(error, results_rating, fields) {
							if (error) throw error;
							if (results_rating.length > 0) {
								var total = 0;
								Object.keys(results_rating).forEach(function(key1, idx1, array1) {
									var result_data_rating = results_rating[key1];
									total = parseFloat(total) + parseFloat(result_data_rating.contructor_rating);
									if (idx1 === array1.length - 1) {
										var rating1 = parseFloat(total) / results_rating.length;
										rating = Math.round(rating1 * 100) / 100;
									}
								});
							}
							result_data.rating = rating;
							result_data.rating_user_count = results_rating.length;
							////if (flag == 1)
							final_array.push(result_data);
							if (idx === array.length - 1) {
								setTimeout(function() {
									res.contructor = final_array;
									next();
								}, 100);

							}
						});
					});
				});
			} else {
				res.contructor = final_array;
				next();
			}
		});
	} else {
		res.contructor = final_array;
		next();
	}
}
const common_product = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT * FROM tbl_bazar_product_buy_sell where common_product_user_id=? and business_type=? order by common_product_id desc LIMIT ?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?;`, [req.query.user_id, 'sell', 50, req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			var final_array = [];
			if (results[0].length > 0) {
				Object.keys(results[0]).forEach(function(key, idx, array) {
					var result_data = results[0][key];
					result_data.table_name = "product_buy_sell";
					var di = '0.0 km';
					var ti = '0 hours 0 mins';
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[1].length > 0) {
						var origin = result_data.common_product_latitude + "," + result_data.common_product_longitude;
						var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
						////console.log(destination);
						////console.log(origin);
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					} else {
						var origin = 00;
						var destination = 00;
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					}
					request(options, function(error, response) {
						if (error) {
							result_data.distance = di;
							result_data.time = ti;
							flag = 1;
						} else {
							var data_distance = JSON.parse(response.body);
							if (data_distance.rows[0] && data_distance.rows[0].elements[0].status == "OK") {
								if (data_distance.rows[0].elements[0].status == "OK") {
									di = data_distance.rows[0].elements[0].distance.text;
									ti = data_distance.rows[0].elements[0].duration.text;
									result_data.distance = di;
									result_data.time = ti;
									flag = 1;
								}
							} else {
								flag = 1;
								result_data.distance = di;
								result_data.time = ti;
							}
						}
						db.query(`SELECT * FROM tbl_bazar_product_buy_sell_rating where common_product_id=?;SELECT count(*) as total FROM tbl_bazar_product_buy_sell_wishlist where common_product_id=? and user_id=?;`, [result_data.common_product_id, result_data.common_product_id, req.query.user_id], function(error, results_rating, fields) {
							if (error) throw error;
							if (results_rating[0].length > 0) {
								var total = 0;
								Object.keys(results_rating[0]).forEach(function(key1, idx1, array1) {
									var result_data_rating = results_rating[0][key1];
									total = parseFloat(total) + parseFloat(result_data_rating.common_product_rating);
									if (idx1 === array1.length - 1) {
										var rating1 = parseFloat(total) / results_rating[0].length;
										rating = Math.round(rating1 * 100) / 100;
									}
								});
							}
							result_data.wishlist_flag = results_rating[1][0].total > 0 ? 1 : 0;
							result_data.rating = rating;
							result_data.rating_user_count = results_rating[0].length;
							//if (flag == 1)
							final_array.push(result_data);
							if (idx === array.length - 1) {
								setTimeout(function() {
									res.common_product = final_array;
									next();
								}, 100);

							}
						});
					});
				});
			} else {
				res.common_product = final_array;
				next();
			}
		});
	} else {
		res.common_product = final_array;
		next();
	}
}
const health_care = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT * FROM tbl_bazar_health_care where health_care_user_id=? and business_type=? order by health_care_id desc LIMIT ?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?;`, [req.query.user_id, 'service', 50, req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			var final_array = [];
			if (results[0].length > 0) {
				Object.keys(results[0]).forEach(function(key, idx, array) {
					var result_data = results[0][key];
					result_data.table_name = "health_care";
					var di = '0.0 km';
					var ti = '0 hours 0 mins';
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[1].length > 0) {
						var origin = result_data.health_care_latitude + "," + result_data.health_care_longitude;
						var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
						////console.log(destination);
						////console.log(origin);
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					} else {
						var origin = 00;
						var destination = 00;
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					}
					request(options, function(error, response) {
						if (error) {
							result_data.distance = di;
							result_data.time = ti;
							flag = 1;
						} else {
							var data_distance = JSON.parse(response.body);
							if (data_distance.rows[0] && data_distance.rows[0].elements[0].status == "OK") {
								if (data_distance.rows[0].elements[0].status == "OK") {
									di = data_distance.rows[0].elements[0].distance.text;
									ti = data_distance.rows[0].elements[0].duration.text;
									result_data.distance = di;
									result_data.time = ti;
									flag = 1;
								}
							} else {
								flag = 1;
								result_data.distance = di;
								result_data.time = ti;
							}
						}
						db.query(`SELECT * FROM tbl_bazar_health_care_rating where health_care_id=?;`, [result_data.health_care_id], function(error, results_rating, fields) {
							if (error) throw error;
							if (results_rating.length > 0) {
								var total = 0;
								Object.keys(results_rating).forEach(function(key1, idx1, array1) {
									var result_data_rating = results_rating[key1];
									total = parseFloat(total) + parseFloat(result_data_rating.health_care_rating);
									if (idx1 === array1.length - 1) {
										var rating1 = parseFloat(total) / results_rating.length;
										rating = Math.round(rating1 * 100) / 100;
									}
								});
							}
							result_data.rating = rating;
							result_data.rating_user_count = results_rating.length;
							//if (flag == 1)
							final_array.push(result_data);
							if (idx === array.length - 1) {
								setTimeout(function() {
									res.health_care = final_array;
									next();
								}, 100);

							}
						});
					});
				});
			} else {
				res.health_care = final_array;
				next();
			}
		});
	} else {
		res.health_care = final_array;
		next();
	}
}
const hotel_stay = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT * FROM tbl_bazar_hotel_stay where hotel_stay_user_id=? and business_type=? order by hotel_stay_id desc LIMIT ?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?;`, [req.query.user_id, 'service', 50, req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			var final_array = [];
			if (results[0].length > 0) {
				Object.keys(results[0]).forEach(function(key, idx, array) {
					var result_data = results[0][key];
					result_data.table_name = "hotel_stay";
					var di = '0.0 km';
					var ti = '0 hours 0 mins';
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[1].length > 0) {
						var origin = result_data.hotel_stay_latitude + "," + result_data.hotel_stay_longitude;
						var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
						////console.log(destination);
						////console.log(origin);
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					} else {
						var origin = 00;
						var destination = 00;
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					}
					request(options, function(error, response) {
						if (error) {
							result_data.distance = di;
							result_data.time = ti;
							flag = 1;
						} else {
							var data_distance = JSON.parse(response.body);
							if (data_distance.rows[0] && data_distance.rows[0].elements[0].status == "OK") {
								if (data_distance.rows[0].elements[0].status == "OK") {
									di = data_distance.rows[0].elements[0].distance.text;
									ti = data_distance.rows[0].elements[0].duration.text;
									result_data.distance = di;
									result_data.time = ti;
									flag = 1;
								}
							} else {
								flag = 1;
								result_data.distance = di;
								result_data.time = ti;
							}
						}
						db.query(`SELECT * FROM tbl_bazar_hotel_stay_rating where hotel_stay_id=?;`, [result_data.hotel_stay_id], function(error, results_rating, fields) {
							if (error) throw error;
							if (results_rating.length > 0) {
								var total = 0;
								Object.keys(results_rating).forEach(function(key1, idx1, array1) {
									var result_data_rating = results_rating[key1];
									total = parseFloat(total) + parseFloat(result_data_rating.hotel_stay_rating);
									if (idx1 === array1.length - 1) {
										var rating1 = parseFloat(total) / results_rating.length;
										rating = Math.round(rating1 * 100) / 100;
									}
								});
							}
							result_data.rating = rating;
							result_data.rating_user_count = results_rating.length;
							//if (flag == 1)
							final_array.push(result_data);
							if (idx === array.length - 1) {
								setTimeout(function() {
									res.hotel_stay = final_array;
									next();
								}, 100);

							}
						});
					});
				});
			} else {
				res.hotel_stay = final_array;
				next();
			}
		});
	} else {
		res.hotel_stay = final_array;
		next();
	}
}
const labour = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT * FROM tbl_bazar_labour where labour_user_id=? and business_type=? order by labour_id desc LIMIT ?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?;`, [req.query.user_id, 'service', 50, req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			var final_array = [];
			if (results[0].length > 0) {
				Object.keys(results[0]).forEach(function(key, idx, array) {
					var result_data = results[0][key];
					result_data.table_name = "labour";
					var di = '0.0 km';
					var ti = '0 hours 0 mins';
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[1].length > 0) {
						var origin = result_data.labour_latitude + "," + result_data.labour_longitude;
						var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
						////console.log(destination);
						////console.log(origin);
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					} else {
						var origin = 00;
						var destination = 00;
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					}
					request(options, function(error, response) {
						if (error) {
							result_data.distance = di;
							result_data.time = ti;
							flag = 1;
						} else {
							var data_distance = JSON.parse(response.body);
							if (data_distance.rows[0] && data_distance.rows[0].elements[0].status == "OK") {
								if (data_distance.rows[0].elements[0].status == "OK") {
									di = data_distance.rows[0].elements[0].distance.text;
									ti = data_distance.rows[0].elements[0].duration.text;
									result_data.distance = di;
									result_data.time = ti;
									flag = 1;
								}
							} else {
								flag = 1;
								result_data.distance = di;
								result_data.time = ti;
							}
						}
						db.query(`SELECT * FROM tbl_bazar_labour_rating where labour_id=?;`, [result_data.labour_id], function(error, results_rating, fields) {
							if (error) throw error;
							if (results_rating.length > 0) {
								var total = 0;
								Object.keys(results_rating).forEach(function(key1, idx1, array1) {
									var result_data_rating = results_rating[key1];
									total = parseFloat(total) + parseFloat(result_data_rating.labour_rating);
									if (idx1 === array1.length - 1) {
										var rating1 = parseFloat(total) / results_rating.length;
										rating = Math.round(rating1 * 100) / 100;
									}
								});
							}
							result_data.rating = rating;
							result_data.rating_user_count = results_rating.length;
							//if (flag == 1)
							final_array.push(result_data);
							if (idx === array.length - 1) {
								setTimeout(function() {
									res.labour = final_array;
									next();
								}, 100);

							}
						});
					});
				});
			} else {
				res.labour = final_array;
				next();
			}
		});
	} else {
		res.labour = final_array;
		next();
	}
}
const play_school = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT * FROM tbl_bazar_play_school where play_school_user_id=? and business_type=? order by play_school_id desc LIMIT ?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?;`, [req.query.user_id, 'service', 50, req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			var final_array = [];
			if (results[0].length > 0) {
				Object.keys(results[0]).forEach(function(key, idx, array) {
					var result_data = results[0][key];
					result_data.table_name = "play_school";
					var di = '0.0 km';
					var ti = '0 hours 0 mins';
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[1].length > 0) {
						var origin = result_data.play_school_latitude + "," + result_data.play_school_longitude;
						var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
						////console.log(destination);
						////console.log(origin);
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					} else {
						var origin = 00;
						var destination = 00;
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					}
					request(options, function(error, response) {
						if (error) {
							result_data.distance = di;
							result_data.time = ti;
							flag = 1;
						} else {
							var data_distance = JSON.parse(response.body);
							if (data_distance.rows[0] && data_distance.rows[0].elements[0].status == "OK") {
								if (data_distance.rows[0].elements[0].status == "OK") {
									di = data_distance.rows[0].elements[0].distance.text;
									ti = data_distance.rows[0].elements[0].duration.text;
									result_data.distance = di;
									result_data.time = ti;
									flag = 1;
								}
							} else {
								flag = 1;
								result_data.distance = di;
								result_data.time = ti;
							}
						}
						db.query(`SELECT * FROM tbl_bazar_play_school_rating where play_school_id=?;`, [result_data.play_school_id], function(error, results_rating, fields) {
							if (error) throw error;
							if (results_rating.length > 0) {
								var total = 0;
								Object.keys(results_rating).forEach(function(key1, idx1, array1) {
									var result_data_rating = results_rating[key1];
									total = parseFloat(total) + parseFloat(result_data_rating.play_school_rating);
									if (idx1 === array1.length - 1) {
										var rating1 = parseFloat(total) / results_rating.length;
										rating = Math.round(rating1 * 100) / 100;
									}
								});
							}
							result_data.rating = rating;
							result_data.rating_user_count = results_rating.length;
							//if (flag == 1)
							final_array.push(result_data);
							if (idx === array.length - 1) {
								setTimeout(function() {
									res.play_school = final_array;
									next();
								}, 100);

							}
						});
					});
				});
			} else {
				res.play_school = final_array;
				next();
			}
		});
	} else {
		res.play_school = final_array;
		next();
	}
}
const restaurants = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT * FROM tbl_bazar_restaurants where restaurants_user_id=? and business_type=? order by restaurants_id desc LIMIT ?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?;`, [req.query.user_id, 'service', 50, req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			var final_array = [];
			if (results[0].length > 0) {
				Object.keys(results[0]).forEach(function(key, idx, array) {
					var result_data = results[0][key];
					result_data.table_name = "restaurants";
					var di = '0.0 km';
					var ti = '0 hours 0 mins';
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[1].length > 0) {
						var origin = result_data.restaurants_latitude + "," + result_data.restaurants_longitude;
						var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
						////console.log(destination);
						////console.log(origin);
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					} else {
						var origin = 00;
						var destination = 00;
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					}
					request(options, function(error, response) {
						if (error) {
							result_data.distance = di;
							result_data.time = ti;
							flag = 1;
						} else {
							var data_distance = JSON.parse(response.body);
							if (data_distance.rows[0] && data_distance.rows[0].elements[0].status == "OK") {
								if (data_distance.rows[0].elements[0].status == "OK") {
									di = data_distance.rows[0].elements[0].distance.text;
									ti = data_distance.rows[0].elements[0].duration.text;
									result_data.distance = di;
									result_data.time = ti;
									flag = 1;
								}
							} else {
								flag = 1;
								result_data.distance = di;
								result_data.time = ti;
							}
						}
						db.query(`SELECT * FROM tbl_bazar_restaurants_rating where restaurants_id=?;`, [result_data.restaurants_id], function(error, results_rating, fields) {
							if (error) throw error;
							if (results_rating.length > 0) {
								var total = 0;
								Object.keys(results_rating).forEach(function(key1, idx1, array1) {
									var result_data_rating = results_rating[key1];
									total = parseFloat(total) + parseFloat(result_data_rating.restaurants_rating);
									if (idx1 === array1.length - 1) {
										var rating1 = parseFloat(total) / results_rating.length;
										rating = Math.round(rating1 * 100) / 100;
									}
								});
							}
							result_data.rating = rating;
							result_data.rating_user_count = results_rating.length;
							//if (flag == 1)
							final_array.push(result_data);
							if (idx === array.length - 1) {
								setTimeout(function() {
									res.restaurants = final_array;
									next();
								}, 100);

							}
						});
					});
				});
			} else {
				res.restaurants = final_array;
				next();
			}
		});
	} else {
		res.restaurants = final_array;
		next();
	}
}
const school_college = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT * FROM tbl_bazar_school_college where school_college_user_id=? and business_type=? order by school_college_id desc LIMIT ?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?;`, [req.query.user_id, 'service', 50, req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			var final_array = [];
			if (results[0].length > 0) {
				Object.keys(results[0]).forEach(function(key, idx, array) {
					var result_data = results[0][key];
					result_data.table_name = "school_college";
					var di = '0.0 km';
					var ti = '0 hours 0 mins';
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[1].length > 0) {
						var origin = result_data.school_college_latitude + "," + result_data.school_college_longitude;
						var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
						////console.log(destination);
						////console.log(origin);
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					} else {
						var origin = 00;
						var destination = 00;
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					}
					request(options, function(error, response) {
						if (error) {
							result_data.distance = di;
							result_data.time = ti;
							flag = 1;
						} else {
							var data_distance = JSON.parse(response.body);
							if (data_distance.rows[0] && data_distance.rows[0].elements[0].status == "OK") {
								if (data_distance.rows[0].elements[0].status == "OK") {
									di = data_distance.rows[0].elements[0].distance.text;
									ti = data_distance.rows[0].elements[0].duration.text;
									result_data.distance = di;
									result_data.time = ti;
									flag = 1;
								}
							} else {
								flag = 1;
								result_data.distance = di;
								result_data.time = ti;
							}
						}
						db.query(`SELECT * FROM tbl_bazar_school_college_rating where school_college_id=?;`, [result_data.school_college_id], function(error, results_rating, fields) {
							if (error) throw error;
							if (results_rating.length > 0) {
								var total = 0;
								Object.keys(results_rating).forEach(function(key1, idx1, array1) {
									var result_data_rating = results_rating[key1];
									total = parseFloat(total) + parseFloat(result_data_rating.school_college_rating);
									if (idx1 === array1.length - 1) {
										var rating1 = parseFloat(total) / results_rating.length;
										rating = Math.round(rating1 * 100) / 100;
									}
								});
							}
							result_data.rating = rating;
							result_data.rating_user_count = results_rating.length;
							//if (flag == 1)
							final_array.push(result_data);
							if (idx === array.length - 1) {
								setTimeout(function() {
									res.school_college = final_array;
									next();
								}, 100);

							}
						});
					});
				});
			} else {
				res.school_college = final_array;
				next();
			}
		});
	} else {
		res.school_college = final_array;
		next();
	}
}
const self_employee = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT * FROM tbl_bazar_self_employee where self_employee_user_id=? and business_type=? order by self_employee_id desc LIMIT ?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?;`, [req.query.user_id, 'service', 50, req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			var final_array = [];
			if (results[0].length > 0) {
				Object.keys(results[0]).forEach(function(key, idx, array) {
					var result_data = results[0][key];
					result_data.table_name = "self_employee";
					var di = '0.0 km';
					var ti = '0 hours 0 mins';
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[1].length > 0) {
						var origin = result_data.self_employee_latitude + "," + result_data.self_employee_longitude;
						var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
						////console.log(destination);
						////console.log(origin);
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					} else {
						var origin = 00;
						var destination = 00;
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					}
					request(options, function(error, response) {
						if (error) {
							result_data.distance = di;
							result_data.time = ti;
							flag = 1;
						} else {
							var data_distance = JSON.parse(response.body);
							if (data_distance.rows[0] && data_distance.rows[0].elements[0].status == "OK") {
								if (data_distance.rows[0].elements[0].status == "OK") {
									di = data_distance.rows[0].elements[0].distance.text;
									ti = data_distance.rows[0].elements[0].duration.text;
									result_data.distance = di;
									result_data.time = ti;
									flag = 1;
								}
							} else {
								flag = 1;
								result_data.distance = di;
								result_data.time = ti;
							}
						}
						db.query(`SELECT * FROM tbl_bazar_self_employee_rating where self_employee_id=?;`, [result_data.self_employee_id], function(error, results_rating, fields) {
							if (error) throw error;
							if (results_rating.length > 0) {
								var total = 0;
								Object.keys(results_rating).forEach(function(key1, idx1, array1) {
									var result_data_rating = results_rating[key1];
									total = parseFloat(total) + parseFloat(result_data_rating.self_employee_rating);
									if (idx1 === array1.length - 1) {
										var rating1 = parseFloat(total) / results_rating.length;
										rating = Math.round(rating1 * 100) / 100;
									}
								});
							}
							result_data.rating = rating;
							result_data.rating_user_count = results_rating.length;
							//if (flag == 1)
							final_array.push(result_data);
							if (idx === array.length - 1) {
								setTimeout(function() {
									res.self_employee = final_array;
									next();
								}, 100);

							}
						});
					});
				});
			} else {
				res.self_employee = final_array;
				next();
			}
		});
	} else {
		res.self_employee = final_array;
		next();
	}
}
const medicals = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT * FROM tbl_bazar_medicals where medicals_user_id=? and business_type=? order by medicals_id desc LIMIT ?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?;`, [req.query.user_id, 'service', 50, req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			var final_array = [];
			if (results[0].length > 0) {
				Object.keys(results[0]).forEach(function(key, idx, array) {
					var result_data = results[0][key];
					result_data.table_name = "medicals";
					var di = '0.0 km';
					var ti = '0 hours 0 mins';
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[1].length > 0) {
						var origin = result_data.medicals_latitude + "," + result_data.medicals_longitude;
						var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
						////console.log(destination);
						////console.log(origin);
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					} else {
						var origin = 00;
						var destination = 00;
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					}
					request(options, function(error, response) {
						if (error) {
							result_data.distance = di;
							result_data.time = ti;
							flag = 1;
						} else {
							var data_distance = JSON.parse(response.body);
							if (data_distance.rows[0] && data_distance.rows[0].elements[0].status == "OK") {
								if (data_distance.rows[0].elements[0].status == "OK") {
									di = data_distance.rows[0].elements[0].distance.text;
									ti = data_distance.rows[0].elements[0].duration.text;
									result_data.distance = di;
									result_data.time = ti;
									flag = 1;
								}
							} else {
								flag = 1;
								result_data.distance = di;
								result_data.time = ti;
							}
						}
						db.query(`SELECT * FROM tbl_bazar_medicals_rating where medical_id=?;`, [result_data.medicals_id], function(error, results_rating, fields) {
							if (error) throw error;
							if (results_rating.length > 0) {
								var total = 0;
								Object.keys(results_rating).forEach(function(key1, idx1, array1) {
									var result_data_rating = results_rating[key1];
									total = parseFloat(total) + parseFloat(result_data_rating.medicals_rating);
									if (idx1 === array1.length - 1) {
										var rating1 = parseFloat(total) / results_rating.length;
										rating = Math.round(rating1 * 100) / 100;
									}
								});
							}
							result_data.rating = rating;
							result_data.rating_user_count = results_rating.length;
							//if (flag == 1)
							final_array.push(result_data);
							if (idx === array.length - 1) {
								setTimeout(function() {
									res.medicals = final_array;
									next();
								}, 100);

							}
						});
					});
				});
			} else {
				res.medicals = final_array;
				next();
			}
		});
	} else {
		res.medicals = final_array;
		next();
	}
}
const doctors = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT * FROM tbl_bazar_doctor where doctors_user_id=? and business_type=? order by doctors_id desc LIMIT ?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?;`, [req.query.user_id, 'service', 50, req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			var final_array = [];
			if (results[0].length > 0) {
				Object.keys(results[0]).forEach(function(key, idx, array) {
					var result_data = results[0][key];
					result_data.table_name = "doctor";
					var di = '0.0 km';
					var ti = '0 hours 0 mins';
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[1].length > 0) {
						var origin = result_data.doctor_latitude + "," + result_data.doctor_longitude;
						var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
						////console.log(destination);
						////console.log(origin);
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					} else {
						var origin = 00;
						var destination = 00;
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					}
					request(options, function(error, response) {
						if (error) {
							result_data.distance = di;
							result_data.time = ti;
							flag = 1;
						} else {
							var data_distance = JSON.parse(response.body);
							if (data_distance.rows[0] && data_distance.rows[0].elements[0].status == "OK") {
								if (data_distance.rows[0].elements[0].status == "OK") {
									di = data_distance.rows[0].elements[0].distance.text;
									ti = data_distance.rows[0].elements[0].duration.text;
									result_data.distance = di;
									result_data.time = ti;
									flag = 1;
								}
							} else {
								flag = 1;
								result_data.distance = di;
								result_data.time = ti;
							}
						}
						db.query(`SELECT * FROM tbl_bazar_doctor_rating where doctor_rating_doctor_id=?;`, [result_data.doctors_id], function(error, results_rating, fields) {
							if (error) throw error;
							if (results_rating.length > 0) {
								var total = 0;
								Object.keys(results_rating).forEach(function(key1, idx1, array1) {
									var result_data_rating = results_rating[key1];
									total = parseFloat(total) + parseFloat(result_data_rating.doctors_rating);
									if (idx1 === array1.length - 1) {
										var rating1 = parseFloat(total) / results_rating.length;
										rating = Math.round(rating1 * 100) / 100;
									}
								});
							}
							result_data.rating = rating;
							result_data.rating_user_count = results_rating.length;
							//if (flag == 1)
							final_array.push(result_data);
							if (idx === array.length - 1) {
								res.doctors = final_array;
								next();
							}
						});
					});
				});
			} else {
				res.doctors = final_array;
				next();
			}
		});
	} else {
		res.doctors = final_array;
		next();
	}
}
const tour_travel = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT * FROM tbl_bazar_tour_travel where tour_travel_user_id=? and business_type=? order by tour_travel_id desc LIMIT ?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?;`, [req.query.user_id, 'service', 50, req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			var final_array = [];
			if (results[0].length > 0) {
				Object.keys(results[0]).forEach(function(key, idx, array) {
					var result_data = results[0][key];
					result_data.table_name = "tour_travel";
					var di = '0.0 km';
					var ti = '0 hours 0 mins';
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[1].length > 0) {
						var origin = result_data.tour_travel_latitude + "," + result_data.tour_travel_longitude;
						var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
						////console.log(destination);
						////console.log(origin);
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					} else {
						var origin = 00;
						var destination = 00;
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					}
					request(options, function(error, response) {
						if (error) {
							result_data.distance = di;
							result_data.time = ti;
							flag = 1;
						} else {
							var data_distance = JSON.parse(response.body);
							if (data_distance.rows[0] && data_distance.rows[0].elements[0].status == "OK") {
								if (data_distance.rows[0].elements[0].status == "OK") {
									di = data_distance.rows[0].elements[0].distance.text;
									ti = data_distance.rows[0].elements[0].duration.text;
									result_data.distance = di;
									result_data.time = ti;
									flag = 1;
								}
							} else {
								flag = 1;
								result_data.distance = di;
								result_data.time = ti;
							}
						}
						db.query(`SELECT * FROM tbl_bazar_tour_travel_rating where tour_travel_id=?;`, [result_data.tour_travel_id], function(error, results_rating, fields) {
							if (error) throw error;
							if (results_rating.length > 0) {
								var total = 0;
								Object.keys(results_rating).forEach(function(key1, idx1, array1) {
									var result_data_rating = results_rating[key1];
									total = parseFloat(total) + parseFloat(result_data_rating.tour_travel_rating);
									if (idx1 === array1.length - 1) {
										var rating1 = parseFloat(total) / results_rating.length;
										rating = Math.round(rating1 * 100) / 100;
									}
								});
							}
							result_data.rating = rating;
							result_data.rating_user_count = results_rating.length;
							//if (flag == 1)
							final_array.push(result_data);
							if (idx === array.length - 1) {
								res.tour_travel = final_array;
								next();
							}
						});
					});
				});
			} else {
				res.tour_travel = final_array;
				next();
			}
		});
	} else {
		res.tour_travel = final_array;
		next();
	}
}
const rent = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT * FROM tbl_bazar_rent where rent_user_id=? and business_type=? order by rent_id desc LIMIT ?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?;`, [req.query.user_id, 'service', 50, req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			var final_array = [];
			if (results[0].length > 0) {
				Object.keys(results[0]).forEach(function(key, idx, array) {
					var result_data = results[0][key];
					result_data.table_name = "rent";
					var di = '0.0 km';
					var ti = '0 hours 0 mins';
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[1].length > 0) {
						var origin = result_data.rent_latitude + "," + result_data.rent_longitude;
						var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
						////console.log(destination);
						////console.log(origin);
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					} else {
						var origin = 00;
						var destination = 00;
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					}
					request(options, function(error, response) {
						if (error) {
							result_data.distance = di;
							result_data.time = ti;
							flag = 1;
						} else {
							var data_distance = JSON.parse(response.body);
							if (data_distance.rows[0] && data_distance.rows[0].elements[0].status == "OK") {
								if (data_distance.rows[0].elements[0].status == "OK") {
									di = data_distance.rows[0].elements[0].distance.text;
									ti = data_distance.rows[0].elements[0].duration.text;
									result_data.distance = di;
									result_data.time = ti;
									flag = 1;
								}
							} else {
								flag = 1;
								result_data.distance = di;
								result_data.time = ti;
							}
						}
						db.query(`SELECT * FROM tbl_bazar_rent_rating where rent_id=?;`, [result_data.rent_id], function(error, results_rating, fields) {
							if (error) throw error;
							if (results_rating.length > 0) {
								var total = 0;
								Object.keys(results_rating).forEach(function(key1, idx1, array1) {
									var result_data_rating = results_rating[key1];
									total = parseFloat(total) + parseFloat(result_data_rating.rent_rating);
									if (idx1 === array1.length - 1) {
										var rating1 = parseFloat(total) / results_rating.length;
										rating = Math.round(rating1 * 100) / 100;
									}
								});
							}
							result_data.rating = rating;
							result_data.rating_user_count = results_rating.length;
							//if (flag == 1)
							final_array.push(result_data);
							if (idx === array.length - 1) {
								res.rent = final_array;
								next();
							}
						});
					});
				});
			} else {
				res.rent = final_array;
				next();
			}
		});
	} else {
		res.rent = final_array;
		next();
	}
}
const vehicle_rental = function(req, res, next) {
	if (req.query.user_id) {
		db.query(`SELECT * FROM tbl_bazar_vehicle_rental where vehicle_rental_user_id=? and business_type=? order by vehicle_rental_id desc LIMIT ?;SELECT * FROM tbl_user_coordinates where coordinate_user_id=?;`, [req.query.user_id, 'service', 50, req.query.user_id], function(error, results, fields) {
			if (error) throw error;
			var final_array = [];
			if (results[0].length > 0) {
				Object.keys(results[0]).forEach(function(key, idx, array) {
					var result_data = results[0][key];
					result_data.table_name = "vehicle_rental";
					var di = '0.0 km';
					var ti = '0 hours 0 mins';
					var rating = 0;
					var rating_count = 0;
					var flag = 2;
					if (results[1].length > 0) {
						var origin = result_data.vehicle_rental_latitude + "," + result_data.vehicle_rental_longitude;
						var destination = (results[1][0].coordinates_latitude) + "," + (results[1][0].coordinates_longitude);
						////console.log(destination);
						////console.log(origin);
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					} else {
						var origin = 00;
						var destination = 00;
						var request = require('request');
						var options = {
							'method': 'GET',
							'url': 'https://maps.googleapis.com/maps/api/distancematrix/json?units=km&origins=' + origin + '&destinations=' + destination + '&key=' + define.GOOGLE_KEY,
							'headers': {}
						};
					}
					request(options, function(error, response) {
						if (error) {
							result_data.distance = di;
							result_data.time = ti;
							flag = 1;
						} else {
							var data_distance = JSON.parse(response.body);
							if (data_distance.rows[0] && data_distance.rows[0].elements[0].status == "OK") {
								if (data_distance.rows[0].elements[0].status == "OK") {
									di = data_distance.rows[0].elements[0].distance.text;
									ti = data_distance.rows[0].elements[0].duration.text;
									result_data.distance = di;
									result_data.time = ti;
									flag = 1;
								}
							} else {
								flag = 1;
								result_data.distance = di;
								result_data.time = ti;
							}
						}
						db.query(`SELECT * FROM tbl_bazar_vehicle_rental_rating where vehicle_rental_id=?;`, [result_data.vehicle_rental_id], function(error, results_rating, fields) {
							if (error) throw error;
							if (results_rating.length > 0) {
								var total = 0;
								Object.keys(results_rating).forEach(function(key1, idx1, array1) {
									var result_data_rating = results_rating[key1];
									total = parseFloat(total) + parseFloat(result_data_rating.vehicle_rental_rating);
									if (idx1 === array1.length - 1) {
										var rating1 = parseFloat(total) / results_rating.length;
										rating = Math.round(rating1 * 100) / 100;
									}
								});
							}
							result_data.rating = rating;
							result_data.rating_user_count = results_rating.length;
							//if (flag == 1)
							final_array.push(result_data);
							if (idx === array.length - 1) {
								res.vehicle_rental = final_array;
								next();
							}
						});
					});
				});
			} else {
				res.vehicle_rental = final_array;
				next();
			}
		});
	} else {
		res.vehicle_rental = final_array;
		next();
	}
}

module.exports = {
	totalFriendCount,
	workListFun,
	othersListFun,
	languageListFun,
	educationListFun,
	profileListFun,
	totalFriendsArray,
	fullProfileData,
	totalFriendsDetail,
	followerListData,
	unFollowerListData,
	followerListDataForAdditionalSetting,
	unFollowerListDataForAdditionalSetting,
	checkUser,
	totalFriendsArray1,
	totalFriendsArrayOther,
	profilePer,
	educationPer,
	workPer,
	othersPer,
	commentList,
	getAllFeedForNormal,
	getAllFeedForNormalNotApproved,
	getAllSharedFeedForNormal,
	getAllSharedFeedForNormalNotApproved,
	getAllFeedForNormalBusiness,
	getAllSharedFeedForNormalBusiness,
	totalFriendsArray14,
	followerListDataForAdditionalSetting11,
	cook,
	contructor,
	common_product,
	health_care,
	hotel_stay,
	labour,
	play_school,
	rent,
	getChatProfiles,
	getFeedShare,
	getFeedfollower,
	getFeedReaction,
	totalFriendsArrayGroup,
	getAllFrindListForGroup,
	totalFriendsArrayViewer,
	restaurants,
	school_college,
	self_employee,
	doctors,
	medicals,
	tour_travel,
	vehicle_rental
};