const fastify = require('fastify')({
	logger: true
});
fastify.register(require('fastify-swagger'), {
	exposeRoute: true,
	routePrefix: '/docs',
	swagger: {
		info: {
			title: 'fastify-api'
		},
	},
});
const db = require("../../config/connection");
exports.category_list = async (req, res) => {
	try {
		await db.query(`SELECT count(*) totalRecords from tbl_categories `, function(error, results, fields) {
			if (error) {
				return res.status(400).send({
					status: 400,
					msg: "Fail"
				});
			} else {
				if (results[0].totalRecords > 0) {
					db.query(`SELECT * from tbl_categories `, function(error, results1, fields) {
						if (error) {
							return res.status(400).send({
								status: 400,
								msg: "Fail"
							});

						} else {
							return res.status(200).send({
								status: 200,
								msg: "Success",
								categoryList: results1
							});
						}
					});
				} else {
					return res.status(404).send({
						status: 404,
						msg: "No Record Found",
						categoryList: []
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
exports.other_list = async (req, res) => {
	try {
		if (!req.params.id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`SELECT count(*) totalRecords from tbl_others where user_id = ?`, [req.params.id], function(error, results, fields) {
				if (error) throw error;
				if (results[0].totalRecords > 0) {
					db.query(`SELECT * ,CONVERT(other_id, NCHAR) as other_id from tbl_others where user_id = '${req.params.id}'`, function(error, results1, fields) {
						if (error) throw error;
						return res.status(200).send({
							status: 200,
							msg: "Success",
							otherList: results1
						});
					});
				} else {
					return res.status(404).send({
						status: 404,
						msg: "No Record Found",
						otherList: []
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
exports.other_delete = async (req, res) => {
	try {
		if (!req.params.id) {
			return res.status(400).send({
				status: 400,
				msg: "fail"
			});
		} else {
			db.query(`SELECT count(*) totalRecords from tbl_others where other_id = ?`, [req.params.id], function(error, results, fields) {
				if (error) throw error;
				if (results[0].totalRecords > 0) {
					db.query(`DELETE FROM tbl_others WHERE other_id= '${req.params.id}'`, function(error, results1, fields) {
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

exports.other_insert = async (req, res) => {
	try {
		if (req.body.user_id) {
			db.query(`SET SQL_MODE = ''; INSERT INTO tbl_others SET ?`, req.body, function(error, results, fields) {
				if (error) {
					return res.status(400).send({
						status: 400,
						msg: "fail"
					});
				} else {
					db.query(`SELECT * from tbl_others where user_id = ?`, [req.body.user_id], function(error, resultsData, fields) {
						return res.status(200).send({
							status: 200,
							msg: "Success",
							other_id: results.insertId,
							user_id: resultsData[0].user_id,
							other_skills: resultsData[0].other_skills,
							other_hobbies: resultsData[0].other_hobbies,
							other_achievements: resultsData[0].other_achievements,
							created_date: resultsData[0].created_date,
							modified_date: resultsData[0].modified_date

						});
					});

				}
			});
		} else {
			return res.status(400).send({
				status: 400,
				msg: "fail",
				other_id: 0,
				user_id: '',
				other_skills: '',
				other_hobbies: '',
				other_achievements: '',
				created_date: '',
				modified_date: ''

			});
		}
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};

exports.other_update = async (req, res) => {
	try {
		if (req.body.other_id) {
			db.query(`SELECT count(*) totalRecords from tbl_others where other_id = ?`, [req.body.other_id], function(error, results1, fields) {
				if (error) throw error;
				if (results1[0].totalRecords > 0) {
					var other_id = req.body.other_id;
					delete req.body.other_id;
					db.query(`UPDATE tbl_others SET ? where other_id = ?`, [req.body, other_id], function(error, results, fields) {
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