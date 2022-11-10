const db = require("../../config/connection");
const middleware = require("../../middleware/authentication");
exports.education_list = async (req, res) => {
	try {
		db.query('SELECT count(*) totalRecords from tbl_education', function(error, results, fields) {
			if (error) throw error;
			var pagination = [];
			if (results[0].totalRecords > 0) {
				db.query(`SELECT *,CONVERT(education_id, NCHAR) as education_id from tbl_education where user_id = ?`, [req.params.id], function(error, results1, fields) {
					if (error) {
						res.send({
							status: 404,
							msg: "fail"
						});
					} else {
						if (results1.length > 0) {

							results1[0].education_id = results1[0].education_id.toString();
							res.send({
								status: 200,
								msg: "Success",
								educationList: results1
							});
						} else {
							res.send({
								status: 404,
								msg: "No Record Found",
								educationList: []
							});
						}
					}
				});
			} else {
				res.send({
					status: 404,
					msg: "No Record Found",
					educationList: []
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
exports.education_delete = async (req, res) => {
	try {
		if (!req.params.id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`SELECT count(*) totalRecords from tbl_education where education_id = ?`, [req.params.id], function(error, results, fields) {
				if (error) throw error;
				if (results[0].totalRecords > 0) {
					db.query(`DELETE FROM tbl_education WHERE education_id= '${req.params.id}'`, function(error, results1, fields) {
						if (error) throw error;
						return res.status(200).send({
							status: 200,
							msg: "Success"
						});
					});
				} else {
					return res.status(404).send({
						status: 404,
						msg: "No Record Found"
					});
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
exports.education_insert = async (req, res) => {
	try {
		if (req.body.user_id) {
			//res.send(req.query.user_id);
			db.query(`SET SQL_MODE = ''; INSERT INTO tbl_education SET ?`, req.body, function(error, results, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					return res.status(200).send({
						status: 200,
						msg: "Success",
						education_id: results.insertId
					});
				}
			});

		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail",
				education_id: []
			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.education_update = async (req, res) => {
	try {
		if (req.body.education_id) {
			db.query(`SELECT count(*) totalRecords from tbl_education where education_id = ?`, [req.body.education_id], function(error, results1, fields) {
				if (error) throw error;
				if (results1[0].totalRecords > 0) {
					var education_id = req.body.education_id;
					delete req.body.education_id;
					db.query(`UPDATE tbl_education SET ? where education_id = ?`, [req.body, education_id], function(error, results, fields) {
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
					return res.status(404).send({
						status: 404,
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
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};