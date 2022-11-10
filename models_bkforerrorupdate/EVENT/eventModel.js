const fs = require('fs');
const db = require("../../config/connection");
var timeAgo = require('node-time-ago');
const merge = require('deepmerge');
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
var service = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../uploads/event/');
    },
    filename: function(req, file, cb) {
        cb(null, "event_" +crypto.createHash('md5').update('1903332cf4ced82311a949443e04f7').digest('hex') + Date.now() + path.extname(file.originalname));
    }
});
exports.add_event = async (req, res) => {
	try {
    let upload = multer({
        storage: service,
    }).fields([{
        name: 'event_gallery',
        maxCount: 20
    }]);
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: err
            });
        } else {
            if (req.body.event_user_id) {
                //console.log(req.files);
                var i = 0;
                var event_gallery = [];
                  var event_gallery1 = [];
                  var kkk='';
                var event_gallery_type = '';
                if (typeof req.files.event_gallery !== 'undefined') {
                    Object.keys(req.files.event_gallery).forEach(function(key, idx1, array1) {
                        var result_file = req.files.event_gallery[key];
                           let ext = result_file.originalname.substring(result_file.originalname.lastIndexOf('.'), result_file.originalname.length);
                        fs.copyFile(result_file.path, "../uploads/feeds/" + result_file.filename, (err) => {
                            if (err) throw err;
                            console.log('source.txt was copied to destination.txt');
                        });
                        console.log(result_file.path);
                        //   fs.copyFile(result_file.path, "../uploads/feeds/"+result_file.filename);
                        if (ext == ".png" || ext == ".jpg" || ext == ".jpeg") {
                            req.body.feed_media_type = "image";
                        }
                      if (ext === '.mov' || ext === '.avchd' || ext === '.mkv' || ext === '.webm' || ext === '.gif' || ext === '.mp4' || ext === 'ogg' || ext === '.wmv' || ext === 'x-flv' || ext === '.avi') {
                            req.body.feed_media_type = "video";
                        }
                        event_gallery.push(define.BASE_URL+"event/"+result_file.filename);
                        event_gallery1.push(define.BASE_URL+"feeds/"+result_file.filename);
                        if (idx1 === array1.length - 1) {
                            req.body.event_gallery = event_gallery.toString();
                            kkk = event_gallery1.toString();
                        }

                    });
                }
                let feed_media_type = req.body.feed_media_type;
                delete(req.body.feed_media_type);
                console.log(req.body);

                db.query(`INSERT INTO tbl_events SET ?`, req.body, function(error, results, fields) {
                    if (error) {
                        return res.status(400).send({
                            status: 400,
                            msg: "fail"
                        });
                    } else {
                        db.query(`SELECT * from tbl_user_profile where user_id= ?`, req.body.event_user_id, function(error, results12, fields) {
                            if (error) {
                                return res.status(400).send({
                                    status: 400,
                                    msg: "fail"
                                });
                            } else {
                                // if (results12.length > 0) {
                                let data1 = {
                                    'event_id': (results.insertId) ? results.insertId : '',
                                    'feed_user_id': (req.body.event_user_id) ? req.body.event_user_id : '',
                                    'feed_user_image': (results12.length > 0) ? results12[0].user_profile_img : '',
                                    'feed_user_name': (results12.length > 0) ? results12[0].user_name : '',
                                    'feed_text': (req.body.event_description) ? req.body.event_description : '',
                                    'feed_media': kkk!='' ? kkk : '',
                                    'feed_media_type': (feed_media_type) ? feed_media_type : '',
                                    'feed_type': (req.body.event_type) ? req.body.event_type : '',
                                    'feed_type_number': (req.body.event_type_number) ? req.body.event_type_number : '',
                                    'feed_group_status':3
                                };
                                db.query(`INSERT INTO tbl_feed SET ?`, data1, function(error, results56, fields) {
                                    if (error) {
                                        return res.status(400).send({
                                            status: 400,
                                            msg: "fail"
                                        });
                                    } else {
                                        db.query(`UPDATE tbl_events SET feed_id= ? where event_id=?`, [results56.insertId, results.insertId], function(error, results56, fields) {
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
                                // }else{
                                //      return res.status(400).send({
                                //                 status: 400,
                                //                 msg: "fail2"
                                //             });
                                // }
                            }

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
exports.get_event = async (req, res) => {
	try {
    if (req.query.user_id) {
        db.query(`SELECT *  from tbl_events where event_user_id = ? AND event_status = ? `, [req.query.user_id, '0'], function(error, results1, fields) {
            if (error) throw error;
            if (results1.length > 0) {

                return res.status(200).send({
                    status: 200,
                    msg: "Success",
                    eventListCount: results1.length,
                    eventList: results1
                });

            } else {
                return res.status(404).send({
                    status: 404,
                    msg: "No Record Found",
                     eventListCount: 0,
                    eventList: []
                });
            }
        });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
               eventListCount: 0,
                    eventList: []
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.delete_event = async (req, res) => {
	try {
    if (req.query.event_id) {

        db.query(`UPDATE tbl_events SET event_status = ? where event_id = ?`, ['1', req.query.event_id], function(error, results, fields) {
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
exports.image_list = async (req, res) => {
	try {
    if (req.query.page_no) {
        var query = db.query(`SELECT * FROM tbl_image_category`, function(error, results, fields) {
            if (error) {
                return res.status(400).send({
                    status: 400,
                    msg: "fail"
                });
            } else {
                console.log(query.sql);
                if (results.length > 0) {
                    var final_array = [];
                    var totalfriendsList = [];
                    Object.keys(results).forEach(function(key, index, array) {
                        var result = results[key];

                        final_array.push(result.image_category_url);
                        if (index === array.length - 1) {
                            let no_of_records_per_page = 12;
                            let max_pages = parseInt(Math.ceil((final_array.length) / no_of_records_per_page));
                            if (req.query.page_no <= max_pages) {
                                let page_no = req.query.page_no;

                                // PAGINATION START

                                let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
                                let sliceData = final_array.slice(offset, offset + no_of_records_per_page)
                                var pagination = {
                                    total_rows: final_array.length,
                                    total_pages: parseInt(Math.ceil((final_array.length) / no_of_records_per_page)),
                                    per_page: no_of_records_per_page,
                                    offset: offset,
                                    current_page_no: page_no
                                };
                                // PAGINATION END

                                return res.status(200).send({
                                    status: 200,
                                    msg: "Success",
                                    bgImageListCount: results.length,
                                    bgImageList: sliceData,
                                    pagination: pagination
                                });
                            } else {
                                return res.status(404).send({
                                    status: 404,
                                    msg: "Page no missing or Its incorrect.",
                                      bgImageListCount: 0,
                                    bgImageList: [],
                                     pagination:  {
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
                } else {

                    return res.status(400).send({
                        status: 400,
                        msg: "fail",
                               bgImageListCount: 0,
                                    bgImageList: [],
                                     pagination:  {
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
    } else {
        return res.status(404).send({
            status: 404,
            msg: "Page no missing or Its incorrect",
                   bgImageListCount: 0,
                                    bgImageList: [],
                                     pagination:  {
                                        total_rows: 0,
                                        total_pages: 0,
                                        per_page: 0,
                                        offset: 0,
                                        current_page_no: '0'
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
exports.image_category_list = async (req, res) => {
	try {
    if (req.query.random_image_id) {
        db.query(`SELECT *  from tbl_image_category where random_image_id = ?`, [req.query.random_image_id], function(error, results1, fields) {
            if (error) throw error;
            if (results1.length > 0) {
                var final_array = [];
                var totalfriendsList = [];
                Object.keys(results1).forEach(function(key, index, array) {
                    var result = results1[key];
                    final_array.push(result.image_category_url);

                    if (index === array.length - 1) {
                        let nam = '';
                        db.query(`SELECT * from tbl_random_image where random_image_id = ?`, [req.query.random_image_id], function(error, results14, fields) {
                            if (error) {

                            } else {
                                if (results14.length > 0)
                                    nam = results14[0].random_image_name;
                            }

                            return res.status(200).send({
                                status: 200,
                                msg: "Success",
                                randomBgListCount: results1.length,
                                randomBgListName: nam,
                                randomBgList: final_array
                            });
                        });
                    }
                });
            } else {
                return res.status(409).send({
                    status: 409,
                    msg: "Record not found",
                     randomBgListCount: 0,
                                randomBgListName: '',
                                randomBgList: []
                });
            }
        });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
               randomBgListCount: 0,
                                randomBgListName: '',
                                randomBgList: []
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};


exports.event_going = async (req, res) => {
	try {
            if (req.query.flag && req.query.event_id) {
                req.query.event_going_user_id=req.query.user_id;
                delete(req.query.user_id);
                    db.query(`SELECT * FROM tbl_events where event_id=? and event_status=?`, [req.query.event_id, '0'], function(error, results12, fields) {
                        if (error) {
                            return res.status(400).send({
                                status: 400,
                                msg: "fail"
                            });
                        } else {
                            if (results12.length > 0) {
                                db.query(`SELECT * FROM tbl_event_going where event_id=? and event_going_user_id=?`, [req.query.event_id, req.query.event_going_user_id], function(error, results_update, fields) {
                                    if (error) {
                                        return res.status(400).send({
                                            status: 400,
                                            msg: "fail"
                                        });
                                    } else {
                                        if (results_update.length <= 0 && req.query.flag == 1) {
                                            delete(req.query.flag);
                                            var like = parseInt(results12[0].event_going_count) + 1;
                                            db.query(`UPDATE tbl_events SET ? where  event_id=?`, [{
                                                event_going_count: like
                                            }, req.query.event_id], function(error, results, fields) {
                                                if (error) {
                                                    return res.status(400).send({
                                                        status: 400,
                                                        msg: error
                                                    });
                                                } else {
                                                    db.query(`INSERT INTO tbl_event_going SET ?`, req.query, function(error, results, fields) {
                                                        if (error) {
                                                            return res.status(400).send({
                                                                status: 400,
                                                                msg: error
                                                            });
                                                        } else {
                                                            return res.status(200).send({
                                                                status: 200,
                                                                msg: "Success",
                                                                goingCount:like.toString()
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        } else if(results_update.length > 0 && req.query.flag == 0) {
                                            delete(req.query.flag);
                                            var like = parseInt(results12[0].event_going_count) - 1;
                                            db.query(`UPDATE tbl_events SET ? where  event_id=?`, [{
                                                event_going_count: like
                                            }, req.query.event_id], function(error, results, fields) {
                                                if (error) {
                                                    return res.status(400).send({
                                                        status: 400,
                                                        msg: "fail"
                                                    });
                                                } else {
                                                    db.query(`DELETE FROM tbl_event_going where event_going_user_id=? and event_id=?`,[req.query.event_going_user_id, req.query.event_id], function(error, results, fields) {
                                                        if (error) {
                                                            return res.status(400).send({
                                                                status: 400,
                                                                msg: "fail"
                                                            });
                                                        } else {
                                                            return res.status(200).send({
                                                                status: 200,
                                                                msg: "Success",
                                                                goingCount:like.toString()
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }else{
                                            return res.status(400).send({
                                                  status: 200,
                                                                msg: "Success",
                                                                goingCount:results12[0].event_going_count.toString()
                                            });
                                        }
                                    }
                                });
                            }else{
                                  return res.status(400).send({
                                status: 400,
                                msg: "fail",
                                goingCount:0
                            });
                            }
                        }
                    });
            } else {
                return res.status(400).send({
                    status: 400,
                    msg: "fail",
                    goingCount:0
                });
            }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.event_interested = async (req, res) => {
	try {
    if (req.query.flag && req.query.event_id) {
        req.query.event_intersted_user_id=req.query.user_id;
        delete(req.query.user_id);
            db.query(`SELECT * FROM tbl_events where event_id=? and event_status=?`, [req.query.event_id, '0'], function(error, results12, fields) {
                if (error) {
                    return res.status(400).send({
                        status: 400,
                        msg: "fail"
                    });
                } else {
                    if (results12.length > 0) {
                        db.query(`SELECT * FROM tbl_event_intersted where event_id=? and event_intersted_user_id=?`, [req.query.event_id, req.query.event_intersted_user_id], function(error, results_update, fields) {
                            if (error) {
                                return res.status(400).send({
                                    status: 400,
                                    msg: "fail"
                                });
                            } else {
                                if (results_update.length <= 0 && req.query.flag == 1) {
                                    delete(req.query.flag);
                                    var like = parseInt(results12[0].event_interested_count) + 1;
                                    db.query(`UPDATE tbl_events SET ? where  event_id=?`, [{
                                        event_interested_count: like
                                    }, req.query.event_id], function(error, results, fields) {
                                        if (error) {
                                            return res.status(400).send({
                                                status: 400,
                                                msg: error
                                            });
                                        } else {
                                            db.query(`INSERT INTO tbl_event_intersted SET ?`, req.query, function(error, results, fields) {
                                                if (error) {
                                                    return res.status(400).send({
                                                        status: 400,
                                                        msg: error
                                                    });
                                                } else {
                                                    return res.status(200).send({
                                                        status: 200,
                                                        msg: "Success",
                                                        interestedCount:like.toString()
                                                    });
                                                }
                                            });
                                        }
                                    });
                                } else if(results_update.length > 0 && req.query.flag == 0) {
                                    delete(req.query.flag);
                                    var like = parseInt(results12[0].event_interested_count) - 1;
                                    db.query(`UPDATE tbl_events SET ? where  event_id=?`, [{
                                        event_interested_count: like
                                    }, req.query.event_id], function(error, results, fields) {
                                        if (error) {
                                            return res.status(400).send({
                                                status: 400,
                                                msg: "fail"
                                            });
                                        } else {
                                            db.query(`DELETE FROM tbl_event_intersted where event_intersted_user_id=? and event_id=?`,[req.query.event_intersted_user_id, req.query.event_id], function(error, results, fields) {
                                                if (error) {
                                                    return res.status(400).send({
                                                        status: 400,
                                                        msg: "fail"
                                                    });
                                                } else {
                                                    return res.status(200).send({
                                                        status: 200,
                                                        msg: "Success",
                                                        interestedCount:like.toString()
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }else{
                                    return res.status(400).send({
                                          status: 200,
                                                        msg: "Success",
                                                        interestedCount:results12[0].event_interested_count.toString()
                                    });
                                }
                            }
                        });
                    }else{
                          return res.status(400).send({
                        status: 400,
                        msg: "fail",
                        interestedCount:0
                    });
                    }
                }
            });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
            interestedCount:0
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_event_details = async (req, res) => {
	try {
  if (req.query.user_id && req.query.event_type ) {
      var feed=[];
              db.query(`SELECT * From tbl_events where event_type=? and event_status=? and event_user_id=?`, [req.query.event_type,'0',req.query.user_id ], function(error, results, fields) {
                  if (error) {
                      return res.status(400).send({
                          status: 400,
                          msg: "fail"
                      });
                  } else {
                      if(results.length >0){
                        Object.keys(results).forEach(function(key, idx, array) {
                               var result_data = results[key];
                              var d=[];
                      db.query(`SELECT COUNT(*) AS numrows FROM tbl_feed_comment where comment_feed_id=? and comment_operation=?;
                      SELECT * FROM tbl_like_details where like_details_feed_id=? ORDER BY created_date DESC LIMIT 2;
                      SELECT * FROM tbl_feed where feed_id=? and feed_is_deleted=?`, [result_data.feed_id, '0',result_data.feed_id,result_data.feed_id,'0'], function(error, results_comment, fields) {
                          if (error) throw error;
                          var user='';
                   // console.log(   results_comment[2][0]);
                          if(results_comment[2].length >0){
                              d = merge(result_data, results_comment[2][0]);

                             // result_data=result_data.concat(results_comment[2][0])
                          }else{
                                d = merge(result_data,{ feed_user_id: "", feed_user_image: "", feed_privacy: "", feed_sharing: "", feed_sharing_count: "", feed_view_count: "", feed_text: "", feed_media: "", feed_media_type: "", feed_video_thumbnail: "", feed_short_video: "", feed_video_length:"", feed_auto_scroll: "", feed_image_view: "", feed_like_count: "", feed_user_name: "", feed_bg_image: "", feed_user_place: "", feed_user_register_id: "", feed_is_deleted: "", feed_user_felling: "", feed_user_tagged: "", feed_type: "", feed_duration: "", comment_count: 0, feed_fellings: "", first_feed_fellings: "", second_feed_fellings: "", last_reacted_user: "", follow: "", follower_count: 0, feed_source: "" });
                          }
                        //  console.log(d);
                         // console.log(result_data);
                               d.is_shared = "0";
                              // d.shared_feed_data = {};
                              console.log( d.created_date);
                               d.feed_duration = timeAgo(new Date(result_data.created_date).toISOString());
                               d.comment_count = results_comment[0][0].numrows;
                                if (results_comment[1].length > 0) {
                                    user=results_comment[1][0].like_details_liked_user_id;
                                       d.first_feed_fellings = results_comment[1][0].feed_fellings;
                                  } else {
                                       d.first_feed_fellings = '';
                                  }
                                  if (results_comment[1].length > 1) {
                                       d.second_feed_fellings = results_comment[1][1].feed_fellings;
                                  } else {
                                       d.second_feed_fellings = '';
                                  }
                                  console.log( d.feed_user_id);
                             var sql=     db.query(`SELECT * FROM tbl_user_profile where user_id=?;
                                  Select count(*) as total from tbl_event_going where event_going_user_id=? and event_id=?;
                                  Select count(*) as total from tbl_event_intersted where event_intersted_user_id=? and event_id=?;
                                  Select count(*) as total from tbl_followers where follower_by_id=? and followered_to_id=?;
                                  Select count(*) as total from tbl_followers where followered_to_id=? and follower_status=?;
                                  Select * from tbl_like_details where  like_details_feed_id=? and like_details_liked_user_id=?`, [
                                      user,
                                      req.query.user_id,result_data.event_id,
                                      req.query.user_id,result_data.event_id,
                                      d.feed_user_id, req.query.user_id,
                                       d.feed_user_id,'1',
                                       d.feed_id,req.query.user_id], function(error, results_rat, fields) {
                                 if (error) throw error;
                                 console.log(sql.sql);
                                 if(results_rat[0].length >0){
                                       d.last_reacted_user = results_rat[0][0].user_name;
                                 }else{
                                       d.last_reacted_user = '';
                                 }
                                  d.going=results_rat[1][0].total >0 ? 1: 0;
                                  d.interested=results_rat[2][0].total >0 ? 1: 0;
                                  d.follow=results_rat[3][0].total > 0 ? 'friend' : 'friend';
                                  d.feed_fellings=results_rat[5].length > 0 ? results_rat[5][0].feed_fellings : '8';
                                   d.follower_count=results_rat[4][0].total;
                                  if(result_data.event_id!=''){
                                 feed.push(d);
                                  }
                              if (idx == array.length - 1) {
                                  return res.status(200).send({
                                      status: 200,
                                      msg: "Success",
                                      eventListWithTypeCount: feed.length,
                                      eventListWithType: feed
                                  });
                              }
                                  });
                      });
                  });
                  }else{
                     return res.status(400).send({
              status: 404,
              msg: "Not found",
               eventListWithTypeCount: 0,
                                      eventListWithType: []
          });
                  }
                  }
              });

      } else {
          return res.status(400).send({
              status: 400,
              msg: "fail",
               eventListWithTypeCount: 0,
                                      eventListWithType: []
          });
      }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_event_with_type = async (req, res) => {
	try {
  if (req.query.user_id && req.query.event_type ) {
      var feed=[];
              db.query(`SELECT * From tbl_events where event_type=? and event_status=? and event_user_id=?`, [req.query.event_type,'0',req.query.user_id ], function(error, results, fields) {
                  if (error) {
                      return res.status(400).send({
                          status: 400,
                          msg: "fail"
                      });
                  } else {
                      if(results.length >0){
                        Object.keys(results).forEach(function(key, idx, array) {
                               var result_data = results[key];
                              var d=[];
                      db.query(`SELECT COUNT(*) AS numrows FROM tbl_feed_comment where comment_feed_id=? and comment_operation=?;
                      SELECT * FROM tbl_like_details where like_details_feed_id=? ORDER BY created_date DESC LIMIT 2;
                      SELECT * FROM tbl_feed where feed_id=? and feed_is_deleted=?`, [result_data.feed_id, '0',result_data.feed_id,result_data.feed_id,'0'], function(error, results_comment, fields) {
                          if (error) throw error;
                          var user='';
                   // console.log(   results_comment[2][0]);
                          if(results_comment[2].length >0){
                              d = merge(result_data, results_comment[2][0]);

                             // result_data=result_data.concat(results_comment[2][0])
                          }else{
                                d = merge(result_data,{ feed_user_id: "", feed_user_image: "", feed_privacy: "", feed_sharing: "", feed_sharing_count: "", feed_view_count: "", feed_text: "", feed_media: "", feed_media_type: "", feed_video_thumbnail: "", feed_short_video: "", feed_video_length:"", feed_auto_scroll: "", feed_image_view: "", feed_like_count: "", feed_user_name: "", feed_bg_image: "", feed_user_place: "", feed_user_register_id: "", feed_is_deleted: "", feed_user_felling: "", feed_user_tagged: "", feed_type: "", feed_duration: "", comment_count: 0, feed_fellings: "", first_feed_fellings: "", second_feed_fellings: "", last_reacted_user: "", follow: "", follower_count: 0, feed_source: "" });
                          }
                        //  console.log(d);
                         // console.log(result_data);
                               d.is_shared = "0";
                              // d.shared_feed_data = {};
                              console.log( d.created_date);
                               d.feed_duration = timeAgo(new Date(result_data.created_date).toISOString());
                               d.comment_count = results_comment[0][0].numrows;
                                if (results_comment[1].length > 0) {
                                    user=results_comment[1][0].like_details_liked_user_id;
                                       d.first_feed_fellings = results_comment[1][0].feed_fellings;
                                  } else {
                                       d.first_feed_fellings = '';
                                  }
                                  if (results_comment[1].length > 1) {
                                       d.second_feed_fellings = results_comment[1][1].feed_fellings;
                                  } else {
                                       d.second_feed_fellings = '';
                                  }
                                  console.log( d.feed_user_id);
                             var sql=     db.query(`SELECT * FROM tbl_user_profile where user_id=?;
                                  Select count(*) as total from tbl_event_going where event_going_user_id=? and event_id=?;
                                  Select count(*) as total from tbl_event_intersted where event_intersted_user_id=? and event_id=?;
                                  Select count(*) as total from tbl_followers where follower_by_id=? and followered_to_id=?;
                                  Select count(*) as total from tbl_followers where followered_to_id=? and follower_status=?;
                                  Select * from tbl_like_details where  like_details_feed_id=? and like_details_liked_user_id=?`, [
                                      user,
                                      req.query.user_id,result_data.event_id,
                                      req.query.user_id,result_data.event_id,
                                      d.feed_user_id, req.query.user_id,
                                       d.feed_user_id,'1',
                                       d.feed_id,req.query.user_id], function(error, results_rat, fields) {
                                 if (error) throw error;
                                 console.log(sql.sql);
                                 if(results_rat[0].length >0){
                                       d.last_reacted_user = results_rat[0][0].user_name;
                                 }else{
                                       d.last_reacted_user = '';
                                 }
                                  d.going=results_rat[1][0].total >0 ? 1: 0;
                                  d.interested=results_rat[2][0].total >0 ? 1: 0;
                                  d.follow=results_rat[3][0].total > 0 ? 'friend' : 'friend';
                                  d.feed_fellings=results_rat[5].length > 0 ? results_rat[5][0].feed_fellings : '8';
                                   d.follower_count=results_rat[4][0].total;
                                  if(result_data.event_id!=''){
                                 feed.push(d);
                                  }
                              if (idx == array.length - 1) {
                                  return res.status(200).send({
                                      status: 200,
                                      msg: "Success",
                                      eventListWithTypeCount: feed.length,
                                      eventListWithType: feed
                                  });
                              }
                                  });
                      });
                  });
                  }else{
                     return res.status(400).send({
              status: 404,
              msg: "Not found",
               eventListWithTypeCount: 0,
                                      eventListWithType: []
          });
                  }
                  }
              });

      } else {
          return res.status(400).send({
              status: 400,
              msg: "fail",
                eventListWithTypeCount: 0,
                                      eventListWithType: []
          });
      }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_event_group = async (req, res) => {
	try {
    if (req.query.user_id && req.query.event_type ) {
        var feed=[];
                db.query(`SELECT * From tbl_events where event_type=? and event_status=?`, [req.query.event_type,'0'], function(error, results, fields) {
                    if (error) {
                        return res.status(400).send({
                            status: 400,
                            msg: "fail"
                        });
                    } else {
                        if(results.length >0){
                          Object.keys(results).forEach(function(key, idx, array) {
                                 var result_data = results[key];
                                var d=[];
                        db.query(`SELECT COUNT(*) AS numrows FROM tbl_feed_comment where comment_feed_id=? and comment_operation=?;
                        SELECT * FROM tbl_like_details where like_details_feed_id=? ORDER BY created_date DESC LIMIT 2;
                        SELECT * FROM tbl_feed where feed_id=? and feed_is_deleted=?`, [result_data.feed_id, '0',result_data.feed_id,result_data.feed_id,'0'], function(error, results_comment, fields) {
                            if (error) throw error;
                            var user='';
                      console.log(   results_comment[2][0]);
                            if(results_comment[2].length >0){
                                d = merge(result_data, results_comment[2][0]);
                                
                               // result_data=result_data.concat(results_comment[2][0])
                            }else{
                                  d = merge(result_data,{ feed_user_id: "", feed_user_image: "", feed_privacy: "", feed_sharing: "", feed_sharing_count: "", feed_view_count: "", feed_text: "", feed_media: "", feed_media_type: "", feed_video_thumbnail: "", feed_short_video: "", feed_video_length:"", feed_auto_scroll: "", feed_image_view: "", feed_like_count: "", feed_user_name: "", feed_bg_image: "", feed_user_place: "", feed_user_register_id: "", feed_is_deleted: "", feed_user_felling: "", feed_user_tagged: "", feed_type: "", feed_duration: "", comment_count: 0, feed_fellings: "", first_feed_fellings: "", second_feed_fellings: "", last_reacted_user: "", follow: "", follower_count: 0, feed_source: "" });
                            }
                            //console.log(d);
                           // console.log(result_data);
                                 d.is_shared = "0";
                                // d.shared_feed_data = {};
                                console.log( d.created_date);
                                 d.feed_duration = timeAgo(new Date(result_data.created_date).toISOString());
                                 d.comment_count = results_comment[0][0].numrows;
                                  if (results_comment[1].length > 0) {
                                      user=results_comment[1][0].like_details_liked_user_id;
                                         d.first_feed_fellings = results_comment[1][0].feed_fellings;
                                    } else {
                                         d.first_feed_fellings = '';
                                    }
                                    if (results_comment[1].length > 1) {
                                         d.second_feed_fellings = results_comment[1][1].feed_fellings;
                                    } else {
                                         d.second_feed_fellings = '';
                                    }
                                    console.log(user);
                                    db.query(`SELECT * FROM tbl_user_profile where user_id=?;
                                    Select count(*) as total from tbl_event_going where event_going_user_id=? and event_id=?;
                                    Select count(*) as total from tbl_event_intersted where event_intersted_user_id=? and event_id=?;
                                    Select count(*) as total from tbl_followers where follower_by_id=? and followered_to_id=?;
                                    Select count(*) as total from tbl_followers where followered_to_id=? and follower_status=?;
                                    Select * from tbl_like_details where  like_details_feed_id=? and like_details_liked_user_id=?`, [
                                        user,
                                        req.query.user_id,result_data.event_id,
                                        req.query.user_id,result_data.event_id,
                                        d.feed_user_id, req.query.user_id,
                                         d.feed_user_id,1,
                                         d.feed_id,req.query.user_id], function(error, results_rat, fields) {
                                   if (error) throw error;
                                   if(results_rat[0].length >0){
                                         d.last_reacted_user = results_rat[0][0].user_name;
                                   }else{
                                         d.last_reacted_user = '';
                                   }
                                    d.going=results_rat[1][0].total >0 ? 1: 0;
                                    d.interested=results_rat[2][0].total >0 ? 1: 0;
                                    d.follow=results_rat[3][0].total > 0 ? 'friend' : 'friend';
                                    d.feed_fellings=results_rat[5].length > 0 ? results_rat[5][0].feed_fellings : '8';
                                     d.follower_count=results_rat[4][0].total;
                                    if(result_data.event_id!=''){
                                   feed.push(d);
                                    }
                                if (idx == array.length - 1) {
                                    return res.status(200).send({
                                        status: 200,
                                        msg: "Success",
                                        eventListWithTypeCount: feed.length,
                                        eventListWithType: feed
                                    });
                                }
                                    });
                        });
                    });
                    }else{
                       return res.status(400).send({
                status: 404,
                msg: "Not found",
                  eventListWithTypeCount: 0,
                                      eventListWithType: []
            });  
                    }
                    }
                });

        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail",
                  eventListWithTypeCount: 0,
                                      eventListWithType: []
            });
        }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};