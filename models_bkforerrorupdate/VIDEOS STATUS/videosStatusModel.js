const fs = require('fs');
const db = require("../../config/connection");
var timeAgo = require('node-time-ago');
const {
    getVideoDurationInSeconds
} = require('get-video-duration');
const multer = require('fastify-multer');
const crypto = require("crypto");
const {
    exec
} = require("child_process");
var path = require('path')
var zktor = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../uploads/ztkor_video_media/');
    },
    filename: function(req, file, cb) {
        cb(null, "zktor_video_status_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
    }
});

exports.add_user_video_status = async (req, res) => {
	try {
    let upload = multer({
        storage: zktor,
    }).fields([{
        name: 'zktor_user_status_url',
        maxCount: 10
    }, {
        name: 'zktor_user_thumbnail'
    }, {
        name: 'zktor_user_status_bg_image_url'
    }]);
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: err
            });
        } else {
            if (req.body.zktor_user_status_user_id) {
                var i = 0;
                delete(req.body.flag);
                var zktor_user_status_url_type = '';
                var zktor_short_video_url = [];
                var zktor_video_video_length = [];
                var zktor_user_thumbnail = [];
                var url_file='';
                 //console.log(req.body.zktor_user_status_url_file);
                 //console.log(req.files.zktor_user_status_url);
                 //console.log(req.body);
                  if(req.body.zktor_user_status_url_file && req.body.zktor_user_status_url_file!=''){
                 url_file= req.body.zktor_user_status_url_file;
                 delete(req.body.zktor_user_status_url_file);
                  }
                delete(req.body.zktor_user_status_url_file);
                if (typeof req.files.zktor_user_status_url !== 'undefined' && url_file=='') {
                    Object.keys(req.files.zktor_user_status_url).forEach(function(key, idx1, array1) {
                         //console.log("snait2");
                        var result_file = req.files.zktor_user_status_url[key];
                        let ext = result_file.originalname.substring(result_file.originalname.lastIndexOf('.'), result_file.originalname.length);
                        //console.log(ext);
                        var zktor_user_status_url = '';
                        if (ext == ".png" || ext == ".jpg" || ext == ".jpeg") {
                            let image_file_path = result_file.path;
                            let ext = (result_file.filename).substring((result_file.filename).lastIndexOf('.'), (result_file.filename).length);
                            let image = "zktor_video_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + ext;
                            let path_to_store_generated_width = "../uploads/ztkor_video_media/" + image;
                            let cmd = "ffmpeg -i " + image_file_path + " -vf scale=iw*2:ih*2 " + path_to_store_generated_width;
                            exec(cmd, (error, stdout, stderr) => {
                                if (error) {
                                    i++;
                                }
                                if (stderr) {}
                            });
                            zktor_user_status_url = define.BASE_URL+"ztkor_video_media/"+ image;
                        }
                        let video_file_path = result_file.path;
                        if (ext == '.mov' || ext == '.avchd' || ext == '.mkv' || ext == '.webm' || ext == '.gif' || ext == '.mp4' || ext == '.ogg' || ext == '.wmv' ||ext == '.x-flv' || ext == '.avi') {
                            let video_file_path = result_file.path;
                            let ext = (result_file.filename).substring((result_file.filename).lastIndexOf('.'), (result_file.filename).length);

                            let video = "zktor_user_status_url_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + ext;
                            let path_to_store_generated_width = "../uploads/ztkor_video_media/" + video;
                            let cmd = "ffmpeg -i " + video_file_path + " -max_muxing_queue_size 21512512 -vf scale=iw*2:ih*2 -preset slow -crf 40 " + path_to_store_generated_width;
                            exec(cmd, (error, stdout, stderr) => {
                                if (error) {
                                    i = 1;
                                }
                                if (stderr) {}
                            });
                            zktor_user_status_url = define.BASE_URL+"ztkor_video_media/"+ video;
                        }
                        if (typeof req.files.zktor_user_thumbnail !== 'undefined') {
                            req.body.zktor_user_thumbnail = define.BASE_URL+"ztkor_video_media/"+ req.files.zktor_user_thumbnail[0].filename;
                        }
                        if (typeof req.files.zktor_user_status_bg_image_url !== 'undefined') {
                            req.body.zktor_user_status_bg_image_url = define.BASE_URL+"ztkor_video_media/"+ req.files.zktor_user_status_bg_image_url[0].filename;
                        }

                            req.body.zktor_user_status_url = zktor_user_status_url;
                        
                        
                        db.query(`INSERT INTO tbl_zktor_user_status SET ?`, req.body, function(error, results, fields) {
                            if (error) {
                                return res.status(400).send({
                                    status: 400,
                                    msg: error
                                });
                            } else {
                                if (idx1 === array1.length - 1) {
                                    return res.status(200).send({
                                        status: 200,
                                        msg: "Success"
                                    });
                                }
                            }
                        });
                    });
                } else {
                       //console.log("snait23");
                    if (typeof req.files.zktor_user_thumbnail !== 'undefined') {
                        req.body.zktor_user_thumbnail = define.BASE_URL+"ztkor_video_media/"+ req.files.zktor_user_thumbnail[0].filename;
                    }
                    if (typeof req.files.zktor_user_status_bg_image_url !== 'undefined') {
                        req.body.zktor_user_status_bg_image_url = define.BASE_URL+"ztkor_video_media/"+ req.files.zktor_user_status_bg_image_url[0].filename;
                    }
                       if(url_file!=''){
                            req.body.zktor_user_status_url = url_file;
                        }
                    db.query(`INSERT INTO tbl_zktor_user_status SET ?`, req.body, function(error, results, fields) {
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
exports.view_user_video_status = async (req, res) => {
	try {
    let upload = multer({
        storage: zktor,
    }).single('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail1"
            });
        } else {
            if (req.body.zktor_status_viewed_user_id && req.body.zktor_status_id) {
                db.query(`select * From tbl_zktor_status_view where zktor_status_viewed_user_id= ? and zktor_status_id=?; select * From tbl_zktor_user_status where zktor_user_status_id= ?`, [req.body.zktor_status_viewed_user_id, req.body.zktor_status_id, req.body.zktor_status_id], function(error, results, fields) {
                    if (error) {
                        return res.status(400).send({
                            status: 400,
                            msg: "fail"
                        });
                    } else {
                        if (results[0].length <= 0) {
                            if (results[1].length > 0) {
                                var count = results[1][0].zktor_user_status_view_count + 1;
                                var d = {
                                    zktor_user_status_view_count: count
                                };
                                db.query(`UPDATE tbl_zktor_user_status SET ? where zktor_user_status_id= ?`, [d, req.body.zktor_status_id], function(error, results_update, fields) {
                                    if (error) {

                                    } else {}
                                });
                                delete(req.body.flag);
                                db.query(`INSERT INTO tbl_zktor_status_view SET ?`, req.body, function(error, results, fields) {
                                    if (error) {
                                        return res.status(400).send({
                                            status: 400,
                                            msg: "fail"
                                        });
                                    } else {
                                        return res.status(200).send({
                                            status: 200,
                                            msg: "Success",
                                            count: count
                                        });
                                    }
                                });
                            } else {
                                return res.status(400).send({
                                    status: 400,
                                    msg: 'fail4'
                                });
                            }
                        } else {
                            return res.status(200).send({
                                status: 200,
                                msg: "Success",
                                count: (results[1].length > 0) ? results[1][0].zktor_user_status_view_count : 0
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
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_zktor_video_status = async (req, res) => {
	try {
    if (req.query.page_no) {
        var no_of_records_per_page = 10;
        var rowno = req.query.page_no;
        if (rowno != 0) {
            rowno = (rowno - 1) * no_of_records_per_page;
        }
        db.query(`SELECT * FROM tbl_zktor_status_video ORDER BY RAND() LIMIT ? OFFSET ?; SELECT COUNT(*) AS numrows FROM tbl_zktor_status_video`, [no_of_records_per_page, rowno], function(error, results, fields) {
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

                        db.query(`SELECT * FROM tbl_user_profile where user_id=?; SELECT * FROM tbl_zktor_status_video_category where zktor_video_status_category_id=?`, [result_data.zktor_video_user_id, result_data.zktor_status_video_category_id], function(error, results_comment, fields) {
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
                            if (results_comment[1].length > 0) {
                                result_data.zktor_video_status_category_name = results_comment[1][0].zktor_video_status_category_name;
                            } else {
                                result_data.zktor_video_status_category_name = '';
                            }
                            result_data.zktor_video_duration = timeAgo(new Date(result_data.created_date).toISOString());
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
                                    return res.status(200).send({
                                        status: 200,
                                        msg: "Success",
                                        zktorVideoListCount: results[1][0].numrows,
                                        zktorVideoList: final_array,
                                        pagination: pagination
                                    });
                                } else {
                                    return res.status(404).send({
                                        status: 404,
                                        msg: "Page no missing or Its incorrect.",
                                                   zktorVideoListCount: 0,
                                        zktorVideoList: [],
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
                    });
                } else {
                    if (idx === array.length - 1) {
                        return res.status(200).send({
                            status: 200,
                            msg: "Success",
                            zktorVideoList: final_array
                        });
                    }
                }


            } else {
                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                           zktorVideoListCount: 0,
                                        zktorVideoList: [],
                                         pagination:  {
                                        total_rows: 0,
                                        total_pages: 0,
                                        per_page: 0,
                                        offset: 0,
                                         current_page_no: '0'}
                });
            }
        });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
                   zktorVideoListCount: 0,
                                        zktorVideoList: [],
                                         pagination:  {
                                        total_rows: 0,
                                        total_pages: 0,
                                        per_page: 0,
                                        offset: 0,
                                        current_page_no: '0'}
        });
    }
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_zktor_video_status_category_id = async (req, res) => {
	try {
    if (req.query.page_no && req.query.zktor_video_status_category_id) {
        var no_of_records_per_page = 10;
        var rowno = req.query.page_no;
        if (rowno != 0) {
            rowno = (rowno - 1) * no_of_records_per_page;
        }
        db.query(`SELECT * FROM tbl_zktor_status_video where zktor_status_video_category_id=?  LIMIT ? OFFSET ?; SELECT COUNT(*) AS numrows FROM tbl_zktor_status_video where zktor_status_video_category_id=?`, [req.query.zktor_video_status_category_id, no_of_records_per_page, rowno, req.query.zktor_video_status_category_id], function(error, results, fields) {
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

                        db.query(`SELECT * FROM tbl_user_profile where user_id=?; SELECT * FROM tbl_zktor_status_video_category where zktor_video_status_category_id=?`, [result_data.zktor_video_user_id, result_data.zktor_status_video_category_id], function(error, results_comment, fields) {
                            if (error) throw error;
                            // if (results_comment[0].length > 0) {
                            //     result_data.user_name = results_comment[0][0].user_name;
                            //     result_data.user_profile_img = results_comment[0][0].user_profile_img;
                            //     result_data.user_profile_background = results_comment[0][0].user_profile_background;
                            //     result_data.user_channel_id = results_comment[0][0].user_channel_id;
                            //     result_data.user_channel_name = results_comment[0][0].user_channel_name;
                            // } else {
                            //     result_data.user_name = '';
                            //     result_data.user_profile_img = '';
                            //     result_data.user_profile_background = '';
                            //     result_data.user_channel_id = '';
                            //     result_data.user_channel_name = '';
                            // }
                            if (results_comment[1].length > 0) {
                                result_data.zktor_video_status_category_name = results_comment[1][0].zktor_video_status_category_name;
                            } else {
                                result_data.zktor_video_status_category_name = '';
                            }
                            result_data.zktor_video_duration = timeAgo(new Date(result_data.created_date).toISOString());
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
                                    return res.status(200).send({
                                        status: 200,
                                        msg: "Success",
                                        categoryListCount: results[1][0].numrows,
                                        categoryList: final_array,
                                        pagination: pagination
                                    });
                                } else {
                                    return res.status(404).send({
                                        status: 404,
                                        msg: "Page no missing or Its incorrect.",
                                               categoryListCount: 0,
                                        categoryList: [],
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
                    });
                } else {
                    if (idx === array.length - 1) {
                        return res.status(200).send({
                            status: 200,
                            msg: "Success",
                            categoryList: final_array
                        });
                    }
                }


            } else {
                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                               categoryListCount: 0,
                                        categoryList: [],
                                         pagination:  {
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
        return res.status(400).send({
            status: 400,
            msg: "fail",
                       categoryListCount: 0,
                                        categoryList: [],
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
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_zktor_video_status_category = async (req, res) => {
	try {
    if (req.query.page_no) {
        var no_of_records_per_page = 10;
        var rowno = req.query.page_no;
        if (rowno != 0) {
            rowno = (rowno - 1) * no_of_records_per_page;
        }
        db.query(`SELECT * FROM tbl_zktor_status_video_category WHERE FIND_IN_SET(MONTHNAME(CURRENT_DATE()),month) union SELECT * FROM tbl_zktor_status_video_category WHERE FIND_IN_SET(MONTHNAME(CURRENT_DATE()),month)=0 LIMIT ? OFFSET ?; SELECT COUNT(*) AS numrows FROM tbl_zktor_status_video_category `, [no_of_records_per_page, rowno], function(error, results, fields) {
            if (error) throw error;
            if (results[0].length > 0) {
                var final_array = [];
                var final_array_one = [];
                var comment = [];
                var rating = 0;
                var rating_count = 0;
                var flag = 2;
                if (results[0].length > 0) {
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
                            zktorVideoCategoryListCount: results[1][0].numrows,
                            zktorVideoCategoryList: results[0],
                            pagination: pagination
                        });
                    } else {
                        return res.status(404).send({
                            status: 404,
                            msg: "Page no missing or Its incorrect.",
                                       zktorVideoCategoryListCount: 0,
                                        zktorVideoCategoryList: [],
                                         pagination:  {
                                        total_rows: 0,
                                        total_pages: 0,
                                        per_page: 0,
                                        offset: 0,
                                        current_page_no: '0'
                                         }
                        });
                    }
                } else {
                    if (idx === array.length - 1) {
                        return res.status(200).send({
                            status: 200,
                            msg: "Success",
                            zktorVideoCategoryList: final_array
                        });
                    }
                }


            } else {
                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                              zktorVideoCategoryListCount: 0,
                                        zktorVideoCategoryList: [],
                                         pagination:  {
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
        return res.status(400).send({
            status: 400,
            msg: "fail",
                      zktorVideoCategoryListCount: 0,
                                        zktorVideoCategoryList: [],
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
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_zktor_video_status_category_without_pagination = async (req, res) => {
	try {
    db.query(`SELECT * FROM tbl_zktor_status_video_category WHERE FIND_IN_SET(MONTHNAME(CURRENT_DATE()),month) union SELECT * FROM tbl_zktor_status_video_category WHERE FIND_IN_SET(MONTHNAME(CURRENT_DATE()),month)=0  `, function(error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            var final_array = [];
            var final_array_one = [];
            var comment = [];
            var rating = 0;
            var rating_count = 0;
            var flag = 2;
            if (results.length > 0) {

                return res.status(200).send({
                    status: 200,
                    msg: "Success",
                    zktorVideoCategoryListCount: results.length,
                    zktorVideoCategoryList: results

                });

            } else {

                return res.status(200).send({
                    status: 200,
                    msg: "Success",
                    zktorVideoCategoryList: final_array
                });
            }


        } else {
            return res.status(404).send({
                status: 404,
                msg: "Record not found",
                zktorVideoCategoryList:[]
            });
        }
    });
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_friend_status = async (req, res) => {
	try {
    if (req.query.user_id && req.query.friend_user_id) {
        var array = [];
        var final_array = [];
        if (req.query.friend_user_id != 'zktor') {
            db.query(`SELECT  * FROM tbl_zktor_user_status where zktor_user_status_user_id=? and  created_date >= NOW() - INTERVAL 1 DAY order by zktor_user_status_id asc;SELECT * FROM tbl_user_profile where user_id=?`, [req.query.friend_user_id, req.query.user_id], function(error, results_comment, fields) {
                if (error) {} else {
                    if (results_comment[1].length > 0 && results_comment[0].length > 0) {
                        var da = [];
                        var ka = [];
                        var se = [];
                        var i = 0;
                        var j = 0;
                        var dddd = 0;
                        Object.keys(results_comment[0]).forEach(function(key1, idx1, array1) {
                            var result_data = results_comment[0][key1];
                            db.query(`SELECT * FROM tbl_user_profile where user_id=?;SELECT * FROM tbl_zktor_status_view where zktor_status_viewed_user_id=? AND zktor_status_id=?`, [req.query.friend_user_id, req.query.user_id, result_data.zktor_user_status_id], function(error, results_ignore, fields) {
                                if (error) {} else {

                                    if (results_ignore[1].length <= 0) {
                                        result_data.status_seen_flag = 0;
                                        da.push(result_data);
                                    } else {
                                        result_data.status_seen_flag = 1;
                                        da.push(result_data);
                                    }

                                    if (idx1 === array1.length - 1) {

                                        if (da.length > 0) {
                                            if (results_ignore[0].length > 0) {
                                                dddd = dddd + 1;
                                                final_array.push({
                                                    user_id: results_ignore[0][0].user_id,
                                                    user_name: results_ignore[0][0].user_name,
                                                    user_profile_img: results_ignore[0][0].user_profile_img,
                                                    //user_profile_background: results_ignore[0][0].user_profile_background,
                                                    user_chat_status: results_ignore[0][0].user_chat_status,
                                                    status: da
                                                });
                                                return res.status(200).send({
                                                    status: 200,
                                                    msg: "Success",
                                                    totalStatusListCount: dddd,
                                                    totalStatusList: final_array
                                                });
                                            }
                                        }
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
            final_array.push({
                user_id: "zktor",
                user_name: "ZKTOR",
                user_profile_img: "3dba0c9d65ff28ac068a5ff61e6dafef.jpg",
                user_chat_status: "Online",
                status: [{
                    "zktor_user_status_id": "0",
                    "zktor_user_status_title": "We hope you are enjoying ZKTOR",
                    "zktor_user_status_view_count": "1",
                    "zktor_user_status_bg_color": "2,137,161,1.0",
                    "zktor_user_status_font": "217,237,5,1.0",
                    "zktor_user_status_bg_image_url": "https://picsum.photos/320/420",
                    "zktor_user_status_url": "",
                    "zktor_user_thumbnail": "",
                    "zktor_user_status_config": "",
                    "zktor_user_status": "1",
                    "zktor_user_status_user_id": "zktor",
                    "zktor_user_status_music": "",
                    "modified_date": "2022-03-28 09:09:32",
                    "created_date": "2022-03-28 09:09:32"
                }]
            });
            return res.status(200).send({
                status: 200,
                msg: "Success",
                totalStatusListCount: 1,
                totalStatusList: final_array
            });
        }
    } else {
        return res.status(400).send({
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
exports.get_friend_status_list = async (req, res) => {
	try {
    if (req.query.user_id) {
        var array = [];
        var final_array = [];
        array = res.totalfriendsList;
        //console.log(res.totalfriendsList);
        if (array.length > 0) {
            array.forEach(function(element, index) {
                //console.log(element);
                db.query(`SELECT  * FROM tbl_zktor_user_status where zktor_user_status_user_id=? and  created_date >= NOW() - INTERVAL 1 DAY order by zktor_user_status_id asc`, [element], function(error, results_comment, fields) {
                    if (error) {} else {
                        if (results_comment.length > 0) {
                            var da = [];
                            var ka = [];
                            var se = [];
                            var i = 0;
                            var j = 0;
                            Object.keys(results_comment).forEach(function(key1, idx1, array1) {
                                var result_data = results_comment[key1];
                                db.query(`SELECT * FROM tbl_user_profile where user_id=?;SELECT * FROM tbl_zktor_status_view where zktor_status_viewed_user_id=? AND zktor_status_id=?`, [element, req.query.user_id, result_data.zktor_user_status_id], function(error, results_ignore, fields) {
                                    if (error) {} else {

                                        if (results_ignore[1].length <= 0 && i == 0) {
                                            da.push(result_data);
                                            i++;
                                        }
                                        if (j == 0) {
                                            ka.push(result_data);
                                            j++;
                                        }

                                        if (idx1 === array1.length - 1) {
                                            ////console.log(da);
                                            // //console.log(ka);
                                            if (da.length > 0) {
                                                se.push(da[0]);
                                            } else {
                                                se.push(ka[0]);
                                            }
                                            // //console.log(se.length);
                                            if (se.length > 0) {
                                                if (results_ignore[0].length > 0) {
                                                    final_array.push({
                                                        user_id: results_ignore[0][0].user_id,
                                                        user_name: results_ignore[0][0].user_name,
                                                        user_profile_img: results_ignore[0][0].user_profile_img,
                                                        //  user_profile_background: results_ignore[0][0].user_profile_background,
                                                        user_chat_status: results_ignore[0][0].user_chat_status,
                                                        status: se[0]
                                                    });
                                                    ////console.log(final_array);
                                                }
                                                if (index == array.length - 1) {
                                                    final_array.push({
                                                        user_id: "zktor",
                                                        user_name: "ZKTOR",
                                                        user_profile_img: "3dba0c9d65ff28ac068a5ff61e6dafef.jpg",
                                                        user_chat_status: "Online",
                                                        status: {
                                                            "zktor_user_status_id": "0",
                                                            "zktor_user_status_title": "We hope you are enjoying ZKTOR",
                                                            "zktor_user_status_view_count": "1",
                                                            "zktor_user_status_bg_color": "2,137,161,1.0",
                                                            "zktor_user_status_font": "217,237,5,1.0",
                                                            "zktor_user_status_bg_image_url": "https://picsum.photos/320/420",
                                                            "zktor_user_status_url": "",
                                                            "zktor_user_thumbnail": "",
                                                            "zktor_user_status_config": "",
                                                            "zktor_user_status": "1",
                                                            "zktor_user_status_user_id": "zktor",
                                                            "zktor_user_status_music": "",
                                                            "modified_date": "2022-03-28 09:09:32",
                                                            "created_date": "2022-03-28 09:09:32"
                                                        }
                                                    });
                                                    return res.status(200).send({
                                                        status: 200,
                                                        msg: "Success",
                                                        totalStatusCount: final_array.length,
                                                        statusList: final_array
                                                    });
                                                }
                                            } else {
                                                if (index == array.length - 1) {
                                                    final_array.push({
                                                        user_id: "zktor",
                                                        user_name: "ZKTOR",
                                                        user_profile_img: "3dba0c9d65ff28ac068a5ff61e6dafef.jpg",
                                                        user_chat_status: "Online",
                                                        status: {
                                                            "zktor_user_status_id": "0",
                                                            "zktor_user_status_title": "We hope you are enjoying ZKTOR",
                                                            "zktor_user_status_view_count": "1",
                                                            "zktor_user_status_bg_color": "2,137,161,1.0",
                                                            "zktor_user_status_font": "217,237,5,1.0",
                                                            "zktor_user_status_bg_image_url": "https://picsum.photos/320/420",
                                                            "zktor_user_status_url": "",
                                                            "zktor_user_thumbnail": "",
                                                            "zktor_user_status_config": "",
                                                            "zktor_user_status": "1",
                                                            "zktor_user_status_user_id": "zktor",
                                                            "zktor_user_status_music": "",
                                                            "modified_date": "2022-03-28 09:09:32",
                                                            "created_date": "2022-03-28 09:09:32"
                                                        }
                                                    });
                                                    return res.status(200).send({
                                                        status: 200,
                                                        msg: "Success",
                                                        totalStatusCount: final_array.length,
                                                        statusList: final_array
                                                    });
                                                }
                                            }
                                        }


                                    }
                                });
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
    } else {
        return res.status(400).send({
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
exports.delete_zktor_video = async (req, res) => {
	try {
    if (req.query.zktor_video_id) {
        db.query(`DELETE from tbl_zktor_status_video where zktor_video_id=?`, [req.query.zktor_video_id], function(error, results1, fields) {
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
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.status_seen_user_list = async (req, res) => {
	try {
    if (req.query.zktor_user_status_id) {
        var final_array = [];
        db.query(`SELECT * FROM tbl_zktor_status_view where zktor_status_id=?`, [req.query.zktor_user_status_id], function(error, results, fields) {
            if (error) throw error;
            else {
                if (results.length > 0) {
                    Object.keys(results).forEach(function(key, idx, array) {
                        var result_data = results[key];
                        db.query(`SELECT * FROM tbl_user_profile where user_id=?`, [result_data.zktor_status_viewed_user_id], function(error, results_comment1, fields) {
                            if (error) throw error;
                            else {

                                if (results_comment1.length > 0) {

                                    result_data.user_name = results_comment1[0].user_name;
                                    result_data.user_profile_img = results_comment1[0].user_profile_img;
                                    result_data.user_profile_background = results_comment1[0].user_profile_background;
                                    result_data.user_channel_name = results_comment1[0].user_channel_name;
                                    result_data.user_channel_description = results_comment1[0].user_channel_description;
                                    result_data.user_email = results_comment1[0].user_email;
                                    result_data.user_address = results_comment1[0].user_address;
                                    result_data.user_website = results_comment1[0].user_website;
                                    result_data.created_date = results_comment1[0].created_date;


                                } else {

                                    result_data.user_name = '';
                                    result_data.user_profile_img = '';
                                    result_data.user_profile_background = '';
                                    result_data.user_channel_name = '';
                                    result_data.user_channel_description = '';
                                    result_data.user_email = '';
                                    result_data.user_address = '';
                                    result_data.user_website = '';
                                    result_data.created_date = '';
                                }
                                final_array.push(result_data);
                                if (idx === array.length - 1) {
                                    return res.status(200).send({
                                        status: 200,
                                        msg: "Success",
                                        statusSeenUserListCount: final_array.length,
                                        statusSeenUserList: final_array
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
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.delete_user_status = async (req, res) => {
	try {
    if (req.query.zktor_user_status_id) {
        db.query(`DELETE from tbl_zktor_user_status where zktor_user_status_id=?`, [req.query.zktor_user_status_id], function(error, results1, fields) {
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
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_zktor_video_category_without_pagination = async (req, res) => {
	try {
    var comment = [];
    db.query(`SELECT * FROM tbl_zktor_status_video_category`, function(error, results_comment, fields) {
        if (error) throw error;
        if (results_comment.length > 0) {

            return res.status(200).send({
                status: 200,
                msg: "Success",
                zktorVideoCategoryListCount: results_comment.length,
                zktorVideoCategoryList: results_comment
            });

        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail"
            });
        }
    });
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.view_user_video_status = async (req, res) => {
	try {
    if (req.query.zktor_status_viewed_user_id && req.query.zktor_status_id) {
        db.query(`select * From tbl_zktor_status_view where zktor_status_viewed_user_id= ? and zktor_status_id=?; select * From tbl_zktor_user_status where zktor_status_id= ?`, [req.query.zktor_status_viewed_user_id, req.query.zktor_status_id, req.query.zktor_status_id], function(error, results, fields) {
            if (error) {
                return res.status(400).send({
                    status: 400,
                    msg: "fail"
                });
            } else {
                if (results[0].length <= 0) {
                    if (results[1].length > 0) {
                        var count = results[1][0].zktor_user_status_view_count + 1;
                        var d = {
                            zktor_user_status_view_count: count
                        };
                        db.query(`UPDATE tbl_zktor_user_status SET ? where zktor_status_id= ?`, [d, req.query.zktor_status_id], function(error, results_update, fields) {
                            if (error) {

                            } else {}
                        });
                        delete(req.query.flag);
                        db.query(`INSERT INTO tbl_zktor_status_view SET ?`, req.query, function(error, results, fields) {
                            if (error) {
                                return res.status(400).send({
                                    status: 400,
                                    msg: "fail"
                                });
                            } else {
                                return res.status(200).send({
                                    status: 200,
                                    msg: "Success",
                                    count: count
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
                        count: (results[1].length > 0) ? results[1][0].zktor_user_status_view_count : 0
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
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.report_zktor_user_status = async (req, res) => {
	try {
    let upload = multer({
        storage: zktor,
    }).single('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail"
            });
        } else {
            if (req.body.zktor_user_status_id && req.body.zktor_user_status_report_user_id) {
                db.query(`INSERT INTO tbl_zktor_user_status_report SET ?`, [req.body], function(error, results66, fields) {
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
        }
    });
	} catch (err) {
		return res.code(400).send({
			status: 400,
			msg: err
		});
	}
};
