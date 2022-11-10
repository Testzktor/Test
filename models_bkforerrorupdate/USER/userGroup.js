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
// UPLOAD FILE CONFIUGRATION
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../uploads/group_wallpaper/');
    },
    filename: function(req, file, cb) {
        cb(null, "group_wallpaper_" +crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
    }
});
exports.get_group_album = async (req, res) => {
	try {
    if (req.query.user_id && req.query.group_id) {
        db.query(`SELECT album_name, COUNT(*) as total FROM tbl_user_group_media WHERE user_id = ? AND group_id = ? GROUP BY album_name`, [req.query.user_id, req.query.group_id], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                var final_array = [];
                Object.keys(results).forEach(function(key2, idx2, array2) {
                    var result_file = results[key2];
                    db.query(`SELECT * FROM tbl_user_group_media WHERE user_id = ? AND group_id = ? AND album_name = ?`, [req.query.user_id, req.query.group_id, result_file.album_name], function(error, rows, fields) {
                        //   if(rows.length>0){
                        var final_images = [];
                        Object.keys(rows).forEach(function(key1, idx1, array1) {
                            var value = rows[key1];
                            if (value.album_media != '')
                                final_images.push(value.album_media);
                            if (idx1 === array1.length - 1) {
                                final_array.push({
                                    album_name: result_file.album_name,
                                    album_media: final_images
                                });
                                console.log(final_array);
                            }
                        });
                        if (idx2 === array2.length - 1) {
                            console.log('id' + idx2);
                            console.log(idx2 === array2.length - 1);
                            console.log('array' + array2.length);
                            return res.send({
                                status: 200,
                                msg: "Success",
                                totalAlbumCount: results.length,
                                groupAlbumList: final_array
                            });
                        }
                        // }
                    });

                });
            } else {
                res.send({
                    status: 200,
                    msg: "No Record Found",
                          totalAlbumCount: 0,
                                groupAlbumList: []
                });
            }
        });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
            totalAlbumCount: 0,
            groupAlbumList: []
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};

/*app.get('/get_group', middleware.authenticateToken, (req, res, next) => {
    if (req.query.user_id) {
        db.query(`SELECT * from tbl_user_group_members where user_id= ? `, [req.query.user_id], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {

                res.send({
                    status: 200,
                    msg: "Success",
                    groupListCount: results.length,
                    groupList: results
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
});*/

// check
exports.get_group = async (req, res) => {
	try {
    if (!req.query.user_id) {
        return res.status(400).send({
            status: 400,
            msg: "fail"
        });
    } else {
        db.query(`SELECT * FROM tbl_user_group_members WHERE user_id = ?`, [req.query.user_id], function(error, results, fields) {
            if (error) {
                return res.status(400).send({
                    status: 400,
                    msg: error
                });
            } else {
                if (results.length > 0) {
                    var final_array1 = [];
                    var cc = 0;
                    Object.keys(results).forEach(function(key, idx, array) {
                        var result_data = results[key];
                        db.query(`SELECT * FROM tbl_user_profile WHERE user_id = ?; SELECT * FROM tbl_user_group WHERE group_id = ?`, [result_data.user_id,result_data.group_id], function(err, rows_user, fields) {
                            if (err) {

                            } else {
                                if (rows_user.length > 0) {

                                    result_data.user_id = rows_user[0][0].user_id;
                                    result_data.user_name = rows_user[0][0].user_name;
                                    result_data.user_profile_img = rows_user[0][0].user_profile_img;
                                    if(rows_user[1][0] !=null)
                                    {
                                      if(rows_user[1][0].group_admins !== null && rows_user[1][0].group_admins !== '') {
                                       result_data.group_chat_by=rows_user[1][0].group_chat_by;
                                       result_data.group_wallpaper=rows_user[1][0].group_wallpaper;
                                       result_data.group_admins=rows_user[1][0].group_admins;
                                        result_data.group_name=rows_user[1][0].group_name;
                                          result_data.group_description=rows_user[1][0].group_description;
                                       var isAdmincheck=rows_user[1][0].group_admins.split(',').includes(result_data.user_id.toString());
                                       if(isAdmincheck==true)
                                       {
                                           result_data.isAdmin = "1"; 
                                           result_data.admin_count = rows_user[1][0].group_admins.split(',').length;
                                       }
                                       else
                                       {
                                            result_data.isAdmin = "0"; 
                                       }
                                                  }
                                                  else
                                                  {
                                                      result_data.isAdmin="";
                                                  }
                                                  
                                    }   
                                    else
                                    {
                                      //result_data.user_array = rows_user[1][0].group_admins.split(',');
                                       result_data.group_chat_by='';
                                       result_data.group_wallpaper='';
                                       result_data.group_admins='';
                                        result_data.group_name='';
                                          result_data.group_description='';
                                       result_data.isAdmin="";
                                        
                                    }
                                                  
                                                  
                                    

                                } else {
                                    result_data.user_id = '';
                                    result_data.user_name = '';
                                    result_data.user_profile_img = '';
                                }
                                final_array1.push(result_data);
                                if (idx === array.length - 1) {
                                    return res.status(200).send({
                                        status: 200,
                                        msg: "Success",
                                        groupListCount: final_array1.length,
                                        groupList: final_array1
                                    });
                                }
                            }
                        });
                    });
                } else {
                    return res.status(404).send({
                        status: 404,
                        msg: "No Record Found",
                        groupListCount: 0,
                        groupList:[]
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
exports.get_group_member = async (req, res) => {
	try {
    if (req.query.group_id) {
        db.query(`SELECT * from tbl_user_group_members where group_id= ?`, [req.query.group_id], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                var final_array = [];
                console.log(results);
                Object.keys(results).forEach(function(key2, idx2, array2) {
                    var result_file = results[key2];

                    db.query(`SELECT  e.*, s.*, d.* FROM (tbl_user_profile e JOIN tbl_education s ON e.user_id = s.user_id) JOIN tbl_works d ON e.user_id = d.user_id where e.user_id = ?`, [result_file.user_id], function(error, rows, fields) {
                        if (error) {
                            return res.status(400).send({
                                status: 400,
                                msg: 'fail'
                            });
                        } else {
                            if (rows.length > 0) {
                                console.log(rows);
                                final_array.push(rows);


                            }
                            if (idx2 === array2.length - 1) {
                                res.send({
                                    status: 200,
                                    msg: "Success",
                                    groupMemberListCount: final_array[0].length,
                                    groupMemberList: final_array[0]
                                });
                            }
                        }
                    });

                });

            } else {
                return res.send({
                    status: 200,
                    msg: "No Record Found",
                             groupMemberListCount: 0,
                                    groupMemberList: []
                });
            }
        });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
            groupMemberListCount: 0,
            groupMemberList: []
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
                         let ext = result_file.originalname.substring(result_file.originalname.lastIndexOf('.'), result_file.originalname.length);
                        final_array.push(define.BASE_URL+"group_wallpaper/"+result_file.filename);
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
                                 let ext = (result_file.filename).substring((result_file.filename).lastIndexOf('.'), (result_file.filename).length);
                                final_array.push(define.BASE_URL+"group_wallpaper/"+result_file.filename);
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
exports.insert_group = async (req, res) => {
	try {
    let upload = multer({
        storage: storage,
    }).array('group_wallpaper');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: err
            });
        } else {
            if (req.body.user_id && req.body.group_name) {
                //console.log(req.files);
                var final_array = [];
                if (req.files.length > 0) {
                    Object.keys(req.files).forEach(function(key, idx, array) {
                        var result_file = req.files[key];
                        final_array.push(define.BASE_URL+"group_wallpaper/"+result_file.filename);
                        if (idx === array.length - 1) {
                            req.body.group_wallpaper = final_array.toString();
                
                             // older line
                            // db.query(`SET SQL_MODE = ''; INSERT INTO tbl_user_group SET ?`, req.body, function(error, results, fields) {
                               db.query(`INSERT INTO tbl_user_group SET ?`, req.body, function(error, results, fields) {
                                if (error) {
                                    return res.status(400).send({
                                        status: 400,
                                        msg: error
                                    });
                                } else {
                                    return res.status(200).send({
                                        status: 200,
                                        msg: "Success",
                                        group_id: results.insertId
                                    });
                                }
                            });
                        }
                    });
                } else {
                    
                    // older line
                 //   db.query(`SET SQL_MODE = ''; INSERT INTO tbl_user_group SET ?`, req.body, function(error, results, fields) {
                    db.query(`INSERT INTO tbl_user_group SET ?`, req.body, function(error, results, fields) {
                        if (error) {
                            return res.status(400).send({
                                status: 400,
                                msg: error
                            });
                        } else {
                            return res.status(200).send({
                                status: 200,
                                msg: "Success",
                                group_id:results.insertId
                            });
                        }
                    });
                }
            } else {
                return res.status(400).send({
                    status: 400,
                    msg: "fail1",
                    group_id:0
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
exports.update_chat_group = async (req, res) => {
	try {
    let upload = multer({
        storage: storage,
    }).array('group_wallpaper');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: err
            });
        } else {
            if (req.body.group_id) {
                //console.log(req.files);
                var final_array = [];
                if (req.files.length > 0) {
                    Object.keys(req.files).forEach(function(key, idx, array) {
                        var result_file = req.files[key];
                        final_array.push(define.BASE_URL+"group_wallpaper/"+result_file.filename);
                        if (idx === array.length - 1) {
                            req.body.group_wallpaper = final_array.toString();
                       
                            var group_id = req.body.group_id;
                            delete(req.body.group_id);
                            db.query(`UPDATE tbl_user_group SET ? where group_id=? `, [req.body,group_id], function(error, results, fields) {
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

                    var group_id = req.body.group_id;
                    delete(req.body.group_id);
                    db.query(`UPDATE tbl_user_group SET ? where group_id=?`, [req.body, group_id], function(error, results, fields) {
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
exports.insert_group_album = async (req, res) => {
	try {
    let upload = multer({
        storage: storage,
    }).array('album_media');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: err
            });
        } else {
            if (req.body.user_id) {
                //console.log(req.files);
                var final_array = [];
                if (req.files.length > 0) {
                    Object.keys(req.files).forEach(function(key, idx, array) {
                        var result_file = req.files[key];
                         let ext = (result_file.filename).substring((result_file.filename).lastIndexOf('.'), (result_file.filename).length);
                        final_array.push(define.BASE_URL+"group_wallpaper/"+result_file.filename);
                        if (idx === array.length - 1) {
                            req.body.album_media = final_array.toString();
                           if (ext == ".png" || ext == ".jpg" || ext == ".jpeg") {
                                req.body.album_media_type = 'image';
                            }
                         if (ext === '.mov' || ext === '.avchd' || ext === '.mkv' || ext === '.webm' || ext === '.gif' || ext === '.mp4' || ext === '.ogg' || ext === '.wmv' || ext === '.x-flv' || ext === '.avi') {
                                req.body.album_media_type = 'video';
                            }
                            db.query(`SET SQL_MODE = ''; INSERT INTO tbl_user_group_media SET ?`, req.body, function(error, results, fields) {
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
                    db.query(`SET SQL_MODE = ''; INSERT INTO tbl_user_group_media SET ?`, req.body, function(error, results, fields) {
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
exports.insert_group_member = async (req, res) => {
	try {
    if (req.body.group_id && req.body.user_id) {
        console.log(req.body.user_id);
        var array = req.body.user_id.split(',');
        
        array.forEach(element => {
            
            var bodyJson={
                 "group_id": req.body.group_id,
        "user_id": element,
        "is_a_friend": "1"
            };
            
        db.query(`SELECT * from tbl_user_group_members where group_id = ? AND user_id = ?`, [req.body.group_id,element], function(error, results1, fields) {
              if (error) {
                        return res.status(400).send({
                            status: 400,
                            msg: 'fail'
                        });
                    } else {
            if (results1.length <= 0) {
                db.query(`SET SQL_MODE = ''; INSERT INTO tbl_user_group_members SET ? `, [bodyJson], function(error, results, fields) {
                    if (error) {
                        return res.status(400).send({
                            status: 400,
                            msg: 'fail'
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
                    msg: "Record already exists"
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
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.delete_chat_group = async (req, res) => {
	try {
    if (req.query.group_id) {
        db.query(`DELETE from tbl_user_group where group_id=?;DELETE from tbl_user_group_members where group_id=?`, [req.query.group_id,req.query.group_id], function(error, results1, fields) {
            if (error) throw error;
            return res.status(200).send({
                status: 200,
                msg: "Success"
            });
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
exports.update_group_member = async (req, res) => {
	try {
    if (req.body.id) {
        var id = req.body.id;
        delete(req.body.id);
        db.query(`UPDATE tbl_user_group_members SET ? where id=?`, [req.body, id], function(error, results1, fields) {
            if (error) throw error;
            return res.status(200).send({
                status: 200,
                msg: "Success"
            });
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

exports.delete_chat_group_member = async (req, res) => {
	try {
    if (req.query.id) {
        var totalfriendsList = (req.query.id).split(",");
        totalfriendsList.forEach((element, index, array) => {
            db.query(`DELETE from tbl_user_group_members where id=?`, [element], function(error, results1, fields) {
                if (error) throw error;
                return res.status(200).send({
                    status: 200,
                    msg: "Success"
                });
            });
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
exports.delete_group_admin = async (req, res) => {
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
    if (req.body.group_id) {
        var id = req.body.group_id;
        delete(req.body.group_id);
        db.query(`select * from tbl_user_group  where group_id=?`, [id], function(error12, results12, fields12) {
            if (error12) {
                return res.status(400).send({
                    status: 400,
                    msg: "fail"
                });
            } else {
                if (results12.length > 0) {
                    var arr1 = (results12[0].group_admins).split(",");
                     var arr2 = (req.body.group_admins).split(",");
                    let difference = arr1.filter(x => !arr2.includes(x));
                    db.query(`update tbl_user_group set ? where group_id=?`, [{group_admins:difference.toString()}, id], function(error, results1, fields) {
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
                        msg: "Record Not Found."
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