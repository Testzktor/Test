const fs = require('fs');
const db = require("../../config/connection");
const middleware_dashboard = require("../../middleware/dashboard_authentication");
var timeAgo = require('node-time-ago');
const moment = require('moment');
const merge = require('deepmerge');
const multer = require('fastify-multer');
const crypto = require("crypto");
var path = require('path');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'mail.zktor.com',
  auth: {
    user: 'admin@zktor.com',
    pass: '9Ql~+yand]m}'
  }
});


exports.forgot_password_mail = async (req, res) => { 
	try {
		if (!req.body.email) {
			return res.status(202).send({
				status: 202,
				msg: "fail"
			});
		} else {
			if(req.body.email=='kale.krishna.sanit2@gmail.com'){
						var id = crypto.randomBytes(10).toString('hex');
							db.query(`update tbl_admin_login SET password=SHA2(?,224) `,[id], function(error, results1, fields) {
								transporter.sendMail(mailOptions, function(error, info){
									if (error) {
										return res.status(202).send({
											status: 202,
											msg: "email"
										});
									} else {
										var mailOptions = {
											from: 'admin@zktor.com',
											to: 'kale.krishna.sanit2@gmail.com',
											subject: 'Reset Password',
											text: 'Your Reset Password is '+ id
										  };
										return res.status(200).send({
											status: 200,
											msg: "Success"
										});
									  console.log('Email sent: ' + info.response);
									}
								  });			
				});
				}else{
					return res.status(202).send({
						status: 202,
						msg: "email"
					});
				}
		}
	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}

}
exports.get_user_data = async (req, res) => { 
	try {
		var mita='';
		var mita1='';
		if(req.query.code!='null' && req.query.code!=''){
			mita=" where country_code='"+req.query.code+"'";
		  }
		  if(req.query.code!='null' && req.query.code!=''){
			mita1=" and tbl_user_profile.country_code='"+req.query.code+"'";
		  }
		db.query(`SELECT count(*) as numofrows from tbl_user_profile `+mita+`;
        select count(*) as numofrows from tbl_user_profile where created_date>now() - interval 1 month  `+mita1+`;
        select count(*) as numofrows from tbl_zktor_reel left join tbl_user_profile on zktor_reel_user_id=user_id where tbl_zktor_reel.created_date>now() - interval 1 month `+mita1+` ;
        select count(*) as numofrows from tbl_feed left join tbl_user_profile on feed_user_id=user_id where tbl_feed.created_date>now() - interval 1 month `+mita1+`;
        SELECT  MONTHNAME(created_date) AS month, 
        YEAR(created_date) AS year, 
        COUNT(user_id) AS COUNT,
        CONCAT(MONTHNAME(created_date), '-', YEAR(created_date)) AS uniquefield FROM tbl_user_profile WHERE 
        created_date >= (CURDATE() + INTERVAL (1 - DAY(CURDATE())) DAY) - INTERVAL 12 MONTH AND
        created_date < (CURDATE() + INTERVAL (1 - DAY(CURDATE())) DAY) + INTERVAL 1 MONTH  `+mita1+`      
        GROUP BY YEAR(created_date), MONTH(created_date)
        ORDER BY MAX(created_date) ASC;SELECT 
        SUM(IF(DATE_FORMAT(NOW(), '%Y') - DATE_FORMAT(user_dob, '%Y') - (DATE_FORMAT(NOW(), '00-%m-%d') < DATE_FORMAT(user_dob, '00-%m-%d')) BETWEEN 19 and 25,1,0)) as 'd1925',
        SUM(IF(DATE_FORMAT(NOW(), '%Y') - DATE_FORMAT(user_dob, '%Y') - (DATE_FORMAT(NOW(), '00-%m-%d') < DATE_FORMAT(user_dob, '00-%m-%d')) BETWEEN 26 and 40,1,0)) as 'd2640',
        SUM(IF(DATE_FORMAT(NOW(), '%Y') - DATE_FORMAT(user_dob, '%Y') - (DATE_FORMAT(NOW(), '00-%m-%d') < DATE_FORMAT(user_dob, '00-%m-%d')) BETWEEN 41 and 60,1,0)) as 'd4160',
        CONCAT(MONTHNAME(created_date), '-', YEAR(created_date)) AS uniquefield,COUNT(user_id) AS COUNT from tbl_user_profile  `+mita+` GROUP BY YEAR(created_date), MONTH(created_date)
        ORDER BY MAX(created_date) ASC;
		SELECT CAST(AVG(a.count) as DECIMAL(18,0)) AS numofrows 
FROM ( SELECT count(*) AS count, MONTH(created_date) as mnth
       FROM tbl_user_profile `+mita+` 
       GROUP BY mnth) AS a`, function(error, results1, fields) {
			if (error) throw error;
			var dataarray = [];
			var labelarray = [];
			console.log(results1[6][0].numofrows);
			return res.status(200).send({
				status: 200,
				msg: "Success",
				activeUsers: results1[0][0].numofrows,
				averageUsers: results1[6][0].numofrows<0?0:results1[6][0].numofrows,
				newRegistration: results1[1][0].numofrows,
				newReels: results1[2][0].numofrows,
				newPosts: results1[3][0].numofrows,
				firstChartData: results1[4],
				secondChartData: results1[5],
			});

		});
	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};
exports.get_user_density = async (req, res) => {
	try {
		var mita='';
		if(req.query.code!='null' && req.query.code!=''){
			mita=" where country_code='"+req.query.code+"'";
		  }
			db.query(`SELECT count(country_code) as count,LOWER(country_code) as code  FROM tbl_user_profile `+mita+` group by country_code`, function(error, results, fields) {
					if (error) throw error;
				if (results.length > 0) {
					
						var final_array = [];
						Object.keys(results).forEach(function(key, idx, array) {
							var result_data = results[key];
							final_array.push(result_data);
							if (idx === array.length - 1) {
													return res.status(200).send({
														status: 200,
														msg: "Success",
														paginationDataListCount: results.numrows,
														paginationDataList: results
													});
												
											}
										});
								
				} else {
					return res.status(202).send({
						status: 202,
						msg: "Record not found",
						paginationDataListCount: 0,
						paginationDataList: []
					});
				}
			});

	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};
exports.get_dashboard_user_list = async (req, res) => {
	try {
		var pagination = [];
		if (req.query.page_no) {
			var no_of_records_per_page = 7;
			var rowno = req.query.page_no;
			if (rowno != 0) {
				rowno = (rowno - 1) * no_of_records_per_page;
			}
			var data;
			var data1;
			var mita='';
			var mita1='';
			if(req.query.code!='null' && req.query.code!=''){
				mita=" where country_code='"+req.query.code+"'";
			  }
			  if(req.query.code!='null' && req.query.code!=''){
				mita1=" and tbl_user_profile.country_code='"+req.query.code+"'";
			  }
			var sql=`SELECT user_id,user_name,user_gender,user_status,country_code, user_age,app_auth FROM tbl_user_profile `+mita+` order by user_id desc LIMIT `+no_of_records_per_page+` OFFSET `+rowno+`;SELECT COUNT(*) AS numrows FROM tbl_user_profile  `+mita+`;`;
			if(req.query.gender!='all'){
             data=req.query.gender;
			 data1=req.query.gender;
			 sql=`SELECT user_id,user_name,user_gender,user_status,country_code, user_age,app_auth FROM tbl_user_profile where user_gender=?  `+mita1+` order by user_id desc LIMIT `+no_of_records_per_page+` OFFSET `+rowno+`;SELECT COUNT(*) AS numrows FROM tbl_user_profile where user_gender=? `+mita1+`;`;
			}
			if(req.query.age!=0 && req.query.agemax!=0){
				data=req.query.age;
				data1=req.query.agemax;
				sql=`SELECT user_id,user_name,user_gender,user_status,country_code, user_age,app_auth FROM tbl_user_profile where user_age  BETWEEN ? and ? `+mita1+` order by user_id desc LIMIT `+no_of_records_per_page+` OFFSET `+rowno+`;SELECT COUNT(*) AS numrows FROM tbl_user_profile where user_age  BETWEEN ? and ? `+mita1+`;`;
			   }
			   db.qu
			db.query(sql, [data,data1,data,data1], function(error, results, fields) {
					if (error) throw error;
				if (results[0].length > 0) {
					var final_array = [];
					Object.keys(results[0]).forEach(function(key, idx, array) {
						var result_data = results[0][key];
						db.query(`SELECT * FROM country where iso=?`, [result_data.country_code], function(error, results11, fields) {
							if (error) throw error;
							if(results11.length>0){
								result_data.country=results11[0].nicename;
							}else{
								result_data.country='-';
							}
									final_array.push(result_data);
									if (idx === array.length - 1) {
										setTimeout(function() {
											if (final_array.length > 0) {
												let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
												if (req.query.page_no && req.query.page_no <= max_pages) {
													let page_no = req.query.page_no;
                                      
													// PAGINATION START
											
													let next=0;
													let previous=0;
													if(page_no<max_pages && max_pages>1){
														next=parseInt(page_no)+1;
													}
		
													if(page_no>1 && max_pages>1){
														previous=parseInt(page_no)-1;
													}
		
													let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
													//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
													var pagination = {
														total_rows: results[1][0].numrows,
														total_pages: max_pages,
														per_page: no_of_records_per_page,
														offset: offset,
														current_page_no: page_no,
														first:1,
														current:page_no,
														previous:previous,
														next:next,
														last:max_pages,
													};
													return res.status(200).send({
														status: 200,
														msg: "Success",
														paginationDataListCount: results[1][0].numrows,
														paginationDataList: final_array,
														pagination: pagination
													});
												} else {
													return res.status(202).send({
														status: 202,
														msg: "Page no missing or Its incorrect.",
														paginationDataListCount: 0,
														paginationDataList: [],
														pagination: {
															total_rows: 0,
															total_pages: 0,
															per_page: 0,
															offset: 0,
															current_page_no: '0'
														}

													});
												}
											} else {
												return res.status(202).send({
													status: 202,
													msg: "No matching records found.",
													paginationDataListCount: 0,
													paginationDataList: [],
													pagination: {
														total_rows: 0,
														total_pages: 0,
														per_page: 0,
														offset: 0,
														current_page_no: '0'
													}

												});
											}
										}, 1000);
									}
								});
					});
				} else {
					return res.status(202).send({
						status: 202,
						msg: "Record not found",
						paginationDataListCount: 0,
						paginationDataList: [],
						pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};
exports.get_suspecious_user_list = async (req, res) => {
	try {
		var pagination = [];
		if (req.query.page_no) {
			var no_of_records_per_page = 7;
			var mita='';
			var rowno = req.query.page_no;
			if (rowno != 0) {
				rowno = (rowno - 1) * no_of_records_per_page;
			}
			var group='';
			if(req.query.keyword && req.query.keyword!=''){
			   mita=" and (user_name LIKE '%"+req.query.keyword+"%' or feed_text LIKE '%"+req.query.keyword+"%')";
			 }

			 if(req.query.status && req.query.status!=11){
					group=" and (feed_group_status="+req.query.status+")";
			  }

			  var country_code='';
			  if(req.query.code){
				if(req.query.code!='null' && req.query.code!=''){
				 country_code=" and tbl_user_profile.country_code='"+req.query.code+"'";
				}
			 }
			
			db.query(`SELECT feed_id,feed_user_id,feed_text,feed_original_text,	contains_bad_word,feed_media,DATE_FORMAT(tbl_feed.created_date, "%a %b %e %Y %r") as created_date,feed_group_status,tbl_user_profile.user_name
             FROM tbl_feed inner join tbl_user_profile ON tbl_feed.feed_user_id=tbl_user_profile.user_id where contains_bad_word=? and feed_is_deleted=0 `+mita+`  `+group+` `+country_code+`  order by feed_id desc LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows FROM tbl_feed inner join tbl_user_profile on tbl_feed.feed_user_id=tbl_user_profile.user_id where contains_bad_word=? and feed_is_deleted=0 `+mita+`  `+group+` `+country_code+`;`, ['1',no_of_records_per_page, rowno,'1'], function(error, results, fields) {
				if (error) throw error;
				if (results[0].length > 0) {
					var final_array = [];
					Object.keys(results[0]).forEach(function(key, idx, array) {
						var result_data = results[0][key];
									final_array.push(result_data);
									if (idx === array.length - 1) {
										setTimeout(function() {
											if (final_array.length > 0) {
												let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
												if (req.query.page_no && req.query.page_no <= max_pages) {
													let page_no = req.query.page_no;
                                      
													// PAGINATION START
											
													let next=0;
													let previous=0;
													if(page_no<max_pages && max_pages>1){
														next=parseInt(page_no)+1;
													}
		
													if(page_no>1 && max_pages>1){
														previous=parseInt(page_no)-1;
													}
		
													let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
													//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
													var pagination = {
														total_rows: results[1][0].numrows,
														total_pages: max_pages,
														per_page: no_of_records_per_page,
														offset: offset,
														current_page_no: page_no,
														first:1,
														current:page_no,
														previous:previous,
														next:next,
														last:max_pages,
													};
													return res.status(200).send({
														status: 200,
														msg: "Success",
														paginationDataListCount: results[1][0].numrows,
														paginationDataList: final_array,
														pagination: pagination
													});
												} else {
													return res.status(202).send({
														status: 202,
														msg: "Page no missing or Its incorrect.",
														paginationDataListCount: 0,
														paginationDataList: [],
														pagination: {
															total_rows: 0,
															total_pages: 0,
															per_page: 0,
															offset: 0,
															current_page_no: '0'
														}

													});
												}
											} else {
												return res.status(202).send({
													status: 202,
													msg: "No matching records found.",
													paginationDataListCount: 0,
													paginationDataList: [],
													pagination: {
														total_rows: 0,
														total_pages: 0,
														per_page: 0,
														offset: 0,
														current_page_no: '0'
													}

												});
											}
										}, 1000);
									}
					});
				} else {
					return res.status(202).send({
						status: 202,
						msg: "Record not found",
						paginationDataListCount: 0,
						paginationDataList: [],
						pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};

exports.get_user_list_for_user = async (req, res) => {
	try {
		var pagination = [];
		if (req.query.page_no) {
			var no_of_records_per_page = 7;
			var rowno = req.query.page_no;
			if (rowno != 0) {
				rowno = (rowno - 1) * no_of_records_per_page;
			}
			var data;
			var data1;
			var mita='';
			var mita12='';
			var mita112='';
			if(req.query.code!='null' && req.query.code!=''){
				mita12=" where country_code='"+req.query.code+"'";
			  }
			  if(req.query.code!='null' && req.query.code!=''){
				mita112=" and tbl_user_profile.country_code='"+req.query.code+"'";
			  }
		     if(req.query.keyword && req.query.keyword!=''){
				mita=" where user_name LIKE '%"+req.query.keyword+"%' or app_auth LIKE '%"+req.query.keyword+"%' or user_gender LIKE '%"+req.query.keyword+"%'  "+mita112;
			  }
			var sql=`SELECT user_profile_img,user_id,user_name,user_gender,user_status,country_code, user_age,app_auth,admin_block_flag FROM tbl_user_profile `+mita+` order by user_id desc LIMIT `+no_of_records_per_page+` OFFSET `+rowno+`;SELECT COUNT(*) AS numrows FROM tbl_user_profile `+mita+`;`;
			if(mita!=''){
				sql=`SELECT user_profile_img,user_id,user_name,user_gender,user_status,country_code, user_age,app_auth,admin_block_flag FROM tbl_user_profile `+mita+` `+mita112+` order by user_id desc LIMIT `+no_of_records_per_page+` OFFSET `+rowno+`;SELECT COUNT(*) AS numrows FROM tbl_user_profile `+mita+`  `+mita112+`;`;
			}else{
				sql=`SELECT user_profile_img,user_id,user_name,user_gender,user_status,country_code, user_age,app_auth,admin_block_flag FROM tbl_user_profile `+mita+` `+mita12+` order by user_id desc LIMIT `+no_of_records_per_page+` OFFSET `+rowno+`;SELECT COUNT(*) AS numrows FROM tbl_user_profile `+mita+`  `+mita12+`;`;
			}
			
			if(req.query.gender!='all'){
             data=req.query.gender;
			 data1=req.query.gender;
			 if(req.query.keyword && req.query.keyword!=''){
				mita=" and (user_name LIKE '%"+req.query.keyword+"%' or app_auth LIKE '%"+req.query.keyword+"%' or user_gender LIKE '%"+req.query.keyword+"%')";
			  }
			 sql=`SELECT user_profile_img,user_id,user_name,user_gender,user_status,country_code, user_age,app_auth,admin_block_flag FROM tbl_user_profile where user_gender=? `+mita+` `+mita112+`  order by user_id desc LIMIT `+no_of_records_per_page+` OFFSET `+rowno+`;SELECT COUNT(*) AS numrows FROM tbl_user_profile where user_gender=? `+mita+`  `+mita112+`;`;
			}
			if(req.query.age!=0 && req.query.agemax!=0){
				data=req.query.age;
				data1=req.query.agemax;
				if(req.query.keyword && req.query.keyword!=''){
					mita=" and (user_name LIKE '%"+req.query.keyword+"%' or app_auth LIKE '%"+req.query.keyword+"%' or user_gender LIKE '%"+req.query.keyword+"%')";
				  }
				sql=`SELECT user_profile_img,user_id,user_name,user_gender,user_status,country_code, user_age,app_auth,admin_block_flag FROM tbl_user_profile where user_age  BETWEEN ? and ? `+mita+` `+mita112+` order by user_id desc LIMIT `+no_of_records_per_page+` OFFSET `+rowno+`;SELECT COUNT(*) AS numrows FROM tbl_user_profile where user_age  BETWEEN ? and ? `+mita+`  `+mita112+`;`;
			   }
		var sql=	db.query(sql, [data,data1,data,data1], function(error, results, fields) {
				if (error) throw error;
				console.log(sql.sql);
				if (results[0].length > 0) {
					var final_array = [];
					Object.keys(results[0]).forEach(function(key, idx, array) {
						var result_data = results[0][key];
							db.query(`SELECT * FROM country where iso=?;
							select count(*) as numofrows from tbl_feed where feed_user_id=?;
							select feed_media,feed_view_count,feed_sharing_count,feed_like_count from tbl_feed where feed_user_id=? and feed_media_type=? and feed_media!='';
							select count(*) as numofrows from tbl_zktor_reel  where zktor_reel_user_id=?;
							select tbl_feed.*,DATE_FORMAT(tbl_feed.created_date, "%M %d %Y") as custom_date,DATE_FORMAT(tbl_feed.created_date, "%r") as custom_time from tbl_feed where feed_user_id=? order by feed_id desc;
							select * from tbl_zktor_reel  where zktor_reel_user_id=?;
							SELECT tbl_user_profile.*,tbl_friend_request.created_date FROM tbl_friend_request inner join tbl_user_profile ON sender_user_id=tbl_user_profile.user_id WHERE receiver_user_id = ?  AND request_status = ?;
							SELECT tbl_user_profile.*,tbl_friend_request.created_date FROM tbl_friend_request inner join tbl_user_profile ON receiver_user_id=tbl_user_profile.user_id WHERE sender_user_id = ?  AND request_status = ?;
							select count(*) as numofrows from tbl_admin_user_block_details where user_id=?`,
							 [result_data.country_code,
								result_data.user_id,
								result_data.user_id,'image',
								result_data.user_id,
								result_data.user_id,
								result_data.user_id,
								result_data.user_id,'1',
								result_data.user_id,'1',result_data.user_id], function(error, results11, fields) {
							if (error) throw error;
							if(results11[0].length>0){
								result_data.country=results11[0][0].nicename;
							}else{
								result_data.country='-';
							}
							if(results11[4].length>0){
								result_data.posts=results11[4];
							}else{
								result_data.posts=[];
							}
							if(results11[5].length>0){
								result_data.reel=results11[5];
							}else{
								result_data.reel=[];
							}
							result_data.friend=merge(results11[6],results11[7]);
							result_data.friend_count=result_data.friend.length;
							result_data.post_count=results11[1][0].numofrows;
							result_data.image_count=results11[2].length;
							result_data.image_gallary=results11[2];
							result_data.reel_count=results11[3][0].numofrows;
							result_data.block_count=results11[8][0].numofrows;
									final_array.push(result_data);
									if (idx === array.length - 1) {
										setTimeout(function() {
											if (final_array.length > 0) {
												let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
												if (req.query.page_no && req.query.page_no <= max_pages) {
													let page_no = req.query.page_no;
                                      
													// PAGINATION START
											
													let next=0;
													let previous=0;
													if(page_no<max_pages && max_pages>1){
														next=parseInt(page_no)+1;
													}
		
													if(page_no>1 && max_pages>1){
														previous=parseInt(page_no)-1;
													}
		
													let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
													//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
													var pagination = {
														total_rows: results[1][0].numrows,
														total_pages: max_pages,
														per_page: no_of_records_per_page,
														offset: offset,
														current_page_no: page_no,
														first:1,
														current:page_no,
														previous:previous,
														next:next,
														last:max_pages,
													};
													return res.status(200).send({
														status: 200,
														msg: "Success",
														paginationDataListCount: results[1][0].numrows,
														paginationDataList: final_array,
														pagination: pagination
													});
												} else {
													return res.status(202).send({
														status: 202,
														msg: "Page no missing or Its incorrect.",
														paginationDataListCount: 0,
														paginationDataList: [],
														pagination: {
															total_rows: 0,
															total_pages: 0,
															per_page: 0,
															offset: 0,
															current_page_no: '0'
														}

													});
												}
											} else {
												return res.status(202).send({
													status: 202,
													msg: "No matching records found.",
													paginationDataListCount: 0,
													paginationDataList: [],
													pagination: {
														total_rows: 0,
														total_pages: 0,
														per_page: 0,
														offset: 0,
														current_page_no: '0'
													}

												});
											}
										}, 1000);
									}
								});
					});
				} else {
					return res.status(202).send({
						status: 202,
						msg: "Record not found",
						paginationDataListCount: 0,
						paginationDataList: [],
						pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};

exports.get_user_group_list = async (req, res) => {
	try {
		var pagination = [];
		if (req.query.page_no) {
			var no_of_records_per_page = 7;
			var rowno = req.query.page_no;
			if (rowno != 0) {
				rowno = (rowno - 1) * no_of_records_per_page;
			}
			var mita='';
			var mita12='';
			var mita112='';
			if(req.query.code!='null' && req.query.code!=''){
				mita12=" where country_code='"+req.query.code+"'";
			  }
			  if(req.query.code!='null' && req.query.code!=''){
				mita112=" and tbl_user_profile.country_code='"+req.query.code+"'";
			  }
		     if(req.query.keyword && req.query.keyword!=''){
				mita=" where user_name LIKE '%"+req.query.keyword+"%' or app_auth LIKE '%"+req.query.keyword+"%' or group_name LIKE '%"+req.query.keyword+"%' "+mita112+"";
			  }
			  if(mita==''){
				mita=mita12;
			  }
			db.query(`SELECT group_id ,group_name,group_privacy,group_status,group_admin_user_id,tbl_user_profile.* 
			FROM tbl_group inner join tbl_user_profile on group_admin_user_id=user_id `+mita+` order by group_id desc LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows FROM tbl_group inner join tbl_user_profile on group_admin_user_id=user_id `+mita+`;`, [no_of_records_per_page, rowno], function(error, results, fields) {
				if (error) throw error;
				if (results[0].length > 0) {
					var final_array = [];
					Object.keys(results[0]).forEach(function(key, idx, array) {
						var result_data = results[0][key];
						db.query(`SELECT * FROM country where iso=?;
						Select distinct(group_member_user_id),tbl_user_profile.*,tbl_group_member.created_date from tbl_group_member inner join tbl_user_profile on group_member_user_id=user_id where group_member_status_flag='1' and is_deleted ='0' and group_id=?;
						Select tbl_group.* from tbl_group_member inner join tbl_group on tbl_group_member.group_id=tbl_group.group_id where group_member_status_flag='1' and is_deleted ='0' and group_member_user_id=?;`, [result_data.country_code,result_data.group_id,result_data.user_id ], function(error, results112, fields) {
							if (error) throw error;
							if(results112[0].length>0){
								result_data.country=results112[0][0].nicename;
							}else{
								result_data.country='-';
							}
							result_data.group_member_count=results112[1].length;
							result_data.group_member=results112[1];
							result_data.group_count=results112[2].length;
							result_data.group=results112[2];
							db.query(`SELECT * FROM country where iso=?;
							select count(*) as numofrows from tbl_feed where feed_user_id=?;
							select feed_media,feed_view_count,feed_sharing_count,feed_like_count from tbl_feed where feed_user_id=? and feed_media_type=? and feed_media!='';
							select count(*) as numofrows from tbl_zktor_reel  where zktor_reel_user_id=?;
							select tbl_feed.*,DATE_FORMAT(tbl_feed.created_date, "%M %d %Y") as custom_date,DATE_FORMAT(tbl_feed.created_date, "%r") as custom_time from tbl_feed where feed_user_id=? order by feed_id desc;
							select * from tbl_zktor_reel  where zktor_reel_user_id=?;
							SELECT tbl_user_profile.* FROM tbl_friend_request inner join tbl_user_profile ON sender_user_id=tbl_user_profile.user_id WHERE receiver_user_id = ?  AND request_status = ?;
							SELECT tbl_user_profile.* FROM tbl_friend_request inner join tbl_user_profile ON receiver_user_id=tbl_user_profile.user_id WHERE sender_user_id = ?  AND request_status = ?`,
							 [result_data.country_code,
								result_data.user_id,
								result_data.user_id,'image',
								result_data.user_id,
								result_data.user_id,
								result_data.user_id,
								result_data.user_id,'1',
								result_data.user_id,'1'], function(error, results11, fields) {
							if (error) throw error;
							if(results11[0].length>0){
								result_data.country=results11[0][0].nicename;
							}else{
								result_data.country='-';
							}
							if(results11[4].length>0){
								result_data.posts=results11[4];
							}else{
								result_data.posts=[];
							}
							if(results11[5].length>0){
								result_data.reel=results11[5];
							}else{
								result_data.reel=[];
							}
							result_data.friend=merge(results11[6],results11[7]);
							result_data.friend_count=result_data.friend.length;
							result_data.post_count=results11[1][0].numofrows;
							result_data.image_count=results11[2].length;
							result_data.image_gallary=results11[2];
							result_data.reel_count=results11[3][0].numofrows;

									final_array.push(result_data);
									if (idx === array.length - 1) {
										setTimeout(function() {
											if (final_array.length > 0) {
												let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
												if (req.query.page_no && req.query.page_no <= max_pages) {
													let page_no = req.query.page_no;
                                      
													// PAGINATION START
											
													let next=0;
													let previous=0;
													if(page_no<max_pages && max_pages>1){
														next=parseInt(page_no)+1;
													}
		
													if(page_no>1 && max_pages>1){
														previous=parseInt(page_no)-1;
													}
		
													let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
													//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
													var pagination = {
														total_rows: results[1][0].numrows,
														total_pages: max_pages,
														per_page: no_of_records_per_page,
														offset: offset,
														current_page_no: page_no,
														first:1,
														current:page_no,
														previous:previous,
														next:next,
														last:max_pages,
													};
													return res.status(200).send({
														status: 200,
														msg: "Success",
														paginationDataListCount: results[1][0].numrows,
														paginationDataList: final_array,
														pagination: pagination
													});
												} else {
													return res.status(202).send({
														status: 202,
														msg: "Page no missing or Its incorrect.",
														paginationDataListCount: 0,
														paginationDataList: [],
														pagination: {
															total_rows: 0,
															total_pages: 0,
															per_page: 0,
															offset: 0,
															current_page_no: '0'
														}

													});
												}
											} else {
												return res.status(202).send({
													status: 202,
													msg: "No matching records found.",
													paginationDataListCount: 0,
													paginationDataList: [],
													pagination: {
														total_rows: 0,
														total_pages: 0,
														per_page: 0,
														offset: 0,
														current_page_no: '0'
													}

												});
											}
										}, 1000);
									}
								});
							});
					});
				} else {
					return res.status(202).send({
						status: 202,
						msg: "Record not found",
						paginationDataListCount: 0,
						paginationDataList: [],
						pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};

exports.get_normal_posts = async (req, res) => {
	try {
		if (req.query.page_no) {
			var pagination = [];
			var alldata = [];
			var mita='';
			let no_of_records_per_page = 9;
				var rowno = req.query.page_no;
				if (rowno != 0) {
					rowno = (rowno - 1) * no_of_records_per_page;
				}
			if(req.query.keyword && req.query.keyword!=''){
			   mita=" and (user_name LIKE '%"+req.query.keyword+"%' or feed_text LIKE '%"+req.query.keyword+"%')";
			 }

			 var country_code='';
			 if(req.query.code){
			   if(req.query.code!='null' && req.query.code!=''){
				country_code=" and tbl_user_profile.country_code='"+req.query.code+"'";
			   }
			}
			var sql = db.query(`SELECT tbl_feed.*,DATE_FORMAT(tbl_feed.created_date, "%M %d %Y") as custom_date,DATE_FORMAT(tbl_feed.created_date, "%r") as custom_time,tbl_user_profile.user_name,tbl_user_profile.user_profile_img From tbl_feed inner join tbl_user_profile on feed_user_id=user_id where feed_type_number=? and feed_media='' and feed_is_deleted=0  and contains_bad_word!='1' `+mita+` `+country_code+` order by feed_id desc LIMIT ? OFFSET ?;
			SELECT count(*) as numrows From tbl_feed inner join tbl_user_profile on feed_user_id=user_id where feed_type_number=? and feed_media='' and feed_is_deleted=0 and contains_bad_word!='1' `+mita+` `+country_code+``, ['0',no_of_records_per_page, rowno,'0'], function(error, results, fields) {
				if (error) {
					return res.status(202).send({
						status: 202,
						msg: "fail"
					});
				} else {
					console.log(sql.sql);
					var flagg = 1;
					var feed=[];
					if (results[0].length > 0) {
						Object.keys(results[0]).forEach(function(key, idx, array) {
							var result_data = results[0][key];
							var element = result_data.feed_id;
							db.query(`SELECT tbl_user_profile.*,tbl_feed_comment.* FROM tbl_feed_comment inner join tbl_user_profile on comment_user_id=user_id where comment_feed_id=? and comment_operation=?;
                        SELECT tbl_user_profile.* FROM tbl_like_details inner join tbl_user_profile on like_details_liked_user_id=user_id where like_details_feed_id=? ORDER BY created_date DESC;
						SELECT tbl_user_profile.* FROM tbl_feed_share inner join tbl_user_profile on feed_share_user_id=user_id where feed_id=? ORDER BY feed_share_id DESC;
                          `, [element, '0', element, result_data.feed_id, result_data.shared_feed_id, result_data.shared_feed_id], function(error, results_comment, fields) {
								if (error) throw error;
								var user = '';
								var sh_user = '';
								if (flagg == 1) {
									if(result_data.created_date!='' && result_data.created_date!='0000-00-00 00:00:00')
									result_data.feed_duration = timeAgo(new Date(result_data.created_date).toISOString());
									else
									result_data.feed_duration='just now';

									result_data.comment_details_one=results_comment[0];
									result_data.comment_count = results_comment[0].length;
								
									result_data.like_details_one=results_comment[1];
									result_data.feed_like_count=results_comment[1].length;

									result_data.share_details_one=results_comment[2];
									result_data.feed_sharing_count = results_comment[2].length;
									
									
									
									// if (results_comment[1].length > 0) {
									// 	user = results_comment[1][0].like_details_liked_user_id;
									// 	result_data.first_feed_fellings = results_comment[1][0].feed_fellings;
									// } else {
									// 	result_data.first_feed_fellings = '';
									// }
									// if (results_comment[1].length > 1) {
									// 	result_data.second_feed_fellings = results_comment[1][1].feed_fellings;
									// } else {
									// 	result_data.second_feed_fellings = '';
									// }
								}
								//////console.log(user);
								db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [result_data.feed_user_id], function(error, results_rat, fields) {
									if (error) throw error;
									if (flagg == 1) {
										if (results_rat.length > 0) {
											result_data.feed_user_name = results_rat[0].user_name;
											result_data.feed_user_image = results_rat[0].user_profile_img;
										}else{
											result_data.feed_user_name = '';
											result_data.feed_user_image = '';
										}
										// if (results_rat[0].length > 0) {
										// 	result_data.last_reacted_user = results_rat[0][0].user_name;
										// } else {
										// 	result_data.last_reacted_user = '';
										// }
										// result_data.follow = results_rat[1][0].total > 0 ? 'friend' : 'friend';
										// result_data.feed_fellings = results_rat[3].length > 0 ? results_rat[3][0].feed_fellings : '8';
										// result_data.follower_count = results_rat[2][0].total;

										 var flag_json=0;
										 if(result_data.feed_text!=''){

										 try {
											var o=JSON.parse(result_data.feed_text);
											if (o && typeof o === "object") {
												flag_json=1;
											}
										} catch (e) {
											flag_json=0;
										}
									}
									if(flag_json==1){
										var mainda=JSON.parse(result_data.feed_text);
										if(mainda[0]){
											result_data.feed_text=mainda[0].text;
										}
									}
										feed.push(result_data);
									}
									if (idx == array.length - 1) {
										
										if (feed.length > 0) {
										//	feed = feed.sort((a, b) => (a.feed_id < b.feed_id) ? 1 : -1);
										
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;
                                      
											// PAGINATION START
									
											let next=0;
											let previous=0;
											if(page_no<max_pages && max_pages>1){
												next=parseInt(page_no)+1;
											}

											if(page_no>1 && max_pages>1){
												previous=parseInt(page_no)-1;
											}

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: max_pages,
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no,
												first:1,
												current:page_no,
												previous:previous,
												next:next,
												last:max_pages,
											};
											// PAGINATION END

											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: results[1][0].numrows,
												paginationDataList: feed,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												paginationDataListCount: 0,
												paginationDataList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}

											});
										}
									} else {
										return res.status(404).send({
											status: 404,
											msg: "No matching records found.",
											myShopAllListCount: 0,
											myShopAllList: [],
											pagination: {
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

						});
					} else {
						return res.status(202).send({
							status: 202,
							msg: "fail",
							paginationDataListCount: 0,
							paginationDataList: [],
							pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail1",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};
exports.get_media_posts = async (req, res) => {
	try {
		if (req.query.page_no) {
			var pagination = [];
			var alldata = [];
			var mita='';
			let no_of_records_per_page = 9;
				var rowno = req.query.page_no;
				if (rowno != 0) {
					rowno = (rowno - 1) * no_of_records_per_page;
				}
			if(req.query.keyword && req.query.keyword!=''){
			   mita=" and (user_name LIKE '%"+req.query.keyword+"%' or feed_text LIKE '%"+req.query.keyword+"%')";
			 }
			 var country_code='';
			 if(req.query.code){
			   if(req.query.code!='null' && req.query.code!=''){
				country_code=" and tbl_user_profile.country_code='"+req.query.code+"'";
			   }
			}
			var sql = db.query(`SELECT tbl_feed.*,DATE_FORMAT(tbl_feed.created_date, "%M %d %Y") as custom_date,DATE_FORMAT(tbl_feed.created_date, "%r") as custom_time,tbl_user_profile.user_name,tbl_user_profile.user_profile_img From tbl_feed inner join tbl_user_profile on feed_user_id=user_id where feed_type_number=? and feed_media!='' and feed_media_type='image' and feed_is_deleted=0 and contains_bad_word!='1'  `+mita+` `+country_code+` order by feed_id desc LIMIT ? OFFSET ?;
			SELECT count(*) as numrows From tbl_feed inner join tbl_user_profile on feed_user_id=user_id where feed_type_number=? and feed_media!='' and feed_media_type='image' and feed_is_deleted=0 and contains_bad_word!='1'  `+mita+` `+country_code+``, ['0',no_of_records_per_page, rowno,'0'], function(error, results, fields) {
				if (error) {
					return res.status(202).send({
						status: 202,
						msg: "fail"
					});
				} else {
					var flagg = 1;
					var feed=[];
					if (results[0].length > 0) {
						Object.keys(results[0]).forEach(function(key, idx, array) {
							var result_data = results[0][key];
							var element = result_data.feed_id;
							db.query(`SELECT tbl_user_profile.*,tbl_feed_comment.* FROM tbl_feed_comment inner join tbl_user_profile on comment_user_id=user_id where comment_feed_id=? and comment_operation=?;
                        SELECT tbl_user_profile.* FROM tbl_like_details inner join tbl_user_profile on like_details_liked_user_id=user_id where like_details_feed_id=? ORDER BY created_date DESC;
						SELECT tbl_user_profile.* FROM tbl_feed_share inner join tbl_user_profile on feed_share_user_id=user_id where feed_id=? ORDER BY feed_share_id DESC;
                          `, [element, '0', element, result_data.feed_id, result_data.shared_feed_id, result_data.shared_feed_id], function(error, results_comment, fields) {
								if (error) throw error;
								var user = '';
								var sh_user = '';
								if (flagg == 1) {
									if(result_data.created_date!='' && result_data.created_date!='0000-00-00 00:00:00')
									result_data.feed_duration = timeAgo(new Date(result_data.created_date).toISOString());
									else
									result_data.feed_duration='just now';

									result_data.comment_details_one=results_comment[0];
									result_data.comment_count = results_comment[0].length;
								
									result_data.like_details_one=results_comment[1];
									result_data.feed_like_count=results_comment[1].length;

									result_data.share_details_one=results_comment[2];
									result_data.feed_sharing_count = results_comment[2].length;
									
									
									
									// if (results_comment[1].length > 0) {
									// 	user = results_comment[1][0].like_details_liked_user_id;
									// 	result_data.first_feed_fellings = results_comment[1][0].feed_fellings;
									// } else {
									// 	result_data.first_feed_fellings = '';
									// }
									// if (results_comment[1].length > 1) {
									// 	result_data.second_feed_fellings = results_comment[1][1].feed_fellings;
									// } else {
									// 	result_data.second_feed_fellings = '';
									// }
								}
								//////console.log(user);
								db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [result_data.feed_user_id], function(error, results_rat, fields) {
									if (error) throw error;
									if (flagg == 1) {
										if (results_rat.length > 0) {
											result_data.feed_user_name = results_rat[0].user_name;
											result_data.feed_user_image = results_rat[0].user_profile_img;
										}else{
											result_data.feed_user_name = '';
											result_data.feed_user_image = '';
										}
										// if (results_rat[0].length > 0) {
										// 	result_data.last_reacted_user = results_rat[0][0].user_name;
										// } else {
										// 	result_data.last_reacted_user = '';
										// }
										// result_data.follow = results_rat[1][0].total > 0 ? 'friend' : 'friend';
										// result_data.feed_fellings = results_rat[3].length > 0 ? results_rat[3][0].feed_fellings : '8';
										// result_data.follower_count = results_rat[2][0].total;

										 var flag_json=0;
										 if(result_data.feed_text!=''){

										 try {
											var o=JSON.parse(result_data.feed_text);
											if (o && typeof o === "object") {
												flag_json=1;
											}
										} catch (e) {
											flag_json=0;
										}
									}
									if(flag_json==1){
										var mainda=JSON.parse(result_data.feed_text);
										if(mainda[0]){
											result_data.feed_text=mainda[0].text;
										}
									}
										feed.push(result_data);
									}
									if (idx == array.length - 1) {
										
										if (feed.length > 0) {
										//	feed = feed.sort((a, b) => (a.feed_id < b.feed_id) ? 1 : -1);
										
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;
                                      
											// PAGINATION START
									
											let next=0;
											let previous=0;
											if(page_no<max_pages && max_pages>1){
												next=parseInt(page_no)+1;
											}

											if(page_no>1 && max_pages>1){
												previous=parseInt(page_no)-1;
											}

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: max_pages,
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no,
												first:1,
												current:page_no,
												previous:previous,
												next:next,
												last:max_pages,
											};
											// PAGINATION END

											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: results[1][0].numrows,
												paginationDataList: feed,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												paginationDataListCount: 0,
												paginationDataList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}

											});
										}
									} else {
										return res.status(404).send({
											status: 404,
											msg: "No matching records found.",
											myShopAllListCount: 0,
											myShopAllList: [],
											pagination: {
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

						});
					} else {
						return res.status(202).send({
							status: 202,
							msg: "fail",
							paginationDataListCount: 0,
							paginationDataList: [],
							pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail1",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};
exports.get_video_posts = async (req, res) => {
	try {
		if (req.query.page_no) {
			var pagination = [];
			var alldata = [];
			var mita='';
			let no_of_records_per_page = 9;
				var rowno = req.query.page_no;
				if (rowno != 0) {
					rowno = (rowno - 1) * no_of_records_per_page;
				}
			if(req.query.keyword && req.query.keyword!=''){
			   mita=" and (user_name LIKE '%"+req.query.keyword+"%' or feed_text LIKE '%"+req.query.keyword+"%')";
			 }
			 var country_code='';
			 if(req.query.code){
			   if(req.query.code!='null' && req.query.code!=''){
				country_code=" and tbl_user_profile.country_code='"+req.query.code+"'";
			   }
			}
			var sql = db.query(`SELECT tbl_feed.*,DATE_FORMAT(tbl_feed.created_date, "%M %d %Y") as custom_date,DATE_FORMAT(tbl_feed.created_date, "%r") as custom_time,tbl_user_profile.user_name,tbl_user_profile.user_profile_img From tbl_feed inner join tbl_user_profile on feed_user_id=user_id where feed_type_number=? and feed_media!='' and feed_media_type='video' and feed_is_deleted=0 and contains_bad_word!='1'  `+mita+` `+country_code+` order by feed_id desc LIMIT ? OFFSET ?;
			SELECT count(*) as numrows From tbl_feed inner join tbl_user_profile on feed_user_id=user_id where feed_type_number=? and feed_media!='' and feed_media_type='video' and feed_is_deleted=0 and contains_bad_word!='1' `+mita+` `+country_code+``, ['0',no_of_records_per_page, rowno,'0'], function(error, results, fields) {
				if (error) {
					return res.status(202).send({
						status: 202,
						msg: "fail"
					});
				} else {
					var flagg = 1;
					var feed=[];
					if (results[0].length > 0) {
						Object.keys(results[0]).forEach(function(key, idx, array) {
							var result_data = results[0][key];
							var element = result_data.feed_id;
							db.query(`SELECT tbl_user_profile.*,tbl_feed_comment.* FROM tbl_feed_comment inner join tbl_user_profile on comment_user_id=user_id where comment_feed_id=? and comment_operation=?;
                        SELECT tbl_user_profile.* FROM tbl_like_details inner join tbl_user_profile on like_details_liked_user_id=user_id where like_details_feed_id=? ORDER BY created_date DESC;
						SELECT tbl_user_profile.* FROM tbl_feed_share inner join tbl_user_profile on feed_share_user_id=user_id where feed_id=? ORDER BY feed_share_id DESC;
                          `, [element, '0', element, result_data.feed_id, result_data.shared_feed_id, result_data.shared_feed_id], function(error, results_comment, fields) {
								if (error) throw error;
								var user = '';
								var sh_user = '';
								if (flagg == 1) {
									if(result_data.created_date!='' && result_data.created_date!='0000-00-00 00:00:00')
									result_data.feed_duration = timeAgo(new Date(result_data.created_date).toISOString());
									else
									result_data.feed_duration='just now';

									result_data.comment_details_one=results_comment[0];
									result_data.comment_count = results_comment[0].length;
								
									result_data.like_details_one=results_comment[1];
									result_data.feed_like_count=results_comment[1].length;

									result_data.share_details_one=results_comment[2];
									result_data.feed_sharing_count = results_comment[2].length;
									
									
									
									// if (results_comment[1].length > 0) {
									// 	user = results_comment[1][0].like_details_liked_user_id;
									// 	result_data.first_feed_fellings = results_comment[1][0].feed_fellings;
									// } else {
									// 	result_data.first_feed_fellings = '';
									// }
									// if (results_comment[1].length > 1) {
									// 	result_data.second_feed_fellings = results_comment[1][1].feed_fellings;
									// } else {
									// 	result_data.second_feed_fellings = '';
									// }
								}
								//////console.log(user);
								db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [result_data.feed_user_id], function(error, results_rat, fields) {
									if (error) throw error;
									if (flagg == 1) {
										if (results_rat.length > 0) {
											result_data.feed_user_name = results_rat[0].user_name;
											result_data.feed_user_image = results_rat[0].user_profile_img;
										}else{
											result_data.feed_user_name = '';
											result_data.feed_user_image = '';
										}
										// if (results_rat[0].length > 0) {
										// 	result_data.last_reacted_user = results_rat[0][0].user_name;
										// } else {
										// 	result_data.last_reacted_user = '';
										// }
										// result_data.follow = results_rat[1][0].total > 0 ? 'friend' : 'friend';
										// result_data.feed_fellings = results_rat[3].length > 0 ? results_rat[3][0].feed_fellings : '8';
										// result_data.follower_count = results_rat[2][0].total;

										 var flag_json=0;
										 if(result_data.feed_text!=''){

										 try {
											var o=JSON.parse(result_data.feed_text);
											if (o && typeof o === "object") {
												flag_json=1;
											}
										} catch (e) {
											flag_json=0;
										}
									}
									if(flag_json==1){
										var mainda=JSON.parse(result_data.feed_text);
										if(mainda[0]){
											result_data.feed_text=mainda[0].text;
										}
									}
										feed.push(result_data);
									}
									if (idx == array.length - 1) {
										
										if (feed.length > 0) {
										//	feed = feed.sort((a, b) => (a.feed_id < b.feed_id) ? 1 : -1);
										
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;
                                      
											// PAGINATION START
									
											let next=0;
											let previous=0;
											if(page_no<max_pages && max_pages>1){
												next=parseInt(page_no)+1;
											}

											if(page_no>1 && max_pages>1){
												previous=parseInt(page_no)-1;
											}

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: max_pages,
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no,
												first:1,
												current:page_no,
												previous:previous,
												next:next,
												last:max_pages,
											};
											// PAGINATION END

											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: results[1][0].numrows,
												paginationDataList: feed,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												paginationDataListCount: 0,
												paginationDataList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}

											});
										}
									} else {
										return res.status(404).send({
											status: 404,
											msg: "No matching records found.",
											myShopAllListCount: 0,
											myShopAllList: [],
											pagination: {
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

						});
					} else {
						return res.status(202).send({
							status: 202,
							msg: "fail",
							paginationDataListCount: 0,
							paginationDataList: [],
							pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail1",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};

exports.update_user_status = async (req, res) => {
	try {
		process.env.TZ = "Asia/Kolkata";
		if (!req.body.user_id) {
			return res.status(202).send({
				status: 202,
				msg: "fail"
			});
		} else {
			var user_id=req.body.user_id;
			delete(req.body.user_id);
			if(req.body.admin_block_flag==0){
					db.query(`update tbl_user_profile SET ? WHERE user_id=?`,[{admin_block_flag:req.body.admin_block_flag},user_id], function(error, results1, fields) {
						if (error) throw error;
						return res.status(200).send({
							status: 200,
							msg: "Success"
						});
					});
				}else{
					var from=new Date().toISOString();
					let dt = new Date();
					var blocked_for='0';
					if(req.body.alltime=='72h'){
						blocked_for='1';
						dt.setHours(dt.getHours() + 72);
					}else if(req.body.alltime=='1w'){
						blocked_for='2';
						dt.setDate(dt.getDay() + 7);
					}else if(req.body.alltime=='15d'){
						blocked_for='3';
						dt.setDate(dt.getDay() + 15);
					}else if(req.body.alltime=='1m'){
						blocked_for='4';
						dt.setDate(dt.getDay() + 30);
					}else if(req.body.alltime=='all'){
						blocked_for='5';
						dt.setFullYear(dt.getFullYear() + 300);
					}
					
         
      //   ut.innerText = "Updated Time : " + dt.toLocaleTimeString(); 
					var to=dt.toISOString();
					
					db.query(`INSERT INTO tbl_admin_user_block_details SET ?`,[{admin_block_id:req.body.admin_id,
						block_msg:req.body.reason,
						block_type:req.body.admin_id,
						blocked_for:blocked_for,
						block_from_date:from,
						block_to_date:to,
						user_id:user_id

					}], function(error, results11, fields) {
						if (error) throw error;
					db.query(`update tbl_user_profile SET ? WHERE user_id=?`,[{admin_block_flag:req.body.admin_block_flag},user_id], function(error, results1, fields) {
						if (error) throw error;
						return res.status(200).send({
							status: 200,
							msg: "Success"
						});
					});
				});
				}
		}
	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};
exports.update_user_status_active = async (req, res) => {
	try {
		process.env.TZ = "Asia/Kolkata";
		if (!req.body.user_id) {
			return res.status(202).send({
				status: 202,
				msg: "fail"
			});
		} else {
			var user_id=req.body.user_id;
			delete(req.body.user_id);
					db.query(`update tbl_user_profile SET ? WHERE user_id=?`,[{user_status:req.body.user_status},user_id], function(error, results1, fields) {
						if (error) throw error;
						return res.status(200).send({
							status: 200,
							msg: "Success"
						});
					});
		}
	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};
exports.update_feed_status = async (req, res) => {
	try {
		if (!req.body.feed_id) {
			return res.status(202).send({
				status: 202,
				msg: "fail"
			});
		} else {
			var feed_id=req.body.feed_id;
			delete(req.body.feed_id);
					db.query(`update tbl_feed set ? WHERE feed_id= ?`,[req.body,feed_id], function(error, results1, fields) {
						if (error) throw error;
						return res.status(200).send({
							status: 200,
							msg: "Success"
						});
					});
		}
	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};


exports.get_group_normal_posts = async (req, res) => {
	try {
		if (req.query.page_no) {
			var pagination = [];
			var alldata = [];
			var mita='';
			let no_of_records_per_page = 9;
				var rowno = req.query.page_no;
				if (rowno != 0) {
					rowno = (rowno - 1) * no_of_records_per_page;
				}
			if(req.query.keyword && req.query.keyword!=''){
			   mita=" and (user_name LIKE '%"+req.query.keyword+"%' or feed_text LIKE '%"+req.query.keyword+"%')";
			 }
			 var country_code='';
			 if(req.query.code){
			   if(req.query.code!='null' && req.query.code!=''){
				country_code=" and tbl_user_profile.country_code='"+req.query.code+"'";
			   }
			}
			var sql = db.query(`SELECT tbl_feed.*,DATE_FORMAT(tbl_feed.created_date, "%M %d %Y") as custom_date,DATE_FORMAT(tbl_feed.created_date, "%r") as custom_time,tbl_user_profile.user_name,tbl_user_profile.user_profile_img From tbl_feed inner join tbl_user_profile on feed_user_id=user_id where feed_type_number=? and feed_media='' and feed_is_deleted=0  and contains_bad_word!='1'  `+mita+` `+country_code+` order by feed_id desc LIMIT ? OFFSET ?;
			SELECT count(*) as numrows From tbl_feed inner join tbl_user_profile on feed_user_id=user_id where feed_type_number=? and feed_media='' and feed_is_deleted=0 and contains_bad_word!='1' `+mita+` `+country_code+``, ['2',no_of_records_per_page, rowno,'2'], function(error, results, fields) {
				if (error) {
					return res.status(202).send({
						status: 202,
						msg: "fail"
					});
				} else {
					var flagg = 1;
					var feed=[];
					if (results[0].length > 0) {
						Object.keys(results[0]).forEach(function(key, idx, array) {
							var result_data = results[0][key];
							var element = result_data.feed_id;
							db.query(`SELECT tbl_user_profile.*,tbl_feed_comment.* FROM tbl_feed_comment inner join tbl_user_profile on comment_user_id=user_id where comment_feed_id=? and comment_operation=?;
                        SELECT tbl_user_profile.* FROM tbl_like_details inner join tbl_user_profile on like_details_liked_user_id=user_id where like_details_feed_id=? ORDER BY created_date DESC;
						SELECT tbl_user_profile.* FROM tbl_feed_share inner join tbl_user_profile on feed_share_user_id=user_id where feed_id=? ORDER BY feed_share_id DESC;
                          `, [element, '0', element, result_data.feed_id, result_data.shared_feed_id, result_data.shared_feed_id], function(error, results_comment, fields) {
								if (error) throw error;
								var user = '';
								var sh_user = '';
								if (flagg == 1) {
									if(result_data.created_date!='' && result_data.created_date!='0000-00-00 00:00:00')
									result_data.feed_duration = timeAgo(new Date(result_data.created_date).toISOString());
									else
									result_data.feed_duration='just now';

									result_data.comment_details_one=results_comment[0];
									result_data.comment_count = results_comment[0].length;
								
									result_data.like_details_one=results_comment[1];
									result_data.feed_like_count=results_comment[1].length;

									result_data.share_details_one=results_comment[2];
									result_data.feed_sharing_count = results_comment[2].length;
									
									
									
									// if (results_comment[1].length > 0) {
									// 	user = results_comment[1][0].like_details_liked_user_id;
									// 	result_data.first_feed_fellings = results_comment[1][0].feed_fellings;
									// } else {
									// 	result_data.first_feed_fellings = '';
									// }
									// if (results_comment[1].length > 1) {
									// 	result_data.second_feed_fellings = results_comment[1][1].feed_fellings;
									// } else {
									// 	result_data.second_feed_fellings = '';
									// }
								}
								//////console.log(user);
								db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [result_data.feed_user_id], function(error, results_rat, fields) {
									if (error) throw error;
									if (flagg == 1) {
										if (results_rat.length > 0) {
											result_data.feed_user_name = results_rat[0].user_name;
											result_data.feed_user_image = results_rat[0].user_profile_img;
										}else{
											result_data.feed_user_name = '';
											result_data.feed_user_image = '';
										}
										// if (results_rat[0].length > 0) {
										// 	result_data.last_reacted_user = results_rat[0][0].user_name;
										// } else {
										// 	result_data.last_reacted_user = '';
										// }
										// result_data.follow = results_rat[1][0].total > 0 ? 'friend' : 'friend';
										// result_data.feed_fellings = results_rat[3].length > 0 ? results_rat[3][0].feed_fellings : '8';
										// result_data.follower_count = results_rat[2][0].total;

										 var flag_json=0;
										 if(result_data.feed_text!=''){

										 try {
											var o=JSON.parse(result_data.feed_text);
											if (o && typeof o === "object") {
												flag_json=1;
											}
										} catch (e) {
											flag_json=0;
										}
									}
									if(flag_json==1){
										var mainda=JSON.parse(result_data.feed_text);
										if(mainda[0]){
											result_data.feed_text=mainda[0].text;
										}
									}
										feed.push(result_data);
									}
									if (idx == array.length - 1) {
										
										if (feed.length > 0) {
										//	feed = feed.sort((a, b) => (a.feed_id < b.feed_id) ? 1 : -1);
										
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;
                                      
											// PAGINATION START
									
											let next=0;
											let previous=0;
											if(page_no<max_pages && max_pages>1){
												next=parseInt(page_no)+1;
											}

											if(page_no>1 && max_pages>1){
												previous=parseInt(page_no)-1;
											}

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: max_pages,
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no,
												first:1,
												current:page_no,
												previous:previous,
												next:next,
												last:max_pages,
											};
											// PAGINATION END

											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: results[1][0].numrows,
												paginationDataList: feed,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												paginationDataListCount: 0,
												paginationDataList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}

											});
										}
									} else {
										return res.status(404).send({
											status: 404,
											msg: "No matching records found.",
											myShopAllListCount: 0,
											myShopAllList: [],
											pagination: {
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

						});
					} else {
						return res.status(202).send({
							status: 202,
							msg: "fail",
							paginationDataListCount: 0,
							paginationDataList: [],
							pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail1",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};
exports.get_group_media_posts = async (req, res) => {
	try {
		if (req.query.page_no) {
			var pagination = [];
			var alldata = [];
			var mita='';
			let no_of_records_per_page = 9;
				var rowno = req.query.page_no;
				if (rowno != 0) {
					rowno = (rowno - 1) * no_of_records_per_page;
				}
			if(req.query.keyword && req.query.keyword!=''){
			   mita=" and (user_name LIKE '%"+req.query.keyword+"%' or feed_text LIKE '%"+req.query.keyword+"%')";
			 }
			 var country_code='';
			 if(req.query.code){
			   if(req.query.code!='null' && req.query.code!=''){
				country_code=" and tbl_user_profile.country_code='"+req.query.code+"'";
			   }
			}
			var sql = db.query(`SELECT tbl_feed.*,DATE_FORMAT(tbl_feed.created_date, "%M %d %Y") as custom_date,DATE_FORMAT(tbl_feed.created_date, "%r") as custom_time,tbl_user_profile.user_name,tbl_user_profile.user_profile_img From tbl_feed inner join tbl_user_profile on feed_user_id=user_id where feed_type_number=? and feed_media!='' and feed_media_type='image' and feed_is_deleted=0 and contains_bad_word!='1'  `+mita+` `+country_code+` order by feed_id desc LIMIT ? OFFSET ?;
			SELECT count(*) as numrows From tbl_feed inner join tbl_user_profile on feed_user_id=user_id where feed_type_number=? and feed_media!='' and feed_media_type='image' and feed_is_deleted=0 and contains_bad_word!='1'  `+mita+` `+country_code+``, ['2',no_of_records_per_page, rowno,'2'], function(error, results, fields) {
				if (error) {
					return res.status(202).send({
						status: 202,
						msg: "fail"
					});
				} else {
					var flagg = 1;
					var feed=[];
					if (results[0].length > 0) {
						Object.keys(results[0]).forEach(function(key, idx, array) {
							var result_data = results[0][key];
							var element = result_data.feed_id;
							db.query(`SELECT tbl_user_profile.*,tbl_feed_comment.* FROM tbl_feed_comment inner join tbl_user_profile on comment_user_id=user_id where comment_feed_id=? and comment_operation=?;
                        SELECT tbl_user_profile.* FROM tbl_like_details inner join tbl_user_profile on like_details_liked_user_id=user_id where like_details_feed_id=? ORDER BY created_date DESC;
						SELECT tbl_user_profile.* FROM tbl_feed_share inner join tbl_user_profile on feed_share_user_id=user_id where feed_id=? ORDER BY feed_share_id DESC;
                          `, [element, '0', element, result_data.feed_id, result_data.shared_feed_id, result_data.shared_feed_id], function(error, results_comment, fields) {
								if (error) throw error;
								var user = '';
								var sh_user = '';
								if (flagg == 1) {
									if(result_data.created_date!='' && result_data.created_date!='0000-00-00 00:00:00')
									result_data.feed_duration = timeAgo(new Date(result_data.created_date).toISOString());
									else
									result_data.feed_duration='just now';

									result_data.comment_details_one=results_comment[0];
									result_data.comment_count = results_comment[0].length;
								
									result_data.like_details_one=results_comment[1];
									result_data.feed_like_count=results_comment[1].length;

									result_data.share_details_one=results_comment[2];
									result_data.feed_sharing_count = results_comment[2].length;
									
									
									
									// if (results_comment[1].length > 0) {
									// 	user = results_comment[1][0].like_details_liked_user_id;
									// 	result_data.first_feed_fellings = results_comment[1][0].feed_fellings;
									// } else {
									// 	result_data.first_feed_fellings = '';
									// }
									// if (results_comment[1].length > 1) {
									// 	result_data.second_feed_fellings = results_comment[1][1].feed_fellings;
									// } else {
									// 	result_data.second_feed_fellings = '';
									// }
								}
								//////console.log(user);
								db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [result_data.feed_user_id], function(error, results_rat, fields) {
									if (error) throw error;
									if (flagg == 1) {
										if (results_rat.length > 0) {
											result_data.feed_user_name = results_rat[0].user_name;
											result_data.feed_user_image = results_rat[0].user_profile_img;
										}else{
											result_data.feed_user_name = '';
											result_data.feed_user_image = '';
										}
										// if (results_rat[0].length > 0) {
										// 	result_data.last_reacted_user = results_rat[0][0].user_name;
										// } else {
										// 	result_data.last_reacted_user = '';
										// }
										// result_data.follow = results_rat[1][0].total > 0 ? 'friend' : 'friend';
										// result_data.feed_fellings = results_rat[3].length > 0 ? results_rat[3][0].feed_fellings : '8';
										// result_data.follower_count = results_rat[2][0].total;

										 var flag_json=0;
										 if(result_data.feed_text!=''){

										 try {
											var o=JSON.parse(result_data.feed_text);
											if (o && typeof o === "object") {
												flag_json=1;
											}
										} catch (e) {
											flag_json=0;
										}
									}
									if(flag_json==1){
										var mainda=JSON.parse(result_data.feed_text);
										if(mainda[0]){
											result_data.feed_text=mainda[0].text;
										}
									}
										feed.push(result_data);
									}
									if (idx == array.length - 1) {
										
										if (feed.length > 0) {
										//	feed = feed.sort((a, b) => (a.feed_id < b.feed_id) ? 1 : -1);
										
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;
                                      
											// PAGINATION START
									
											let next=0;
											let previous=0;
											if(page_no<max_pages && max_pages>1){
												next=parseInt(page_no)+1;
											}

											if(page_no>1 && max_pages>1){
												previous=parseInt(page_no)-1;
											}

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: max_pages,
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no,
												first:1,
												current:page_no,
												previous:previous,
												next:next,
												last:max_pages,
											};
											// PAGINATION END

											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: results[1][0].numrows,
												paginationDataList: feed,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												paginationDataListCount: 0,
												paginationDataList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}

											});
										}
									} else {
										return res.status(404).send({
											status: 404,
											msg: "No matching records found.",
											myShopAllListCount: 0,
											myShopAllList: [],
											pagination: {
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

						});
					} else {
						return res.status(202).send({
							status: 202,
							msg: "fail",
							paginationDataListCount: 0,
							paginationDataList: [],
							pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail1",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};
exports.get_group_video_posts = async (req, res) => {
	try {
		if (req.query.page_no) {
			var pagination = [];
			var alldata = [];
			var mita='';
			let no_of_records_per_page = 9;
				var rowno = req.query.page_no;
				if (rowno != 0) {
					rowno = (rowno - 1) * no_of_records_per_page;
				}
			if(req.query.keyword && req.query.keyword!=''){
			   mita=" and (user_name LIKE '%"+req.query.keyword+"%' or feed_text LIKE '%"+req.query.keyword+"%')";
			 }

			 var country_code='';
			 if(req.query.code){
			   if(req.query.code!='null' && req.query.code!=''){
				country_code=" and tbl_user_profile.country_code='"+req.query.code+"'";
			   }
			}
			var sql = db.query(`SELECT tbl_feed.*,DATE_FORMAT(tbl_feed.created_date, "%M %d %Y") as custom_date,DATE_FORMAT(tbl_feed.created_date, "%r") as custom_time,tbl_user_profile.user_name,tbl_user_profile.user_profile_img From tbl_feed inner join tbl_user_profile on feed_user_id=user_id where feed_type_number=? and feed_media!='' and feed_media_type='video' and feed_is_deleted=0 and contains_bad_word!='1'  `+mita+` `+country_code+` order by feed_id desc LIMIT ? OFFSET ?;
			SELECT count(*) as numrows From tbl_feed inner join tbl_user_profile on feed_user_id=user_id where feed_type_number=? and feed_media!='' and feed_media_type='video' and feed_is_deleted=0 and contains_bad_word!='1' `+mita+` `+country_code+``, ['2',no_of_records_per_page, rowno,'2'], function(error, results, fields) {
				if (error) {
					return res.status(202).send({
						status: 202,
						msg: "fail"
					});
				} else {
					var flagg = 1;
					var feed=[];
					if (results[0].length > 0) {
						Object.keys(results[0]).forEach(function(key, idx, array) {
							var result_data = results[0][key];
							var element = result_data.feed_id;
							db.query(`SELECT tbl_user_profile.*,tbl_feed_comment.* FROM tbl_feed_comment inner join tbl_user_profile on comment_user_id=user_id where comment_feed_id=? and comment_operation=?;
                        SELECT tbl_user_profile.* FROM tbl_like_details inner join tbl_user_profile on like_details_liked_user_id=user_id where like_details_feed_id=? ORDER BY created_date DESC;
						SELECT tbl_user_profile.* FROM tbl_feed_share inner join tbl_user_profile on feed_share_user_id=user_id where feed_id=? ORDER BY feed_share_id DESC;
                          `, [element, '0', element, result_data.feed_id, result_data.shared_feed_id, result_data.shared_feed_id], function(error, results_comment, fields) {
								if (error) throw error;
								var user = '';
								var sh_user = '';
								if (flagg == 1) {
									if(result_data.created_date!='' && result_data.created_date!='0000-00-00 00:00:00')
									result_data.feed_duration = timeAgo(new Date(result_data.created_date).toISOString());
									else
									result_data.feed_duration='just now';

									result_data.comment_details_one=results_comment[0];
									result_data.comment_count = results_comment[0].length;
								
									result_data.like_details_one=results_comment[1];
									result_data.feed_like_count=results_comment[1].length;

									result_data.share_details_one=results_comment[2];
									result_data.feed_sharing_count = results_comment[2].length;
									
									
									
									// if (results_comment[1].length > 0) {
									// 	user = results_comment[1][0].like_details_liked_user_id;
									// 	result_data.first_feed_fellings = results_comment[1][0].feed_fellings;
									// } else {
									// 	result_data.first_feed_fellings = '';
									// }
									// if (results_comment[1].length > 1) {
									// 	result_data.second_feed_fellings = results_comment[1][1].feed_fellings;
									// } else {
									// 	result_data.second_feed_fellings = '';
									// }
								}
								//////console.log(user);
								db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [result_data.feed_user_id], function(error, results_rat, fields) {
									if (error) throw error;
									if (flagg == 1) {
										if (results_rat.length > 0) {
											result_data.feed_user_name = results_rat[0].user_name;
											result_data.feed_user_image = results_rat[0].user_profile_img;
										}else{
											result_data.feed_user_name = '';
											result_data.feed_user_image = '';
										}
										// if (results_rat[0].length > 0) {
										// 	result_data.last_reacted_user = results_rat[0][0].user_name;
										// } else {
										// 	result_data.last_reacted_user = '';
										// }
										// result_data.follow = results_rat[1][0].total > 0 ? 'friend' : 'friend';
										// result_data.feed_fellings = results_rat[3].length > 0 ? results_rat[3][0].feed_fellings : '8';
										// result_data.follower_count = results_rat[2][0].total;

										 var flag_json=0;
										 if(result_data.feed_text!=''){

										 try {
											var o=JSON.parse(result_data.feed_text);
											if (o && typeof o === "object") {
												flag_json=1;
											}
										} catch (e) {
											flag_json=0;
										}
									}
									if(flag_json==1){
										var mainda=JSON.parse(result_data.feed_text);
										if(mainda[0]){
											result_data.feed_text=mainda[0].text;
										}
									}
										feed.push(result_data);
									}
									if (idx == array.length - 1) {
										
										if (feed.length > 0) {
										//	feed = feed.sort((a, b) => (a.feed_id < b.feed_id) ? 1 : -1);
										
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;
                                      
											// PAGINATION START
									
											let next=0;
											let previous=0;
											if(page_no<max_pages && max_pages>1){
												next=parseInt(page_no)+1;
											}

											if(page_no>1 && max_pages>1){
												previous=parseInt(page_no)-1;
											}

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: max_pages,
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no,
												first:1,
												current:page_no,
												previous:previous,
												next:next,
												last:max_pages,
											};
											// PAGINATION END

											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: results[1][0].numrows,
												paginationDataList: feed,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												paginationDataListCount: 0,
												paginationDataList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}

											});
										}
									} else {
										return res.status(404).send({
											status: 404,
											msg: "No matching records found.",
											myShopAllListCount: 0,
											myShopAllList: [],
											pagination: {
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

						});
					} else {
						return res.status(202).send({
							status: 202,
							msg: "fail",
							paginationDataListCount: 0,
							paginationDataList: [],
							pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail1",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};

exports.get_deleted_posts = async (req, res) => {
	try {
		if (req.query.page_no) {
			var pagination = [];
			var alldata = [];
			var mita='';
			let no_of_records_per_page = 9;
				var rowno = req.query.page_no;
				if (rowno != 0) {
					rowno = (rowno - 1) * no_of_records_per_page;
				}
			if(req.query.keyword && req.query.keyword!=''){
			   mita=" and (user_name LIKE '%"+req.query.keyword+"%' or feed_text LIKE '%"+req.query.keyword+"%')";
			 }
			 var country_code='';
			 if(req.query.code){
			   if(req.query.code!='null' && req.query.code!=''){
				country_code=" and tbl_user_profile.country_code='"+req.query.code+"'";
			   }
			}
			var sql = db.query(`SELECT tbl_feed.*,DATE_FORMAT(tbl_feed.created_date, "%M %d %Y") as custom_date,DATE_FORMAT(tbl_feed.created_date, "%r") as custom_time,tbl_user_profile.user_name,tbl_user_profile.user_profile_img From tbl_feed inner join tbl_user_profile on feed_user_id=user_id where feed_is_deleted=1  `+mita+` `+country_code+` order by feed_id desc LIMIT ? OFFSET ?;
			SELECT count(*) as numrows From tbl_feed inner join tbl_user_profile on feed_user_id=user_id where feed_is_deleted=1  `+mita+` `+country_code+``, [no_of_records_per_page, rowno], function(error, results, fields) {
				if (error) {
					return res.status(202).send({
						status: 202,
						msg: "fail"
					});
				} else {
					var flagg = 1;
					var feed=[];
					if (results[0].length > 0) {
						Object.keys(results[0]).forEach(function(key, idx, array) {
							var result_data = results[0][key];
							var element = result_data.feed_id;
							db.query(`SELECT tbl_user_profile.*,tbl_feed_comment.* FROM tbl_feed_comment inner join tbl_user_profile on comment_user_id=user_id where comment_feed_id=? and comment_operation=?;
                        SELECT tbl_user_profile.* FROM tbl_like_details inner join tbl_user_profile on like_details_liked_user_id=user_id where like_details_feed_id=? ORDER BY created_date DESC;
						SELECT tbl_user_profile.* FROM tbl_feed_share inner join tbl_user_profile on feed_share_user_id=user_id where feed_id=? ORDER BY feed_share_id DESC;
                          `, [element, '0', element, result_data.feed_id, result_data.shared_feed_id, result_data.shared_feed_id], function(error, results_comment, fields) {
								if (error) throw error;
								var user = '';
								var sh_user = '';
								if (flagg == 1) {
									if(result_data.created_date!='' && result_data.created_date!='0000-00-00 00:00:00')
									result_data.feed_duration = timeAgo(new Date(result_data.created_date).toISOString());
									else
									result_data.feed_duration='just now';

									result_data.comment_details_one=results_comment[0];
									result_data.comment_count = results_comment[0].length;
								
									result_data.like_details_one=results_comment[1];
									result_data.feed_like_count=results_comment[1].length;

									result_data.share_details_one=results_comment[2];
									result_data.feed_sharing_count = results_comment[2].length;
									
									
									
									// if (results_comment[1].length > 0) {
									// 	user = results_comment[1][0].like_details_liked_user_id;
									// 	result_data.first_feed_fellings = results_comment[1][0].feed_fellings;
									// } else {
									// 	result_data.first_feed_fellings = '';
									// }
									// if (results_comment[1].length > 1) {
									// 	result_data.second_feed_fellings = results_comment[1][1].feed_fellings;
									// } else {
									// 	result_data.second_feed_fellings = '';
									// }
								}
								//////console.log(user);
								db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [result_data.feed_user_id], function(error, results_rat, fields) {
									if (error) throw error;
									if (flagg == 1) {
										if (results_rat.length > 0) {
											result_data.feed_user_name = results_rat[0].user_name;
											result_data.feed_user_image = results_rat[0].user_profile_img;
										}else{
											result_data.feed_user_name = '';
											result_data.feed_user_image = '';
										}
										// if (results_rat[0].length > 0) {
										// 	result_data.last_reacted_user = results_rat[0][0].user_name;
										// } else {
										// 	result_data.last_reacted_user = '';
										// }
										// result_data.follow = results_rat[1][0].total > 0 ? 'friend' : 'friend';
										// result_data.feed_fellings = results_rat[3].length > 0 ? results_rat[3][0].feed_fellings : '8';
										// result_data.follower_count = results_rat[2][0].total;

										 var flag_json=0;
										 if(result_data.feed_text!=''){

										 try {
											var o=JSON.parse(result_data.feed_text);
											if (o && typeof o === "object") {
												flag_json=1;
											}
										} catch (e) {
											flag_json=0;
										}
									}
									if(flag_json==1){
										var mainda=JSON.parse(result_data.feed_text);
										if(mainda[0]){
											result_data.feed_text=mainda[0].text;
										}
									}
										feed.push(result_data);
									}
									if (idx == array.length - 1) {
										
										if (feed.length > 0) {
										//	feed = feed.sort((a, b) => (a.feed_id < b.feed_id) ? 1 : -1);
										
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;
                                      
											// PAGINATION START
									
											let next=0;
											let previous=0;
											if(page_no<max_pages && max_pages>1){
												next=parseInt(page_no)+1;
											}

											if(page_no>1 && max_pages>1){
												previous=parseInt(page_no)-1;
											}

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: max_pages,
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no,
												first:1,
												current:page_no,
												previous:previous,
												next:next,
												last:max_pages,
											};
											// PAGINATION END

											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: results[1][0].numrows,
												paginationDataList: feed,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												paginationDataListCount: 0,
												paginationDataList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}

											});
										}
									} else {
										return res.status(404).send({
											status: 404,
											msg: "No matching records found.",
											myShopAllListCount: 0,
											myShopAllList: [],
											pagination: {
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

						});
					} else {
						return res.status(202).send({
							status: 202,
							msg: "fail",
							paginationDataListCount: 0,
							paginationDataList: [],
							pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail1",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};

exports.get_service_list = async (req, res) => {
	try {
		if (req.query.page_no) {
			var pagination = [];
			var alldata = [];
			var mita='';
			let no_of_records_per_page = 10;
				var rowno = req.query.page_no;
				if (rowno != 0) {
					rowno = (rowno - 1) * no_of_records_per_page;
				}
			if(req.query.keyword && req.query.keyword!=''){
			   mita=" and (user_name LIKE '%"+req.query.keyword+"%' or feed_text LIKE '%"+req.query.keyword+"%')";
			 }
			var sql = db.query(`(select cook_id as id, cook_name as businessName,cook_user_id as user_id, cook_image as image,cook_status as status, 'Cook Service' as service from tbl_bazar_cook union ALL 
			select  contructor_id as id, contructor_name as businessName, contructor_user_id as user_id, contructor_image as image, contructor_status as status, 'Cook Service' as service from tbl_bazar_contructor union ALL 
			select doctors_id as id, doctors_name as businessName,doctors_user_id as user_id, doctors_images as image,doctors_status as status, 'Doctors Service' as service from tbl_bazar_doctor
			union ALL  
				select health_care_id as id, health_care_name as businessName,health_care_user_id as user_id, health_care_images as image,health_care_status as status, 'Health Care Service' as service from tbl_bazar_health_care
				union ALL
				select  hotel_stay_id as id, hotel_stay_name as businessName,hotel_stay_user_id as user_id, hotel_stay_images as image,hotel_stay_status as status, 'Hotel Stay Service' as service from tbl_bazar_hotel_stay
				union ALL
				select labour_id as id, labour_name as businessName,labour_user_id as user_id, labour_image as image,labour_status as status, 'Labour Service' as service from tbl_bazar_labour
				union ALL 
				select  medicals_id as id, medicals_name as businessName,medicals_user_id as user_id, medicals_images as image,medicals_status as status, 'Medicals Service' as service from tbl_bazar_medicals
				union ALL 
				select  play_school_id as id, play_school_name as businessName,play_school_user_id as user_id, play_school_images as image,play_school_status as status, 'Play School Service' as service from tbl_bazar_play_school
				union ALL 
				select  rent_id as id, rent_title as businessName,rent_user_id as user_id, rent_properties_images as image,rent_status as status, 'Rent Service' as service from tbl_bazar_rent
				union ALL 
				select  restaurants_id as id, restaurants_name as businessName,restaurants_user_id as user_id, restaurants_images as image,restaurants_status as status, 'Restaurants Service' as service from tbl_bazar_restaurants
				union ALL 
				select  school_college_id as id, school_college_name as businessName,school_college_user_id as user_id, school_college_images as image,school_college_status as status, 'School College Service' as service from tbl_bazar_school_college
				union ALL 
				select  self_employee_id as id, self_employee_name as businessName,self_employee_user_id as user_id, self_employee_image as image,self_employee_status as status, 'Self Employee Service' as service from tbl_bazar_self_employee
				union ALL 
				select  tour_travel_id as id, tour_travel_name as businessName,tour_travel_user_id as user_id, tour_travel_images as image,tour_travel_status as status, 'Tour Travel Service' as service from tbl_bazar_tour_travel
				union ALL 
				select  vehicle_rental_id as id, vehicle_company_name as businessName,vehicle_rental_user_id as user_id, vehicle_rental_images as image,vehicle_status as status, 'Vehicle Service' as service from tbl_bazar_vehicle_rental
				) 
				LIMIT ? offset ? ;
			select (select COUNT(distinct cook_id) from tbl_bazar_cook) + 
			(select COUNT(distinct contructor_id) from tbl_bazar_contructor) + 
			(select COUNT(distinct doctors_id) from tbl_bazar_doctor) 
			+ 
			(select COUNT(distinct health_care_id) from tbl_bazar_health_care) 
			+ 
			(select COUNT(distinct hotel_stay_id) from 	tbl_bazar_hotel_stay) 
			+ 
			(select COUNT(distinct labour_id) from tbl_bazar_labour) 
			+ 
			(select COUNT(distinct medicals_id) from tbl_bazar_medicals) 
			+ 
			(select COUNT(distinct play_school_id) from tbl_bazar_play_school) 
			+ 
			(select COUNT(distinct rent_id) from tbl_bazar_rent) 
			+ 
			(select COUNT(distinct restaurants_id) from tbl_bazar_restaurants) 
			+ 
			(select COUNT(distinct school_college_id) from tbl_bazar_school_college) 
			+ 
			(select COUNT(distinct self_employee_id) from tbl_bazar_self_employee) 
			+ 
			(select COUNT(distinct tour_travel_id) from 	tbl_bazar_tour_travel) 
			+ 
			(select COUNT(distinct vehicle_rental_id) from 	tbl_bazar_vehicle_rental) 
			
			AS numrows;`, [no_of_records_per_page, rowno], function(error, results, fields) {
				if (error) {
					return res.status(202).send({
						status: 202,
						msg: error
					});
				} else {
					var flagg = 1;
					var feed=[];
					if (results[0].length > 0) {
						console.log(results);
						console.log(results);
						var count = results[1][0];
						console.log(count);
						Object.keys(results[0]).forEach(function(key, idx, array) {
							var result_data = results[0][key];
							var element = result_data.feed_id;
						// 	db.query(`SELECT tbl_user_profile.*,tbl_feed_comment.* FROM tbl_feed_comment inner join tbl_user_profile on comment_user_id=user_id where comment_feed_id=? and comment_operation=?;
                        // SELECT tbl_user_profile.* FROM tbl_like_details inner join tbl_user_profile on like_details_liked_user_id=user_id where like_details_feed_id=? ORDER BY created_date DESC;
						// SELECT tbl_user_profile.* FROM tbl_feed_share inner join tbl_user_profile on feed_share_user_id=user_id where feed_id=? ORDER BY feed_share_id DESC;
                        //   `, [element, '0', element, result_data.feed_id, result_data.shared_feed_id, result_data.shared_feed_id], function(error, results_comment, fields) {
						// 		if (error) throw error;
							
						// 		db.query(`SELECT * FROM tbl_user_profile where user_id=?;`, [result_data.feed_user_id], function(error, results_rat, fields) {
						// 			if (error) throw error;
									
									feed.push(result_data);
									if (idx == array.length - 1) {
										
										if (feed.length > 0) {
										//	feed = feed.sort((a, b) => (a.feed_id < b.feed_id) ? 1 : -1);
										
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;
                                      
											// PAGINATION START
									
											let next=0;
											let previous=0;
											if(page_no<max_pages && max_pages>1){
												next=parseInt(page_no)+1;
											}

											if(page_no>1 && max_pages>1){
												previous=parseInt(page_no)-1;
											}

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: max_pages,
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no,
												first:1,
												current:page_no,
												previous:previous,
												next:next,
												last:max_pages,
											};
											// PAGINATION END

											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: results[1][0].numrows,
												paginDupli:results[0].length,
												paginationDataList: feed,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												paginationDataListCount: 0,
												paginationDataList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}

											});
										}
									} else {
										return res.status(404).send({
											status: 404,
											msg: "No matching records found.",
											myShopAllListCount: 0,
											myShopAllList: [],
											pagination: {
												total_rows: 0,
												total_pages: 0,
												per_page: 0,
												offset: 0,
												current_page_no: '0'
											}

										});
									}
									}
							// 	});
							// });

						});
					} else {
						return res.status(202).send({
							status: 202,
							msg: "fail",
							paginationDataListCount: 0,
							paginationDataList: [],
							pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail1",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};

exports.get_business_list = async (req, res) => {
	try {
		if (req.query.page_no) {
			var pagination = [];
			var alldata = [];
			var mita='';
			let no_of_records_per_page = 10;
				var rowno = req.query.page_no;
				if (rowno != 0) {
					rowno = (rowno - 1) * no_of_records_per_page;
				}
			if(req.query.keyword && req.query.keyword!=''){
			   mita=" where (user_name LIKE '%"+req.query.keyword+"%' or my_shop_name LIKE '%"+req.query.keyword+"%')";
			 }
			var sql = db.query(`select *, tbl_user_profile.user_name,tbl_user_profile.app_auth,tbl_user_profile.user_age,tbl_user_profile.user_id  from tbl_bazar_my_shop innner join tbl_user_profile on my_shop_user_id=user_id `+ mita+` LIMIT ? offset ?;
			select count(*) AS numrows from tbl_bazar_my_shop innner join tbl_user_profile on my_shop_user_id=user_id `+ mita+`;`, [no_of_records_per_page, rowno], function(error, results, fields) {
				if (error) {
					return res.status(202).send({
						status: 202,
						msg: error
					});
				} else {
					var flagg = 1;
					var feed=[];
					if (results[0].length > 0) {
						console.log(results);
						console.log(results);
						var count = results[1][0];
						console.log(count);
						Object.keys(results[0]).forEach(function(key, idx, array) {
							var result_data = results[0][key];
							var element = result_data.feed_id;
							db.query(`SELECT * FROM country where iso=?;
							select count(*) as numofrows from tbl_feed where feed_user_id=?;
							select feed_media,feed_view_count,feed_sharing_count,feed_like_count from tbl_feed where feed_user_id=? and feed_media_type=? and feed_media!='';
							select count(*) as numofrows from tbl_zktor_reel  where zktor_reel_user_id=?;
							select tbl_feed.*,DATE_FORMAT(tbl_feed.created_date, "%M %d %Y") as custom_date,DATE_FORMAT(tbl_feed.created_date, "%r") as custom_time from tbl_feed where feed_user_id=? order by feed_id desc;
							select * from tbl_zktor_reel  where zktor_reel_user_id=?;
							SELECT tbl_user_profile.* FROM tbl_friend_request inner join tbl_user_profile ON sender_user_id=tbl_user_profile.user_id WHERE receiver_user_id = ?  AND request_status = ?;
							SELECT tbl_user_profile.* FROM tbl_friend_request inner join tbl_user_profile ON receiver_user_id=tbl_user_profile.user_id WHERE sender_user_id = ?  AND request_status = ?`,
							 [result_data.country_code,
								result_data.user_id,
								result_data.user_id,'image',
								result_data.user_id,
								result_data.user_id,
								result_data.user_id,
								result_data.user_id,'1',
								result_data.user_id,'1'], function(error, results11, fields) {
							if (error) throw error;
							if(results11[0].length>0){
								result_data.country=results11[0][0].nicename;
							}else{
								result_data.country='-';
							}
							if(results11[4].length>0){
								result_data.posts=results11[4];
							}else{
								result_data.posts=[];
							}
							if(results11[5].length>0){
								result_data.reel=results11[5];
							}else{
								result_data.reel=[];
							}
							result_data.friend=merge(results11[6],results11[7]);
							result_data.friend_count=result_data.friend.length;
							result_data.post_count=results11[1][0].numofrows;
							result_data.image_count=results11[2].length;
							result_data.image_gallary=results11[2];
							result_data.reel_count=results11[3][0].numofrows;
						

									feed.push(result_data);
									if (idx == array.length - 1) {
										
										if (feed.length > 0) {
										//	feed = feed.sort((a, b) => (a.feed_id < b.feed_id) ? 1 : -1);
										
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;
                                      
											// PAGINATION START
									
											let next=0;
											let previous=0;
											if(page_no<max_pages && max_pages>1){
												next=parseInt(page_no)+1;
											}

											if(page_no>1 && max_pages>1){
												previous=parseInt(page_no)-1;
											}

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: max_pages,
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no,
												first:1,
												current:page_no,
												previous:previous,
												next:next,
												last:max_pages,
											};
											// PAGINATION END

											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: results[1][0].numrows,
												paginDupli:results[0].length,
												paginationDataList: feed,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												paginationDataListCount: 0,
												paginationDataList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}

											});
										}
									} else {
										return res.status(404).send({
											status: 404,
											msg: "No matching records found.",
											myShopAllListCount: 0,
											myShopAllList: [],
											pagination: {
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
							// });

						});
					} else {
						return res.status(202).send({
							status: 202,
							msg: "fail",
							paginationDataListCount: 0,
							paginationDataList: [],
							pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail1",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};

exports.get_product_list = async (req, res) => {
	try {
		if (req.query.page_no) {
			var pagination = [];
			var alldata = [];
			var mita='';
			let no_of_records_per_page = 10;
				var rowno = req.query.page_no;
				if (rowno != 0) {
					rowno = (rowno - 1) * no_of_records_per_page;
				}
			if(req.query.keyword && req.query.keyword!=''){
			   mita=" where (common_product_title LIKE '%"+req.query.keyword+"%' or common_product_brand_name  LIKE '%"+req.query.keyword+"%' or common_product_specification  LIKE '%"+req.query.keyword+"%')";
			 }
			 db.query(`SELECT * FROM tbl_bazar_product_buy_sell `+mita+` order by common_product_id desc  LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows  FROM tbl_bazar_product_buy_sell `+mita+` `, [ no_of_records_per_page, rowno], function(error, results, fields) {
				if (error) throw error;
				var feed = [];
				if (results[0].length > 0) {
					Object.keys(results[0]).forEach(function(key, idx, array) {
						var result_data = results[0][key];
							db.query(`SELECT * FROM tbl_bazar_product_category where product_category_id=?;SELECT * FROM tbl_bazar_my_shop WHERE my_shop_id=?;SELECT * FROM tbl_user_profile WHERE user_id=?`, [result_data.common_product_category_id,result_data.shop_id,result_data.common_product_user_id], function(error, results_rating, fields) {
								if (error) throw error;
								if (results_rating[0].length > 0) {

									result_data.product_category_name=results_rating[0][0].product_category_name;

								}else{
									result_data.product_category_name="";
								}

								if (results_rating[1].length > 0) {
									result_data.my_shop_name=results_rating[1][0].my_shop_name;
								}else{
									if (results_rating[2].length > 0) {
										result_data.my_shop_name=results_rating[2][0].user_name;
									}else{
									result_data.my_shop_name="";
									}
								}

								if (results_rating[2].length > 0) {
									result_data.country_code=results_rating[2][0].country_code;
								}else{
								result_data.country_code="";
								}
							
						

									feed.push(result_data);
									if (idx == array.length - 1) {
										
										if (feed.length > 0) {
										//	feed = feed.sort((a, b) => (a.feed_id < b.feed_id) ? 1 : -1);
										
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;
                                      
											// PAGINATION START
									
											let next=0;
											let previous=0;
											if(page_no<max_pages && max_pages>1){
												next=parseInt(page_no)+1;
											}

											if(page_no>1 && max_pages>1){
												previous=parseInt(page_no)-1;
											}

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: max_pages,
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no,
												first:1,
												current:page_no,
												previous:previous,
												next:next,
												last:max_pages,
											};
											// PAGINATION END

											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: results[1][0].numrows,
												paginDupli:results[0].length,
												paginationDataList: feed,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												paginationDataListCount: 0,
												paginationDataList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}

											});
										}
									} else {
										return res.status(404).send({
											status: 404,
											msg: "No matching records found.",
											myShopAllListCount: 0,
											myShopAllList: [],
											pagination: {
												total_rows: 0,
												total_pages: 0,
												per_page: 0,
												offset: 0,
												current_page_no: '0'
											}

										});
									}
									}
								//});
							 });

						});
					} else {
						return res.status(202).send({
							status: 202,
							msg: "fail",
							paginationDataListCount: 0,
							paginationDataList: [],
							pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail1",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};

exports.get_product_list_by_shop_id = async (req, res) => {
	try {
		if (req.query.page_no && req.query.shop_id) {
			var pagination = [];
			var alldata = [];
			var mita='';
			let no_of_records_per_page = 10;
				var rowno = req.query.page_no;
				if (rowno != 0) {
					rowno = (rowno - 1) * no_of_records_per_page;
				}
			 db.query(`SELECT * FROM tbl_bazar_product_buy_sell where shop_id=? order by common_product_id desc  LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows  FROM tbl_bazar_product_buy_sell where shop_id=? `, [req.query.shop_id, no_of_records_per_page, rowno,req.query.shop_id], function(error, results, fields) {
				if (error) throw error;
				var feed = [];
				if (results[0].length > 0) {
					Object.keys(results[0]).forEach(function(key, idx, array) {
						var result_data = results[0][key];
							db.query(`SELECT * FROM tbl_bazar_product_category where product_category_id=?;SELECT * FROM tbl_bazar_my_shop WHERE my_shop_id=?;SELECT * FROM tbl_user_profile WHERE user_id=?`, [result_data.common_product_category_id,result_data.shop_id,result_data.common_product_user_id], function(error, results_rating, fields) {
								if (error) throw error;
								if (results_rating[0].length > 0) {

									result_data.product_category_name=results_rating[0][0].product_category_name;

								}else{
									result_data.product_category_name="";
								}

								if (results_rating[1].length > 0) {
									result_data.my_shop_name=results_rating[1][0].my_shop_name;
								}else{
									if (results_rating[2].length > 0) {
										result_data.my_shop_name=results_rating[2][0].user_name;
									}else{
									result_data.my_shop_name="";
									}
								}

								if (results_rating[2].length > 0) {
									result_data.country_code=results_rating[2][0].country_code;
								}else{
								result_data.country_code="";
								}
							
						

									feed.push(result_data);
									if (idx == array.length - 1) {
										
										if (feed.length > 0) {
										//	feed = feed.sort((a, b) => (a.feed_id < b.feed_id) ? 1 : -1);
										
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;
                                      
											// PAGINATION START
									
											let next=0;
											let previous=0;
											if(page_no<max_pages && max_pages>1){
												next=parseInt(page_no)+1;
											}

											if(page_no>1 && max_pages>1){
												previous=parseInt(page_no)-1;
											}

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: max_pages,
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no,
												first:1,
												current:page_no,
												previous:previous,
												next:next,
												last:max_pages,
											};
											// PAGINATION END

											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: results[1][0].numrows,
												paginDupli:results[0].length,
												paginationDataList: feed,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												paginationDataListCount: 0,
												paginationDataList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}

											});
										}
									} else {
										return res.status(404).send({
											status: 404,
											msg: "No matching records found.",
											myShopAllListCount: 0,
											myShopAllList: [],
											pagination: {
												total_rows: 0,
												total_pages: 0,
												per_page: 0,
												offset: 0,
												current_page_no: '0'
											}

										});
									}
									}
								//});
							 });

						});
					} else {
						return res.status(202).send({
							status: 202,
							msg: "fail",
							paginationDataListCount: 0,
							paginationDataList: [],
							pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail1",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};
exports.update_product_status = async (req, res) => {
	try {
		if (!req.body.common_product_id) {
			return res.status(202).send({
				status: 202,
				msg: "fail"
			});
		} else {
			var common_product_id=req.body.common_product_id;
			delete(req.body.common_product_id);
					db.query(`update tbl_bazar_product_buy_sell set ? WHERE common_product_id= ?`,[req.body,common_product_id], function(error, results1, fields) {
						if (error) throw error;
						return res.status(200).send({
							status: 200,
							msg: "Success"
						});
					});
		}
	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};

exports.update_group_status = async (req, res) => {
	try {
		if (!req.body.group_id) {
			return res.status(202).send({
				status: 202,
				msg: "fail"
			});
		} else {
			var group_id=req.body.group_id;
			delete(req.body.group_id);
					db.query(`update tbl_group set ? WHERE group_id= ?`,[req.body,group_id], function(error, results1, fields) {
						if (error) throw error;
						return res.status(200).send({
							status: 200,
							msg: "Success"
						});
					});
		}
	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};

exports.login = async (req, res) => {
	try {
		if (!req.body.username || !req.body.password) {
			return res.status(202).send({
				status: 202,
				msg: "fail"
			});
		} else {
		var sql= db.query(`select  id,username from tbl_admin_login WHERE username=? and password=SHA2(?,224)`,[req.body.username,req.body.password], function(error, results1, fields) {
							if(results1.length>0){
						return res.status(200).send({
							status: 200,
							msg: "Success",
							access_token: middleware_dashboard.generateAccessToken(results1[0]),
							data:results1[0]
						});
					}else{
						return res.status(202).send({
							status: 202,
							msg: "fail"
						});
					}
					});
		}
	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};
exports.loginwithphone = async (req, res) => {
	try {
		if (!req.body.phoneNumber || !req.body.countryCode) {
			return res.status(202).send({
				status: 202,
				msg: "fail"
			});
		} else {
		var sql= db.query(`select  id,username from tbl_admin_login WHERE phone=? and country_code=?`,[req.body.phoneNumber,req.body.countryCode], function(error, results1, fields) {
							if(results1.length>0){
						return res.status(200).send({
							status: 200,
							msg: "Success",
							access_token: middleware_dashboard.generateAccessToken(results1[0]),
							data:results1[0]
						});
					}else{
						return res.status(202).send({
							status: 202,
							msg: "fail"
						});
					}
					});
		}
	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};
exports.update_password = async (req, res) => {
	try {
		if (!req.body.username || !req.body.password || !req.body.new_password || !req.body.id) {
			return res.status(202).send({
				status: 202,
				msg: "fail"
			});
		} else {
		db.query(`select * from tbl_admin_login WHERE username=? and password=SHA2(?,224) and id=?`,[req.body.username,req.body.password,req.body.id], function(error, results1, fields) {
					if(results1.length>0){
							db.query(`update tbl_admin_login SET password=SHA2(?,224) where id=?`,[req.body.new_password,results1[0].id], function(error, results1, fields) {			
						return res.status(200).send({
							status: 200,
							msg: "Success"
						});
				});
					}else{
						return res.status(202).send({
							status: 202,
							msg: "Old"
						});
					}
					});
		}
	} catch (err) {
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};

exports.get_video_call_list = async (req, res) => {
	try {
		if (req.query.page_no) {
			var pagination = [];
			var alldata = [];
			var mita='';
			let no_of_records_per_page = 7;
				var rowno = req.query.page_no;
				if (rowno != 0) {
					rowno = (rowno - 1) * no_of_records_per_page;
				}
				if(req.query.main_user_id!='null' && req.query.caller_user_id!='null'){
					console.log('null');
					mita=" and user_id="+req.query.main_user_id+" and caller_id="+req.query.caller_user_id;
				  }else if(req.query.main_user_id!='null'){
					mita=" and user_id="+req.query.main_user_id;
				  }else if(req.query.caller_user_id!='null'){
					mita=" and caller_id="+req.query.caller_user_id;
				  }
			var sql= db.query(`SELECT * ,DATE_FORMAT(time, "%b, %d %Y") as custom_date,DATE_FORMAT(time, "%r") as custom_time, DATE_FORMAT(DATE_SUB(time, INTERVAL tbl_call_logs.duration SECOND), "%r") as call_duration FROM tbl_call_logs where is_video_call=? `+mita+` order by id desc  LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows  FROM tbl_call_logs where is_video_call=? `+mita+``, ['1', no_of_records_per_page, rowno,'1'], function(error, results, fields) {
				if (error) throw error;
				var feed = [];
				console.log(sql.sql);
				if (results[0].length > 0) {
					Object.keys(results[0]).forEach(function(key, idx, array) {
						var result_data = results[0][key];
							db.query(`SELECT * FROM tbl_user_profile where user_id=?;SELECT * FROM tbl_user_profile WHERE user_id=?`, [result_data.user_id,result_data.caller_id], function(error, results_rating, fields) {
								if (error) throw error;
								if (results_rating[0].length > 0) {

									result_data.user_name=results_rating[0][0].user_name;
									result_data.user_profile_img=results_rating[0][0].user_profile_img;
									

								}else{
									result_data.user_name='';
									result_data.user_profile_img='';
								}
								if (results_rating[1].length > 0) {

									result_data.caller_user_name=results_rating[1][0].user_name;
									result_data.caller_user_profile_img=results_rating[1][0].user_profile_img;
									

								}else{
									result_data.caller_user_name='';
									result_data.caller_user_profile_img='';
								}
							
							
									feed.push(result_data);
									if (idx == array.length - 1) {
										
										if (feed.length > 0) {
										//	feed = feed.sort((a, b) => (a.feed_id < b.feed_id) ? 1 : -1);
										
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;
                                      
											// PAGINATION START
									
											let next=0;
											let previous=0;
											if(page_no<max_pages && max_pages>1){
												next=parseInt(page_no)+1;
											}

											if(page_no>1 && max_pages>1){
												previous=parseInt(page_no)-1;
											}

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: max_pages,
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no,
												first:1,
												current:page_no,
												previous:previous,
												next:next,
												last:max_pages,
											};
											// PAGINATION END

											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: results[1][0].numrows,
												paginDupli:results[0].length,
												paginationDataList: feed,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												paginationDataListCount: 0,
												paginationDataList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}

											});
										}
									} else {
										return res.status(404).send({
											status: 404,
											msg: "No matching records found.",
											myShopAllListCount: 0,
											myShopAllList: [],
											pagination: {
												total_rows: 0,
												total_pages: 0,
												per_page: 0,
												offset: 0,
												current_page_no: '0'
											}

										});
									}
									}
								//});
							 });

						});
					} else {
						return res.status(202).send({
							status: 202,
							msg: "fail",
							paginationDataListCount: 0,
							paginationDataList: [],
							pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail1",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};
exports.get_audio_call_list = async (req, res) => {
	try {
		if (req.query.page_no) {
			var pagination = [];
			var alldata = [];
			var mita='';
			let no_of_records_per_page = 7;
				var rowno = req.query.page_no;
				if (rowno != 0) {
					rowno = (rowno - 1) * no_of_records_per_page;
				}
			
				if(req.query.main_user_id!='null' && req.query.caller_user_id!='null'){
					mita=" and user_id="+req.query.main_user_id+" and caller_id="+req.query.caller_user_id;
				  }else if(req.query.main_user_id!='null'){
					mita=" and user_id="+req.query.main_user_id;
				  }else if(req.query.caller_user_id!='null'){
					mita=" and caller_id="+req.query.caller_user_id;
				  }
			 db.query(`SELECT * ,DATE_FORMAT(time, "%b, %d %Y") as custom_date,DATE_FORMAT(time, "%r") as custom_time, DATE_FORMAT(DATE_SUB(time, INTERVAL tbl_call_logs.duration SECOND), "%r") as call_duration FROM tbl_call_logs where is_video_call=? `+mita+` order by id desc  LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows  FROM tbl_call_logs where is_video_call=?  `+mita+``, ['0', no_of_records_per_page, rowno,'0'], function(error, results, fields) {
				if (error) throw error;
				var feed = [];
				if (results[0].length > 0) {
					Object.keys(results[0]).forEach(function(key, idx, array) {
						var result_data = results[0][key];
							db.query(`SELECT * FROM tbl_user_profile where user_id=?;SELECT * FROM tbl_user_profile WHERE user_id=?`, [result_data.user_id,result_data.caller_id], function(error, results_rating, fields) {
								if (error) throw error;
								if (results_rating[0].length > 0) {

									result_data.user_name=results_rating[0][0].user_name;
									result_data.user_profile_img=results_rating[0][0].user_profile_img;
									

								}else{
									result_data.user_name='';
									result_data.user_profile_img='';
								}
								if (results_rating[1].length > 0) {

									result_data.caller_user_name=results_rating[1][0].user_name;
									result_data.caller_user_profile_img=results_rating[1][0].user_profile_img;
									

								}else{
									result_data.caller_user_name='';
									result_data.caller_user_profile_img='';
								}
							
							
									feed.push(result_data);
									if (idx == array.length - 1) {
										
										if (feed.length > 0) {
										//	feed = feed.sort((a, b) => (a.feed_id < b.feed_id) ? 1 : -1);
										
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;
                                      
											// PAGINATION START
									
											let next=0;
											let previous=0;
											if(page_no<max_pages && max_pages>1){
												next=parseInt(page_no)+1;
											}

											if(page_no>1 && max_pages>1){
												previous=parseInt(page_no)-1;
											}

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: max_pages,
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no,
												first:1,
												current:page_no,
												previous:previous,
												next:next,
												last:max_pages,
											};
											// PAGINATION END

											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: results[1][0].numrows,
												paginDupli:results[0].length,
												paginationDataList: feed,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												paginationDataListCount: 0,
												paginationDataList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}

											});
										}
									} else {
										return res.status(404).send({
											status: 404,
											msg: "No matching records found.",
											myShopAllListCount: 0,
											myShopAllList: [],
											pagination: {
												total_rows: 0,
												total_pages: 0,
												per_page: 0,
												offset: 0,
												current_page_no: '0'
											}

										});
									}
									}
								//});
							 });

						});
					} else {
						return res.status(202).send({
							status: 202,
							msg: "fail",
							paginationDataListCount: 0,
							paginationDataList: [],
							pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail1",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};

exports.get_user_list_for_popup = async (req, res) => {
	try {
	
			 db.query(`SELECT user_id , user_name from tbl_user_profile where user_name!='' `, function(error, results, fields) {
				if (error) throw error;
				var feed = [];

				if (results.length > 0) {
					Object.keys(results).forEach(function(key, idx, array) {
						var result_data = results[key];
						
									feed.push(result_data);
									if (idx == array.length - 1) {
											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: feed.length,
												paginationDataList: feed
											});
							
									}
									
								});
							} else {
								return res.status(202).send({
									status: 202,
									msg: "fail1",
									paginationDataListCount: 0,
									paginationDataList: []
								});
							}
							// });

						});
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};

exports.get_chat_messages_list = async (req, res) => {
	try {
    if (req.query.user_id && req.query.friend_user_id) {
        if (req.query.page_no) {
           var query = db.query(`SELECT * FROM tbl_chat_details WHERE sender_user_id = ? AND receiver_user_id = ? and cleared_by_id!=? UNION SELECT * FROM tbl_chat_details WHERE receiver_user_id = ? AND sender_user_id = ? and cleared_by_id!=? ORDER BY created_date DESC`, [req.query.user_id, req.query.friend_user_id,req.query.user_id, req.query.user_id, req.query.friend_user_id,req.query.user_id], function(error, results, fields) {
                if (error) {
                    return res.status(400).send({
                        status: 400,
                        msg: "fail"
                    });
                } else {
                    //console.log(query.sql);
                    if (results.length > 0) {
                        var final_array = [];
                        var totalfriendsList = [];
                        Object.keys(results).forEach(function(key, index, array) {
                            var result = results[key];
							if(result.message_media!=''){
								result.message_media="https://media.zktor.com/uploads/chat_media/"+result.message_media.slice(0, -4);
								const images = ["jpg", "gif", "png"]
								const videos = ["mp4", "3gp", "ogg"]
								
								const url = new URL(result.message_media)
								const extension = url.pathname.split(".")[1]
								
								if (images.includes(extension)) {
								  result.message_type='2';
								} else if (videos.includes(extension)) {
								    result.message_type='3';
								}
							}
                            result.created_date = moment(Date.parse(result.created_date)).format('DD-MM-YYYY HH:mmA');
                            result.modified_date = moment(Date.parse(result.modified_date)).format('DD-MM-YYYY HH:mmA');
                            if (req.query.user_id == result.receiver_user_id) {
                                result.user_type = 'Friend';
                                final_array.push(result);
                            } else if (req.query.user_id == result.sender_user_id) {
                                result.user_type = 'User';
                                final_array.push(result);
                            }

                            if (index === array.length - 1) {
                                let no_of_records_per_page = 5;
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
                                        chatMessageList: final_array,
                                        pagination: pagination
                                    });
                                } else {
                                    return res.status(404).send({
                                        status: 404,
                                        msg: "Page no missing or Its incorrect.",
                                         chatMessageList: [],
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
                                      chatMessageList: [],
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
                          chatMessageList: [],
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
        return res.status(400).send({
            status: 400,
            msg: "fail",
                      chatMessageList: [],
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
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(400).send({
			status: 400,
			error: errorName,
			msg: errorMessage
		});
	}
};


exports.get_chat_list_profiles = async (req, res) => {
	try {
		if (req.query.page_no) {
			var pagination = [];
			var alldata = [];
			var mita='';
			let no_of_records_per_page = 7;
				var rowno = req.query.page_no;
				if (rowno != 0) {
					rowno = (rowno - 1) * no_of_records_per_page;
				}
			
				if(req.query.main_user_id!='null' && req.query.caller_user_id!='null'){
					mita=" and sender_user_id="+req.query.main_user_id+" and receiver_user_id="+req.query.caller_user_id;
				  }else if(req.query.main_user_id!='null'){
					mita=" and sender_user_id="+req.query.main_user_id;
				  }else if(req.query.caller_user_id!='null'){
					mita=" and receiver_user_id="+req.query.caller_user_id;
				  }
		var sql=	 db.query(`select DATE_FORMAT(created_date, "%b, %d %Y") as custom_date,DATE_FORMAT(created_date, "%r") as custom_time, min(message_id) as message_id, least(sender_user_id, receiver_user_id) as sender_user_id, greatest(sender_user_id, receiver_user_id) as receiver_user_id
			 from tbl_chat_details where sender_user_id!=0 and receiver_user_id!=0 `+mita+`
			 group by least(sender_user_id, receiver_user_id), greatest(sender_user_id, receiver_user_id)  order by message_id desc  LIMIT ? OFFSET ?;
			 select count(*) AS numrows,  min(message_id) as message_id, least(sender_user_id, receiver_user_id) as sender_user_id, greatest(sender_user_id, receiver_user_id) as receiver_user_id
			 from tbl_chat_details where sender_user_id!=0 and receiver_user_id!=0  `+mita+`
			 group by least(sender_user_id, receiver_user_id), greatest(sender_user_id, receiver_user_id) `, [ no_of_records_per_page, rowno], function(error, results, fields) {
				if (error) throw error;
				var feed = [];
				console.log(sql.sql);
				if (results[0].length > 0) {
					Object.keys(results[0]).forEach(function(key, idx, array) {
						var result_data = results[0][key];
							db.query(`SELECT * FROM tbl_user_profile where user_id=?;SELECT * FROM tbl_user_profile WHERE user_id=?`, [result_data.sender_user_id,result_data.receiver_user_id], function(error, results_rating, fields) {
								if (error) throw error;
								if (results_rating[0].length > 0) {

									result_data.user_name=results_rating[0][0].user_name;
									result_data.user_profile_img=results_rating[0][0].user_profile_img;
									

								}else{
									result_data.user_name='';
									result_data.user_profile_img='';
								}
								if (results_rating[1].length > 0) {

									result_data.caller_user_name=results_rating[1][0].user_name;
									result_data.caller_user_profile_img=results_rating[1][0].user_profile_img;
									

								}else{
									result_data.caller_user_name='';
									result_data.caller_user_profile_img='';
								}
							
							
									feed.push(result_data);
									if (idx == array.length - 1) {
										
										if (feed.length > 0) {
										//	feed = feed.sort((a, b) => (a.feed_id < b.feed_id) ? 1 : -1);
										
										let max_pages = parseInt(Math.ceil((results[1].length) / no_of_records_per_page));
										console.log(results[1][0].numrows);
										console.log(max_pages);
										if (req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;
                                      
											// PAGINATION START
									
											let next=0;
											let previous=0;
											if(page_no<max_pages && max_pages>1){
												next=parseInt(page_no)+1;
											}

											if(page_no>1 && max_pages>1){
												previous=parseInt(page_no)-1;
											}

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1].length,
												total_pages: max_pages,
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no,
												first:1,
												current:page_no,
												previous:previous,
												next:next,
												last:max_pages,
											};
											// PAGINATION END

											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: results[1][0].numrows,
												paginDupli:results[0].length,
												paginationDataList: feed,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												paginationDataListCount: 0,
												paginationDataList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}

											});
										}
									} else {
										return res.status(404).send({
											status: 404,
											msg: "No matching records found.",
											myShopAllListCount: 0,
											myShopAllList: [],
											pagination: {
												total_rows: 0,
												total_pages: 0,
												per_page: 0,
												offset: 0,
												current_page_no: '0'
											}

										});
									}
									}
								//});
							 });

						});
					} else {
						return res.status(202).send({
							status: 202,
							msg: "fail",
							paginationDataListCount: 0,
							paginationDataList: [],
							pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail1",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};


exports.notification_list_for_dashboard = async (req, res) => {
	try {
		if (req.query.page_no) {
			var pagination = [];
			var alldata = [];
			var mita='';
			let no_of_records_per_page = 9;
				var rowno = req.query.page_no;
				if (rowno != 0) {
					rowno = (rowno - 1) * no_of_records_per_page;
				}
			
			
				  if(req.query.keyword && req.query.keyword!=''){
					mita=" where (notification_des LIKE '%"+req.query.keyword+"%' or notification_type LIKE '%"+req.query.keyword+"%')";
				  }
	 
			 db.query(`SELECT * from tbl_notification  `+mita+` order by notification_id desc  LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows  FROM tbl_notification  `+mita+``, [ no_of_records_per_page, rowno], function(error, results, fields) {
				if (error) throw error;
				var feed = [];
				if (results[0].length > 0) {
					Object.keys(results[0]).forEach(function(key, idx, array) {
						var result_data = results[0][key];
							db.query(`SELECT * FROM tbl_user_profile where user_id=?;SELECT * FROM tbl_user_profile where user_id=?;`, [result_data.notification_user_id,result_data.notification_data_id], function(error, results_rating, fields) {
								if (error) throw error;
								var flag=0;
								if (results_rating[0].length > 0) {

									result_data.user_name=results_rating[0][0].user_name;
									result_data.user_profile_img=results_rating[0][0].user_profile_img;
									

								}else{
									result_data.user_name='';
									result_data.user_profile_img='';
								}
								if (results_rating[1].length > 0) {

									result_data.caller_user_name=results_rating[1][0].user_name;
									result_data.caller_user_profile_img=results_rating[1][0].user_profile_img;
									

								}else{
									result_data.caller_user_name='';
									result_data.caller_user_profile_img='';
								}
								try{
								if(result_data.created_date!='' && result_data.created_date!='00-00-00 00:00:00'){
									
								result_data.notification_ago = timeAgo(new Date(result_data.created_date).toISOString());
								}else{
									result_data.notification_ago='not known';
								}
							}catch(e){
								result_data.notification_ago='not known';	
							}
							if((result_data.notification_type).includes('approve')){
								result_data.notification_type= 'Service Approved';

							}

							if((result_data.notification_type).includes('reject')){
								result_data.notification_type= 'Service Rejected';

							}

							if((result_data.notification_type)=='order'){
								result_data.notification_type= 'Product Ordered';

							}
							if((result_data.notification_type)=='post'){
								result_data.notification_type= 'User Post';

							}
							if((result_data.notification_type)=='follow'){
								result_data.notification_type= 'User followed';

							}

							if((result_data.notification_type)=='Accept'){
								result_data.notification_type= 'User Accepted Request';

								
							}

							if((result_data.notification_type)=='shipped_view'){
								result_data.notification_type= 'Order Shipped Details';

								
							}

						
							if((result_data.notification_type).includes('call')){
								result_data.notification_type= 'Audio Call';

							}

							if((result_data.notification_type).includes('matrimonial')){
								result_data.notification_type= 'Matrimonial Notification';

							}

						

							if((result_data.notification_type).includes('video')){
								result_data.notification_type= 'Video Call';

							}
							if((result_data.notification_type)=='sent' || result_data.notification_type=='accept' ||  result_data.notification_type=='suggestion_request'){
								result_data.notification_type= 'Friend Request';

								
							}
							
							if((result_data.notification_type)=='group_invite' || result_data.notification_type.includes('group_request') || result_data.notification_type=='group'){
								result_data.notification_type= 'Group Invitation';

								
							}
							
                              if(result_data.user_name!='' && result_data.notification_des!=''){
								var search = 'your';  
var replacer = new RegExp(search, 'g')

var string = result_data.notification_des

result_data.notification_des=string.replace(replacer, result_data.user_name+"'s") ;
							  }
							  if(result_data.user_name!='' && result_data.notification_des!=''){
								var search = 'Your';  
var replacer = new RegExp(search, 'g')

var string = result_data.notification_des

result_data.notification_des=string.replace(replacer, result_data.user_name+"'s") ;
							  }

							  if(result_data.user_name!='' && result_data.notification_des!=''){
								var search1 = 'you';  
var replacer1 = new RegExp(search1, 'g')

var string1 = result_data.notification_des

result_data.notification_des=string1.replace(replacer1, result_data.user_name) ;
							  }

							  if(result_data.user_name!='' && result_data.notification_des!=''){
								var search1 = 'You';  
var replacer1 = new RegExp(search1, 'g')

var string1 = result_data.notification_des

result_data.notification_des=string1.replace(replacer1, result_data.user_name) ;
							  }
							
							
							
									feed.push(result_data);
									if (idx == array.length - 1) {
										
										if (feed.length > 0) {
										//	feed = feed.sort((a, b) => (a.feed_id < b.feed_id) ? 1 : -1);
										
										let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
										if (req.query.page_no <= max_pages) {
											let page_no = req.query.page_no;
                                      
											// PAGINATION START
									
											let next=0;
											let previous=0;
											if(page_no<max_pages && max_pages>1){
												next=parseInt(page_no)+1;
											}

											if(page_no>1 && max_pages>1){
												previous=parseInt(page_no)-1;
											}

											let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
											//let sliceData = feed.slice(offset, offset + no_of_records_per_page)
											var pagination = {
												total_rows: results[1][0].numrows,
												total_pages: max_pages,
												per_page: no_of_records_per_page,
												offset: offset,
												current_page_no: page_no,
												first:1,
												current:page_no,
												previous:previous,
												next:next,
												last:max_pages,
											};
											// PAGINATION END

											return res.status(200).send({
												status: 200,
												msg: "Success",
												paginationDataListCount: results[1][0].numrows,
												paginDupli:results[0].length,
												paginationDataList: feed,
												pagination: pagination
											});
										} else {
											return res.status(404).send({
												status: 404,
												msg: "Page no missing or Its incorrect.",
												paginationDataListCount: 0,
												paginationDataList: [],
												pagination: {
													total_rows: 0,
													total_pages: 0,
													per_page: 0,
													offset: 0,
													current_page_no: '0'
												}

											});
										}
									} else {
										return res.status(404).send({
											status: 404,
											msg: "No matching records found.",
											myShopAllListCount: 0,
											myShopAllList: [],
											pagination: {
												total_rows: 0,
												total_pages: 0,
												per_page: 0,
												offset: 0,
												current_page_no: '0'
											}

										});
									}
									}
								//});
							 });

						});
					} else {
						return res.status(202).send({
							status: 202,
							msg: "fail",
							paginationDataListCount: 0,
							paginationDataList: [],
							pagination: {
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
			return res.status(202).send({
				status: 202,
				msg: "fail1",
				paginationDataListCount: 0,
				paginationDataList: [],
				pagination: {
					total_rows: 0,
					total_pages: 0,
					per_page: 0,
					offset: 0,
					current_page_no: '0'
				}
			});
		}
	} catch (err) {
		console.log(err);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(202).send({
			status: 202,
			error: errorName,
			msg: errorMessage
		});
	}
};