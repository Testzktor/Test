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
        cb(null, "business_post_" +crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
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
        cb(null, "personal_page_" +crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
    }
});
exports.create_playlist = async (req, res) => {
	try {
    let upload = multer({
        storage: storage,
    }).array('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: err
            });
        } else {
            if (req.body.user_id && req.body.playlist_name) {
                db.query(`SELECT * from tbl_video_playlist where user_id= ? AND playlist_name = ? `, [req.body.user_id, req.body.playlist_name], function(error, rows, fields) {
                    if (error) {
                        return res.status(400).send({
                            status: 400,
                            msg: error
                        });
                    } else {
                        if (rows.length <= 0) {
                            db.query(`SET SQL_MODE = ''; INSERT INTO tbl_video_playlist SET ?`, req.body, function(error, results, fields) {
                                if (error) {
                                    return res.status(400).send({
                                        status: 400,
                                        msg: error
                                    });
                                } else {
                                    return res.status(200).send({
                                        status: 200,
                                        msg: "Success",
                                        playlist_id: results.insertId
                                    });
                                }
                            });
                        } else {
                            return res.status(409).send({
                                status: 409,
                                msg: "Record already exists"
                            });
                        }
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
exports.add_to_playlist = async (req, res) => {
	try {
    let upload = multer({
        storage: storage,
    }).array('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: err
            });
        } else {
            if (req.body.user_id && req.body.playlist_category && req.body.video_name && req.body.playlist_id) {
                db.query(`SELECT * from tbl_playlist_details where user_id= ? AND playlist_category = ? AND video_name = ? AND playlist_id = ? `, [req.body.user_id, req.body.playlist_category, req.body.video_name, req.body.playlist_id], function(error, rows, fields) {
                    if (error) {
                        return res.status(400).send({
                            status: 400,
                            msg: error
                        });
                    } else {
                        if (rows.length <= 0) {
                            db.query(`SET SQL_MODE = ''; INSERT INTO tbl_playlist_details SET ?`, req.body, function(error, results, fields) {
                                if (error) {
                                    return res.status(400).send({
                                        status: 400,
                                        msg: error
                                    });
                                } else {
                                    return res.status(200).send({
                                        status: 200,
                                        msg: "Success",
                                        id: results.insertId
                                    });
                                }
                            });
                        } else {
                            return res.status(409).send({
                                status: 409,
                                msg: "Record already exists"
                            });
                        }
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
exports.get_playlist = async (req, res) => {
	try {
    if (req.query.user_id) {
        //console.log(req.files);
        db.query(`SELECT * from tbl_video_playlist where user_id= ?`, [req.query.user_id], function(error, resultsd, fields) {
            if (error) throw error;
            if (resultsd.length > 0) {
                var final_array = [];
                Object.keys(resultsd).forEach(function(key, idx, array) {
                    var result_file = resultsd[key];
                   // db.query(`SELECT tbl_playlist_details.*,tbl_user_profile.user_name,tbl_user_profile.user_profile_img,tbl_user_profile.user_email from tbl_playlist_details inner join tbl_user_profile on tbl_playlist_details.user_id=tbl_user_profile.user_id where tbl_playlist_details.user_id= ? AND playlist_category=? AND playlist_id=?`, [req.query.user_id, '1', result_file.playlist_id], function(error, results, fields) {
                     db.query(`SELECT tbl_playlist_details.*,tbl_feed.feed_user_id,tbl_feed.feed_text,tbl_feed.feed_user_image,tbl_feed.feed_user_name,tbl_user_profile.user_name,tbl_user_profile.user_profile_img,tbl_user_profile.user_email from tbl_playlist_details join tbl_feed on tbl_playlist_details.feed_id=tbl_feed.feed_id join tbl_user_profile on tbl_feed.feed_user_id=tbl_user_profile.user_id  where tbl_playlist_details.user_id= ? AND playlist_category=? AND playlist_id=?`, [req.query.user_id, '1', result_file.playlist_id], function(error, results, fields) {
   
                        if (error) {
                            return res.status(400).send({
                                status: 400,
                                msg: error
                            });
                        } else {
                            var media_array = [];
                            if (results.length > 0) {
                                Object.keys(results).forEach(function(key1, idx1, array1) {
                                    var v = results[key1];
                                    media_array.push(v);
                                    if (idx1 === array1.length - 1) {
                                        result_file.media_list = media_array;
                                    }
                                });
                            } else {
                                result_file.media_list = media_array;
                            }
                            final_array.push(result_file);
                            if (idx === array.length - 1) {
                                return res.status(200).send({
                                    status: 200,
                                    msg: "Success",
                                    playList: final_array
                                });
                            }
                        }
                    });

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
exports.get_savelist = async (req, res) => {
	try {
        if (req.query.user_id) {
            db.query(`SELECT * from tbl_playlist_details where user_id= ? AND playlist_category=? `, [req.query.user_id, '2'], function(error, results, fields) {
                if (error) {
                    return res.status(400).send({
                        status: 400,
                        msg: error
                    });
                } else {
                    var media_array = [];
                    if (results.length > 0) {
                        Object.keys(results).forEach(function(key1, idx1, array1) {
                            var v = results[key1];
                            media_array.push(v.video_name);
                        });
                    }

                    return res.status(200).send({
                        status: 200,
                        msg: "Success",
                        saveList: media_array
                    
});
                }
            });


}
else {
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
exports.delete_playlist_video = async (req, res) => {
	try {
    if (req.query.id) {
        db.query(`delete from tbl_playlist_details where id= ?`, [req.query.id], function(error, results, fields) {
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
exports.delete_playlist = async (req, res) => {
	try {
    if (req.query.playlist_id) {
        db.query(`Delete from tbl_video_playlist where playlist_id= ?;Delete from tbl_playlist_details where playlist_id= ?`, [req.query.playlist_id,req.query.playlist_id], function(error, results, fields) {
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