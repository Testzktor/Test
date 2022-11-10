const fastify = require('fastify')({
	logger: true
});
const db = require("../../config/connection");
const middleware = require("../../middleware/authentication");
var bodyParser = require('body-parser');
var timeAgo = require('node-time-ago');
exports.notification_count = async (req, res) => {
	try {
        if(!req.params.id){ return res.status(400).send({ status: 400, msg: "fail"});}else{
     db.query(`SELECT IFNULL(SUM(IF(notification_action = '0', 1, 0)),0) AS zero, IFNULL(SUM(IF(notification_action = '1', 1, 0)),0) AS one, IFNULL(SUM(IF(notification_action = '2', 1, 0)),0) AS two FROM tbl_notification where notification_user_id= ?`,[req.params.id] ,function (error, results, fields) {
      if (error) throw error;
      if(results.length>0)
      {
             return res.status(200).send({ status: 200, msg: "Success", notificationTotalCount: results[0].one+results[0].zero,notificationUnreadCount:results[0].zero,notificationReadCount:results[0].one });     
      }else{
      return res.status(404).send({ status: 404, msg: "No Record Found"});
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
exports.notification_list = async (req, res) => {
	try {
    var final=[];
        if(!req.params.id){ return res.status(400).send({ status: 400, msg: "fail"});}else{
     db.query(`SELECT * from tbl_notification where notification_user_id = ?`,[req.params.id] ,function (error, results, fields) {
      if (error) throw error;
      if(results.length>0)
      {    Object.keys(results).forEach(function(key, idx1, array1) {
                        var result_file =results[key];
                        result_file.notification_ago= timeAgo(new Date(result_file.created_date).toISOString());
                        final.push(result_file);
                           if (idx1 === array1.length - 1) {
             return res.status(200).send({ status: 200, msg: "Success", notificationList: results.reverse() }); 
                           }
      });
      }else{
      return res.status(404).send({ status: 404, msg: "No Record Found",notificationList:[]});
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
exports.notification_delete = async (req, res) => {
	try {
    if(!req.params.id){ 
        return res.status(400).send({ status: 400, msg: "fail"});}else{
     db.query(`SELECT count(*) totalRecords from tbl_notification where notification_id = ?`,[req.params.id] ,function (error, results, fields) {
      if (error) throw error;
      if(results[0].totalRecords>0)
      {
        db.query(`DELETE FROM tbl_notification WHERE notification_id= '${req.params.id}'` ,function (error, results1, fields) {
          if (error) throw error;  
             return res.status(200).send({ status: 200, msg: "Success" });     
        });   
      }else{
       return res.status(404).send({ status: 404, msg: "No Record Found"});
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
exports.notification_create = async (req, res) => {
	try {
    
    if(req.body.notification_user_id){
        //res.send(req.body.notification_user_id);
         db.query(`SET SQL_MODE = ''; INSERT INTO tbl_notification SET ?`, req.body ,function (error, results, fields) {
          if (error){ return res.status(400).send({ status: 400, msg: "fail"});}else {
             return res.status(200).send({ status: 200, msg: "Success" , notification_id:results.insertId});     }
        }); 
        
    }else{
       return res.status(400).send({ status: 400, msg: "fail",notification_id:0}); 
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.notification_update = async (req, res) => {
	try {
    if(req.body.notification_id){
          db.query(`SELECT count(*) totalRecords from tbl_notification where notification_id = ?`,[req.body.notification_id] ,function (error, results1, fields) {
      if (error) throw error;
      if(results1[0].totalRecords>0)
      {
          var notification_id =req.body.notification_id;
          delete req.body.notification_id;
         db.query(`UPDATE tbl_notification SET ? where notification_id = ?`, [req.body,notification_id] ,function (error, results, fields) {
          if (error){ return res.status(400).send({ status: 400, msg: "fail"});}else {
             return res.status(200).send({ status: 200, msg: "Success"});     
         }
        });
      }else{
         return res.status(404).send({ status: 404, msg: "No Record Found"});
      }
      });
    }else {
       return res.status(400).send({ status: 400, msg: "fail"}); 
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
