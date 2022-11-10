const fastify = require('fastify')({
	logger: true
});
const db = require("../../config/connection");
const middleware = require("../../middleware/authentication");
var bodyParser = require('body-parser');

exports.language_list = async (req, res) => {
	try {
    if(!req.params.id){ return res.status(400).send({ status: 400, msg: "fail"});}else{
     db.query(`SELECT count(*) totalRecords from tbl_languages where user_id = ?`,[req.params.id] ,function (error, results, fields) {
      if (error) throw error;
      if(results[0].totalRecords>0)
      {
        db.query(`SELECT * ,CONVERT(language_id, NCHAR) as language_id from tbl_languages where user_id = '${req.params.id}'` ,function (error, results1, fields) {
          if (error) throw error;
             return res.status(200).send({ status: 200, msg: "Success", languageList: results1 });
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
exports.language_delete = async (req, res) => {
	try {
    if(!req.params.id){
        return res.status(400).send({ status: 400, msg: "fail"});}else{
     db.query("SELECT count(*) totalRecords from tbl_languages where language_id = ?",[req.params.id] ,function (error, results, fields) {
      if (error) throw error;
      if(results[0].totalRecords>0)
      {
        db.query(`DELETE FROM tbl_languages WHERE language_id= '${req.params.id}'` ,function (error, results1, fields) {
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
exports.language_insert = async (req, res) => {
	try {
    if(req.body.user_id){
        //res.send(req.query.user_id);
         db.query(`SET SQL_MODE = ''; INSERT INTO tbl_languages SET ?`, req.body ,function (error, results, fields) {
          if (error){ return res.status(400).send({ status: 400, msg: "fail"});}else {
             return res.status(200).send({ status: 200, msg: "Success", language_id:results.insertId});     }
        });

    }else{
       return res.status(400).send({ status: 400, msg: "fail"});
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.language_update = async (req, res) => {
	try {
    if(req.body.language_id){
          db.query(`SELECT count(*) totalRecords from tbl_languages where language_id = ?`,[req.body.language_id] ,function (error, results1, fields) {
      if (error) throw error;
      if(results1[0].totalRecords>0)
      {
          var language_id =req.body.language_id;
          delete req.body.language_id;
         db.query(`UPDATE tbl_languages SET ? where language_id = ?`, [req.body,language_id] ,function (error, results, fields) {
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
