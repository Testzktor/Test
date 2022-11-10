const fs = require('fs');
const db = require("../../config/connection");
const middleware = require("../../middleware/authentication");
const {
	getVideoDurationInSeconds
} = require('get-video-duration')
var bodyParser = require('body-parser');
const full = require("../USER/userFullProfile");
const multer = require('multer');
const crypto = require("crypto");

var document = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, '../uploads/document/');
	},
	filename: function(req, file, cb) {
		cb(null, "document_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
	}
});
exports.add_travelling = async (req, res) => {
	let upload = multer({
		storage: document,
	}).single('');
	upload(req, res, function(err) {
		if (err) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			if (req.body.travelling_user_id) {
				db.query(`SET SQL_MODE = ''; INSERT INTO tbl_travelling_place SET ?`, req.body, function(error, results, fields) {
					if (error) {
						return res.status(400).send({
							status: 400,
							msg: "fail"
						});
					} else {
						console.log(results);
						return res.status(200).send({
							status: 200,
							msg: "Success",
							travellingPlaceId: results.insertId
						});
					}
				});
			} else {
				return res.status(400).send({
					status: 400,
					msg: "fail",
					travellingPlaceId: 0
				});
			}
		}
	});
};
exports.get_travelling = async (req, res) => {
	if (req.query.user_id) {
		{

			db.query(`SELECT * From tbl_travelling_place where travelling_user_id = ? AND travelling_delete_status=? `, [req.query.user_id, '0'], function(error, results, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					if (results.length > 0) {
						return res.status(200).send({
							status: 200,
							msg: "Success",
							travellingList: results
						});
					} else {
						return res.status(404).send({
							status: 404,
							msg: "Record not found",
							travellingList: []
						});
					}
				}
			});
		}
	} else {
		return res.status(400).send({
			status: 400,
			msg: "fail1",
			travellingList: []
		});
	}

};
exports.delete_travelling_list = async (req, res) => {
	if (req.query.user_id) {
		db.query(`SELECT *  from tbl_travelling_place where travelling_user_id = ? AND travelling_delete_status =?`, [req.query.user_id, '0'], function(error, results1, fields) {
			if (error) throw error;

			if (results1.length > 0) {
				db.query(`update tbl_travelling_place SET travelling_delete_status =? where travelling_user_id = ?`, ['1', req.query.user_id], function(error, results, fields) {
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
				return res.status(409).send({
					status: 409,
					msg: "Record not found"
				});
			}
		});
	} else {
		return res.status(400).send({
			status: 400,
			msg: "fail"
		});
	}

};
exports.delete_travelling_record = async (req, res) => {
	if (req.query.travelling_id) {

		db.query(`SELECT *  from tbl_travelling_place where travelling_id = ? AND travelling_delete_status =?`, [req.query.travelling_id, '0'], function(error, results1, fields) {
			if (error) {
				return res.status(400).send({
					status: 400,
					msg: "fail"
				});
			} else {
				if (results1.length > 0) {
					db.query(`update tbl_travelling_place SET travelling_delete_status =? where travelling_id = ?`, ['1', req.query.travelling_id], function(error, results, fields) {
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
					return res.status(409).send({
						status: 409,
						msg: "Record not found"
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

};