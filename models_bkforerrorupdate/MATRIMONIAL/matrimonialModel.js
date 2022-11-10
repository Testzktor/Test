const fs = require('fs');
const db = require("../../config/connection");
const {
    getVideoDurationInSeconds
} = require('get-video-duration')
const merge = require('deepmerge');
const multer = require('fastify-multer');
const crypto = require("crypto");
const {
    exec
} = require("child_process");
var path = require('path')
var matrimonial = multer.diskStorage({
    destination: function(req, file, cb) {
        
        cb(null, '../uploads/matrimonial/');
    },
    filename: function(req, file, cb) {
        cb(null, "matrimonial_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
    }
});
exports.add_matrimonial = async (req, res) => {
	try {
    let upload = multer({
        storage: matrimonial,
    }).fields([{
        name: 'matrimonial_images',
        maxCount: 10
    },
    {
        name: 'identification_image',
        maxCount: 1
    },{
        name: 'user_profile_image',
        maxCount: 1
    }
    ]);
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: err,
                 matrimonial_id:0
            });
        } else {
           // console.log(req.body);
            if (req.body.matrimonial_user_id) {
                var matrimonial_images = [];
                if (typeof req.files.matrimonial_images !== 'undefined') {
                  //  console.log("test0");
                    //req.body.matrimonial_business_id = "matrimonial_" + crypto.createHash('md5').update('ABCDEFGHIJL1234567890').digest('hex');
                    Object.keys(req.files.matrimonial_images).forEach(function(key, idx1, array1) {
                        var result_file = req.files.matrimonial_images[key];
                        matrimonial_images.push(define.BASE_URL+"matrimonial/"+result_file.filename);
                        if (idx1 === array1.length - 1) {
                             if (typeof req.files.user_profile_image !== 'undefined') {
                                 console.log(req.files.user_profile_image);
                                 req.body.user_profile_image=define.BASE_URL+"matrimonial/"+req.files.user_profile_image[0].filename;
                             }
                              if (typeof req.files.identification_image !== 'undefined') {
                                  console.log(req.files.identification_image);
                                 req.body.identification_image=define.BASE_URL+"matrimonial/"+req.files.identification_image[0].filename;
                             }
                            req.body.matrimonial_images = matrimonial_images.toString();
                            db.query(`INSERT INTO tbl_matrimonial SET ?`, req.body, function(error, results, fields) {
                                if (error) {
                                    return res.status(400).send({
                                        status: 400,
                                        msg: "fail",
                                         matrimonial_id:0
                                    });
                                } else {
                                    return res.status(200).send({
                                        status: 200,
                                        msg: "Success",
                                        matrimonial_id:results.insertId
                                    });
                                }
                            });
                        }
                    });
                } else {
                    console.log("test01");
                     if (typeof req.files.user_profile_image !== 'undefined') {
                                 req.body.user_profile_image=define.BASE_URL+"matrimonial/"+req.files.user_profile_image[0].filename;
                             }
                             if (typeof req.files.identification_image !== 'undefined') {
                                 req.body.identification_image=define.BASE_URL+"matrimonial/"+req.files.identification_image[0].filename;
                             }
                    db.query(`INSERT INTO tbl_matrimonial SET ?`, req.body, function(error, results, fields) {
                        if (error) {
                            return res.status(400).send({
                                status: 400,
                                msg: "fail",
                                matrimonial_id:0
                            });
                        } else {
                            return res.status(200).send({
                                status: 200,
                                msg: "Success",
                                matrimonial_id:results.insertId
                            });
                        }
                    });
                }
            } else {
                return res.status(400).send({
                    status: 400,
                    msg: "fail",
                     matrimonial_id:0
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
exports.edit_matrimonial = async (req, res) => {
	try {
    let upload = multer({
        storage: matrimonial,
    }).fields([{
        name: 'matrimonial_images',
        maxCount: 10
    },
    {
        name: 'identification_image',
        maxCount: 1
    },{
        name: 'user_profile_image',
        maxCount: 1
    }
    ]);
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail1"
            });
        } else {
            console.log(req.body);
            if (req.body.matrimonial_id) {
                var matrimonial_id=req.body.matrimonial_id;
                delete(req.body.matrimonial_id);
                var matrimonial_images = [];
                if (typeof req.files.matrimonial_images !== 'undefined') {
                    //req.body.matrimonial_business_id = "matrimonial_" + crypto.createHash('md5').update('ABCDEFGHIJL1234567890').digest('hex');
                    Object.keys(req.files.matrimonial_images).forEach(function(key, idx1, array1) {
                        var result_file = req.files.matrimonial_images[key];
                        matrimonial_images.push(define.BASE_URL+"matrimonial/"+result_file.filename);
                        if (idx1 === array1.length - 1) {
                             if (typeof req.files.user_profile_image !== 'undefined') {
                                 req.body.user_profile_image=define.BASE_URL+"matrimonial/"+req.files.user_profile_image[0].filename;
                             }
                             if (typeof req.files.identification_image !== 'undefined') {
                                 req.body.identification_image=define.BASE_URL+"matrimonial/"+req.files.identification_image[0].filename;
                             }
                            req.body.matrimonial_images = matrimonial_images.toString();
                            db.query(`UPDATE tbl_matrimonial SET ? where matrimonial_id=?`, [req.body,matrimonial_id], function(error, results, fields) {
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
                     if (typeof req.files.user_profile_image !== 'undefined') {
                                 req.body.user_profile_image=define.BASE_URL+"matrimonial/"+req.files.user_profile_image[0].filename;
                             }
                             if (typeof req.files.identification_image !== 'undefined') {
                                 req.body.identification_image=define.BASE_URL+"matrimonial/"+req.files.identification_image[0].filename;
                             }
                    db.query(`UPDATE tbl_matrimonial SET ? where matrimonial_id=?`, [req.body,matrimonial_id], function(error, results, fields) {
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
                    msg: "fail3"
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
exports.update_matrimonial_settings = async (req, res) => {
	try {
    let upload = multer({
        storage: matrimonial,
    }).fields([{
        name: 'matrimonial_images',
        maxCount: 1
    }
    ]);
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail"
            });
        } else {
            if (req.body.matrimonial_id) {
                var matrimonial_id=req.body.matrimonial_id;
                delete(req.body.matrimonial_id);
                var matrimonial_images = [];
                    db.query(`UPDATE tbl_matrimonial SET ? where matrimonial_id=?`, [req.body,matrimonial_id], function(error, results, fields) {
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
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_matrimonial = async (req, res) => {
	try {
    var pagination = [];
    if (req.query.page_no && req.query.user_id) {
        var damin="where matrimonial_id>0";
                  var no_of_records_per_page = 10;
                  var rowno = req.query.page_no;
                if (rowno != 0)
                {
                    rowno = (rowno - 1) * no_of_records_per_page;
                }
               damin="SELECT * FROM tbl_matrimonial  order by matrimonial_id desc LIMIT "+no_of_records_per_page+" OFFSET "+rowno+";SELECT COUNT(*) AS numrows FROM tbl_matrimonial ";
              console.log(req.query.length);
              console.log(Object.keys(req.query).length);
                if(Object.keys(req.query).length>1){
                    var kita=req.query;
                  //  delete(kita.page_no);
                    var mita='';
                     Object.keys(kita).forEach(function(key34, idx34, array34) {
                         if(key34!="page_no" && key34!="user_id"){
                             if(idx34==1){
                         mita=mita+" "+key34+" LIKE '%"+ kita[key34]+"%'";
                             }else if(idx34 >=2){
                                   //if (idx34 === array34.length - 1) {
                                        mita=mita+" or "+key34+" LIKE '%"+ kita[key34]+"%'";
                                   //}
                             }
                         //console.log(idx34);
                         }
                     });
                  //  damin="where "+kita;
                  if(mita!='')
                     damin="SELECT * FROM tbl_matrimonial where "+mita+" order by matrimonial_id desc LIMIT "+no_of_records_per_page+" OFFSET "+rowno+";SELECT COUNT(*) AS numrows FROM tbl_matrimonial where "+mita;
                }
                console.log(req.query);
      var dd=  db.query(damin, function(error, results, fields) {
            if (error) throw error;
            console.log(dd.sql);
         
            if (results[0].length > 0) {
                var final_array = [];
                Object.keys(results[0]).forEach(function(key, idx, array) {
                    var result_data = results[0][key];
                
                            db.query(`SELECT * FROM tbl_matrimonial_religion where matrimonial_religion_id=?;SELECT * FROM tbl_matrimonial_main_gotra where main_gotra_id=?;SELECT * FROM tbl_matrimonial_sub_gotra where sub_gotra_id=?;SELECT * FROM tbl_matrimonial_shortlisted where matrimonial_id=? and user_id=?;SELECT count(*) as numofrows FROM tbl_matrimonial_visited where matrimonial_id=? and matrimonial_who_visited=?;SELECT count(*) as numofrows FROM tbl_matrimonial_block where matrimonial_id=? and matrimonial_user_id=?;`, [result_data.matrimonial_religion,result_data.matrimonial_main_gotra,result_data.matrimonial_sub_gotra,result_data.matrimonial_id,req.query.user_id,result_data.matrimonial_id,req.query.user_id,result_data.matrimonial_id,req.query.user_id], function(error, results_rating, fields) {
                                if (error) throw error;
                                if (results_rating[0].length > 0) {
                                   result_data.matrimonial_religion=results_rating[0][0];
                                }else{
                                    result_data.matrimonial_religion={}
                                }
                                  if (results_rating[1].length > 0) {
                                   result_data.matrimonial_main_gotra=results_rating[1][0];
                                }else{
                                    result_data.matrimonial_main_gotra={}
                                }
                                  if (results_rating[2].length > 0) {
                                   result_data.matrimonial_sub_gotra=results_rating[2][0];
                                }else{
                                    result_data.matrimonial_sub_gotra={}
                                }
                                
                                      if (results_rating[3].length > 0) {
                                   result_data.shortlisted_flag=1;
                                }else{
                                    result_data.shortlisted_flag=0;
                                }
                                result_data.visited_count=results_rating[4][0].numofrows;
                                if(results_rating[5][0].numofrows<=0){
                               final_array.push(result_data);
                                }
                                if (idx === array.length - 1) {
                                    setTimeout(function() {
                                    if (final_array.length > 0) {
                                        let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
                                        if (req.query.page_no && req.query.page_no <= max_pages) {
                                            let page_no = req.query.page_no;

                                            // PAGINATION START
                                            let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
                                            var pagination = {
                                                total_rows: results[1][0].numrows,
                                                total_pages: parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page)),
                                                per_page: no_of_records_per_page,
                                                offset: offset,
                                                current_page_no: page_no
                                            };
                                            // PAGINATION END

                                            return res.status(200).send({
                                                status: 200,
                                                msg: "Success",
                                                matrimonialAllListCount: results[1][0].numrows,
                                                matrimonialAllList: final_array,
                                                pagination: pagination
                                            });
                                        } else {
                                            return res.status(404).send({
                                                status: 404,
                                                msg: "Page no missing or Its incorrect.",
                                                   matrimonialAllListCount: 0,
                                                matrimonialAllList: [],
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
                                        return res.status(404).send({
                                            status: 404,
                                            msg: "No matching records found.",
                                                                matrimonialAllListCount: 0,
                                                matrimonialAllList: [],
                                                 pagination:  {
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
                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                                        matrimonialAllListCount: 0,
                                                matrimonialAllList: [],
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
            msg: "Page no missing or Its incorrect.",
                                matrimonialAllListCount: 0,
                                                matrimonialAllList: [],
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
// exports.get_matrimonial_filter2 = async (req, res) => {
// 	try {
// app.post('/get_matrimonial_filter2', middleware.authenticateToken, (req, res, next) => {
//     var pagination = [];
// console.log(Object.keys(req.body).length);
// var agee='de';
// if(req.body.matrimonial_age){
//     agee=req.body.matrimonial_age;
//     delete(req.body.matrimonial_age)
// }
// console.log(agee);
// var damin='SELECT * FROM tbl_matrimonial order by matrimonial_id desc;SELECT COUNT(*) AS numrows FROM tbl_matrimonial';
//     if(Object.keys(req.body).length>0){
//                     var kita=req.body;
//                     var mita='';
//                      Object.keys(kita).forEach(function(key34, idx34, array34) {
//                          if(key34 != "u_id"){
//                              if(idx34==0){
//                                  if(key34=='matrimonial_occupation'){
//                                 mita=mita+" FIND_IN_SET("+key34+",'"+kita[key34]+"')";
//                                  }else{
//                                       if(key34== "height"){
//                                          var parsedOutput = kita[key34].split(",");
//                                          console.log(parsedOutput.length);
//                                          if(parsedOutput.length>1){
//                                          mita=mita+" "+key34+" >= "+ parsedOutput[0]+" and "+key34+" <= "+ parsedOutput[1];
//                                          }else{
//                                           mita=mita+" "+key34+" = '"+ kita[key34]+"'";
//                                          }
//                                       }else{
//                          mita=mita+" "+key34+" = '"+ kita[key34]+"'";
//                                       }
//                                  }
//                              }else if(idx34 >=1){
//                                      if(key34=='matrimonial_occupation'){
//                                 mita=mita+" and FIND_IN_SET("+key34+",'"+kita[key34]+"')";
//                                  }else{
//                                      if(key34== "height"){
//                                          var parsedOutput = kita[key34].split(",");
//                                          if(parsedOutput.length>1){
//                                          mita=mita+" and "+key34+" >= "+ parsedOutput[0]+" and "+key34+" <= "+ parsedOutput[1];
//                                          }else{
//                                              mita=mita+" and "+key34+" = '"+ kita[key34]+"'";
//                                          }
//                                      }else{
//                                         mita=mita+" and "+key34+" = '"+ kita[key34]+"'";
//                                      }
//                                  }
                                  
//                              }
                   
//                          }
//                      });
//                   //  damin="where "+kita;
//                   if(mita!='')
//                      damin="SELECT * FROM tbl_matrimonial where "+mita+" order by matrimonial_id desc;SELECT COUNT(*) AS numrows FROM tbl_matrimonial where "+mita;
//                 }
//                 console.log(damin);
//       var sql= db.query(damin, [100], function(error, results, fields) {
//             if (error) throw error;
//             if (results[0].length > 0) {
//                 console.log(sql.sql);
//                 var final_array = [];
//                 Object.keys(results[0]).forEach(function(key, idx, array) {
//                     var result_data = results[0][key];
//                             db.query(`SELECT * FROM tbl_matrimonial_religion where matrimonial_religion_id=?;SELECT * FROM tbl_matrimonial_main_gotra where main_gotra_id=?;SELECT * FROM tbl_matrimonial_sub_gotra where sub_gotra_id=?;SELECT * FROM tbl_matrimonial_shortlisted where matrimonial_id=? and user_id=?;SELECT count(*) as numofrows FROM tbl_matrimonial_visited where matrimonial_id=? and matrimonial_who_visited=?;SELECT count(*) as numofrows FROM tbl_matrimonial_block where matrimonial_id=? and matrimonial_user_id=?;SELECT * FROM tbl_matrimonial_like WHERE matrimonial_id = ? AND matrimonial_like_user_id = ?`, [result_data.matrimonial_religion,result_data.matrimonial_main_gotra,result_data.matrimonial_sub_gotra,result_data.matrimonial_id,req.query.user_id,result_data.matrimonial_id,req.query.user_id,result_data.matrimonial_id,req.query.user_id,   result_data.matrimonial_id,req.body.u_id], function(error, results_rating, fields) {
//                                 if (error) throw error;
//                                 if (results_rating[0].length > 0) {
//                                   result_data.matrimonial_religion=results_rating[0][0];
//                                 }else{
//                                     result_data.matrimonial_religion={}
//                                 }
//                                   if (results_rating[1].length > 0) {
//                                   result_data.matrimonial_main_gotra=results_rating[1][0];
//                                 }else{
//                                     result_data.matrimonial_main_gotra={}
//                                 }
//                                   if (results_rating[2].length > 0) {
//                                   result_data.matrimonial_sub_gotra=results_rating[2][0];
//                                 }else{
//                                     result_data.matrimonial_sub_gotra={}
//                                 }
//                                       if (results_rating[3].length > 0) {
//                                   result_data.shortlisted_flag=1;
//                                 }else{
//                                     result_data.shortlisted_flag=0;
//                                 }
                                
//                                 if(results_rating[6].length > 0){
//                                       result_data.is_liked=1;
//                                      }else{
//                                         result_data.is_liked=0;
//                                      }
                                 
//                               // result_data.is_like1111= req.body.u_id;
//                               // result_data.is_like2222= result_data.matrimonial_id;
                    
//                                 ///////
                                
//                              //   db.query("SELECT * FROM tbl_matrimonial_like WHERE matrimonial_id = ? AND matrimonial_like_user_id = ?", [result_data.matrimonial_id,req.body.u_id], function(error, dat1, fields) {
//                               //      if (error) throw error;
                                
//                                 //      if(dat1[0].length > 0){
//                                 //        result_data.is_liked=1;
//                                 //     }else{
//                                 //        result_data.is_liked=0;
//                                 //     }
                                    
//                              //   });
                                
//                                 ///////
                                
//                                  result_data.visited_count=results_rating[4][0].numofrows;
//                                  if(results_rating[5][0].numofrows<=0){
//                                           var  flag56=0;
//                                      if(agee!='' && result_data.matrimonial_age!=''){
//                                          var matrimonial_age=(result_data.matrimonial_age).trim();
//                                          matrimonial_age=matrimonial_age.split(" ");
//                                          var ketad=agee.split(",");
//                                          var one= ketad[0];
//                                          var two= ketad[1];
//                                          var match=matrimonial_age[0];
//                                          console.log(match);
//                                          console.log(one);
//                                          console.log(two);
//                                          console.log("------");
//                                          if(match>=one && match<=two){
//                                              flag56=0;
//                                          }else{
//                                              flag56=1;
//                                          }
//                                      }
//                                      if(flag56==0){
//                                  final_array.push(result_data);
//                                      }
//                                  }
//                                 if (idx === array.length - 1) {
//                                     setTimeout(function() {
//                                     if (final_array.length > 0) {
//                                             return res.status(200).send({
//                                                 status: 200,
//                                                 msg: "Success",
//                                                 matrimonialAllListCount: results[1][0].numrows,
//                                                 matrimonialAllList: final_array,
//                                             });
//                                     } else {
//                                         return res.status(404).send({
//                                             status: 404,
//                                             msg: "No matching records found.",
//                                                                 matrimonialAllListCount: 0,
//                                                 matrimonialAllList: [],
                                                

//                                         });
//                                     }
//                                     }, 100);
//                                 }
//                             });
//                 });
//             } else {
//                 return res.status(404).send({
//                     status: 404,
//                     msg: "Record not found",
//                                         matrimonialAllListCount: 0,
//                                                 matrimonialAllList: [],

//                 });
//             }
//         });

// 	} catch (err) {
// 		return res.status(400).send({
// 			status: 400,
// 			msg: err
// 		});
// 	}
// };
exports.get_matrimonial_filter = async (req, res) => {
	try {
    var pagination = [];
console.log(Object.keys(req.body).length);
var agee='de';
if(req.body.matrimonial_age){
    agee=req.body.matrimonial_age;
    delete(req.body.matrimonial_age)
}

console.log(agee);
var damin='SELECT * FROM tbl_matrimonial order by matrimonial_id desc;SELECT * FROM tbl_matrimonial';
    if(Object.keys(req.body).length>0){
                    var kita=req.body;
                    var mita='';
                     Object.keys(kita).forEach(function(key34, idx34, array34) {
                         if(key34!='u_id'){
                             if(idx34==0){
                                 if(key34=='matrimonial_occupation'){
                                mita=mita+" FIND_IN_SET("+key34+",'"+kita[key34]+"')";
                                 }else{
                                      if(key34== "height"){
                                         var parsedOutput = kita[key34].split(",");
                                         console.log(parsedOutput.length);
                                         if(parsedOutput.length>1){
                                         mita=mita+" "+key34+" >= "+ parsedOutput[0]+" and "+key34+" <= "+ parsedOutput[1];
                                         }else{
                                           mita=mita+" "+key34+" = '"+ kita[key34]+"'";
                                         }
                                      }else{
                         mita=mita+" "+key34+" = '"+ kita[key34]+"'";
                                      }
                                 }
                             }else if(idx34 >=1){
                                     if(key34=='matrimonial_occupation'){
                                mita=mita+" and FIND_IN_SET("+key34+",'"+kita[key34]+"')";
                                 }else{
                                     if(key34== "height"){
                                         var parsedOutput = kita[key34].split(",");
                                         if(parsedOutput.length>1){
                                         mita=mita+" and "+key34+" >= "+ parsedOutput[0]+" and "+key34+" <= "+ parsedOutput[1];
                                         }else{
                                             mita=mita+" and "+key34+" = '"+ kita[key34]+"'";
                                         }
                                     }else{
                                        mita=mita+" and "+key34+" = '"+ kita[key34]+"'";
                                     }
                                 }
                                  
                             }
                     }
                     });
                  //  damin="where "+kita;
                  if(mita!='')
                     damin="SELECT * FROM tbl_matrimonial where "+mita+" order by matrimonial_id desc;SELECT * FROM tbl_matrimonial where "+mita;
                }
                console.log(damin);
       var sql= db.query(damin, [100], function(error, results, fields) {
            if (error) throw error;
            if (results[0].length > 0) {
                console.log(sql.sql);
                var final_array = [];
                Object.keys(results[0]).forEach(function(key, idx, array) {
                    var result_data = results[0][key];
                            db.query(`SELECT * FROM tbl_matrimonial_religion where matrimonial_religion_id=?;
                            SELECT * FROM tbl_matrimonial_main_gotra where main_gotra_id=?;
                            SELECT * FROM tbl_matrimonial_sub_gotra where sub_gotra_id=?;
                            SELECT * FROM tbl_matrimonial_shortlisted where matrimonial_id=? and user_id=?;
                            SELECT count(*) as numofrows FROM tbl_matrimonial_visited where matrimonial_id=? and matrimonial_who_visited=?;
                            SELECT count(*) as numofrows FROM tbl_matrimonial_block where matrimonial_id=? and matrimonial_user_id=?;
                            select * from tbl_user_profile where user_id=?`, [result_data.matrimonial_religion,result_data.matrimonial_main_gotra,result_data.matrimonial_sub_gotra,result_data.matrimonial_id,req.query.user_id,result_data.matrimonial_id,req.query.user_id,result_data.matrimonial_id,req.query.user_id,result_data.matrimonial_user_id], function(error, results_rating, fields) {
                                if (error) throw error;
                                if (results_rating[0].length > 0) {
                                   result_data.matrimonial_religion=results_rating[0][0];
                                }else{
                                    result_data.matrimonial_religion={}
                                }
                                  if (results_rating[1].length > 0) {
                                   result_data.matrimonial_main_gotra=results_rating[1][0];
                                }else{
                                    result_data.matrimonial_main_gotra={}
                                }
                                  if (results_rating[2].length > 0) {
                                   result_data.matrimonial_sub_gotra=results_rating[2][0];
                                }else{
                                    result_data.matrimonial_sub_gotra={}
                                }
                                       if (results_rating[3].length > 0) {
                                   result_data.shortlisted_flag=1;
                                }else{
                                    result_data.shortlisted_flag=0;
                                }
                                        if (results_rating[6].length > 0) {
                                   result_data.user_register_id=results_rating[6][0].user_register_id;
                                }else{
                                    result_data.user_register_id='';
                                }
                                 result_data.visited_count=results_rating[4][0].numofrows;
                                 if(results_rating[5][0].numofrows<=0){
                                   var  flag56=0;
                                     if(agee!='' && result_data.matrimonial_age!=''){
                                         var matrimonial_age=(result_data.matrimonial_age).trim();
                                         matrimonial_age=matrimonial_age.split(" ");
                                         var ketad=agee.split(",");
                                         if(ketad.length>1){
                                         var one= ketad[0];
                                         var two= ketad[1];
                                         var match=matrimonial_age[0];
                                         console.log(match);
                                         console.log(one);
                                         console.log(two);
                                         console.log("------");
                                         if(match>=one && match<=two){
                                             flag56=0;
                                         }else{
                                             flag56=1;
                                         }
                                         }
                                     }
                                     if(flag56==0){
                                         if(result_data.matrimonial_user_id!=req.query.u_id)
                                 final_array.push(result_data);
                                     }
                                 }
                                if (idx === array.length - 1) {
                                    setTimeout(function() {
                                    if (final_array.length > 0) {
                                            return res.status(200).send({
                                                status: 200,
                                                msg: "Success",
                                                matrimonialAllListCount: final_array.length,
                                                matrimonialAllList: final_array,
                                            });
                                    } else {
                                        return res.status(404).send({
                                            status: 404,
                                            msg: "No matching records found.",
                                                                matrimonialAllListCount: 0,
                                                matrimonialAllList: [],
                                                

                                        });
                                    }
                                    }, 100);
                                }
                            });
                });
            } else {
                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                                        matrimonialAllListCount: 0,
                                                matrimonialAllList: [],

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
exports.get_matrimonial_all = async (req, res) => {
	try {

    var pagination = [];

        db.query(`SELECT * FROM tbl_matrimonial order by matrimonial_id desc;SELECT COUNT(*) AS numrows FROM tbl_matrimonial`, [100], function(error, results, fields) {
            if (error) throw error;
            if (results[0].length > 0) {
                var final_array = [];
                Object.keys(results[0]).forEach(function(key, idx, array) {
                    var result_data = results[0][key];
                            db.query(`SELECT * FROM tbl_matrimonial_religion where matrimonial_religion_id=?;SELECT * FROM tbl_matrimonial_main_gotra where main_gotra_id=?;SELECT * FROM tbl_matrimonial_sub_gotra where sub_gotra_id=?;SELECT * FROM tbl_matrimonial_shortlisted where matrimonial_id=? and user_id=?;SELECT count(*) as numofrows FROM tbl_matrimonial_visited where matrimonial_id=? and matrimonial_who_visited=?;SELECT count(*) as numofrows FROM tbl_matrimonial_block where matrimonial_id=? and matrimonial_user_id=?;`, [result_data.matrimonial_religion,result_data.matrimonial_main_gotra,result_data.matrimonial_sub_gotra,result_data.matrimonial_id,req.query.user_id,result_data.matrimonial_id,req.query.user_id,result_data.matrimonial_id,req.query.user_id], function(error, results_rating, fields) {
                                if (error) throw error;
                                if (results_rating[0].length > 0) {
                                   result_data.matrimonial_religion=results_rating[0][0];
                                }else{
                                    result_data.matrimonial_religion={}
                                }
                                  if (results_rating[1].length > 0) {
                                   result_data.matrimonial_main_gotra=results_rating[1][0];
                                }else{
                                    result_data.matrimonial_main_gotra={}
                                }
                                  if (results_rating[2].length > 0) {
                                   result_data.matrimonial_sub_gotra=results_rating[2][0];
                                }else{
                                    result_data.matrimonial_sub_gotra={}
                                }
                                       if (results_rating[3].length > 0) {
                                   result_data.shortlisted_flag=1;
                                }else{
                                    result_data.shortlisted_flag=0;
                                }
                                 result_data.visited_count=results_rating[4][0].numofrows;
                                 if(results_rating[5][0].numofrows<=0){
                                 final_array.push(result_data);
                                 }
                                if (idx === array.length - 1) {
                                    setTimeout(function() {
                                    if (final_array.length > 0) {
                                            return res.status(200).send({
                                                status: 200,
                                                msg: "Success",
                                                matrimonialAllListCount: results[1][0].numrows,
                                                matrimonialAllList: final_array,
                                            });
                                    } else {
                                        return res.status(404).send({
                                            status: 404,
                                            msg: "No matching records found.",
                                                                matrimonialAllListCount: 0,
                                                matrimonialAllList: [],
                                                

                                        });
                                    }
                                    }, 100);
                                }
                            });
                });
            } else {
                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                                        matrimonialAllListCount: 0,
                                                matrimonialAllList: [],

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
exports.get_matrimonial_user_details = async (req, res) => {
	try {
    var pagination = [];
if (req.query.user_id) {
        db.query(`SELECT * FROM tbl_matrimonial where matrimonial_user_id=?;SELECT COUNT(*) AS numrows FROM tbl_matrimonial`, [req.query.user_id], function(error, results, fields) {
            if (error) throw error;
            if (results[0].length > 0) {
                var final_array = [];
                Object.keys(results[0]).forEach(function(key, idx, array) {
                    var result_data = results[0][key];
                            db.query(`SELECT * FROM tbl_matrimonial_religion where matrimonial_religion_id=?;SELECT * FROM tbl_matrimonial_main_gotra where main_gotra_id=?;SELECT * FROM tbl_matrimonial_sub_gotra where sub_gotra_id=?;SELECT * FROM tbl_matrimonial_shortlisted where matrimonial_id=? and user_id=?;SELECT count(*) as numofrows FROM tbl_matrimonial_visited where matrimonial_id=? and matrimonial_who_visited=?;`, [result_data.matrimonial_religion,result_data.matrimonial_main_gotra,result_data.matrimonial_sub_gotra,result_data.matrimonial_id,req.query.user_id,result_data.matrimonial_id,req.query.user_id], function(error, results_rating, fields) {
                                if (error) throw error;
                                if (results_rating[0].length > 0) {
                                   result_data.matrimonial_religion=results_rating[0][0];
                                }else{
                                    result_data.matrimonial_religion={}
                                }
                                  if (results_rating[1].length > 0) {
                                   result_data.matrimonial_main_gotra=results_rating[1][0];
                                }else{
                                    result_data.matrimonial_main_gotra={}
                                }
                                  if (results_rating[2].length > 0) {
                                   result_data.matrimonial_sub_gotra=results_rating[2][0];
                                }else{
                                    result_data.matrimonial_sub_gotra={}
                                }
                                       if (results_rating[3].length > 0) {
                                   result_data.shortlisted_flag=1;
                                }else{
                                    result_data.shortlisted_flag=0;
                                }
                                 result_data.visited_count=results_rating[4][0].numofrows;
                              final_array.push(result_data);
                                if (idx === array.length - 1) {
                                    setTimeout(function() {
                                    if (final_array.length > 0) {
                                            return res.status(200).send({
                                                status: 200,
                                                msg: "Success",
                                                matrimonialUserDetails: final_array[0],
                                            });
                                    } else {
                                        return res.status(404).send({
                                            status: 404,
                                            msg: "No matching records found.",
                                                matrimonialUserDetails: [],
                                                

                                        });
                                    }
                                    }, 100);
                                }
                            });
                });
            } else {
                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                                                matrimonialUserDetails: [],

                });
            }
        });
}else{
   return res.status(404).send({
        status: 404,
        msg: "Record not found",
        matrimonialUserDetails: [],

                }); 
}

	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_matrimonial_occupation = async (req, res) => {
	try {
    db.query(`SELECT *  from tbl_matrimonial_occupation`,[], function(error, results1, fields) {
        if (error) throw error;
        if (results1.length > 0 ) {
            return res.status(200).send({
                status: 200,
                msg: "Success",
                matrimonialOccupationListCount: results1.length,
                matrimonialOccupationList: results1
            });
        } else {

            return res.status(404).send({
                status: 404,
                msg: "Record not found",
                matrimonialOccupationListCount:0,
                matrimonialOccupationList: []
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
exports.get_matrimonial_religion = async (req, res) => {
	try {
    db.query(`SELECT *  from tbl_matrimonial_religion`,[], function(error, results1, fields) {
        if (error) throw error;
        if (results1.length > 0 ) {
            return res.status(200).send({
                status: 200,
                msg: "Success",
                matrimonialReligionListCount: results1.length,
                matrimonialReligionList: results1
            });
        } else {

            return res.status(404).send({
                status: 404,
                msg: "Record not found",
                matrimonialReligionListCount:0,
                matrimonialReligionList: []
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
exports.get_matrimonial_main_gotra = async (req, res) => {
	try {
    if (req.query.religion_id) {
        db.query(`SELECT * FROM tbl_matrimonial_main_gotra WHERE matrimonial_religion_id = ?`, [req.query.religion_id], function(error, results1, fields) {
            if (error) throw error;
            if (results1.length > 0) {
                return res.status(200).send({
                    status: 200,
                    msg: "Success",
                    mainGotraListCount: results1.length,
                    mainGotraList: results1
                });
            } else {

                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                    mainGotraListCount:0,
                    mainGotraList:[]
                });
            }
        });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
             mainGotraListCount:0,
                    mainGotraList:[]
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_matrimonial_sub_gotra = async (req, res) => {
	try {
    if (req.query.main_gotra_id) {
        db.query(`SELECT * FROM tbl_matrimonial_sub_gotra WHERE main_gotra_id = ?`, [req.query.main_gotra_id], function(error, results1, fields) {
            if (error) throw error;
            if (results1.length > 0) {
                return res.status(200).send({
                    status: 200,
                    msg: "Success",
                    subGotraListCount: results1.length,
                    subGotraList: results1
                });
            } else {

                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                    subGotraListCount:0,
                    subGotraList:[]
                });
            }
        });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
             subGotraListCount:0,
             subGotraList:[]
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_matrimonial_shortlisted = async (req, res) => {
	try {
    if (req.query.user_id) {
        db.query(`SELECT tbl_matrimonial.matrimonial_user_id as user_id,tbl_matrimonial.matrimonial_id,tbl_matrimonial.matrimonial_name,tbl_matrimonial.user_name,tbl_matrimonial.matrimonial_images,tbl_matrimonial.user_profile_image,tbl_matrimonial.matrimonial_religion,tbl_matrimonial.matrimonial_main_gotra,tbl_matrimonial.matrimonial_user_qualification,tbl_matrimonial.matrimonial_occupation,tbl_matrimonial.matrimonial_state,tbl_matrimonial.matrimonial_age FROM tbl_matrimonial_shortlisted inner join tbl_matrimonial on tbl_matrimonial.matrimonial_id=tbl_matrimonial_shortlisted.matrimonial_id WHERE tbl_matrimonial_shortlisted.user_id=? order by 1 desc;SELECT count(*) as numofusers FROM tbl_matrimonial_shortlisted inner join tbl_matrimonial on tbl_matrimonial.matrimonial_id=tbl_matrimonial_shortlisted.matrimonial_id WHERE  tbl_matrimonial_shortlisted.user_id=? and date(tbl_matrimonial_shortlisted.created_date) = CURDATE()`, [req.query.user_id,req.query.user_id], function(error, results1, fields) {
            if (error) throw error;
            if (results1[0].length > 0) {
                return res.status(200).send({
                    status: 200,
                    msg: "Success",
                    todaysShortListedCounts:results1[1][0].numofusers,
                    shortlistedListCount: results1[0].length,
                     shortlistedList:results1[0]
                
                   
                });
            } else {

                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                    todaysShortListedCounts:0,
                    shortlistedListCount:0,
                    shortlistedList:[]
                });
            }
        });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
             todaysShortListedCounts:0,
             shortlistedListCount:0,
             shortlistedList:[]
        });
    }

	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.add_matrimonial_shortlisted = async (req, res) => {
	try {
    let upload = multer({
        storage: matrimonial,
    }).fields([{
        name: 'user_profile_image',
        maxCount: 1
    }
    ]);
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail",
                 shortlisted_id:0
            });
        } else {
            if (req.body.user_id) {
  db.query(`SELECT * FROM  tbl_matrimonial_shortlisted where user_id=? and matrimonial_id=?`,[req.body.user_id,req.body.matrimonial_id], function(error, results78, fields) {
                        if (error) {
                            return res.status(400).send({
                                status: 400,
                                msg: "fail",
                                shortlisted_id:0
                            });
                        } else {
                            if(results78.length<=0){
                    db.query(`INSERT INTO tbl_matrimonial_shortlisted SET ?`, req.body, function(error, results, fields) {
                        if (error) {
                            return res.status(400).send({
                                status: 400,
                                msg: "fail",
                                shortlisted_id:0
                            });
                        } else {
                            return res.status(200).send({
                                status: 200,
                                msg: "Success",
                                shortlisted_id:results.insertId
                            });
                        }
                    });
                            }else{
                                   return res.status(400).send({
                    status: 400,
                    msg: "Record already exists.",
                     shortlisted_id:0
                }); 
                            }
                        }
  });
                
            } else {
                return res.status(400).send({
                    status: 400,
                    msg: "fail",
                     shortlisted_id:0
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
exports.add_matrimonial_report = async (req, res) => {
	try {
    let upload = multer({
        storage: matrimonial,
    }).fields([{
        name: 'user_profile_image',
        maxCount: 1
    }
    ]);
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail",
                 matrimonial_report_id:0
            });
        } else {
            if (req.body.matrimonial_id) {
                    db.query(`INSERT INTO tbl_matrimonial_report SET ?`, req.body, function(error, results, fields) {
                        if (error) {
                            return res.status(400).send({
                                status: 400,
                                msg: "fail",
                                matrimonial_report_id:0
                            });
                        } else {
                            return res.status(200).send({
                                status: 200,
                                msg: "Success",
                                matrimonial_report_id:results.insertId
                            });
                        }
                    });
         
                            } else {
                return res.status(400).send({
                    status: 400,
                    msg: "fail",
                     shortlisted_id:0
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
exports.add_matrimonial_visited = async (req, res) => {
	try {
    db.query(`select * from tbl_matrimonial_visited where matrimonial_who_visited = ? and matrimonial_on_visited = ? and matrimonial_id = ?`, [req.body.matrimonial_who_visited,req.body.matrimonial_on_visited,req.body.matrimonial_id], function(error, available, fields) {
        
        if(available.length>0){
            
      //   var json = JSON.parse(req.body);
      //json.push('created_date: ' + "");  
            req.body["created_date"]= "";
            db.query(`UPDATE tbl_matrimonial_visited SET ? where matrimonial_who_visited = ? and matrimonial_on_visited = ? and matrimonial_id = ?`, [req.body,req.body.matrimonial_who_visited,req.body.matrimonial_on_visited,req.body.matrimonial_id], function(error, results_update, fields) {
                            if (error) {
                       return res.status(400).send({
                                status: 400,
                                msg: "fail1",
                            });
                            } else {
                                return res.status(200).send({
                                status: 200,
                                msg: "Success",
                                //new1: req.body;
                            });
                            }
                        });
            
    
        }else{
            
       if (req.body.matrimonial_id) {
                    db.query(`INSERT INTO tbl_matrimonial_visited SET ?`, req.body, function(error, results, fields) {
                        if (error) {
                            return res.status(400).send({
                                status: 400,
                                msg: "fail1",
                                matrimonial_visited_id:0
                            });
                        } else {
                            return res.status(200).send({
                                status: 200,
                                msg: "Success",
                                matrimonial_visited_id:results.insertId
                            });
                        }
                    });
         
                            } else {
                return res.status(400).send({
                    status: 400,
                    msg: "fail2",
                    bodyData: req.body,
                     matrimonial_visited_id:0
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
exports.get_matrimonial_visited = async (req, res) => {
	try {
    if (req.query.user_id) {
     db.query(`SELECT tbl_matrimonial.matrimonial_user_id as user_id,tbl_matrimonial.matrimonial_id,tbl_matrimonial.matrimonial_name,tbl_matrimonial.user_name,tbl_matrimonial.matrimonial_images,tbl_matrimonial.user_profile_image,tbl_matrimonial.matrimonial_religion,tbl_matrimonial.matrimonial_main_gotra,tbl_matrimonial.matrimonial_user_qualification,tbl_matrimonial.matrimonial_occupation,tbl_matrimonial.matrimonial_state,tbl_matrimonial.matrimonial_age FROM tbl_matrimonial_visited inner join tbl_matrimonial on tbl_matrimonial.matrimonial_id=tbl_matrimonial_visited.matrimonial_id WHERE tbl_matrimonial_visited.matrimonial_on_visited=? order by 1 desc;SELECT count(*) as numofusers FROM tbl_matrimonial_visited inner join tbl_matrimonial on tbl_matrimonial.matrimonial_id=tbl_matrimonial_visited.matrimonial_id WHERE tbl_matrimonial_visited.matrimonial_on_visited=? and date(tbl_matrimonial_visited.created_date) = CURDATE()`, [req.query.user_id,req.query.user_id], function(error, results1, fields) {
         if (error) throw error;
         if (results1[0].length > 0) {
             return res.status(200).send({
                 status: 200,
                 msg: "Success",
                 todaysVisitedCount:results1[1][0].numofusers,
                 visitedlistedListCount: results1[0].length,
                 visitedlistedList: results1[0]
             });
         } else {
             return res.status(404).send({
                 status: 404,
                 msg: "Record not found",
                 todaysVisitedCount:0,
                 visitedlistedListCount:0,
                 visitedlistedList:[]
             });
         }
     });
 } else {
     return res.status(400).send({
         status: 400,
         msg: "fail",
         todaysVisitedCount:0,
         visitedlistedListCount:0,
         visitedlistedList:[]
     });
 }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.delete_shortlisted = async (req, res) => {
	try {
    let upload = multer({
        storage: matrimonial,
    }).fields([{
        name: 'user_profile_image',
        maxCount: 1
    }
    ]);
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail"
            });
        } else {
            if (req.body.matrimonial_id && req.body.user_id) {
                    db.query(`delete from tbl_matrimonial_shortlisted WHERE user_id= ? and matrimonial_id=?`,[req.body.user_id,req.body.matrimonial_id], function(error, results, fields) {
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
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.matrimonial_like = async (req, res) => {
	try {
    if (req.query.matrimonial_like_user_id,req.query.matrimonial_id ) {
                         db.query(`SELECT * FROM tbl_matrimonial where matrimonial_user_id=?;`, [req.query.matrimonial_like_user_id], function(error, results4141, fields) {
            if (error) throw error;
            if (results4141.length > 0) {
                //req.query.matrimonial_id=results4141[0].matrimonial_id;
        db.query(`select * From tbl_matrimonial_like where matrimonial_like_user_id= ? and matrimonial_id=?; select * From tbl_matrimonial where matrimonial_id= ?`, [req.query.matrimonial_like_user_id, req.query.matrimonial_id, req.query.matrimonial_id], function(error, results, fields) {
            if (error) {
                return res.status(400).send({
                    status: 400,
                    msg: "fail"
                });
            } else {
                if (req.query.flag == 1) {
                    if (results[0].length <= 0) {
                        if (results[1].length > 0) {
                            var count = results[1][0].like_count + 1;
                            var d = {
                                like_count: count
                            };
                            db.query(`UPDATE tbl_matrimonial SET ? where matrimonial_id= ?`, [d, req.query.matrimonial_id], function(error, results_update, fields) {
                                if (error) {

                                } else {}
                            });
                            delete(req.query.flag);
                            db.query(`INSERT INTO tbl_matrimonial_like SET ?`,req.query , function(error, results, fields) {
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
                                msg: 'fail',
                                 count:0
                            });
                        }
                    } else {
                        return res.status(200).send({
                            status: 200,
                            msg: "Success",
                            count: (results[1].length > 0) ? results[1][0].like_count : 0
                        });
                    }
                } else {
                    if (results[1].length > 0) {
                        var count = 0;
                        if (results[1][0].like_count > 0) {
                            count = results[1][0].like_count - 1;
                        }
                        var d = {
                            like_count: count
                        };
                        db.query(`UPDATE tbl_matrimonial SET ? where matrimonial_id= ?`, [d, req.query.matrimonial_id], function(error, results_update, fields) {
                            if (error) {

                            } else {}
                        });
                        db.query(`DELETE from tbl_matrimonial_like where matrimonial_id=? and matrimonial_like_user_id = ?`, [req.query.matrimonial_id, req.query.matrimonial_like_user_id], function(error, results, fields) {
                            if (error) {
                                return res.status(400).send({
                                    status: 400,
                                    msg: "fail",
                                     count:0
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
                            msg: 'fail',
                             count:0
                        });
                    }
                }
            }
        });

    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
             count:0
        });
    }
                         });

    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
             count:0
        });
    }

	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.check_matrimonial_profile_exists = async (req, res) => {
	try {
    if (req.query.user_id) {
        db.query(`SELECT * FROM tbl_matrimonial WHERE matrimonial_user_id = ? `, [req.query.user_id], function(error, results1, fields) {
            if (error) {
                return res.status(200).send({
                    status: 200,
                    msg: "Success",
                    profileExists:0
                }); 
            }else{
            if (results1.length > 0) {
                return res.status(200).send({
                    status: 200,
                    msg: "Success",
                    profileExists:1
                });
            } else {

                return res.status(200).send({
                    status: 200,
                    msg: "Success",
                    profileExists:0
                });
            }
            }
        });
    } else {
       return res.status(200).send({
                    status: 200,
                    msg: "Success",
                    profileExists:0
                });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.matrimonial_block = async (req, res) => {
	try {
    if (req.query.matrimonial_user_id && req.query.flag && req.query.matrimonial_id) {
         var d = (req.query.matrimonial_user_id).split(",");
        console.log(d.length);
        let i = 0
        var flag =req.query.flag;
         d.forEach(function(element111, index11) {
            req.query.matrimonial_user_id=element111;
                  db.query(`SELECT * FROM tbl_matrimonial where matrimonial_user_id=?;`, [element111], function(error, results4141, fields) {
            if (error) throw error;
            if (results4141.length > 0) {
               /// req.query.matrimonial_id=results4141[0].matrimonial_id;
        db.query(`select * From tbl_matrimonial_block where matrimonial_user_id= ? and matrimonial_id=?; select * From tbl_matrimonial where matrimonial_id= ?`, [element111, results4141[0].matrimonial_id, results4141[0].matrimonial_id], function(error, results, fields) {
            if (error) {
                 if (index11==d.length-1) {
                return res.status(400).send({
                    status: 400,
                    msg: "fail0"
                });
                 }
                
            } else {
                if (flag == 1) {
                    if (results[0].length <= 0) {
                            delete(req.query.flag);
                            db.query(`INSERT INTO tbl_matrimonial_block SET ?`, req.query, function(error, results, fields) {
                                if (error) {
                                     if (index11==d.length-1) {
                                    return res.status(400).send({
                                        status: 400,
                                        msg: "fail9"
                                    });
                                     }
                                    
                                } else {
                                    if (index11==d.length-1) {
                                    return res.status(200).send({
                                        status: 200,
                                        msg: "Success"
                                    });
                                    }
                                    
                                }
                            });
                    } else {
                       if (index11==d.length-1) {
                        return res.status(200).send({
                            status: 200,
                            msg: "Success"
                        });
                       }
                    }
                } else {
                    if (results[1].length > 0) {
                        ///  results4141[0].matrimonial_id, element111
                        db.query(`DELETE from tbl_matrimonial_block where matrimonial_id=? and matrimonial_user_id = ?`, [req.query.matrimonial_id, req.query.matrimonial_user_id], function(error, results, fields) {
                            if (error) {
                               
                                return res.status(400).send({
                                    status: 400,
                                    msg: "fail4"
                                });
                                
                            } else {
                                if (index11==d.length-1) {
                                return res.status(200).send({
                                    status: 200,
                                    msg: "Success22",
                                    test1: req.query
                                });
                                }
                            }
                        });

                    } else {
                        if (index11==d.length-1) {
                        return res.status(400).send({
                            status: 400,
                            msg: 'fail6',
                        });
                        }
                    }
                }
            }
        });

    } else {
        if (index11==d.length-1) {
        return res.status(400).send({
            status: 400,
            msg: "fail4"
        });
        }
    }
                  });
                   
});
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail3"
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_matrimonial_like = async (req, res) => {
	try {
    if (req.query.user_id) {
     db.query(`SELECT tbl_matrimonial.matrimonial_user_id as user_id,tbl_matrimonial.matrimonial_id,tbl_matrimonial.matrimonial_name,tbl_matrimonial.user_name,tbl_matrimonial.matrimonial_images,tbl_matrimonial.user_profile_image,tbl_matrimonial.matrimonial_religion,tbl_matrimonial.matrimonial_main_gotra,tbl_matrimonial.matrimonial_user_qualification,tbl_matrimonial.matrimonial_occupation,tbl_matrimonial.matrimonial_state,tbl_matrimonial.matrimonial_age FROM tbl_matrimonial_like inner join tbl_matrimonial on tbl_matrimonial.matrimonial_id=tbl_matrimonial_like.matrimonial_id WHERE tbl_matrimonial_like.matrimonial_like_user_id=? order by 1 desc;
     SELECT count(*) as numofusers FROM tbl_matrimonial_like inner join tbl_matrimonial on tbl_matrimonial.matrimonial_id=tbl_matrimonial_like.matrimonial_id WHERE tbl_matrimonial_like.matrimonial_like_user_id=? and date(tbl_matrimonial_like.created_date) = CURDATE()`, [req.query.user_id,req.query.user_id], function(error, results1, fields) {
         if (error) throw error;
         if (results1[0].length > 0) {
             return res.status(200).send({
                 status: 200,
                 msg: "Success",
                 todayslikedCount:results1[1][0].numofusers,
                 likedListCount: results1[0].length,
                likedList: results1[0]
             });
         } else {
             return res.status(404).send({
                 status: 404,
                 msg: "Record not found",
                 todayslikedCount:0,
                likedListCount:0,
                likedList:[]
             });
         }
     });
 } else {
     return res.status(400).send({
         status: 400,
         msg: "fail",
         todayslikedCount:0,
        likedListCount:0,
        likedList:[]
     });
 }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_matrimonial_like2 = async (req, res) => {
	try {
var final_array = [];
if (req.query.user_id) {
    
    db.query(`SELECT matrimonial_id as m_id FROM tbl_matrimonial WHERE matrimonial_user_id=?`, [req.query.user_id], function(error, results1, fields) {
        if (error) throw error;
       
         if (results1.length === 0) {
             return res.status(404).send({
                status: 404,
                 msg: "Record not found",
                 todayslikedCount:0,
                likedListCount:0,
                likedList:[]
                 
             });
         } 
        
    db.query(`SELECT matrimonial_like_user_id as user_id FROM tbl_matrimonial_like WHERE matrimonial_id = ?;SELECT count(*) as numofusers FROM tbl_matrimonial_like inner join tbl_matrimonial on tbl_matrimonial.matrimonial_id=tbl_matrimonial_like.matrimonial_id WHERE tbl_matrimonial_like.matrimonial_id=? and date(tbl_matrimonial_like.created_date) = CURDATE()`, [results1[0].m_id,results1[0].m_id], function(error, results, fields) {
        if (error) {
              return res.status(200).send({
                 status: 404,
                 msg: error,
                 
             });
         };
        if (results[0].length > 0) {
            var todaydayCount = results[1][0].numofusers;
            Object.keys(results[0]).forEach(function(key, idx, array) {
                var result = results[0][key];
                db.query(`SELECT * FROM tbl_matrimonial WHERE matrimonial_user_id = ?`, [result.user_id], function(err, rows, fields) {
                    if (err) {
                        return res.status(400).send({
                            status: 404,
                 msg: "Record not found",
                 todayslikedCount:0,
                likedListCount:0,
                likedList:[]
                        });
                    } else {
                        if (rows.length > 0) {
                            result.matrimonial_like_user_id = rows[0].matrimonial_like_user_id;
                            result.matrimonial_id = rows[0].matrimonial_id;
                            result.matrimonial_name = rows[0].matrimonial_name;
                            result.user_name = rows[0].user_name;
                            result.matrimonial_images = rows[0].matrimonial_images;
                            result.user_profile_image = rows[0].user_profile_image;
                            result.matrimonial_religion = rows[0].matrimonial_religion;
                            result.matrimonial_main_gotra = rows[0].matrimonial_main_gotra;
                            result.matrimonial_user_qualification = rows[0].matrimonial_user_qualification;
                            result.matrimonial_occupation = rows[0].matrimonial_occupation;
                            result.matrimonial_state = rows[0].matrimonial_state;
                            result.matrimonial_age = rows[0].matrimonial_age;
                            
                        } else {
                           result.matrimonial_like_user_id = '';
                            result.matrimonial_id = '';
                            result.matrimonial_name ='';
                            result.user_name ='';
                            result.matrimonial_images = '';
                            result.user_profile_image = '';
                            result.matrimonial_religion = '';
                            result.matrimonial_main_gotra = '';
                            result.matrimonial_user_qualification = '';
                            result.matrimonial_occupation = '';
                            result.matrimonial_state = '';
                            result.matrimonial_age ='';
                        }
                        
                        final_array.push(result);
                        if (idx === array.length - 1) {
                            return res.status(200).send({
                                 status: 200,
                                 msg: "Success",
                                todayslikedCount:todaydayCount,
                                likedListCount: final_array.length,
                                likedList: final_array.reverse(),
                            });
                        }
                    }
                });
            });

        } else {
            return res.status(404).send({
               status: 404,
                 msg: "Record not found",
                 todayslikedCount:0,
                likedListCount:0,
                likedList:[]
            });
        }
    });
  });

  } else {
     return res.status(400).send({
         status: 400,
         msg: "fail",
         todayslikedCount:0,
        likedListCount:0,
        likedList:[]
     });
 } 
    
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_matrimonial_block = async (req, res) => {
	try {
    if (req.query.user_id) {
     db.query(`SELECT tbl_matrimonial.matrimonial_user_id as user_id,tbl_matrimonial.matrimonial_id,tbl_matrimonial.matrimonial_name,tbl_matrimonial.user_name,tbl_matrimonial.matrimonial_images,tbl_matrimonial.user_profile_image,tbl_matrimonial.matrimonial_religion,tbl_matrimonial.matrimonial_main_gotra,tbl_matrimonial.matrimonial_user_qualification,tbl_matrimonial.matrimonial_occupation,tbl_matrimonial.matrimonial_state,tbl_matrimonial.matrimonial_age FROM tbl_matrimonial_block inner join tbl_matrimonial on tbl_matrimonial.matrimonial_id=tbl_matrimonial_block.matrimonial_id WHERE tbl_matrimonial_block.matrimonial_user_id=? order by 1 desc;SELECT count(*) as numofusers FROM tbl_matrimonial_block inner join tbl_matrimonial on tbl_matrimonial.matrimonial_id=tbl_matrimonial_block.matrimonial_id WHERE tbl_matrimonial_block.matrimonial_user_id=? and date(tbl_matrimonial_block.created_date) = CURDATE()`, [req.query.user_id,req.query.user_id], function(error, results1, fields) {
         if (error) throw error;
         if (results1[0].length > 0) {
             return res.status(200).send({
                 status: 200,
                 msg: "Success",
                 todaysBlockedCount:results1[1][0].numofusers,
                 blockedListCount: results1[0].length,
                blockedList: results1[0]
             });
         } else {
             return res.status(404).send({
                 status: 404,
                 msg: "Record not found",
                 todaysBlockedCount:0,
                blockedListCount:0,
                blockedList:[]
             });
         }
     });
 } else {
     return res.status(400).send({
         status: 400,
         msg: "fail",
         todaysBlockedCount:0,
        blockedListCount:0,
        blockedList:[]
     });
 }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
