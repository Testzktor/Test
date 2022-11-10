const db = require("../../config/connection");
exports.job_random = async (req, res) => {
	try {
var final_array = [];
    ///db.query(`SELECT job_user_id as user_id,job_company_image as image,job_description as description  from tbl_job_create  ORDER BY rand() limit 15`, function(error, results, fields) {
       db.query(`SELECT * from tbl_job_create  ORDER BY rand() limit 15`, function(error, results, fields) { 
       if (error) throw error;
        if (results.length > 0) {
            Object.keys(results).forEach(function(key, idx, array) {
                var result = results[key];
                db.query(`SELECT * FROM tbl_user_profile WHERE user_id = ?`, [result.job_user_id], function(err, rows, fields) {
                    if (err) {
                        return res.status(400).send({
                            status: 400,
                            msg:"No Record Found",
                             randomListCount: final_array.length,
                         randomList: final_array,
                        });
                    } else {
                        if (rows.length > 0) {
                            result.user_name = rows[0].user_name;
                            result.user_profile_img = rows[0].user_profile_img;
                        } else {
                            result.user_name = '';
                            result.user_profile_img = '';
                        }
                        if(result.job_company_image!==''){
                            if((result.job_company_image).includes('/uploads/job_company_image')){
                                
                            }else{
                                result.job_company_image=define.BASE_URL+'job_company_image/'+result.job_company_image;
                            }
                        }
                        final_array.push(result);
                        if (idx === array.length - 1) {
                            return res.status(200).send({
                                status: 200,
                                msg: "Success",
                                randomListCount: final_array.length,
                                randomList: final_array,
                            });
                        }
                    }
                });
            });

        } else {
            return res.status(404).send({
                status: 404,
                msg: "No Record Found",
                randomListCount: final_array.length,
                randomList: final_array,
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
exports.news_random = async (req, res) => {
	try {
var final_array = [];
    db.query(`SELECT * from tbl_news  ORDER BY rand() limit 15`, function(error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            Object.keys(results).forEach(function(key, idx, array) {
                var result = results[key];
           
                        if(result.news_image!=''){
                            if((result.news_image).includes('/uploads/news/')){
                                
                            }else{
                                result.news_image=define.BASE_URL+'news/'+result.news_image;
                            }
                        }
                        final_array.push(result);
                        if (idx === array.length - 1) {
                            return res.status(200).send({
                                status: 200,
                                msg: "Success",
                                randomListCount: final_array.length,
                                randomList: final_array,
                            });
                        }
                    
            });

        } else {
            return res.status(404).send({
                status: 404,
                msg: "No Record Found",
                randomListCount: final_array.length,
                randomList: final_array,
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
exports.sell_random = async (req, res) => {
	try {
var final_array = [];
  ///  db.query(`SELECT common_product_user_id as user_id,common_product_images as image,common_product_title as description  from tbl_bazar_product_buy_sell  ORDER BY rand() limit 15`, function(error, results, fields) {
      db.query(`SELECT * from tbl_bazar_product_buy_sell  ORDER BY rand() limit 15`, function(error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            Object.keys(results).forEach(function(key, idx, array) {
                var result = results[key];
                db.query(`SELECT * FROM tbl_user_profile WHERE user_id = ?`, [result.common_product_user_id], function(err, rows, fields) {
                    if (err) {
                        return res.status(400).send({
                            status: 400,
                            msg:"No Record Found",
                             randomListCount: final_array.length,
                         randomList: final_array,
                        });
                    } else {
                        if (rows.length > 0) {
                            result.user_name = rows[0].user_name;
                            result.user_profile_img = rows[0].user_profile_img;
                        } else {
                            result.user_name = '';
                            result.user_profile_img = '';
                        }
                        final_array.push(result);
                        if (idx === array.length - 1) {
                            return res.status(200).send({
                                status: 200,
                                msg: "Success",
                                randomListCount: final_array.length,
                                randomList: final_array,
                            });
                        }
                    }
                });
            });

        } else {
            return res.status(404).send({
                status: 404,
                msg: "No Record Found",
                randomListCount: final_array.length,
                randomList: final_array,
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
exports.zktor_video_random = async (req, res) => {
	try {
var final_array = [];
    db.query(`SELECT zktor_video_user_id as user_id,zktor_video_url as video,zktor_video_description as description,zktor_video_thumbnail_url as thumbnail  from tbl_zktor_video  ORDER BY rand() limit 15`, function(error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            Object.keys(results).forEach(function(key, idx, array) {
                var result = results[key];
                db.query(`SELECT * FROM tbl_user_profile WHERE user_id = ?`, [result.user_id], function(err, rows, fields) {
                    if (err) {
                        return res.status(400).send({
                            status: 400,
                            msg:"No Record Found",
                             randomListCount: final_array.length,
                         randomList: final_array,
                        });
                    } else {
                        if (rows.length > 0) {
                            result.user_name = rows[0].user_name;
                            result.user_profile_img = rows[0].user_profile_img;
                        } else {
                            result.user_name = '';
                            result.user_profile_img = '';
                        }
                        final_array.push(result);
                        if (idx === array.length - 1) {
                            return res.status(200).send({
                                status: 200,
                                msg: "Success",
                                randomListCount: final_array.length,
                                randomList: final_array.reverse(),
                            });
                        }
                    }
                });
            });

        } else {
            return res.status(404).send({
                status: 404,
                msg: "No Record Found",
                randomListCount: final_array.length,
                randomList: final_array,
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