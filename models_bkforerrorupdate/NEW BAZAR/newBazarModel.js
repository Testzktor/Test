
const db = require("../../config/connection");
exports.get_cook_qualification = async (req, res) => {
	try {
    var comment = [];
    db.query(`SELECT * FROM tbl_bazar_cook_qualification`, function(error, results_comment, fields) {
        if (error) throw error;
        if (results_comment.length > 0) {

            return res.status(200).send({
                status: 200,
                msg: "Success",
                listCount: results_comment.length,
                list: results_comment
            });

        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail"
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
exports.get_cook_experience = async (req, res) => {
	try {

    var comment = [];
    db.query(`SELECT * FROM tbl_bazar_cook_experience`, function(error, results_comment, fields) {
        if (error) throw error;
        if (results_comment.length > 0) {

            return res.status(200).send({
                status: 200,
                msg: "Success",
                listCount: results_comment.length,
                list: results_comment
            });

        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail"
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
exports.get_self_employee_work_type = async (req, res) => {
	try {
    var comment = [];
    db.query(`SELECT * FROM tbl_bazar_self_employee_work_type`, function(error, results_comment, fields) {
        if (error) throw error;
        if (results_comment.length > 0) {

            return res.status(200).send({
                status: 200,
                msg: "Success",
                listCount: results_comment.length,
                list: results_comment
            });

        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail"
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
exports.get_self_employee_categories = async (req, res) => {
	try {
    var comment = [];
    db.query(`SELECT * FROM tbl_bazar_self_employee_categories`, function(error, results_comment, fields) {
        if (error) throw error;
        if (results_comment.length > 0) {

            return res.status(200).send({
                status: 200,
                msg: "Success",
                listCount: results_comment.length,
                list: results_comment
            });

        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail"
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
exports.get_labour_work_type = async (req, res) => {
	try {
    var comment = [];
    db.query(`SELECT * FROM tbl_bazar_labour_work_type`, function(error, results_comment, fields) {
        if (error) throw error;
        if (results_comment.length > 0) {

            return res.status(200).send({
                status: 200,
                msg: "Success",
                listCount: results_comment.length,
                list: results_comment
            });

        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail"
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
exports.get_school_college_standards = async (req, res) => {
	try {
    var comment = [];
    db.query(`SELECT * FROM tbl_bazar_school_college_standards`, function(error, results_comment, fields) {
        if (error) throw error;
        if (results_comment.length > 0) {

            return res.status(200).send({
                status: 200,
                msg: "Success",
                listCount: results_comment.length,
                list: results_comment
            });

        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail"
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
exports.get_play_school_age = async (req, res) => {
	try {
    var comment = [];
    db.query(`SELECT * FROM tbl_bazar_play_school_age`, function(error, results_comment, fields) {
        if (error) throw error;
        if (results_comment.length > 0) {

            return res.status(200).send({
                status: 200,
                msg: "Success",
                listCount: results_comment.length,
                list: results_comment
            });

        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail"
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
exports.get_play_school_grade = async (req, res) => {
	try {
    var comment = [];
    db.query(`SELECT * FROM tbl_bazar_play_school_grade`, function(error, results_comment, fields) {
        if (error) throw error;
        if (results_comment.length > 0) {

            return res.status(200).send({
                status: 200,
                msg: "Success",
                listCount: results_comment.length,
                list: results_comment
            });

        } else {
            return res.status(400).send({
                status: 400,
                msg: "fail"
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
