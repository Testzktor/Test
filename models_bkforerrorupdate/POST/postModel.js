
const fs = require('fs');
const db = require("../../config/connection");
const middleware = require("../../middleware/authentication");
var timeAgo = require('node-time-ago');
exports.get_gif = async (req, res) => {
	try {
    var comment = [];
    if (req.query.gif_category_id) {
    db.query(`SELECT tbl_gif_images.*, tbl_gif_category.gif_category_name, tbl_gif_category.gif_category_status FROM tbl_gif_images INNER JOIN tbl_gif_category ON tbl_gif_images.gif_category_id = tbl_gif_category.gif_category_id WHERE tbl_gif_category.gif_category_status =? and tbl_gif_category.gif_category_id=?`,['1',req.query.gif_category_id], function(error, results_comment, fields) {
        if (error) throw error;
        if (results_comment.length > 0) {

            return res.status(200).send({
                status: 200,
                msg: "Success",
                gifListCount: results_comment.length,
                gifList: results_comment
            });

        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail",
                   gifListCount: 0,
                gifList: []
            });
        }
    });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
               gifListCount: 0,
                gifList: []
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};

exports.get_all_gif = async (req, res) => {
	try {
    var comment = [];
    db.query(`SELECT tbl_gif_images.*, tbl_gif_category.gif_category_name, tbl_gif_category.gif_category_status FROM tbl_gif_images INNER JOIN tbl_gif_category ON tbl_gif_images.gif_category_id = tbl_gif_category.gif_category_id WHERE tbl_gif_category.gif_category_status =?`,['1'], function(error, results_comment, fields) {
        if (error) throw error;
        if (results_comment.length > 0) {

            return res.status(200).send({
                status: 200,
                msg: "Success",
                gifListCount: results_comment.length,
                gifList: results_comment
            });

        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail",
                gifListCount: 0,
                gifList: []
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
exports.get_category = async (req, res) => {
	try {
    var comment = [];
    db.query(`SELECT * FROM tbl_gif_category WHERE gif_category_status =?`,['1'], function(error, results_comment, fields) {
        if (error) throw error;
        if (results_comment.length > 0) {

            return res.status(200).send({
                status: 200,
                msg: "Success",
                categoryListCount: results_comment.length,
                categoryList: results_comment
            });

        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail",
                 categoryListCount: 0,
                categoryList: []
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