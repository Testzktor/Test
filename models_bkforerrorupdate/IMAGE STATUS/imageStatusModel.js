
const fs = require('fs');
const db = require("../../config/connection");
var timeAgo = require('node-time-ago');
const multer = require('fastify-multer');
const crypto = require("crypto");
const {
    exec
} = require("child_process");
var path = require('path')

var zktor = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../uploads/ztkor_image_media/');
    },
    filename: function(req, file, cb) {
        cb(null, "zktor_image_media_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
    }
});
exports.get_zktor_image_status = async (req, res) => {
	try {
    if (req.query.page_no) {
        var no_of_records_per_page = 10;
        var rowno = req.query.page_no;
        if (rowno != 0) {
            rowno = (rowno - 1) * no_of_records_per_page;
        }
        db.query(`SELECT * FROM tbl_zktor_status_image ORDER BY RAND() LIMIT ? OFFSET ?; SELECT COUNT(*) AS numrows FROM tbl_zktor_status_image`, [no_of_records_per_page, rowno], function(error, results, fields) {
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
                    console.log(merged);
                    Object.keys(results[0]).forEach(function(key, idx, array) {
                        var result_data = results[0][key];

                        db.query(` SELECT * FROM tbl_zktor_status_image_category where zktor_status_image_category_id=?`, [result_data.zktor_status_image_category_id], function(error, results_comment, fields) {
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
                            if (results_comment.length > 0) {
                                result_data.zktor_status_category_name = results_comment[0].zktor_status_category_name;
                            } else {
                                result_data.zktor_status_category_name = '';
                            }
                            console.log(result_data);
                             if (result_data.created_date != '0000-00-00 00:00:00' && result_data.created_date!='')
                            result_data.zktor_video_duration = timeAgo(new Date(result_data.created_date).toISOString());
                            else
                          result_data.zktor_video_duration  = 'just now';
                            
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
                                        zktorImageListCount: results[1][0].numrows,
                                        zktorImageList: final_array,
                                        pagination: pagination
                                    });
                                } else {
                                    return res.status(404).send({
                                        status: 404,
                                        msg: "Page no missing or Its incorrect.",
                                          zktorImageListCount: 0,
                                        zktorImageList: [],
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
                            zktorImageList: final_array
                        });
                    }
                }


            } else {
                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                                  zktorImageListCount: 0,
                                        zktorImageList: [],
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
                          zktorImageListCount: 0,
                                        zktorImageList: [],
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
exports.get_zktor_image_status_category_id = async (req, res) => {
	try {
    if (req.query.page_no && req.query.zktor_status_image_category_id) {
        var no_of_records_per_page = 10;
        var rowno = req.query.page_no;
        if (rowno !== 0) {
            rowno = (rowno - 1) * no_of_records_per_page;
        }
        db.query(`SELECT * FROM tbl_zktor_status_image where zktor_status_image_category_id=?  LIMIT ? OFFSET ?; SELECT COUNT(*) AS numrows FROM tbl_zktor_status_image where zktor_status_image_category_id=?`, [req.query.zktor_status_image_category_id, no_of_records_per_page, rowno, req.query.zktor_status_image_category_id], function(error, results, fields) {
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
                    console.log(merged);
                    /*
                    Object.keys(results[0]).forEach(function(key, idx, array) {
                        var result_data = results[0][key];

                          db.query(` SELECT * FROM tbl_zktor_status_image_category where zktor_status_image_category_id=?`, [result_data.zktor_status_image_category_id], function(error, results_comment, fields) {
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
                            if (results_comment.length > 0) {
                                result_data.zktor_status_category_name = results_comment[0].zktor_status_category_name;
                            } else {
                                result_data.zktor_status_category_name = '';
                            }
                            result_data.zktor_video_duration = timeAgo(new Date(result_data.created_date).toISOString());
                            final_array.push(result_data);
                            if (idx === array.length - 1) {
                                
                            }
                        });
                    });
                    */
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
                                        imageCategoryListCount: results[1][0].numrows,
                                        imageCategoryList: results[0],
                                        pagination: pagination
                                    });
                                } else {
                                    return res.status(404).send({
                                        status: 404,
                                        msg: "Page no missing or Its incorrect.",
                                                      imageCategoryListCount: 0,
                                        imageCategoryList: [],
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
                            imageCategoryList: final_array,
                                                         imageCategoryListCount: 0,
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


            } else {
                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                                                    imageCategoryListCount: 0,
                                        imageCategoryList: [],
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
                                            imageCategoryListCount: 0,
                                        imageCategoryList: [],
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
exports.get_zktor_image_status_category_id_old = async (req, res) => {
	try {
    if (req.query.page_no && req.query.zktor_status_image_category_id) {
        var no_of_records_per_page = 10;
        var rowno = req.query.page_no;
        if (rowno !== 0) {
            rowno = (rowno - 1) * no_of_records_per_page;
        }
        db.query(`SELECT * FROM tbl_zktor_status_image where zktor_status_image_category_id=?  LIMIT ? OFFSET ?; SELECT COUNT(*) AS numrows FROM tbl_zktor_status_image where zktor_status_image_category_id=?`, [req.query.zktor_status_image_category_id, no_of_records_per_page, rowno, req.query.zktor_status_image_category_id], function(error, results, fields) {
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
                    console.log(merged);
                    Object.keys(results[0]).forEach(function(key, idx, array) {
                        var result_data = results[0][key];

                          db.query(` SELECT * FROM tbl_zktor_status_image_category where zktor_status_image_category_id=?`, [result_data.zktor_status_image_category_id], function(error, results_comment, fields) {
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
                            if (results_comment.length > 0) {
                                result_data.zktor_status_category_name = results_comment[0].zktor_status_category_name;
                            } else {
                                result_data.zktor_status_category_name = '';
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
                                        imageCategoryListCount: results[1][0].numrows,
                                        imageCategoryList: final_array,
                                        pagination: pagination
                                    });
                                } else {
                                    return res.status(404).send({
                                        status: 404,
                                        msg: "Page no missing or Its incorrect.",
                                                      imageCategoryListCount: 0,
                                        imageCategoryList: [],
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
                            imageCategoryList: final_array,
                                                         imageCategoryListCount: 0,
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


            } else {
                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                                                    imageCategoryListCount: 0,
                                        imageCategoryList: [],
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
                                            imageCategoryListCount: 0,
                                        imageCategoryList: [],
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
exports.get_zktor_image_status_category = async (req, res) => {
	try {
    if (req.query.page_no) {
        var no_of_records_per_page = 10;
        var rowno = req.query.page_no;
        if (rowno != 0) {
            rowno = (rowno - 1) * no_of_records_per_page;
        }
        db.query(`SELECT * FROM tbl_zktor_status_image_category LIMIT ? OFFSET ?; SELECT COUNT(*) AS numrows FROM tbl_zktor_status_image_category `, [no_of_records_per_page, rowno], function(error, results, fields) {
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
                            zktorImageCategoryListCount: results[1][0].numrows,
                            zktorImageCategoryList: results[0],
                            pagination: pagination
                        });
                    } else {
                        return res.status(404).send({
                            status: 404,
                            msg: "Page no missing or Its incorrect.",
                                             zktorImageCategoryListCount: 0,
                                        zktorImageCategoryList: [],
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
                            zktorImageCategoryList: final_array
                        });
                    }
                }


            } else {
                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                                             zktorImageCategoryListCount: 0,
                                        zktorImageCategoryList: [],
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
                                     zktorImageCategoryListCount: 0,
                                        zktorImageCategoryList: [],
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
exports.get_zktor_image_status_category_without_pagination = async (req, res) => {
	try {

    db.query(`SELECT * FROM tbl_zktor_status_image_category`, function(error, results, fields) {
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
                    zktorImageCategoryListCount: results.length,
                    zktorImageCategoryList: results

                });

            } else {

                return res.status(200).send({
                    status: 200,
                    msg: "Success",
                       zktorImageCategoryListCount: final_array.length,
                    zktorImageCategoryList: final_array
                });
            }


        } else {
            return res.status(404).send({
                status: 404,
                msg: "Record not found",
                 zktorImageCategoryListCount:0,
                    zktorImageCategoryList: []
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
exports.get_zktor_image_category_without_pagination = async (req, res) => {
	try {
    var comment = [];
    db.query(`SELECT * FROM tbl_zktor_status_image_category`, function(error, results_comment, fields) {
        if (error) throw error;
        if (results_comment.length > 0) {

            return res.status(200).send({
                status: 200,
                msg: "Success",
                zktorImageCategoryListCount: results_comment.length,
                zktorImageCategoryList: results_comment
            });

        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail",
                  zktorImageCategoryListCount:0,
                    zktorImageCategoryList: []
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
