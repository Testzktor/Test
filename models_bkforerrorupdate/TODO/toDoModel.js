
const fs = require('fs');
const db = require("../../config/connection");
const {
    getVideoDurationInSeconds
} = require('get-video-duration')
const full = require("../USER/userFullProfile");
const multer = require('fastify-multer');
const crypto = require("crypto");
const {
    exec
} = require("child_process");
var path = require('path')
var bazar = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../uploads/bazar/');
    },
    filename: function(req, file, cb) {
        cb(null, "todo_" + crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + path.extname(file.originalname));
    }
});
exports.add_todo_task = async (req, res) => {
	try {
    let upload = multer({
        storage: bazar,
    }).fields([{
        name: 'todo_image',
        maxCount: 10
    }]);
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail"
            });
        } else {
            if (req.body.todo_task_title) {
                var todo_image = [];
                db.query(`INSERT INTO tbl_todo_task SET ?`, req.body, function(error, results, fields) {
                    if (error) {
                        return res.status(400).send({
                            status: 400,
                            msg: "fail"
                        });
                    } else {
                        return res.status(200).send({
                            status: 200,
                            msg: "Success",
                            todo_task_id: results.insertId
                        });
                    }
                });

            } else {
                return res.status(400).send({
                    status: 400,
                    msg: "fail",
                    todo_task_id:0
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
exports.update_todo_task = async (req, res) => {
	try {
    let upload = multer({
        storage: bazar,
    }).fields([{
        name: 'todo_image',
        maxCount: 10
    }]);
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail"
            });
        } else {
            if (req.body.todo_task_id) {
                var todo_image = [];
                var todo_task_id = req.body.todo_task_id;
                delete(req.body.todo_task_id);
                db.query(`UPDATE tbl_todo_task SET ? where todo_task_id= ?`, [req.body, todo_task_id], function(error, results, fields) {
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
exports.get_todo_task = async (req, res) => {
	try {
    if (req.query.todo_task_user_id) {
        db.query(`SELECT * FROM tbl_todo_task WHERE todo_task_user_id = ? `, [req.query.todo_task_user_id], function(error, results1, fields) {
            if (error) throw error;
            if (results1.length > 0) {
                var comment_re = [];
                Object.keys(results1).forEach(function(key_re, idx_re, array_re) {
                    var results_comment_reply_data = results1[key_re];


                    db.query(`SELECT * FROM tbl_todo_category where todo_category_id=? and todo_category_status=?;SELECT
                                count(*) as total from tbl_todo_task inner join tbl_todo_category on  tbl_todo_task.todo_task_category_id=tbl_todo_category.todo_category_id where todo_task_user_id=? and todo_task_status=?`, [results_comment_reply_data.todo_task_category_id, '1', req.query.todo_task_user_id, '0'], function(error, results_comment_reply_re, fields) {
                        if (error) {
                            return res.status(404).send({
                                status: 404,
                                msg: error
                            });
                        } else {

                            if (results_comment_reply_re[0].length > 0) {
                                results_comment_reply_data.todo_category_name = results_comment_reply_re[0][0].todo_category_name;
                                comment_re.push(results_comment_reply_data);

                            }
                            if (idx_re === array_re.length - 1) {

                                return res.status(200).send({
                                    status: 200,
                                    msg: "Success",
                                    todoTaskListCount: comment_re.length,
                                    todoTaskPendingCount: results_comment_reply_re[1][0].total,
                                    todoTaskList: comment_re
                                });
                            }

                        }
                    });


                });

            } else {
                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                        todoTaskListCount: 0,
                                    todoTaskPendingCount: 0,
                                    todoTaskList: []
                });
            }
        });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
                  todoTaskListCount: 0,
                                    todoTaskPendingCount: 0,
                                    todoTaskList: []
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_todo_task_today = async (req, res) => {
	try {
    if (req.query.todo_task_user_id) {
        var created_date = new Date();
        console.log(created_date.toISOString().slice(0, 10));
        var dl = db.query(`SELECT * FROM tbl_todo_task WHERE date(todo_task_date) = ? and todo_task_user_id = ?`, [created_date.toISOString().slice(0, 10), req.query.todo_task_user_id], function(error, results1, fields) {
            if (error) throw error;
            if (results1.length > 0) {
                var comment_re = [];
                Object.keys(results1).forEach(function(key_re, idx_re, array_re) {
                    var results_comment_reply_data = results1[key_re];


                    var dl = db.query(`SELECT * FROM tbl_todo_category where todo_category_id=? and todo_category_status=?;SELECT
                                count(*) as total from tbl_todo_task inner join tbl_todo_category on  tbl_todo_task.todo_task_category_id=tbl_todo_category.todo_category_id where todo_task_user_id=? and todo_task_status=? and date(todo_task_date) = ?`, [results_comment_reply_data.todo_task_category_id, '1', req.query.todo_task_user_id, '0', created_date.toISOString().slice(0, 10)], function(error, results_comment_reply_re, fields) {
                        if (error) {
                            return res.status(404).send({
                                status: 404,
                                msg: error
                            });
                        } else {
                            console.log(dl.sql);
                            if (results_comment_reply_re[0].length > 0) {
                                results_comment_reply_data.todo_category_name = results_comment_reply_re[0][0].todo_category_name;
                                comment_re.push(results_comment_reply_data);

                            }
                            if (idx_re === array_re.length - 1) {

                                return res.status(200).send({
                                    status: 200,
                                    msg: "Success",
                                    todoTodaysTaskListCount: comment_re.length,
                                    todoTodaysPendingCount: results_comment_reply_re[1][0].total,
                                    todoTodaysTaskList: comment_re
                                });
                            }

                        }
                    });


                });

            } else {
                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                      todoTodaysTaskListCount: 0,
                                    todoTodaysPendingCount: 0,
                                    todoTodaysTaskList: []
                });
            }
        });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
                  todoTodaysTaskListCount: 0,
                                    todoTodaysPendingCount: 0,
                                    todoTodaysTaskList: []
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_todo_task_not_today = async (req, res) => {
	try {
    if (req.query.todo_task_user_id) {
        var created_date = new Date();
        console.log(created_date);
        db.query(`SELECT * FROM tbl_todo_task WHERE date(todo_task_date) != ? and todo_task_user_id = ?`, [created_date.toISOString().slice(0, 10), req.query.todo_task_user_id], function(error, results1, fields) {
            if (error) throw error;
            if (results1.length > 0) {
                var comment_re = [];
                Object.keys(results1).forEach(function(key_re, idx_re, array_re) {
                    var results_comment_reply_data = results1[key_re];


                    db.query(`SELECT * FROM tbl_todo_category where todo_category_id=? and todo_category_status=?;SELECT
                                count(*) as total from tbl_todo_task inner join tbl_todo_category on  tbl_todo_task.todo_task_category_id=tbl_todo_category.todo_category_id where todo_task_user_id=? and todo_task_status=? and date(todo_task_date) != ?`, [results_comment_reply_data.todo_task_category_id, '1', req.query.todo_task_user_id, '0', created_date.toISOString().slice(0, 10)], function(error, results_comment_reply_re, fields) {
                        if (error) {
                            return res.status(404).send({
                                status: 404,
                                msg: error
                            });
                        } else {

                            if (results_comment_reply_re[0].length > 0) {
                                results_comment_reply_data.todo_category_name = results_comment_reply_re[0][0].todo_category_name;
                                comment_re.push(results_comment_reply_data);

                            }
                            if (idx_re === array_re.length - 1) {

                                return res.status(200).send({
                                    status: 200,
                                    msg: "Success",
                                    todoNotTodaysTaskListCount: comment_re.length,
                                    todoNotTodaysPendingCount: results_comment_reply_re[1][0].total,
                                    todoNotTodaysTaskList: comment_re
                                });
                            }

                        }
                    });


                });

            } else {
                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                          todoNotTodaysTaskListCount: 0,
                                    todoNotTodaysPendingCount: 0,
                                    todoNotTodaysTaskList: []
                });
            }
        });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
                   todoNotTodaysTaskListCount: 0,
                                    todoNotTodaysPendingCount: 0,
                                    todoNotTodaysTaskList: []
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_todo_category = async (req, res) => {
	try {
    if (req.query.todo_category_user_id) {
        var created_date = new Date();
        var comment_re = [];
        db.query(`SELECT * FROM tbl_todo_category WHERE todo_category_user_id = ? AND todo_category_status= ?;
        SELECT count(*) as total from tbl_todo_task inner join tbl_todo_category on  tbl_todo_task.todo_task_category_id=tbl_todo_category.todo_category_id where todo_task_user_id=? and todo_task_status=? and date(todo_task_date) != ?;
         SELECT count(*) as total from tbl_todo_task inner join tbl_todo_category on  tbl_todo_task.todo_task_category_id=tbl_todo_category.todo_category_id where todo_task_user_id=? and todo_task_status=? and date(todo_task_date) = ?;
         SELECT count(*) as total from tbl_todo_task inner join tbl_todo_category on  tbl_todo_task.todo_task_category_id=tbl_todo_category.todo_category_id where todo_task_user_id=? and date(todo_task_date) = ?;
         SELECT count(*) as total from tbl_todo_task inner join tbl_todo_category on  tbl_todo_task.todo_task_category_id=tbl_todo_category.todo_category_id where todo_task_user_id=?;`,
            [req.query.todo_category_user_id, '1',
                req.query.todo_category_user_id, '0', created_date.toISOString().slice(0, 10),
                req.query.todo_category_user_id, '0', created_date.toISOString().slice(0, 10),
                req.query.todo_category_user_id, created_date.toISOString().slice(0, 10),
                req.query.todo_category_user_id
            ],
            function(error, results1, fields) {
                if (error) {
                                return res.status(404).send({
                                    status: 404,
                                    msg: error
                                });
                            } else {
                               console.log(results1[0]);
                              
                if (results1[0].length > 0) {
                    
                    Object.keys(results1[0]).forEach(function(key_re, idx_re, array_re) {
                        var results_comment_reply_data = results1[0][key_re];
                         
                        db.query(`SELECT count(*) as total FROM tbl_todo_task where todo_task_category_id=? and todo_task_status=?`, [results_comment_reply_data.todo_category_id, '0'], function(error, results_comment_reply_re, fields) {
                            if (error) {
                                return res.status(404).send({
                                    status: 404,
                                    msg: error
                                });
                            } else {
                                results_comment_reply_data.todo_unwantched = results_comment_reply_re[0].total;
                                comment_re.push(results_comment_reply_data);
                                if (idx_re === array_re.length - 1) {
                                    return res.status(200).send({
                                        status: 200,
                                        msg: "Success",
                                        total_todoo: results1[4][0].total,
                                        notTodaysPendingCount: results1[1][0].total,
                                        todaysPendingCount: results1[2][0].total,
                                        allPendingCount: results1[1][0].total + results1[2][0].total,
                                        today_todo: results1[3][0].total,
                                        todoCategoryListCount: comment_re.length,
                                        todoCategoryList: comment_re
                                    });
                                }
                            }
                        });
                    });
                } else {
                    return res.status(404).send({
                        status: 404,
                        msg: "Record not found",
                             total_todoo: 0,
                                        notTodaysPendingCount:0,
                                        todaysPendingCount: 0,
                                        allPendingCount: 0,
                                        today_todo: 0,
                                        todoCategoryListCount: 0,
                                        todoCategoryList: []
                    });
                }
                            }
            });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
                            total_todoo: 0,
                                        notTodaysPendingCount:0,
                                        todaysPendingCount: 0,
                                        allPendingCount: 0,
                                        today_todo: 0,
                                        todoCategoryListCount: 0,
                                        todoCategoryList: []
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.get_todo_task_category_id = async (req, res) => {
	try {
    var created_date = new Date();
    console.log(created_date);
    var comment_re = [];
    if (req.query.todo_task_category_id) {
        db.query(`SELECT * FROM tbl_todo_task  WHERE todo_task_category_id = ?`, [req.query.todo_task_category_id], function(error, results1, fields) {
            if (error) throw error;
            if (results1.length > 0) {
                Object.keys(results1).forEach(function(key_re, idx_re, array_re) {
                    var results_comment_reply_data = results1[key_re];
                    db.query(`SELECT * FROM tbl_todo_category where todo_category_id=? and todo_category_status=?`, [results_comment_reply_data.todo_task_category_id, '1'], function(error, results_comment_reply_re, fields) {
                        if (error) {
                            return res.status(404).send({
                                status: 404,
                                msg: error
                            });
                        } else {
                            if (results_comment_reply_re.length > 0)
                                results_comment_reply_data.todo_category_name = results_comment_reply_re[0].todo_category_name;
                            else
                                results_comment_reply_data.todo_category_name = '';
                            comment_re.push(results_comment_reply_data);
                            if (idx_re === array_re.length - 1) {
                                return res.status(200).send({
                                    status: 200,
                                    msg: "Success",
                                    todoTaskListCount: comment_re.length,
                                    todoTaskList: comment_re
                                });
                            }
                        }
                    });
                });
            } else {

                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                        todoTaskListCount: 0,
                                    todoTaskList: []
                });
            }
        });
    } else {
        return res.status(400).send({
            status: 400,
            msg: "fail",
              todoTaskListCount: 0,
                                    todoTaskList: []
        });
    }
	} catch (err) {
		return res.status(400).send({
			status: 400,
			msg: err
		});
	}
};
exports.delete_todo_task = async (req, res) => {
	try {
    if (req.query.todo_task_id) {
        db.query(`DELETE FROM tbl_todo_task WHERE todo_task_id = ?`, [req.query.todo_task_id], function(error, results1, fields) {
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
exports.add_todo_category = async (req, res) => {
	try {
    let upload = multer({
        storage: bazar,
    }).fields([{
        name: 'todo_image',
        maxCount: 10
    }]);
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail"
            });
        } else {
            if (req.body.todo_category_user_id) {
                var todo_image = [];
                db.query(`INSERT INTO tbl_todo_category SET ?`, req.body, function(error, results, fields) {
                    if (error) {
                        return res.status(400).send({
                            status: 400,
                            msg: "fail"
                        });
                    } else {
                        return res.status(200).send({
                            status: 200,
                            msg: "Success",
                            todo_category_id: results.insertId
                        });
                    }
                });

            } else {
                return res.status(400).send({
                    status: 400,
                    msg: "fail",
                    todo_category_id:0
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
exports.delete_todo_category = async (req, res) => {
	try {
    if (req.query.todo_category_id) {
        db.query(`DELETE FROM tbl_todo_category WHERE todo_category_id = ?`, [req.query.todo_category_id], function(error, results1, fields) {
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
exports.update_todo_category = async (req, res) => {
	try {
    let upload = multer({
        storage: bazar,
    }).fields([{
        name: 'todo_image',
        maxCount: 10
    }]);
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).send({
                status: 400,
                msg: "fail"
            });
        } else {
            if (req.body.todo_category_id) {
                var todo_image = [];
                var todo_category_id = req.body.todo_category_id;
                delete(req.body.todo_category_id);
                db.query(`UPDATE tbl_todo_category SET ? where todo_category_id= ?`, [req.body, todo_category_id], function(error, results, fields) {
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
