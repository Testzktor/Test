const fastify = require('fastify')({
	logger: true
});
const fs = require('fs');
const db = require("../../config/connection");
const middleware = require("../../middleware/authentication");
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

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../uploads/video/');
    },
    filename: function(req, file, cb) {
        cb(null, crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
    }
});
var feed = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../uploads/temp_folder/');
    },
    filename: function(req, file, cb) {
        cb(null, crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
    }
});
exports.create_albumlist = async (req, res) => {
	try {
    let upload = multer({
        storage: storage,
    }).single('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail"
            });
        } else {
            if (req.body.album_list_user_id && req.body.album_list_name) {
                db.query(`SELECT *  from tbl_media_album_list where album_list_user_id = ? AND album_list_name = ? `, [req.body.album_list_user_id, req.body.album_list_name], function(error, results1, fields) {
                    if (error) throw error;
                    if (results1.length <= 0) {
                        db.query(`INSERT INTO tbl_media_album_list SET ?`, req.body, function(error, results, fields) {
                            if (error) {
                                return res.status(400).send({
                                    status: 400,
                                    msg: "fail"
                                });
                            } else {
                                return res.status(200).send({
                                    status: 200,
                                    msg: "Success",
                                    album_list_id:results.insertId
                                });
                            }
                        });
                    } else {
                        return res.status(409).send({
                            status: 409,
                            msg: "Record already exists",
                            album_list_id:0
                        });
                    }
                });
            } else {
                return res.status(400).send({
                    status: 400,
                    msg: "fail",
                     album_list_id:0
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
exports.get_albumlist = async (req, res) => {
	try {
    if (!req.query.user_id) {
        return res.status(400).send({
            status: 400,
            msg: "fail"
        });
    } else {
        db.query(`SELECT * FROM tbl_media_album_list WHERE album_list_user_id = ? AND album_delete_status = ?`, [req.query.user_id, '0'], function(error, results, fields) {
            if (error) {
                return res.status(400).send({
                    status: 400,
                    msg: error
                });
            } else {
                if (results.length > 0) {
                    var final_array = [];
                    Object.keys(results).forEach(function(key, idx1, array1) {
                        var final = results[key];
                        db.query(`SELECT * FROM tbl_user_album WHERE album_user_id = ? AND album_list_id= ? AND album_img_status=? LIMIT 1`, [req.query.user_id, final.album_list_id, '0'], function(error, results12, fields) {
                            if (error) {
                                return res.status(400).send({
                                    status: 400,
                                    msg: error
                                });
                            } else {
                                if (results12.length > 0) {

                                    final.first_image = results12[0].album_img_name;

                                } else {
                                    final.first_image = '';
                                }
                                final_array.push(final);
                                if (idx1 === array1.length - 1) {
                                    return res.status(200).send({
                                        status: 200,
                                        msg: "Success",
                                        albumList: final_array
                                    });
                                }
                            }
                        });
                    });
                } else {
                    return res.status(404).send({
                        status: 404,
                        msg: "No Record Found",
                        albumList:[]
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
exports.get_album_data = async (req, res) => {
	try {
    if (!req.query.album_list_id) {
        return res.status(400).send({
            status: 400,
            msg: "fail"
        });
    } else {
        db.query(`SELECT * FROM tbl_media_album_list WHERE album_list_id = ? AND album_delete_status = ?`, [req.query.album_list_id, '0'], function(error, results, fields) {
            if (error) {
                return res.status(400).send({
                    status: 400,
                    msg: error
                });
            } else {
                if (results.length > 0) {

                    db.query(`SELECT * FROM tbl_user_album WHERE album_list_id = ? AND album_img_status=?`, [req.query.album_list_id, '0'], function(error, results12, fields) {
                        if (error) {
                            return res.status(400).send({
                                status: 400,
                                msg: error
                            });
                        } else {
                            if (results12.length > 0) {

                                return res.status(200).send({
                                    status: 200,
                                    msg: "Success",
                                    albumMediaList: results12
                                });

                            } else {
                                return res.status(404).send({
                                    status: 404,
                                    msg: "No Record Found",
                                    albumMediaList:[]
                                });
                            }
                        }
                    });

                } else {
                    return res.status(404).send({
                        status: 404,
                        msg: "No Record Found",
                        albumMediaList:[]
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
exports.delete_album_data = async (req, res) => {
	try {
    if (!req.query.album_list_id) {
        return res.status(400).send({
            status: 400,
            msg: "fail"
        });
    } else {
        var final_array = [];
        var array = (req.query.album_list_id).split(",");
        console.log(array.length);
        let i = 0
        while (i < array.length) {
            let d=array[i];
            db.query(`SELECT * FROM tbl_media_album_list WHERE album_list_id = ? AND album_delete_status = ?`, [d, '0'], function(error1, results, fields1) {
                if (error1) {
                    return res.status(400).send({
                        status: 400,
                        msg: error1
                    });
                } else {

                    if (results.length > 0) {

                        db.query(`UPDATE tbl_media_album_list SET album_delete_status = ? where album_list_id = ?`, ['1', d], function(error, results11, fields) {
                            if (error) {
                                return res.status(400).send({
                                    status: 400,
                                    msg: error
                                });
                            }

                        });
                    }
                }
            }); //
            i++;
        }
        if (i == array.length)
            return res.status(200).send({
                status: 200,
                msg: "Success"
            });

    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.delete_album_media = async (req, res) => {
	try {
    if (!req.query.album_id || !req.query.user_id) {
        return res.status(400).send({
            status: 400,
            msg: "fail"
        });
    } else {
        var final_array = [];
        var array = (req.query.album_id).split(",");
        console.log(array.length);
        let i = 0
        while (i < array.length) {
            let d=array[i];
            db.query(`SELECT * FROM tbl_user_album WHERE album_id = ? AND  album_user_id = ? AND album_img_status = ?`, [d,req.query.user_id, '0'], function(error1, results, fields1) {
                if (error1) {
                    return res.status(400).send({
                        status: 400,
                        msg: error1
                    });
                } else {
                   console.log(results);
                    if (results.length > 0) {

                        db.query(`UPDATE tbl_user_album SET album_img_status = ? where album_id = ? AND album_user_id = ?`, ['1', d,req.query.user_id], function(error, results11, fields) {
                            if (error) {
                                return res.status(400).send({
                                    status: 400,
                                    msg: error
                                });
                            }

                        });
                    }
                }
            }); //
            i++;
        }
        if (i == array.length)
            return res.status(200).send({
                status: 200,
                msg: "Success"
            });

    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.update_media_privacy = async (req, res) => {
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
        } else {
    if (!req.body.album_id || !req.body.user_id || !req.body.album_access) {
        return res.status(400).send({
            status: 400,
            msg: "fail"
        });
    } else {

            db.query(`SELECT * FROM tbl_user_album WHERE album_id = ? AND  album_user_id = ? AND album_img_status = ?`, [req.body.album_id,req.body.user_id, '0'], function(error1, results, fields1) {
                if (error1) {
                    return res.status(400).send({
                        status: 400,
                        msg: error1
                    });
                } else {
                   console.log(results);
                    if (results.length > 0) {

                   db.query(`UPDATE tbl_user_album SET album_access = ? where album_id = ? AND album_user_id = ? `, [req.body.album_access, req.body.album_id,req.body.user_id], function(error, results11, fields) {
                            if (error) {
                                return res.status(400).send({
                                    status: 400,
                                    msg: error
                                });
                            }else{

                              return res.status(200).send({
                status: 200,
                msg: "Success"
            });
                            }
                        });
                    }else{
                         return res.status(404).send({
                status: 404,
                msg: "Record not found"
            });
                    }
                }
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
exports.album_privacy = async (req, res) => {
	try {
        let upload = multer({
        storage: storage,
    }).single('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail"
            });
        } else {
    if (!req.body.album_list_id || !req.body.album_list_privacy ) {
        return res.status(400).send({
            status: 400,
            msg: "fail"
        });
    } else {

            db.query(`SELECT * FROM tbl_media_album_list WHERE album_list_id = ? AND  album_delete_status = ? `, [req.body.album_list_id, '0'], function(error1, results, fields1) {
                if (error1) {
                    return res.status(400).send({
                        status: 400,
                        msg: error1
                    });
                } else {
                   console.log(results);
                    if (results.length > 0) {

                   db.query(`UPDATE tbl_media_album_list SET album_list_privacy = ? where album_list_id = ? `, [req.body.album_list_privacy, req.body.album_list_id], function(error, results11, fields) {
                            if (error) {
                                return res.status(400).send({
                                    status: 400,
                                    msg: error
                                });
                            }else{

                              return res.status(200).send({
                status: 200,
                msg: "Success"
            });
                            }
                        });
                    }else{
                         return res.status(404).send({
                status: 404,
                msg: "Record not found"
            });
                    }
                }
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
exports.update_album_data = async (req, res) => {
	try {
        let upload = multer({
        storage: storage,
    }).single('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail"
            });
        } else {
    if (!req.body.album_name || !req.body.album_type ) {
        return res.status(400).send({
            status: 400,
            msg: "fail"
        });
    } else {

        var type=req.body.album_type;
                     delete(req.body.album_type);
                     if(req.body.album_img_name)
                     delete(req.body.album_img_name);
                   db.query(`UPDATE tbl_user_album SET ? where album_type = ? `, [req.body, type], function(error, results11, fields) {
                            if (error) {
                                return res.status(400).send({
                                    status: 400,
                                    msg: error
                                });
                            }else{

                              return res.status(200).send({
                status: 200,
                msg: "Success"
            });
                            }
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
exports.update_albumlist = async (req, res) => {
	try {
    let upload = multer({
        storage: storage,
    }).single('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail"
            });
        } else {
            if (req.body.album_list_id) {
                db.query(`Select * From tbl_media_album_list where album_list_id= ? and album_delete_status=?;`, [req.body.album_list_id, '0'], function(error, results, fields) {
                    if (error) {
                        return res.status(400).send({
                            status: 400,
                            msg: "fail"
                        });
                    } else {
                        var album_list_id=req.body.album_list_id;
                        delete(req.body.album_list_id);
                        if (results.length > 0) {
                            db.query(`UPDATE tbl_media_album_list SET ? where album_list_id=?`, [req.body,album_list_id], function(error, results66, fields) {
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