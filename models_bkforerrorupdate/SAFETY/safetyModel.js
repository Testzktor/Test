
const fs = require('fs');
const db = require("../../config/connection");
const middleware = require("../../middleware/authentication");
var timeAgo = require('node-time-ago');
const {
    getVideoDurationInSeconds
} = require('get-video-duration');
var bodyParser = require('body-parser');
const multer = require('fastify-multer');
const crypto = require("crypto");
const {
    exec
} = require("child_process");
var path = require('path')
var zktor = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../uploads/ztkor_video_media/');
    },
    filename: function(req, file, cb) {
        cb(null, "zktor_video_media_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
    }
});
exports.add_safety_alert = async (req, res) => {
	try {
    let upload = multer({
        storage: zktor,
    }).single('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail"
            });
        } else {
            if (req.body.safety_alert_user_id) {
                            db.query(`INSERT INTO tbl_safety_alert SET ?`, [req.body], function(error, results66, fields) {
                                if (error) {
                                    return res.status(400).send({
                                        status: 400,
                                        msg: "fail"
                                    });
                                } else {
                                    return res.status(200).send({
                                        status: 200,
                                        msg: "Success",
                                        safety_alert_id:results66.insertId
                                    });
                                }
                            });

            } else {
                return res.status(400).send({
                    status: 400,
                    msg: "fail",
                    safety_alert_id:0
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
exports.update_safety_alert = async (req, res) => {
	try {
    let upload = multer({
        storage: zktor,
    }).single('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail"
            });
        } else {
            if (req.body.safety_alert_id) {
                var safety_alert_id=req.body.safety_alert_id;
                delete(req.body.safety_alert_id);
                            db.query(`UPDATE tbl_safety_alert SET ? where safety_alert_id=?`, [req.body,safety_alert_id], function(error, results66, fields) {
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

exports.get_safety_alert = async (req, res) => {
	try {
    var comment = [];
     if (req.query.safety_alert_user_id ) {
    db.query(`SELECT * FROM tbl_safety_alert where safety_alert_user_id=?`,[req.query.safety_alert_user_id], function(error, results_comment, fields) {
        if (error) throw error;
        if (results_comment.length > 0) {

            return res.status(200).send({
                status: 200,
                msg: "Success",
                safetyAlertListCount: results_comment.length,
                safetyAlertList: results_comment
            });

        } else {
            return res.status(400).send({
                status: 400,
                msg: "Records Not Found.",
                safetyAlertListCount:0,
                safetyAlertList: []
            });
        }
    });
     } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
                  safetyAlertListCount:0,
                safetyAlertList: []
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};

exports.delete_safety_alert = async (req, res) => {
	try {
    if (req.query.safety_alert_id) {
        db.query(`DELETE from tbl_safety_alert where safety_alert_id=? `, [req.query.safety_alert_id], function(error, results1, fields) {
            if (error) throw error;
            return res.status(200).send({
                status: 200,
                msg: "Success"
            });
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