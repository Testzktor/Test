const fastify = require('fastify')({
	logger: true
});
const db = require("../../config/connection");
const middleware = require("../../middleware/authentication");
var bodyParser = require('body-parser');
exports.work_list = async (req, res) => {
	try {
         var id  = req.params.id;
        db.query(`SELECT count(*) totalRecords from tbl_works where user_id = ?`,[req.params.id] ,function (error, results, fields) {
        if (error) throw error;
        var pagination=[];
        if(results[0].totalRecords>0)
        {
          db.query('SELECT * ,CONVERT(work_id, NCHAR) as work_id from tbl_works where user_id = "'+id+'" ' ,function (error, results1, fields) {
            if (error) throw error;
            let pagination=[]
            results1[0].work_id= results1[0].work_id.toString();
            res.send({ status: 200, msg: "Success", workList: results1 });

          });
        }
        else{
        res.send({ status: 404, msg: "No Record Found",workList: []});
        }

      });
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.work_delete = async (req, res) => {
	try {
    if(!req.params.id){
        return res.status(400).send({ status: 400, msg: "fail"});}else{
     db.query(`SELECT count(*) totalRecords from tbl_works where work_id = ?`,[req.params.id] ,function (error, results, fields) {
      if (error) throw error;
      if(results[0].totalRecords>0)
      {
        db.query(`DELETE FROM tbl_works WHERE work_id= '${req.params.id}'` ,function (error, results1, fields) {
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

exports.work_insert = async (req, res) => {
	try {
    if(req.body.user_id){
        //res.send(req.query.user_id);
         db.query(`SET SQL_MODE = ''; INSERT INTO tbl_works SET ?`, req.body ,function (error, results, fields) {
          if (error){ return res.status(400).send({ status: 400, msg: "fail"});}else {
             return res.status(200).send({ status: 200, msg: "Success", work_id:results.insertId });     }
        });

    }else{
       return res.status(400).send({ status: 400, msg: "fail",work_id:0});
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.work_update = async (req, res) => {
	try {
    if(req.body.work_id){
          db.query(`SELECT count(*) totalRecords from tbl_works where work_id = ?`,[req.body.work_id] ,function (error, results1, fields) {
      if (error) throw error;
      if(results1[0].totalRecords>0)
      {
          var work_id =req.body.work_id;
          delete req.body.work_id;
         db.query(`UPDATE tbl_works SET ? where work_id = ?`, [req.body,work_id] ,function (error, results, fields) {
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
