const express = require('express');
const app = express();
const fs = require('fs');
const db = require("../../config/connection");
const request = require('request');
const middleware = require("../../middleware/authentication");
var timeAgo = require('node-time-ago');
const moment = require('moment');
const merge = require('deepmerge');
const {
    getVideoDurationInSeconds
} = require('get-video-duration')
var bodyParser = require('body-parser');
app.use(express.json());
const full = require("../USER/userFullProfile");
const multer = require('multer');
const crypto = require("crypto");
const {
    exec
} = require("child_process");
var path = require('path')
app.use(express.urlencoded({
    extended: true
}));
app.use(bodyParser.urlencoded({
    extended: true
}));
// UPLOAD FILE CONFIUGRATION

var chat = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../uploads/chat_media/');
    },
    filename: function(req, file, cb) {
        cb(null, "chat_" +crypto.createHash('md5').update('abcdefgh').digest('hex') + Date.now() + file.originalname);
    }
});
app.post('/follow_user', middleware.authenticateToken, (req, res, next) => {
    if (req.body.followered_to_id && req.body.follower_by_id && req.body.follower_status && req.body.feed_id) {
        db.query(`SELECT DISTINCT sender_user_id as me  FROM tbl_chat_details where receiver_user_id =91 union SELECT DISTINCT receiver_user_id as me  FROM tbl_chat_details where sender_user_id =91 `, [req.body.followered_to_id, req.body.follower_by_id], function(error, results1, fields) {
            if (error) throw error;
            if (results1.length <= 0) {
                db.query(`INSERT INTO tbl_followers SET ?`, req.body, function(error, results, fields) {
                    if (error) {
                        return res.status(400).json({
                            status: 400,
                            msg: "fail"
                        });
                    } else {
                        return res.status(200).json({
                            status: 200,
                            msg: "Success"
                        });
                    }
                });
            } else {
                db.query(`UPDATE tbl_followers SET follower_status = ? where followered_to_id = ? AND follower_by_id = ?`, [req.body.follower_status, req.body.followered_to_id, req.body.follower_by_id], function(error, results, fields) {
                    if (error) {
                        return res.status(400).json({
                            status: 400,
                            msg: "fail"
                        });
                    } else {
                        return res.status(200).json({
                            status: 200,
                            msg: "Success"
                        });
                    }
                });
            }
        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail"
        });
    }
});
app.get('/update_seen_status', middleware.authenticateToken, (req, res, next) => {
    if (req.query.sender_user_id && req.query.receiver_user_id) {
        db.query(`UPDATE tbl_chat_details SET message_status= ? where sender_user_id=? AND receiver_user_id=? and (message_status= ? OR message_status=?)`, ['3', req.query.receiver_user_id, req.query.sender_user_id, '1', '2'], function(error, results, fields) {
            if (error) {

            } else {

                db.query(`SELECT * FROM tbl_user_profile where user_id=?`, [req.query.sender_user_id], function(error, results68, fields) {
                    if (error) {

                    } else {
                        if (results68.length > 0) {
                            if (results68[0].user_register_id) {
                                var options = {
                                    'method': 'POST',
                                    'url': 'https://fcm.googleapis.com/fcm/send',
                                    'headers': {
                                        'Authorization': 'key=AAAAWRGw03M:APA91bETShIEhgnkyCStvphR_OAZ72XaUx_Quj3TgdB7CexvvhFx9REavNhecH35uIi-0N5CAXuT4B71CFpSyHLJEpY93TPgAjEVAMBJfjU_hCEdS7_ah2-ziKVryMchyfJ1btrvyGou',
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        "to": "/topics/" + results68[0].user_register_id,
                                        "data": {
                                            "title": "update",
                                            "body": "normal"
                                        }
                                    })

                                };
                                request(options, function(error, response) {
                                    if (error) throw new Error(error);
                                    //console.log(response.body);
                                });
                            }
                        }
                    }
                });
                db.query(`SELECT * FROM tbl_user_profile where user_id=?`, [req.query.receiver_user_id], function(error, results68, fields) {
                    if (error) {

                    } else {
                        if (results68.length > 0) {
                            if (results68[0].user_register_id) {
                                var options = {
                                    'method': 'POST',
                                    'url': 'https://fcm.googleapis.com/fcm/send',
                                    'headers': {
                                        'Authorization': 'key=AAAAWRGw03M:APA91bETShIEhgnkyCStvphR_OAZ72XaUx_Quj3TgdB7CexvvhFx9REavNhecH35uIi-0N5CAXuT4B71CFpSyHLJEpY93TPgAjEVAMBJfjU_hCEdS7_ah2-ziKVryMchyfJ1btrvyGou',
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        "to": "/topics/" + results68[0].user_register_id,
                                        "data": {
                                            "title": "update",
                                            "body": "normal"
                                        }
                                    })

                                };
                                request(options, function(error, response) {
                                    if (error) throw new Error(error);
                                    //console.log(response.body);
                                });
                            }
                        }
                    }
                });
                return res.status(200).json({
                    status: 200,
                    msg: "Success"
                });
            }
        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail"
        });
    }
});
app.get('/get_friend_block', middleware.authenticateToken, (req, res, next) => {
    if (req.query.user_id) {
        db.query(`SELECT *
FROM  tbl_friend_request
WHERE  sender_user_id  =  ? OR receiver_user_id  =  ?
ORDER BY  created_date  DESC`, [req.query.user_id, req.query.user_id], function(error, results, fields) {
            if (error) {
                return res.status(400).json({
                    status: 400,
                    msg: "fail"
                });

            } else {
                if (results.length > 0) {
                    var final_array = [];
                    var final_array1 = [];
                    Object.keys(results).forEach(function(key, idx1, array1) {
                        var result = results[key];
                        var user_id = '';

                        if (req.query.user_id == result.receiver_user_id) {
                            user_id = result.sender_user_id;
                            // final_array.push(result.sender_user_id);
                        } else if (req.query.user_id == result.sender_user_id) {
                            // final_array.push.push(result.receiver_user_id);
                            user_id = result.receiver_user_id;
                        }

                        db.query(`select user_id,user_name,user_profile_img,user_chat_status from tbl_user_profile where user_id=?`, [user_id], function(error, results11, fields) {
                            if (error) {} else {
                                if (results11.length > 0) {
                                    if (result.request_status == 1) {
                                        results11[0].request_status = 1;
                                        final_array.push(results11[0]);
                                    } else if (result.request_status == 4) {
                                        results11[0].request_status = 4;
                                        final_array1.push(results11[0]);
                                    }

                                }
                                if (idx1 === array1.length - 1) {
                                    return res.status(200).json({
                                        status: 200,
                                        msg: "Success",
                                        totalFriendCount: final_array.length,
                                        totalBlockedFriendCount: final_array1.length,
                                         friendAndBlockedList: merge(final_array, final_array1)
                                    });
                                }
                            }
                        });
                    });

                } else {
                    return res.status(400).json({
                        status: 400,
                        msg: "fail",
                            totalFriendCount: 0,
                                        totalBlockedFriendCount: 0,
                                         friendAndBlockedList: []
                    });
                }

            }
        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail",
               totalFriendCount: 0,
                                        totalBlockedFriendCount: 0,
                                         friendAndBlockedList: []
        });
    }

});
app.get('/get_chat_messages', middleware.authenticateToken, (req, res, next) => {

    if (req.query.user_id && req.query.friend_user_id) {
        if (req.query.page_no) {
            var query = db.query(`SELECT * FROM tbl_chat_details WHERE sender_user_id = ? AND receiver_user_id = ? UNION SELECT * FROM tbl_chat_details WHERE receiver_user_id = ? AND sender_user_id = ? ORDER BY created_date DESC`, [req.query.user_id, req.query.friend_user_id, req.query.user_id, req.query.friend_user_id], function(error, results, fields) {
                if (error) {
                    return res.status(400).json({
                        status: 400,
                        msg: "fail"
                    });
                } else {
                    //console.log(query.sql);
                    if (results.length > 0) {
                        var final_array = [];
                        var totalfriendsList = [];
                        Object.keys(results).forEach(function(key, index, array) {
                            var result = results[key];
                            result.created_date = moment(Date.parse(result.created_date)).format('DD-MM-YYYY HH:mmA');
                            result.modified_date = moment(Date.parse(result.modified_date)).format('DD-MM-YYYY HH:mmA');
                            if (req.query.user_id == result.receiver_user_id) {
                                result.user_type = 'Friend';
                                final_array.push(result);
                            } else if (req.query.user_id == result.sender_user_id) {
                                result.user_type = 'User';
                                final_array.push(result);
                            }

                            if (index === array.length - 1) {
                                let no_of_records_per_page = 5;
                                let max_pages = parseInt(Math.ceil((final_array.length) / no_of_records_per_page));
                                if (req.query.page_no <= max_pages) {
                                    let page_no = req.query.page_no;

                                    // PAGINATION START

                                    let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
                                    let sliceData = final_array.slice(offset, offset + no_of_records_per_page)
                                    var pagination = {
                                        total_rows: final_array.length,
                                        total_pages: parseInt(Math.ceil((final_array.length) / no_of_records_per_page)),
                                        per_page: no_of_records_per_page,
                                        offset: offset,
                                        current_page_no: page_no
                                    };
                                    // PAGINATION END

                                    return res.status(200).json({
                                        status: 200,
                                        msg: "Success",
                                        chatMessageList: sliceData,
                                        pagination: pagination
                                    });
                                } else {
                                    return res.status(404).json({
                                        status: 404,
                                        msg: "Page no missing or Its incorrect.",
                                         chatMessageList: [],
                                          pagination:  {
                                        total_rows: 0,
                                        total_pages: 0,
                                        per_page: 0,
                                        offset: 0,
                                        current_page_no: '0'
                                    }

                                    });
                                }
                            }

                        });
                    } else {

                        return res.status(400).json({
                            status: 400,
                            msg: "fail",
                                      chatMessageList: [],
                                          pagination:  {
                                        total_rows: 0,
                                        total_pages: 0,
                                        per_page: 0,
                                        offset: 0,
                                        current_page_no: '0'
                                    }
                        });

                    }
                }
            });
        } else {
            return res.status(404).json({
                status: 404,
                msg: "Page no missing or Its incorrect",
                          chatMessageList: [],
                                          pagination:  {
                                        total_rows: 0,
                                        total_pages: 0,
                                        per_page: 0,
                                        offset: 0,
                                        current_page_no: '0'
                                    }
            });
        }
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail",
                      chatMessageList: [],
                                          pagination:  {
                                        total_rows: 0,
                                        total_pages: 0,
                                        per_page: 0,
                                        offset: 0,
                                        current_page_no: '0'
                                    }
        });
    }
});
app.get('/get_chat_profiles', middleware.authenticateToken, full.getChatProfiles, (req, res, next) => {

    if (req.query.user_id && res.getchatdetails.length > 0) {
        totalfriendsList = res.getchatdetails.filter((x, i) => i === res.getchatdetails.indexOf(x));

        let i = 0
        var profile_array = [];
        console.log(totalfriendsList);
        totalfriendsList.forEach((element, index, array) => {
            var final_array = [];
            var sl = db.query(`SELECT *
FROM   tbl_chat_details
WHERE   ((sender_user_id   =   ? and receiver_user_id= ?) OR (receiver_user_id   =   ? and sender_user_id= ?))
AND find_in_set(  ?, deleted_by_id) =   ?
AND find_in_set(  ?, cleared_by_id) =   ?
ORDER BY   created_date   DESC
LIMIT ? `, [element, req.query.user_id, element, req.query.user_id,
                req.query.user_id, '0',
                req.query.user_id, '0', 1
            ], function(error, results_da, fields) {
                if (error) throw error;
                console.log(sl.sql);
                if (results_da.length <= 0) {
                    results_da[0] = {
                        message_id: '',
                        chat_group_id: ''
                    };
                }
                db.query(`SELECT user_id,user_name,user_profile_img,user_chat_status,chat_profile_seen,profile_last_login,user_register_id from tbl_user_profile where user_id=?;
                    select * from tbl_chat_status where blocked_by_user_id=? and blocked_to_user_id=?;
                    select * from tbl_chat_status where blocked_by_user_id=? and blocked_to_user_id=?;
                    SELECT count(*) as total
FROM   tbl_chat_details
WHERE   (receiver_user_id   =   ? and sender_user_id= ?)
AND   (message_status   = ? or message_status=?);
SELECT *
FROM   tbl_friend_request
WHERE   ((sender_user_id   =   ? and receiver_user_id= ?) OR (receiver_user_id   =   ? and sender_user_id= ?));
select * from tbl_user_group where group_id=?
                    `, [element,
                    element, req.query.user_id,
                    req.query.user_id, element,
                    req.query.user_id, element, '1', '2',
                    element, req.query.user_id, element, req.query.user_id,
                    results_da[0].chat_group_id
                ], function(error, results13, fields) {
                    if (error) throw error;
                    if (results13[0].length > 0) {
                        // //console.log(results13);
                        if (results13[1].length > 0) {
                            results_da[0].show_profile = results13[1][0].status;
                        } else {
                            results_da[0].show_profile = 1;
                        }
                        if (results13[2].length > 0) {
                            results_da[0].bloked_profile = results13[2][0].status;
                        } else {
                            results_da[0].bloked_profile = 1;
                        }
                        if (results13[4].length > 0) {
                            results_da[0].request_status = results13[4][0].request_status;
                            results_da[0].request_status_user_id = results13[4][0].request_status_user_id;
                        } else {
                            results_da[0].request_status = "1";
                            results_da[0].request_status_user_id = "";
                        }
                        if (results13[5].length > 0) {
                            results_da[0].group_detail = results13[5][0];
                        } else {
                            results_da[0].group_detail = {};
                        }
                        results_da[0].created_date = moment(Date.parse(results_da[0].created_date)).format('DD-MM-YYYY HH:mmA');
                        results_da[0].modified_date = moment(Date.parse(results_da[0].modified_date)).format('DD-MM-YYYY HH:mmA');
                        results_da[0].unread_messages = results13[3][0].total
                        final_array = merge(results_da[0], results13[0][0]);
                        if (results_da[0].message_id != '')
                            profile_array.push(final_array);

                    }

                    if (index === array.length - 1) {
                        return res.status(200).json({
                            status: 200,
                            msg: "Success",
                            totalchatProfilesCount: profile_array.length,
                            chatProfilesMessageList: profile_array
                        });
                    }
                });

            });
        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail",
            totalchatProfilesCount: 0,
            chatProfilesMessageList: []
        });
    }
});
app.get('/get_chat_friend', middleware.authenticateToken, full.totalFriendsArray, (req, res, next) => {

    if (req.query.user_id) {
        db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [req.query.user_id, req.query.user_id, '1'], function(error, results, fields) {
            if (error) {
                return res.status(400).json({
                    status: 400,
                    msg: "fail"
                });
            } else {
                if (results.length > 0) {
                    var final_array = [];
                    var totalfriendsList = [];
                    Object.keys(results).forEach(function(key) {
                        var result = results[key];
                        if (req.query.user_id == result.receiver_user_id) {
                            final_array.push(result.sender_user_id);
                        } else if (req.query.user_id == result.sender_user_id) {
                            final_array.push(result.receiver_user_id);
                        }
                    });
                    totalfriendsList = final_array.filter((item, i, ar) => ar.indexOf(item) === i);
                    //console.log(totalfriendsList);
                    let i = 0
                    var profile_array = [];
                    // //console.log(totalfriendsList.length);
                    totalfriendsList.forEach((element, index, array) => {
                        db.query(`SELECT user_id,user_name,user_profile_img,user_chat_status,chat_profile_seen,profile_last_login,caller_id from tbl_user_profile where user_id=?; select * from tbl_chat_status where blocked_by_user_id=? and blocked_to_user_id=?;select * from tbl_chat_status where blocked_by_user_id=? and blocked_to_user_id=? `, [element, element, req.query.user_id, req.query.user_id, element], function(error, results13, fields) {
                            if (error) throw error;
                            if (results13[0].length > 0) {
                                // //console.log(results13);
                                if (results13[1].length > 0) {
                                    results13[0][0].show_profile = results13[1][0].status;
                                } else {
                                    results13[0][0].show_profile = 1;
                                }
                                if (results13[2].length > 0) {
                                    results13[0][0].bloked_profile = results13[2][0].status;
                                } else {
                                    results13[0][0].bloked_profile = 1;
                                }
                                profile_array.push(results13[0][0]);

                            }
                            if (index === array.length - 1) {
                                return res.status(200).json({
                                    status: 200,
                                    msg: "Success",
                                    totalFriendCount: profile_array.length,
                                    friendChatList: profile_array
                                });
                            }
                        });
                    });

                } else {

                    return res.status(400).json({
                        status: 400,
                        msg: "fail",
                          totalFriendCount: 0,
                                    friendChatList: []
                    });

                }
            }
        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail",
               totalFriendCount: 0,
                                    friendChatList: []
        });
    }
});
app.get('/update_chat_status', middleware.authenticateToken, (req, res, next) => {
    if (req.query.online_status && req.query.user_id) {
        db.query(`SELECT * from tbl_user_profile where user_id=? `, [req.query.user_id], function(error, results1, fields) {
            if (error) throw error;
            if (results1.length > 0) {
                db.query(`UPDATE tbl_user_profile SET user_chat_status= ? where user_id=?`, [req.query.online_status, req.query.user_id], function(error, results, fields) {
                    if (error) {

                    } else {

                        return res.status(200).json({
                            status: 200,
                            msg: "Success"
                        });
                    }
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail"
                });
            }
        });

    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail"
        });
    }
});
app.post('/add_message12', middleware.authenticateToken, (req, res, next) => {
    let upload = multer({
        storage: chat,
    }).fields([{
        name: 'message_media',
        maxCount: 25
    }, {
        name: 'page_profile_picture'
    }]);
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).json({
                status: 400,
                msg: err
            });
        } else {
            if (req.body.sender_user_id && req.body.receiver_user_id) {
                ////console.log(req.files);
                var i = 0;
                var message_media = [];
                var message_media_type = '';
                if (typeof req.files.message_media !== 'undefined') {
                    Object.keys(req.files.message_media).forEach(function(key, idx1, array1) {
                        var result_file = req.files.message_media[key];
                        let ext = (result_file.filename).substring((result_file.filename).lastIndexOf('.'), (result_file.filename).length);
                            if (ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".tif" || ext == ".bmp" || ext == ".raw" || ext == ".cr2" || ext == ".sr2") {
                            if (message_media_type == '')
                                message_media_type = '2';
                        }

                          if (ext === '.mov' || ext === '.avchd' || ext === '.mkv' || ext === '.webm' || ext === '.gif' || ext === '.mp4' || ext === 'video/ogg' || ext === '.wmv' || ext === 'video/x-flv' || ext === '.avi') {
                            if (message_media_type == '')
                                message_media_type = '3';
                        }

                        if (ext == 'ppt' || ext == 'txt' || ext == 'doc' || ext == 'docx' || ext == 'odt' || ext == 'html' || ext == 'sql' || ext == 'pdf' || ext == 'xls' || ext == 'xlsx' || ext == 'csv')
                            message_media_type = '4';

                        if (ext == 'mp3' || ext == 'aac' || ext == 'ogg' || ext == 'aiff' || ext == 'wma')
                            message_media_type = '7';
                        message_media.push(result_file.filename);
                        if (idx1 === array1.length - 1) {
                            db.query(`SELECT * FROM tbl_user_profile where user_id=?`, [req.body.receiver_user_id], function(error, results6, fields) {
                                if (error) {

                                } else {
                                    if (results6.length > 0) {
                                        if (results6[0].visiter_id == req.body.sender_user_id)
                                            req.body.message_status = '3';
                                    }
                                }

                                req.body.message_media = message_media.toString();
                                req.body.message_type = message_media_type;

                                db.query(`INSERT INTO tbl_chat_details SET ?`, req.body, function(error, results, fields) {
                                    if (error) {
                                        return res.status(400).json({
                                            status: 400,
                                            msg: "fail"
                                        });
                                    } else {
                                        if (results.insertId) {
                                            db.query(`SELECT * FROM tbl_chat_details where message_id=?`, [results.insertId], function(error, results67, fields) {
                                                if (error) {

                                                } else {
                                                    if (results67.length > 0) {
                                                        if (results67[0].receiver_user_id == req.body.sender_user_id)
                                                            results67[0].user_type = 'Friend';
                                                        else if (results67[0].sender_user_id == req.body.sender_user_id)
                                                            results67[0].user_type = 'User';
                                                    }
                                                }
                                                db.query(`SELECT * FROM tbl_user_profile where user_id=?`, [req.body.sender_user_id], function(error, results68, fields) {
                                                    if (error) {

                                                    } else {
                                                        if (results68.length > 0) {
                                                            if (results68[0].user_register_id) {
                                                                var options = {
                                                                    'method': 'POST',
                                                                    'url': 'https://fcm.googleapis.com/fcm/send',
                                                                    'headers': {
                                                                        'Authorization': 'key=AAAAWRGw03M:APA91bETShIEhgnkyCStvphR_OAZ72XaUx_Quj3TgdB7CexvvhFx9REavNhecH35uIi-0N5CAXuT4B71CFpSyHLJEpY93TPgAjEVAMBJfjU_hCEdS7_ah2-ziKVryMchyfJ1btrvyGou',
                                                                        'Content-Type': 'application/json'
                                                                    },
                                                                    body: JSON.stringify({
                                                                        "to": "/topics/" + results68[0].user_register_id,
                                                                        "data": {
                                                                            "title": "chat",
                                                                            "body": "normal"
                                                                        }
                                                                    })

                                                                };

                                                                request(options, function(error, response) {
                                                                    if (error) throw new Error(error);
                                                                    ////console.log(response.body);
                                                                });
                                                            }
                                                        }
                                                    }
                                                });
                                                return res.status(200).json({
                                                    status: 200,
                                                    msg: "Success",
                                                    lastMessage: results67[0]
                                                });

                                            });
                                        } else {
                                            return res.status(400).json({
                                                status: 400,
                                                msg: "fail",
                                                  lastMessage: {}
                                            });
                                        }
                                    }
                                });
                            });
                        }
                    });
                } else {
                    db.query(`INSERT INTO tbl_chat_details SET ?`, req.body, function(error, results, fields) {
                        if (error) {
                            return res.status(400).json({
                                status: 400,
                                msg: "fail",
                                  lastMessage: {}
                            });
                        } else {
                            if (results.insertId) {
                                db.query(`SELECT * FROM tbl_chat_details where message_id=?`, [results.insertId], function(error, results67, fields) {
                                    if (error) {

                                    } else {
                                        if (results67.length > 0) {
                                            if (results67[0].receiver_user_id == req.body.sender_user_id)
                                                results67[0].user_type = 'Friend';
                                            else if (results67[0].sender_user_id == req.body.sender_user_id)
                                                results67[0].user_type = 'User';
                                        }
                                    }
                                    db.query(`SELECT * FROM tbl_user_profile where user_id=?`, [req.body.sender_user_id], function(error, results68, fields) {
                                        if (error) {

                                        } else {
                                            if (results68.length > 0) {
                                                if (results68[0].user_register_id) {
                                                    var options = {
                                                        'method': 'POST',
                                                        'url': 'https://fcm.googleapis.com/fcm/send',
                                                        'headers': {
                                                            'Authorization': 'key=AAAAWRGw03M:APA91bETShIEhgnkyCStvphR_OAZ72XaUx_Quj3TgdB7CexvvhFx9REavNhecH35uIi-0N5CAXuT4B71CFpSyHLJEpY93TPgAjEVAMBJfjU_hCEdS7_ah2-ziKVryMchyfJ1btrvyGou',
                                                            'Content-Type': 'application/json'
                                                        },
                                                        body: JSON.stringify({
                                                            "to": "/topics/" + results68[0].user_register_id,
                                                            "data": {
                                                                "title": "chat",
                                                                "body": "normal"
                                                            }
                                                        })

                                                    };

                                                    request(options, function(error, response) {
                                                        if (error) throw new Error(error);
                                                        ////console.log(response.body);
                                                    });
                                                }
                                            }
                                        }
                                    });
                                    return res.status(200).json({
                                        status: 200,
                                        msg: "Success",
                                        lastMessage: results67[0]
                                    });

                                });
                            } else {
                                return res.status(400).json({
                                    status: 400,
                                    msg: "fail",
                                      lastMessage: {}
                                });
                            }
                            // return res.status(200).json({
                            //     status: 200,
                            //     msg: "Success"
                            // });
                        }
                    });
                }
            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail",
                      lastMessage: {}
                });
            }
        }
    });
});
app.get('/get_message_ids', middleware.authenticateToken, full.totalFriendsArray, (req, res, next) => {
    if (req.query.user_id && req.query.receiver_user_id) {
        var comment_re = [];
        db.query(`SELECT * FROM tbl_chat_details WHERE sender_user_id = ? AND receiver_user_id =? AND find_in_set(?, deleted_by_id) = '0' AND chat_group_id = '' UNION SELECT * FROM tbl_chat_details WHERE receiver_user_id = ? AND sender_user_id=?  AND find_in_set(?, deleted_by_id) = '0' AND chat_group_id = ''`, [req.query.user_id, req.query.receiver_user_id, req.query.user_id, req.query.user_id, req.query.receiver_user_id, req.query.user_id], function(error, results_comment_re, fields) {
            if (error) throw error;
            if (results_comment_re.length > 0) {
                Object.keys(results_comment_re).forEach(function(key_re, idx_re, array_re) {
                    var results_data = results_comment_re[key_re];
                    comment_re.push(results_data.message_id);
                    if (idx_re === array_re.length - 1) {

                        return res.status(200).json({
                            status: 200,
                            msg: "Success",
                            message_idsCount: comment_re.length,
                            message_ids: comment_re
                        });
                    }
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail",
                     message_idsCount: 0,
                            message_ids: []
                });
            }

        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail",
                message_idsCount: 0,
                            message_ids: []
        });
    }
});
app.get('/get_message_ids_for_group', middleware.authenticateToken, full.totalFriendsArray, (req, res, next) => {
    if (req.query.group_id) {
        var comment_re = [];
        db.query(`SELECT * FROM tbl_chat_details WHERE chat_group_id = ? AND find_in_set(?, deleted_by_id) = '0' `, [req.query.group_id, req.query.group_id], function(error, results_comment_re, fields) {
            if (error) throw error;
            if (results_comment_re.length > 0) {
                Object.keys(results_comment_re).forEach(function(key_re, idx_re, array_re) {
                    var results_data = results_comment_re[key_re];
                    comment_re.push(results_data.message_id);
                    if (idx_re === array_re.length - 1) {

                        return res.status(200).json({
                            status: 200,
                            msg: "Success",
                            message_idsCount: comment_re.length,
                            message_ids: comment_re
                        });
                    }
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail",
                        message_idsCount: 0,
                            message_ids: []
                });
            }

        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail",
                message_idsCount: 0,
                            message_ids: []
        });
    }
});
app.get('/get_user_media', middleware.authenticateToken, full.totalFriendsArray, (req, res, next) => {
    if (req.query.user_id && req.query.receiver_user_id) {
        var comment_re = [];
        db.query(`SELECT * FROM tbl_chat_details WHERE sender_user_id = ? AND receiver_user_id =? AND find_in_set(?, deleted_by_id) = '0' AND chat_group_id = '' AND message_media != '' UNION SELECT * FROM tbl_chat_details WHERE receiver_user_id = ? AND sender_user_id=?  AND find_in_set(?, deleted_by_id) = '0' AND chat_group_id = '' AND message_media != ''`, [req.query.user_id, req.query.receiver_user_id, req.query.user_id, req.query.user_id, req.query.receiver_user_id, req.query.user_id], function(error, results_comment_re, fields) {
            if (error) throw error;
            if (results_comment_re.length > 0) {
                Object.keys(results_comment_re).forEach(function(key_re, idx_re, array_re) {
                    var results_data = results_comment_re[key_re];
                    comment_re.push(results_data.message_media);
                    if (idx_re === array_re.length - 1) {

                        return res.status(200).json({
                            status: 200,
                            msg: "Success",
                            userMediaListCount: comment_re.length,
                            userMediaList: comment_re
                        });
                    }
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail",
                        userMediaListCount: 0,
                            userMediaList: []
                });
            }

        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail",
              userMediaListCount: 0,
                            userMediaList: []
        });
    }
});
app.get('/get_group_media', middleware.authenticateToken, full.totalFriendsArray, (req, res, next) => {
    if (req.query.group_id) {
        var comment_re = [];
        db.query(`SELECT * FROM tbl_chat_details WHERE chat_group_id = ? AND find_in_set(?, deleted_by_id) = '0'  AND message_media != '' `, [req.query.group_id, req.query.group_id], function(error, results_comment_re, fields) {
            if (error) throw error;
            if (results_comment_re.length > 0) {
                Object.keys(results_comment_re).forEach(function(key_re, idx_re, array_re) {
                    var results_data = results_comment_re[key_re];
                    comment_re.push(results_data.message_media);
                    if (idx_re === array_re.length - 1) {

                        return res.status(200).json({
                            status: 200,
                            msg: "Success",
                            groupMediaListCount: comment_re.length,
                            groupMediaList: comment_re
                        });
                    }
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail",
                     groupMediaListCount: 0,
                            groupMediaList: []
                });
            }

        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail",
            groupMediaListCount: 0,
                            groupMediaList: []
        });
    }
});
app.post('/add_user_archive', middleware.authenticateToken, (req, res, next) => {
    let upload = multer({
        storage: chat,
    }).single('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).json({
                status: 400,
                msg: "fail"
            });
        } else {
            var s = [];
            if (req.body.message_id && req.body.user_id) {
                var totalfriendsList = (req.body.message_id).split(",");
                totalfriendsList.forEach((element, index, array) => {
                    delete(req.body.message_id);
                    req.body.message_id = element;
                    db.query(`INSERT INTO tbl_chat_user_archive SET ?`, req.body, function(error, results, fields) {
                        if (error) {
                            return res.status(400).json({
                                status: 400,
                                msg: "fail"
                            });
                        } else {
                            s.push(results.insertId);
                            if (index === array.length - 1) {
                                return res.status(200).json({
                                    status: 200,
                                    msg: "Success",
                                    archive_ids: s
                                });
                            }
                        }
                    });
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail",
                    archive_ids:[]
                });
            }
        }
    });
});
app.get('/get_user_archive', middleware.authenticateToken, (req, res, next) => {
    if (req.query.chat_with_id && req.query.user_id) {
        var final_array = [];
        db.query(`SELECT * FROM tbl_chat_user_archive where chat_with_id=? and user_id=? order by chat_user_archive_id desc`, [req.query.chat_with_id, req.query.user_id, req.query.user_id], function(error, results, fields) {
            if (error) throw error;
            else {
                if (results.length > 0) {
                    Object.keys(results).forEach(function(key, idx, array) {
                        var result_data = results[key];
                        db.query(`SELECT  * FROM tbl_chat_details where message_id=?;SELECT * FROM tbl_user_profile WHERE user_id = ?`, [result_data.message_id, result_data.user_id], function(error, results_comment1, fields) {
                            if (error) throw error;
                            else {

                                if (results_comment1[0].length > 0) {

                                    result_data.chat_details = results_comment1[0][0];


                                } else {

                                    result_data.chat_details = [];

                                }
                                if (results_comment1[1].length > 0) {

                                    result_data.user_details = results_comment1[1][0];

                                } else {

                                    result_data.user_details = [];

                                }
                                final_array.push(result_data);
                                if (idx === array.length - 1) {
                                    return res.status(200).json({
                                        status: 200,
                                        msg: "Success",
                                        userArchiveListCount: final_array.length,
                                        userArchiveList: final_array
                                    });
                                }
                            }
                        });
                    });
                } else {
                    return res.status(400).json({
                        status: 400,
                        msg: "fail",
                          userArchiveListCount: 0,
                                        userArchiveList: []
                    });
                }
            }
        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail",
              userArchiveListCount: 0,
                                        userArchiveList: []
        });
    }

});
app.get('/delete_user_archive', middleware.authenticateToken, (req, res, next) => {
    if (req.query.chat_user_archive_id) {
        db.query(`DELETE from tbl_chat_user_archive where chat_user_archive_id=?`, [req.query.chat_user_archive_id], function(error, results1, fields) {
            if (error) throw error;
            return res.status(200).json({
                status: 200,
                msg: "Success"
            });
        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail"
        });
    }
});
app.post('/update_chat', middleware.authenticateToken, (req, res, next) => {
    let upload = multer({
        storage: chat,
    }).single('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).json({
                status: 400,
                msg: "fail"
            });
        } else {
            var s = [];
            if (req.body.message_id) {
                var flag = 0;
                var m = '';
                if (req.body.deleted_by_id && req.body.deleted_by_id != '') {
                    m = req.body.deleted_by_id;
                    delete(req.body.deleted_by_id);
                    flag = 1;
                }
                var totalfriendsList = (req.body.message_id).split(",");
                totalfriendsList.forEach((element, index, array) => {
                    var km = '';
                    delete(req.body.message_id);
                    // req.body.message_id = element;

                    db.query(`SELECT * FROM tbl_chat_details where message_id=?`, [element], function(error, results, fields) {
                        if (error) {
                            return res.status(400).json({
                                status: 400,
                                msg: "fail"
                            });
                        } else {
                            if (results.length > 0 && m != '') {

                                if (results[0].deleted_by_id != '') {
                                    //console.log((results[0].deleted_by_id).indexOf(m));
                                    if ((results[0].deleted_by_id).indexOf(m) != -1) {
                                        req.body.deleted_by_id = (results[0].deleted_by_id).trim();

                                    } else {
                                        req.body.deleted_by_id = (results[0].deleted_by_id).trim() + "," + m;
                                    }
                                } else {
                                    req.body.deleted_by_id = m.trim();
                                }
                                db.query(`UPDATE tbl_chat_details SET ? where message_id=?`, [req.body, element], function(error, results1, fields) {
                                    if (error) {} else {
                                        if (index === array.length - 1) {
                                            return res.status(200).json({
                                                status: 200,
                                                msg: "Success"
                                            });
                                        }
                                    }
                                });
                            } else {
                                if (index === array.length - 1) {
                                    return res.status(200).json({
                                        status: 200,
                                        msg: "Success"
                                    });
                                }
                            }
                        }
                    });
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail"
                });
            }
        }
    });
});
app.post('/clear_history_chat', middleware.authenticateToken, (req, res, next) => {
    let upload = multer({
        storage: chat,
    }).single('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).json({
                status: 400,
                msg: "fail"
            });
        } else {
            var s = [];
            if (req.body.message_id) {
                var flag = 0;
                var m = '';
                if (req.body.cleared_by_id && req.body.cleared_by_id != '') {
                    m = req.body.cleared_by_id;
                    delete(req.body.cleared_by_id);
                    flag = 1;
                }
                var totalfriendsList = (req.body.message_id).split(",");
                totalfriendsList.forEach((element, index, array) => {
                    var km = '';
                    delete(req.body.message_id);
                    // req.body.message_id = element;

                    db.query(`SELECT * FROM tbl_chat_details where message_id=?`, [element], function(error, results, fields) {
                        if (error) {
                            return res.status(400).json({
                                status: 400,
                                msg: "fail"
                            });
                        } else {
                            if (results.length > 0 && m != '') {

                                if (results[0].cleared_by_id != '') {
                                    //console.log((results[0].cleared_by_id).indexOf(m));
                                    if ((results[0].cleared_by_id).indexOf(m) != -1) {
                                        req.body.cleared_by_id = (results[0].cleared_by_id).trim();

                                    } else {
                                        req.body.cleared_by_id = (results[0].cleared_by_id).trim() + "," + m;
                                    }
                                } else {
                                    req.body.cleared_by_id = m.trim();
                                }
                                db.query(`UPDATE tbl_chat_details SET ? where message_id=?`, [req.body, element], function(error, results1, fields) {
                                    if (error) {} else {
                                        if (index === array.length - 1) {
                                            return res.status(200).json({
                                                status: 200,
                                                msg: "Success"
                                            });
                                        }
                                    }
                                });
                            } else {
                                if (index === array.length - 1) {
                                    return res.status(200).json({
                                        status: 200,
                                        msg: "Success"
                                    });
                                }
                            }
                        }
                    });
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail"
                });
            }
        }
    });
});
app.post('/clear_history_chat_with_user_ids', middleware.authenticateToken, (req, res, next) => {
    let upload = multer({
        storage: chat,
    }).single('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).json({
                status: 400,
                msg: "fail"
            });
        } else {
            var s = [];
            if (req.body.sender_user_id && req.body.receiver_user_id) {
                var flag = 0;
                var m = '';
                if (req.body.cleared_by_id && req.body.cleared_by_id != '') {
                    m = req.body.cleared_by_id;
                    delete(req.body.cleared_by_id);
                    flag = 1;
                }
                var sender = req.body.sender_user_id;
                var receiver = req.body.receiver_user_id;
                delete(req.body.receiver_user_id);
                delete(req.body.sender_user_id);

                // req.body.message_id = element;
                db.query(`SELECT * FROM tbl_chat_details WHERE sender_user_id = ? AND receiver_user_id = ? UNION SELECT * FROM tbl_chat_details WHERE receiver_user_id = ? AND sender_user_id = ?`, [sender, receiver, sender, receiver], function(error, results, fields) {
                    if (error) {
                        return res.status(400).json({
                            status: 400,
                            msg: "fail"
                        });
                    } else {
                        if (results.length > 0 && m != '') {
                            Object.keys(results).forEach(function(key_re, idx_re, array_re) {
                                var results_comment_reply_data = results[key_re];
                                var km = '';
                                if (results_comment_reply_data.cleared_by_id != '') {
                                    //console.log((results_comment_reply_data.cleared_by_id).indexOf(m));
                                    if ((results_comment_reply_data.cleared_by_id).indexOf(m) != -1) {
                                        req.body.cleared_by_id = (results_comment_reply_data.cleared_by_id).trim();

                                    } else {
                                        req.body.cleared_by_id = (results_comment_reply_data.cleared_by_id).trim() + "," + m;
                                    }
                                } else {
                                    req.body.cleared_by_id = m.trim();
                                }
                                db.query(`UPDATE tbl_chat_details SET ? where message_id=?`, [req.body, results_comment_reply_data.message_id], function(error, results1, fields) {
                                    if (error) {} else {
                                        if (idx_re === array_re.length - 1) {
                                            return res.status(200).json({
                                                status: 200,
                                                msg: "Success"
                                            });
                                        }
                                    }
                                });
                            });
                        } else {
                            return res.status(200).json({
                                status: 200,
                                msg: "Success"
                            });
                        }
                    }
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail"
                });
            }
        }
    });
});

app.post('/add_shared_message', middleware.authenticateToken, (req, res, next) => {
    /*
    return res.status(200).json({
                    status: 200,
                    msg: "success",
                    test: req.body.receiver_user_id,
                    test2: req.body.sender_user_id
                      // lastMessage: {}
                });
                */
                
                db.query(`INSERT INTO tbl_chat_details SET ?`, req.body, function(error, results, fields) {
                                if (error) {
                                    return res.status(400).json({
                                        status: 400,
                                        msg: "fail2",
                                    
                                       //  lastMessage: {}
                                    });
                                } else {
                                   /*
                                    //console.log("tt11");
                                    return res.status(200).json({
                    status: 200,
                    msg: "success",
                    test: req.body,
                });
                */
                
                db.query(`Select * FROM tbl_chat_details where message_id= ?`, [results.insertId], function(error, results1, fields) {
                                                if (error) {
                                                    return res.status(400).json({
                                                        status: 400,
                                                        msg: "fail"
                                                    });
                                                } else {
                                                   
                                                    if (results1[0].receiver_user_id == req.body.sender_user_id) {
                                                        results1[0].user_type = 'Friend';
                                                    } else if (results1[0].sender_user_id == req.body.sender_user_id) {
                                                        results1[0].user_type = 'User';
                                                    }

/*
                                           db.query(`select * from tbl_user_profile where user_id= ?`, [results1[0].receiver_user_id,], function(error12, results12, fields12) {
     
                                                 if (results12[0].length > 0 && results12[0][0].user_register_id && results12[0][0].user_register_id != '') {
                                                        var options = {
                                                            'method': 'POST',
                                                            'url': 'https://fcm.googleapis.com/fcm/send',
                                                            'headers': {
                                                                'Authorization': 'key=AAAAWRGw03M:APA91bETShIEhgnkyCStvphR_OAZ72XaUx_Quj3TgdB7CexvvhFx9REavNhecH35uIi-0N5CAXuT4B71CFpSyHLJEpY93TPgAjEVAMBJfjU_hCEdS7_ah2-ziKVryMchyfJ1btrvyGou',
                                                                'Content-Type': 'application/json'
                                                            },
                                                            body: JSON.stringify({
                                                                "to": "/topics/" + results12[0][0].user_register_id,
                                                                "data": {
                                                                    "title": "chat",
                                                                    "body": "normal"
                                                                }
                                                            })

                                                        };
                                                        request(options, function(error, response) {
                                                            //console.log(response);
                                                        });
                                                    }
     
                                           });
*/
                                                    
                                                  /*
                                                    if (results12[1].length > 0 && results12[1][0].user_register_id && results12[1][0].user_register_id != '') {
                                                        var options = {
                                                            'method': 'POST',
                                                            'url': 'https://fcm.googleapis.com/fcm/send',
                                                            'headers': {
                                                                'Authorization': 'key=AAAAWRGw03M:APA91bETShIEhgnkyCStvphR_OAZ72XaUx_Quj3TgdB7CexvvhFx9REavNhecH35uIi-0N5CAXuT4B71CFpSyHLJEpY93TPgAjEVAMBJfjU_hCEdS7_ah2-ziKVryMchyfJ1btrvyGou',
                                                                'Content-Type': 'application/json'
                                                            },
                                                            body: JSON.stringify({
                                                                "to": "/topics/" + results12[1][0].user_register_id,
                                                                "data": {
                                                                    "title": "chat",
                                                                    "body": "normal"
                                                                }
                                                            })
                                                        };
                                                        request(options, function(error, response) {
                                                            //console.log(response);
                                                        });
                                                    }
                                                    
                                                    results1[0].created_date = moment(Date.parse(results1[0].created_date)).format('DD-MM-YYYY HH:mmA');
                        results1[0].modified_date = moment(Date.parse(results1[0].modified_date)).format('DD-MM-YYYY HH:mmA');
                        */
                                                    return res.status(200).json({
                                                        status: 200,
                                                        msg: "Success",
                                                        lastMessage: results1[0]
                                                    });
                                                
                                                }
                                            });
                                    }
                            });
                
   /*
    if (req.body.receiver_user_id && req.body.sender_user_id) {
                db.query(`INSERT INTO tbl_chat_details SET ?`, req.body, function(error, results, fields) {
                                if (error) {
                                    return res.status(400).json({
                                        status: 400,
                                        msg: "fail2",
                                         lastMessage: {}
                                    });
                                } else {
                                    //console.log("tt11");
                                    db.query(`Select * FROM tbl_chat_details where message_id= ?`, [results.insertId], function(error, results1, fields) {
                                        if (error) {
                                            return res.status(400).json({
                                                status: 400,
                                                msg: "fail3",
                                                   lastMessage: {}
                                            });
                                        } else {
                                            if (results1[0].receiver_user_id == req.body.sender_user_id) {
                                                results1[0].user_type = 'Friend';
                                            } else if (results1[0].sender_user_id == req.body.sender_user_id) {
                                                results1[0].user_type = 'User';
                                            }

                                            if (results12[0].length > 0 && results12[0][0].user_register_id && results12[0][0].user_register_id != '') {
                                                var options = {
                                                    'method': 'POST',
                                                    'url': 'https://fcm.googleapis.com/fcm/send',
                                                    'headers': {
                                                        'Authorization': 'key=AAAAWRGw03M:APA91bETShIEhgnkyCStvphR_OAZ72XaUx_Quj3TgdB7CexvvhFx9REavNhecH35uIi-0N5CAXuT4B71CFpSyHLJEpY93TPgAjEVAMBJfjU_hCEdS7_ah2-ziKVryMchyfJ1btrvyGou',
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        "to": "/topics/" + results12[0][0].user_register_id,
                                                        "data": {
                                                            "title": "chat",
                                                            "body": "normal"
                                                        }
                                                    })

                                                };
                                                request(options, function(error, response) {
                                                    //console.log(response);
                                                });
                                            }
                                            if (results12[1].length > 0 && results12[1][0].user_register_id && results12[1][0].user_register_id != '') {
                                                var options = {
                                                    'method': 'POST',
                                                    'url': 'https://fcm.googleapis.com/fcm/send',
                                                    'headers': {
                                                        'Authorization': 'key=AAAAWRGw03M:APA91bETShIEhgnkyCStvphR_OAZ72XaUx_Quj3TgdB7CexvvhFx9REavNhecH35uIi-0N5CAXuT4B71CFpSyHLJEpY93TPgAjEVAMBJfjU_hCEdS7_ah2-ziKVryMchyfJ1btrvyGou',
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        "to": "/topics/" + results12[1][0].user_register_id,
                                                        "data": {
                                                            "title": "chat",
                                                            "body": "normal"
                                                        }
                                                    })
                                                };
                                                request(options, function(error, response) {
                                                    //console.log(response);
                                                });
                                            }
                                             results1[0].created_date = moment(Date.parse(results1[0].created_date)).format('DD-MM-YYYY HH:mmA');
                                             results1[0].modified_date = moment(Date.parse(results1[0].modified_date)).format('DD-MM-YYYY HH:mmA');
                                            return res.status(200).json({
                                                status: 200,
                                                msg: "Success",
                                                lastMessage: results1[0]
                                            });
                                        }
                                    });
                                }
                            });
            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail4",
                    test: req.body,
                       lastMessage: {}
                });
            }
       */     
    
});

app.post('/add_call_log', middleware.authenticateToken, (req, res, next) => {
   
                db.query(`INSERT INTO tbl_call_logs SET ?`, req.body, function(error, results, fields) {
                                if (error) {
                                    return res.status(400).json({
                                        status: 400,
                                        msg: "fail1",
                                        msg3: error,
                                        msg2: req.body
                                    });
                                } else {
                                   
                                    //console.log("tt11");
                  return res.status(200).json({
                    status: 200,
                    msg: "success",
                });
                
                                    }
                            });
                
    
});

app.get('/get_call_log', middleware.authenticateToken, (req, res, next) => {
    if (!req.query.user_id) {
        return res.status(400).json({
            status: 400,
            msg: "fail",
            call_logs:[]
        });
    } else {
            db.query(`SELECT * FROM tbl_call_logs WHERE user_id = ? order by id desc`, [req.query.user_id], function(err, rows, fields) {
                            if (err) {
                                return res.status(400).json({
                                    status: 400,
                                    msg: err,
                                    call_logs:[]
                                });
                            } else {
                                if (rows.length > 0) {
                                   /* 
                                  return res.status(200).json({
                                                status: 200,
                                                msg: "success",
                                                logs: rows
                                            });
                                           */ 
                                        //  db.query(`SELECT * FROM tbl_call_logs WHERE user_id = ?`, [req.query.user_id], function(err, rows, fields) {  
                                            
                                            var finalData = [];
                                            Object.keys(rows).forEach(function(key, i, array1) {
                                                var value1 = rows[key];
                                                
                                               /// value1.time = value1.time as String;
                                                
                                                value1.time = moment(Date.parse(value1.time)).format('YYYY-MM-DD HH:mm:ss');
                                                
                                                db.query(`SELECT user_name,user_profile_img FROM tbl_user_profile WHERE user_id = ?`, [value1.caller_id], function(err, profile, fields) { 
                                                    
                                                   // value1.push(profile.user_name);
                                                //    value1.push(profile.user_profile_img);
                                                    value1.caller_name = profile[0].user_name;
                                                    value1.caller_img = profile[0].user_profile_img;
                                                    finalData.push(value1);
                                                   
                                                    
                                                   // rows[i][key].caller_name = profile.user_name;
                                                //    rows[i][key].caller_img = profile.user_profile_img;
                                                    
                                                  ///  comment_re.push(results_data.message_media);
                                                    if (i === array1.length - 1) {

                                                     return res.status(200).json({
                                                          status: 200,
                                                          msg: "success",
                                                         // msg2: profile,
                                                          logs: finalData
                                                        });
                                                       }
                                                    
                                                });
                                                
                                                /*
                                                if (results_comment_re.length > 0) {
                Object.keys(results_comment_re).forEach(function(key_re, idx_re, array_re) {
                    var results_data = results_comment_re[key_re];
                    comment_re.push(results_data.message_media);
                    if (idx_re === array_re.length - 1) {

                        return res.status(200).json({
                            status: 200,
                            msg: "Success",
                            groupMediaListCount: comment_re.length,
                            groupMediaList: comment_re
                        });
                    }
                });
            }
                                                */
                                                
                                            });
                                            
                                            /*
                                            return res.status(200).json({
                                                status: 200,
                                                msg: "success",
                                                logs: rows
                                            });
                                            */
                                    }else{
                                       return res.status(404).json({
                                                status: 404,
                                                msg: "failed",
                                                logs: []
                                            }); 
                                    }
                            }
                        });
    }
    
});

app.get('/test_api', (req, res, next) => {
   
   return res.status(200).json({
                                    status: 200,
                                    msg: "test success",
                                });
   
});

app.get('/get_individual_call_log', middleware.authenticateToken, (req, res, next) => {
    if (!req.query.user_id) {
        return res.status(400).json({
            status: 400,
            msg: "fail",
            call_logs:[]
        });
    } else {
            db.query(`SELECT * FROM tbl_call_logs WHERE user_id = ? AND caller_id = ? order by id desc`, [req.query.user_id,req.query.target_id], function(err, rows, fields) {
                            if (err) {
                                return res.status(400).json({
                                    status: 400,
                                    msg: err,
                                    call_logs:[]
                                });
                            } else {
                                if (rows.length > 0) {
                                   /* 
                                  return res.status(200).json({
                                                status: 200,
                                                msg: "success",
                                                logs: rows
                                            });
                                           */ 
                                        //  db.query(`SELECT * FROM tbl_call_logs WHERE user_id = ?`, [req.query.user_id], function(err, rows, fields) {  
                                            
                                            var finalData = [];
                                            Object.keys(rows).forEach(function(key, i, array1) {
                                                var value1 = rows[key];
                                                
                                               /// value1.time = value1.time as String;
                                                
                                                value1.time = moment(Date.parse(value1.time)).format('YYYY-MM-DD HH:mm:ss');
                                                
                                                db.query(`SELECT user_name,user_profile_img FROM tbl_user_profile WHERE user_id = ?`, [value1.caller_id], function(err, profile, fields) { 
                                                    
                                                   // value1.push(profile.user_name);
                                                //    value1.push(profile.user_profile_img);
                                                    value1.caller_name = profile[0].user_name;
                                                    value1.caller_img = profile[0].user_profile_img;
                                                    finalData.push(value1);
                                                   
                                                    
                                                   // rows[i][key].caller_name = profile.user_name;
                                                //    rows[i][key].caller_img = profile.user_profile_img;
                                                    
                                                  ///  comment_re.push(results_data.message_media);
                                                    if (i === array1.length - 1) {

                                                     return res.status(200).json({
                                                          status: 200,
                                                          msg: "success",
                                                         // msg2: profile,
                                                          logs: finalData
                                                        });
                                                       }
                                                    
                                                });
                                                
                                                /*
                                                if (results_comment_re.length > 0) {
                Object.keys(results_comment_re).forEach(function(key_re, idx_re, array_re) {
                    var results_data = results_comment_re[key_re];
                    comment_re.push(results_data.message_media);
                    if (idx_re === array_re.length - 1) {

                        return res.status(200).json({
                            status: 200,
                            msg: "Success",
                            groupMediaListCount: comment_re.length,
                            groupMediaList: comment_re
                        });
                    }
                });
            }
                                                */
                                                
                                            });
                                            
                                            /*
                                            return res.status(200).json({
                                                status: 200,
                                                msg: "success",
                                                logs: rows
                                            });
                                            */
                                    }else{
                                       return res.status(404).json({
                                                status: 404,
                                                msg: "failed",
                                                logs: []
                                            }); 
                                    }
                            }
                        });
    }
    
});

app.post('/add_message', middleware.authenticateToken, (req, res, next) => {
    let upload = multer({
        storage: chat,
    }).fields([{
        name: 'message_media',
        maxCount: 25
    }]);
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).json({
                status: 400,
                msg: "fail"
            });
        } else {
            if (req.body.receiver_user_id && req.body.sender_user_id) {
                db.query(`select * from tbl_user_profile where user_id= ?;select * from tbl_user_profile where user_id= ?`, [req.body.receiver_user_id, req.body.sender_user_id], function(error12, results12, fields12) {
                    if (error12) {
                        return res.status(400).json({
                            status: 400,
                            msg: "fail"
                        });
                    } else {
                        if (results12[0].length > 0) {
                            if (results12[0][0].visiter_id == req.body.sender_user_id) {
                                req.body.message_status = 3;
                            }
                        }
                        var message_media = [];
                        if (typeof req.files.message_media !== 'undefined') {
                            //console.log("tt");
                            Object.keys(req.files.message_media).forEach(function(key, idx1, array1) {
                                var result_file = req.files.message_media[key];
                                //console.log(result_file);
                                //var extension = path.extname(result_file.originalname);
                                //console.log(extension);
                                message_media.push(result_file.filename);
                                //let ext = (result_file.filename).substring((result_file.filename).lastIndexOf('.'), (result_file.filename).length-1);
                                var input = result_file.filename;
                                var slices = input.split(".");
                                var extension = "." + slices[slices.length - 2];
                                  let ext = (result_file.filename).substring((result_file.filename).lastIndexOf('.'), (result_file.filename).length);
                                if (idx1 === array1.length - 1) {
                                      if (ext == ".png" || ext == ".jpg" || ext == ".jpeg") {
                                        req.body.message_type = '2';
                                    } else if (ext === '.mov' || ext === '.avchd' || ext === '.mkv' || ext === '.webm' || ext === '.gif' || ext === '.mp4' || ext === 'video/ogg' || ext === '.wmv' || ext === 'video/x-flv' || ext === '.avi') {
                                        req.body.message_type = '3';
                                    } else if (extension == '.ppt' || extension == '.txt' || extension == '.doc' || extension == '.docx' || extension == '.odt' || extension == '.html' || extension == '.sql' || extension == '.pdf' || extension == '.xls' || extension == '.xlsx' || extension == '.csv') {
                                        req.body.message_type = '4';
                                    } else if (extension == '.mp3' || extension == '.flac' || extension == '.m4a' || extension == '.wma' || extension == '.aac') {
                                        req.body.message_type = '7';
                                    }
                                    req.body.message_media = message_media.toString();
                                    db.query(`INSERT INTO tbl_chat_details SET ?`, req.body, function(error, results, fields) {
                                        if (error) {
                                            return res.status(400).json({
                                                status: 400,
                                                msg: "fail"
                                            });
                                        } else {
                                            db.query(`Select * FROM tbl_chat_details where message_id= ?`, [results.insertId], function(error, results1, fields) {
                                                if (error) {
                                                    return res.status(400).json({
                                                        status: 400,
                                                        msg: "fail"
                                                    });
                                                } else {
                                                    if (results1[0].receiver_user_id == req.body.sender_user_id) {
                                                        results1[0].user_type = 'Friend';
                                                    } else if (results1[0].sender_user_id == req.body.sender_user_id) {
                                                        results1[0].user_type = 'User';
                                                    }

                                                    if (results12[0].length > 0 && results12[0][0].user_register_id && results12[0][0].user_register_id != '') {
                                                        var options = {
                                                            'method': 'POST',
                                                            'url': 'https://fcm.googleapis.com/fcm/send',
                                                            'headers': {
                                                                'Authorization': 'key=AAAAWRGw03M:APA91bETShIEhgnkyCStvphR_OAZ72XaUx_Quj3TgdB7CexvvhFx9REavNhecH35uIi-0N5CAXuT4B71CFpSyHLJEpY93TPgAjEVAMBJfjU_hCEdS7_ah2-ziKVryMchyfJ1btrvyGou',
                                                                'Content-Type': 'application/json'
                                                            },
                                                            body: JSON.stringify({
                                                                "to": "/topics/" + results12[0][0].user_register_id,
                                                                "data": {
                                                                    "title": "chat",
                                                                    "body": "normal"
                                                                }
                                                            })

                                                        };
                                                        request(options, function(error, response) {
                                                            //console.log(response);
                                                        });
                                                    }
                                                    if (results12[1].length > 0 && results12[1][0].user_register_id && results12[1][0].user_register_id != '') {
                                                        var options = {
                                                            'method': 'POST',
                                                            'url': 'https://fcm.googleapis.com/fcm/send',
                                                            'headers': {
                                                                'Authorization': 'key=AAAAWRGw03M:APA91bETShIEhgnkyCStvphR_OAZ72XaUx_Quj3TgdB7CexvvhFx9REavNhecH35uIi-0N5CAXuT4B71CFpSyHLJEpY93TPgAjEVAMBJfjU_hCEdS7_ah2-ziKVryMchyfJ1btrvyGou',
                                                                'Content-Type': 'application/json'
                                                            },
                                                            body: JSON.stringify({
                                                                "to": "/topics/" + results12[1][0].user_register_id,
                                                                "data": {
                                                                    "title": "chat",
                                                                    "body": "normal"
                                                                }
                                                            })
                                                        };
                                                        request(options, function(error, response) {
                                                            //console.log(response);
                                                        });
                                                    }
                                                    results1[0].created_date = moment(Date.parse(results1[0].created_date)).format('DD-MM-YYYY HH:mmA');
                        results1[0].modified_date = moment(Date.parse(results1[0].modified_date)).format('DD-MM-YYYY HH:mmA');
                                                    return res.status(200).json({
                                                        status: 200,
                                                        msg: "Success",
                                                        lastMessage: results1[0]
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            db.query(`INSERT INTO tbl_chat_details SET ?`, req.body, function(error, results, fields) {
                                if (error) {
                                    return res.status(400).json({
                                        status: 400,
                                        msg: "fail",
                                         lastMessage: {}
                                    });
                                } else {
                                    //console.log("tt11");
                                    db.query(`Select * FROM tbl_chat_details where message_id= ?`, [results.insertId], function(error, results1, fields) {
                                        if (error) {
                                            return res.status(400).json({
                                                status: 400,
                                                msg: "fail",
                                                   lastMessage: {}
                                            });
                                        } else {
                                            if (results1[0].receiver_user_id == req.body.sender_user_id) {
                                                results1[0].user_type = 'Friend';
                                            } else if (results1[0].sender_user_id == req.body.sender_user_id) {
                                                results1[0].user_type = 'User';
                                            }

                                            if (results12[0].length > 0 && results12[0][0].user_register_id && results12[0][0].user_register_id != '') {
                                                var options = {
                                                    'method': 'POST',
                                                    'url': 'https://fcm.googleapis.com/fcm/send',
                                                    'headers': {
                                                        'Authorization': 'key=AAAAWRGw03M:APA91bETShIEhgnkyCStvphR_OAZ72XaUx_Quj3TgdB7CexvvhFx9REavNhecH35uIi-0N5CAXuT4B71CFpSyHLJEpY93TPgAjEVAMBJfjU_hCEdS7_ah2-ziKVryMchyfJ1btrvyGou',
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        "to": "/topics/" + results12[0][0].user_register_id,
                                                        "data": {
                                                            "title": "chat",
                                                            "body": "normal"
                                                        }
                                                    })

                                                };
                                                request(options, function(error, response) {
                                                    //console.log(response);
                                                });
                                            }
                                            if (results12[1].length > 0 && results12[1][0].user_register_id && results12[1][0].user_register_id != '') {
                                                var options = {
                                                    'method': 'POST',
                                                    'url': 'https://fcm.googleapis.com/fcm/send',
                                                    'headers': {
                                                        'Authorization': 'key=AAAAWRGw03M:APA91bETShIEhgnkyCStvphR_OAZ72XaUx_Quj3TgdB7CexvvhFx9REavNhecH35uIi-0N5CAXuT4B71CFpSyHLJEpY93TPgAjEVAMBJfjU_hCEdS7_ah2-ziKVryMchyfJ1btrvyGou',
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        "to": "/topics/" + results12[1][0].user_register_id,
                                                        "data": {
                                                            "title": "chat",
                                                            "body": "normal"
                                                        }
                                                    })
                                                };
                                                request(options, function(error, response) {
                                                    //console.log(response);
                                                });
                                            }
                                             results1[0].created_date = moment(Date.parse(results1[0].created_date)).format('DD-MM-YYYY HH:mmA');
                                             results1[0].modified_date = moment(Date.parse(results1[0].modified_date)).format('DD-MM-YYYY HH:mmA');
                                            return res.status(200).json({
                                                status: 200,
                                                msg: "Success",
                                                lastMessage: results1[0]
                                            });
                                        }
                                    });
                                }
                            });
                        }

                    }
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail",
                       lastMessage: {}
                });
            }
        }
    });
});
app.get('/get_friend_list', middleware.authenticateToken, full.totalFriendsArray, (req, res, next) => {
    if (req.query.user_id) {
        var final_array = [];
        if (res.totalfriendsList != '') {
            (res.totalfriendsList).forEach((element, index, array) => {
                db.query(`SELECT user_id,user_name,user_profile_img,user_chat_status FROM tbl_user_profile where user_id=?`, [element], function(error, results_comment_reply, fields) {
                    if (error) {} else {
                        var results_comment_reply_data = [];
                        if (results_comment_reply.length > 0) {
                            final_array.push(results_comment_reply[0]);

                        }

                        // final_array.push(results_comment_reply_data);
                        if (index === array.length - 1) {
                            return res.status(200).json({
                                status: 200,
                                msg: "Success",
                                totalFriendCount: final_array.length,
                                friendChatList: final_array
                            });
                        }


                    }
                });
            });
        } else {
            return res.status(400).json({
                status: 400,
                msg: "fail",
                   totalFriendCount: 0,
                                friendChatList: []
            });
        }
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail",
             totalFriendCount: 0,
                                friendChatList: []
        });
    }

});
app.post('/add_archive_chat', middleware.authenticateToken, (req, res, next) => {
    let upload = multer({
        storage: chat,
    }).single('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).json({
                status: 400,
                msg: "fail"
            });
        } else {
            var s = [];
            if (req.body.message_id && req.body.user_id) {
                var totalfriendsList = (req.body.message_id).split(",");
                var totalfriendsList1 = (req.body.sender_id).split(",");
                totalfriendsList.forEach((element, index, array) => {
                    delete(req.body.message_id);
                    delete(req.body.sender_id);
                    req.body.message_id = element;
                    req.body.sender_id = totalfriendsList1[index];
                    db.query(`INSERT INTO tbl_chat_archive SET ?`, req.body, function(error, results, fields) {
                        if (error) {
                            return res.status(400).json({
                                status: 400,
                                msg: "fail"
                            });
                        } else {
                            s.push(results.insertId);
                            if (index === array.length - 1) {
                                return res.status(200).json({
                                    status: 200,
                                    msg: "Success",
                                    archive_ids: s
                                });
                            }
                        }
                    });
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail",
                      archive_ids: []
                });
            }
        }
    });
});
app.get('/get_group_archive', middleware.authenticateToken, (req, res, next) => {
    if (req.query.group_id && req.query.user_id) {
        var final_array = [];
        db.query(`SELECT * FROM tbl_chat_archive where group_id=? and user_id=? order by chat_archive_id desc`, [req.query.group_id, req.query.user_id, req.query.user_id], function(error, results, fields) {
            if (error) throw error;
            else {
                if (results.length > 0) {
                    Object.keys(results).forEach(function(key, idx, array) {
                        var result_data = results[key];
                        db.query(`SELECT  * FROM tbl_chat_details where message_id=?;SELECT * FROM tbl_user_profile WHERE user_id = ?`, [result_data.message_id, result_data.user_id], function(error, results_comment1, fields) {
                            if (error) throw error;
                            else {

                                if (results_comment1[0].length > 0) {

                                    result_data.chat_details = results_comment1[0][0];


                                } else {

                                    result_data.chat_details = [];

                                }
                                if (results_comment1[1].length > 0) {

                                    result_data.user_details = results_comment1[1][0];

                                } else {

                                    result_data.user_details = [];

                                }
                                final_array.push(result_data);
                                if (idx === array.length - 1) {
                                    return res.status(200).json({
                                        status: 200,
                                        msg: "Success",
                                        archiveListCount: final_array.length,
                                        archiveList: final_array
                                    });
                                }
                            }
                        });
                    });
                } else {
                    return res.status(400).json({
                        status: 400,
                        msg: "fail",
                        archiveListCount:0,
                        archiveList: []
                    });
                }
            }
        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail",
             archiveListCount:0,
                        archiveList: []
        });
    }

});
app.get('/delete_group_archive', middleware.authenticateToken, (req, res, next) => {
    if (req.query.chat_archive_id) {
        db.query(`DELETE from tbl_chat_archive where chat_archive_id=?`, [req.query.chat_archive_id], function(error, results1, fields) {
            if (error) throw error;
            return res.status(200).json({
                status: 200,
                msg: "Success"
            });
        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail"
        });
    }
});
app.post('/add_group_report', middleware.authenticateToken, (req, res, next) => {
    let upload = multer({
        storage: chat,
    }).single('group_report_image');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).json({
                status: 400,
                msg: "fail"
            });
        } else {
            if (req.body.group_id && req.body.group_reported_by) {
                if (typeof req.file !== 'undefined') {
                    req.body.group_report_image = req.file.filename;
                }
                db.query(`INSERT INTO tbl_user_group_report SET ?`, [req.body], function(error, results, fields) {
                    if (error) {
                        return res.status(400).json({
                            status: 400,
                            msg: "fail"
                        });
                    } else {
                        return res.status(200).json({
                            status: 200,
                            msg: "Success"
                        });
                    }
                });

            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail"
                });
            }
        }
    });
});
app.get('/get_all_friend_status', middleware.authenticateToken, full.totalFriendsArrayOther, (req, res, next) => {
    if (req.query.user_id) {
        var final_array = [];
        if (res.totalFriendList != '' && res.totalFriendList.length > 0) {
            (res.totalFriendList).forEach((element, index, array) => {
                db.query(`SELECT user_id,user_name,user_profile_img,user_chat_status FROM tbl_user_profile where user_id=?`, [element], function(error, results_comment_reply, fields) {
                    if (error) {} else {
                        var results_comment_reply_data = [];
                        if (results_comment_reply.length > 0) {
                            results_comment_reply[0].request_status = res.requestStatus[index];
                            results_comment_reply[0].request_status_duration = timeAgo(new Date(res.createdDate[index]).toISOString());
                            final_array.push(results_comment_reply[0]);
                        }
                        // final_array.push(results_comment_reply_data);
                        if (index === array.length - 1) {
                            return res.status(200).json({
                                status: 200,
                                msg: "Success",
                                totalFriendCount: final_array.length,
                                friendChatList: final_array
                            });
                        }
                    }
                });
            });
        } else {
            return res.status(400).json({
                status: 400,
                msg: "fail",
                 totalFriendCount:0,
                        friendChatList: []
            });
        }
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail",
              totalFriendCount:0,
                        friendChatList: []
        });
    }
});
app.get('/chat_block_unblock', middleware.authenticateToken, (req, res, next) => {
    if (req.query.blocked_by_user_id && req.query.blocked_to_user_id) {
        db.query(`SELECT * from tbl_chat_status where blocked_by_user_id=? and blocked_to_user_id`, [req.query.blocked_by_user_id, req.query.blocked_to_user_id], function(error, results, fields) {
            if (error) {
                return res.status(400).json({
                    status: 400,
                    msg: "fail"
                });
            } else {

                if (results.length > 0) {
                    db.query(`UPDATE tbl_chat_status SET ? where blocked_by_user_id= ? and blocked_to_user_id=?;`, [{
                        status: req.query.status
                    }, req.query.blocked_by_user_id, req.query.blocked_to_user_id], function(error, results13, fields) {
                        if (error) {
                            return res.status(400).json({
                                status: 400,
                                msg: "fail"
                            });
                        } else {
                            return res.status(200).json({
                                status: 200,
                                msg: "Success"
                            });
                        }
                    });

                } else {
                    db.query(`INSERT INTO tbl_chat_status SET ?`, [req.query], function(error, results13, fields) {
                        if (error) {
                            return res.status(400).json({
                                status: 400,
                                msg: "fail"
                            });
                        } else {
                            return res.status(200).json({
                                status: 200,
                                msg: "Success"
                            });
                        }
                    });
                }
            }
        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail"
        });
    }
});
app.get('/get_chat_business_schedule', middleware.authenticateToken, full.totalFriendsArray, (req, res, next) => {
    if (req.query.chat_business_id) {

        var comment_re = [];
        db.query(`SELECT * FROM tbl_chat_business_schedule where chat_business_id=?`, [req.query.chat_business_id], function(error, results_comment_re, fields) {
            if (error) throw error;
            if (results_comment_re.length > 0) {
                return res.status(200).json({
                    status: 200,
                    msg: "Success",
                    totalChatBusiness: results_comment_re.length,
                    chatBusinessList: results_comment_re
                });

            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail",
                      totalChatBusiness:0,
                        chatBusinessList: []
                });
            }

        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail",
                      totalChatBusiness:0,
                        chatBusinessList: []
        });
    }
});



/*app.get('/get_chat_group_member', middleware.authenticateToken, full.totalFriendsArray, (req, res, next) => {
    if (req.query.group_id) {

        var comment_re = [];
        db.query(`SELECT * FROM tbl_user_group_members where group_id=?`, [req.query.group_id], function(error, results_comment_re, fields) {
            if (error) throw error;
            if (results_comment_re.length > 0) {
                return res.status(200).json({
                    status: 200,
                    msg: "Success",
                    totalGroupMember: results_comment_re.length,
                    groupMemberList: results_comment_re
                });

            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail"
                });
            }

        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail"
        });
    }
});
*/



app.get('/get_chat_group_member', middleware.authenticateToken, full.totalFriendsArray, (req, res, next) => {
     var adminCount=0;
    if (!req.query.group_id) {
        return res.status(400).json({
            status: 400,
            msg: "fail"
        });
    } else {
        db.query(`SELECT * FROM tbl_user_group_members WHERE group_id = ?`, [req.query.group_id], function(error, results, fields) {
            if (error) {
                return res.status(400).json({
                    status: 400,
                    msg: "fail"
                });
            } else {
                if (results.length > 0) {
                    var final_array1 = [];
                   
                    var cc = 0;
                    Object.keys(results).forEach(function(key, idx, array) {
                        var result_data = results[key];
                        db.query(`SELECT * FROM tbl_user_profile WHERE user_id = ?; SELECT group_admins,user_id FROM tbl_user_group WHERE group_id = ?`, [result_data.user_id,result_data.group_id], function(err, rows_user, fields) {
                            if (err) {

                            } else {
                                if (rows_user[0].length > 0) {

                                    result_data.user_id = rows_user[0][0].user_id;
                                    result_data.user_name = rows_user[0][0].user_name;
                                    result_data.user_profile_img = rows_user[0][0].user_profile_img;
                                    if(rows_user[1].length>0 && rows_user[1][0].group_admins !== null && rows_user[1][0].group_admins !== '') {
                                        /*result_data.user_test = result_data.user_id;
                                       result_data.user_array = rows_user[1][0].group_admins.split(',');*/
                                        result_data.admin_count = rows_user[1][0].group_admins.split(',').length; 
                                         result_data.creator_groupId = rows_user[1][0].user_id.toString();
                                           result_data.group_admins = rows_user[1][0].group_admins.toString();
                                       var isAdmincheck=rows_user[1][0].group_admins.split(',').includes(result_data.user_id.toString());
                                       if(isAdmincheck==true)
                                       {
                                           result_data.isAdmin = "1"; 
                                          
                                       }
                                       else
                                       {
                                            result_data.isAdmin = "0"; 
                                       }
                                        //result_data.isAdmin = rows_user[1][0].group_admins.split(',').includes(result_data.user_id.toString());
                                                  }
                                                  else
                                                  {
                                                      result_data.isAdmin="";
                                                  }

                                } else {
                                    result_data.user_id = '';
                                    result_data.user_name = '';
                                    result_data.user_profile_img = '';
                                }
                                final_array1.push(result_data);
                                if (idx === array.length - 1) {
                                    return res.status(200).json({
                                        status: 200,
                                        msg: "Success",
                                       // adminCount:adminCount,
                                        groupMemberListCount: final_array1.length,
                                        groupMemberList: final_array1
                                    });
                                }
                            }
                        });
                    });
                } else {
                    return res.status(404).json({
                        status: 404,
                        msg: "No Record Found",
                      groupMemberListCount:0,
                        groupMemberList: []
                    });
                }
            }
        });
    }
});







app.post('/add_chat_business_schedule', middleware.authenticateToken, (req, res, next) => {
    let upload = multer({
        storage: chat,
    }).single('');
    upload(req, res, function(err) {
        if (err) {
            return res.status(400).json({
                status: 400,
                msg: err
            });
        } else {
            if (req.body.chat_business_id && req.body.chat_user_id) {
                db.query(`SELECT * from tbl_chat_business_schedule where chat_business_id=? and chat_user_id`, [req.body.chat_business_id, req.body.chat_user_id], function(error, results, fields) {
                    if (error) {
                        return res.status(400).json({
                            status: 400,
                            msg: "fail"
                        });
                    } else {

                        if (results.length > 0) {
                            db.query(`UPDATE tbl_chat_business_schedule SET ? where chat_business_id= ? and chat_user_id=?;`, [req.body, req.body.chat_business_id, req.body.chat_user_id], function(error, results13, fields) {
                                if (error) {
                                    return res.status(400).json({
                                        status: 400,
                                        msg: "fail"
                                    });
                                } else {
                                    return res.status(200).json({
                                        status: 200,
                                        msg: "Success"
                                    });
                                }
                            });

                        } else {
                            db.query(`INSERT INTO tbl_chat_business_schedule SET ?`, [req.body], function(error, results13, fields) {
                                if (error) {
                                    return res.status(400).json({
                                        status: 400,
                                        msg: "fail"
                                    });
                                } else {
                                    return res.status(200).json({
                                        status: 200,
                                        msg: "Success"
                                    });
                                }
                            });
                        }
                    }
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail"
                });
            }
        }
    });
});
app.get('/get_chat_background', middleware.authenticateToken, full.totalFriendsArray, (req, res, next) => {
    var pagination = [];
    if (req.query.page_no) {
        var no_of_records_per_page = 10;
        var rowno = req.query.page_no;
        if (rowno != 0) {
            rowno = (rowno - 1) * no_of_records_per_page;
        }
        var comment = [];
        db.query(`SELECT * FROM tbl_chat_background LIMIT ? OFFSET ?;SELECT COUNT(*) AS numrows FROM tbl_chat_background`, [no_of_records_per_page, rowno], function(error, results_comment, fields) {
            if (error) throw error;
            if (results_comment[0].length > 0) {
                Object.keys(results_comment[0]).forEach(function(key12, idx12, array12) {
                    var results_comment_data = results_comment[0][key12];
                    comment.push(results_comment_data.chat_background_url);
                    if (idx12 === array12.length - 1) {
                        let max_pages = parseInt(Math.ceil((results_comment[1][0].numrows) / no_of_records_per_page));
                        if (req.query.page_no && req.query.page_no <= max_pages) {
                            let page_no = req.query.page_no;
                            // PAGINATION START
                            let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
                            //  let sliceData = final_array.slice(offset, offset + no_of_records_per_page)
                            var pagination = {
                                total_rows: results_comment[1][0].numrows,
                                total_pages: parseInt(Math.ceil((results_comment[1][0].numrows) / no_of_records_per_page)),
                                per_page: no_of_records_per_page,
                                offset: offset,
                                current_page_no: page_no
                            };
                            return res.status(200).json({
                                status: 200,
                                msg: "Success",
                                chatBackgroundeListCount: results_comment[1][0].numrows,
                                chatBackgroundeList: comment,
                                pagination: pagination
                            });
                        } else {
                            return res.status(404).json({
                                status: 404,
                                msg: "Page no missing or Its incorrect.",
                                 chatBackgroundeListCount: 0,
                                chatBackgroundeList: [],
                               pagination:  {
                                        total_rows: 0,
                                        total_pages: 0,
                                        per_page: 0,
                                        offset: 0,
                                        current_page_no: '0'
                                    }

                            });
                        }
                    }

                });
            } else {
                return res.status(400).json({
                    status: 400,
                    msg: "fail",
                            chatBackgroundeListCount: 0,
                                chatBackgroundeList: [],
                               pagination:  {
                                        total_rows: 0,
                                        total_pages: 0,
                                        per_page: 0,
                                        offset: 0,
                                        current_page_no: '0'
                                    }
                });
            }
        });

    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail",
                    chatBackgroundeListCount: 0,
                                chatBackgroundeList: [],
                               pagination:  {
                                        total_rows: 0,
                                        total_pages: 0,
                                        per_page: 0,
                                        offset: 0,
                                        current_page_no: '0'
                                    }
        });
    }

});
app.get('/update_seen_status12', middleware.authenticateToken, (req, res, next) => {
    if (req.query.receiver_user_id && req.query.sender_user_id) {
        db.query(`select * from tbl_user_profile where user_id= ?;select * from tbl_user_profile where user_id= ?`, [req.query.receiver_user_id, req.query.sender_user_id], function(error12, results12, fields12) {
            if (error12) {
                return res.status(400).json({
                    status: 400,
                    msg: "fail"
                });
            } else {
                var message_media = [];
                db.query(`UPDATE tbl_chat_details SET ? where receiver_user_id=? and sender_user_id=? AND message_status=?;UPDATE tbl_chat_details SET ? where receiver_user_id=? and sender_user_id=? AND message_status=?`, [{
                    message_status: '3'
                }, req.query.sender_user_id, req.query.receiver_user_id, '1', {
                    message_status: '3'
                }, req.query.sender_user_id, req.query.receiver_user_id, '2'], function(error, results, fields) {
                    if (error) {
                        return res.status(400).json({
                            status: 400,
                            msg: "fail"
                        });
                    } else {
                        if (results12[0].length > 0 && results12[0][0].user_register_id && results12[0][0].user_register_id != '') {
                            var options = {
                                'method': 'POST',
                                'url': 'https://fcm.googleapis.com/fcm/send',
                                'headers': {
                                    'Authorization': 'key=AAAAWRGw03M:APA91bETShIEhgnkyCStvphR_OAZ72XaUx_Quj3TgdB7CexvvhFx9REavNhecH35uIi-0N5CAXuT4B71CFpSyHLJEpY93TPgAjEVAMBJfjU_hCEdS7_ah2-ziKVryMchyfJ1btrvyGou',
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    "to": "/topics/" + results12[0][0].user_register_id,
                                    "data": {
                                        "title": "update",
                                        "body": "normal"
                                    }
                                })
                            };
                            request(options, function(error, response) {
                                //console.log(response);
                            });
                        }
                        if (results12[1].length > 0 && results12[1][0].user_register_id && results12[1][0].user_register_id != '') {
                            var options = {
                                'method': 'POST',
                                'url': 'https://fcm.googleapis.com/fcm/send',
                                'headers': {
                                    'Authorization': 'key=AAAAWRGw03M:APA91bETShIEhgnkyCStvphR_OAZ72XaUx_Quj3TgdB7CexvvhFx9REavNhecH35uIi-0N5CAXuT4B71CFpSyHLJEpY93TPgAjEVAMBJfjU_hCEdS7_ah2-ziKVryMchyfJ1btrvyGou',
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    "to": "/topics/" + results12[1][0].user_register_id,
                                    "data": {
                                        "title": "update",
                                        "body": "normal"
                                    }
                                })
                            };
                            request(options, function(error, response) {
                                //console.log(response);
                            });
                        }
                        return res.status(200).json({
                            status: 200,
                            msg: "Success"
                        });
                    }
                });
            }
        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail"
        });
    }
});
app.get('/get_group_chat_messages', middleware.authenticateToken, (req, res, next) => {
    if (req.query.chat_group_id && req.query.page_no) {
        var no_of_records_per_page = 10;
        var rowno = req.query.page_no;
        if (rowno != 0) {
            rowno = (rowno - 1) * no_of_records_per_page;
        }
        db.query(`SELECT * FROM tbl_chat_details where chat_group_id=? order by message_id DESC LIMIT ? OFFSET ?; SELECT COUNT(*) AS numrows FROM tbl_chat_details where chat_group_id=?`, [req.query.chat_group_id, no_of_records_per_page, rowno, req.query.chat_group_id], function(error, results, fields) {
            if (error) throw error;
            if (results[0].length > 0) {
                var final_array = [];
                var final_array_one = [];
                var comment = [];
                var rating = 0;
                var rating_count = 0;
                var flag = 2;
                if (results[0].length > 0) {
                    Object.keys(results[0]).forEach(function(key, idx, array) {
                      //  var result_data=[];
                        var result_data = results[0][key];
                        db.query(`SELECT * FROM tbl_user_profile where user_id=?`, [result_data.sender_user_id], function(error, results_comment, fields) {
                            if (error) throw error;
                            if (results_comment.length > 0) {
                                result_data.user_name = results_comment[0].user_name;
                                result_data.user_profile_img = results_comment[0].user_profile_img;

                            } else {
                                result_data.user_name = '';
                                result_data.user_profile_img = '';

                            }
                             result_data.zktor_chat_duration = timeAgo(new Date(result_data.created_date).toISOString());
                             result_data.created_date = moment(Date.parse(result_data.created_date)).format('DD-MM-YYYY HH:mmA');
                              result_data.modified_date = moment(Date.parse(result_data.modified_date)).format('DD-MM-YYYY HH:mmA');
                              
                              result_data.message_id = (result_data.message_id).toString();
                                result_data.sender_user_id = (result_data.sender_user_id).toString();
                                  result_data.receiver_user_id = (result_data.receiver_user_id).toString();
                                    result_data.delete_status = (result_data.delete_status).toString();
                                      result_data.cleared_status = (result_data.cleared_status).toString();
                                      
                              
                              
                              
                              
                            result_data.user_type = 'User';
                            final_array.push(result_data);
                            if (idx === array.length - 1) {
                                let max_pages = parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page));
                                if (req.query.page_no && req.query.page_no <= max_pages) {
                                    let page_no = req.query.page_no;
                                    // PAGINATION START
                                    let offset = parseInt(Math.ceil((page_no * no_of_records_per_page) - no_of_records_per_page));
                                    //  let sliceData = final_array.slice(offset, offset + no_of_records_per_page)
                                    var pagination = {
                                        total_rows: results[1][0].numrows,
                                        total_pages: parseInt(Math.ceil((results[1][0].numrows) / no_of_records_per_page)),
                                        per_page: no_of_records_per_page,
                                        offset: offset,
                                        current_page_no: page_no
                                    };
                                    return res.status(200).json({
                                        status: 200,
                                        msg: "Success",
                                        chatMessageListCount: results[1][0].numrows,
                                        chatMessageList: final_array,
                                        pagination: pagination
                                    });
                                } else {
                                    return res.status(404).json({
                                        status: 404,
                                        msg: "Page no missing or Its incorrect.",
                                                chatMessageListCount: 0,
                                chatMessageList: [],
                               pagination:  {
                                        total_rows: 0,
                                        total_pages: 0,
                                        per_page: 0,
                                        offset: 0,
                                        current_page_no: '0'
                                    }
                                    });
                                }
                            }
                        });
                    });

                } else {
                    if (idx === array.length - 1) {
                        return res.status(200).json({
                            status: 200,
                            msg: "Success",
                            chatMessageList: final_array
                        });
                    }
                }


            } else {
                return res.status(404).json({
                    status: 404,
                    msg: "Record not found",
                                      chatMessageListCount: 0,
                                chatMessageList: [],
                               pagination:  {
                                        total_rows: 0,
                                        total_pages: 0,
                                        per_page: 0,
                                        offset: 0,
                                        current_page_no: '0'
                                    }
                });
            }
        });
    } else {
        return res.status(400).json({
            status: 400,
            msg: "fail",
                              chatMessageListCount: 0,
                                chatMessageList: [],
                               pagination:  {
                                        total_rows: 0,
                                        total_pages: 0,
                                        per_page: 0,
                                        offset: 0,
                                        current_page_no: '0'
                                    }
        });
    }
});
app.get('/get_group_friend_list', middleware.authenticateToken,full.totalFriendsArrayGroup,full.getAllFrindListForGroup, (req, res, next) => {
    if (!req.query.receiver_user_id) {
        return res.status(400).json({
            status: 400,
            msg: "fail",
             friendList:[]
        });
    } else {
            if(!req.query.group_id){
                console.log(res.totalfriendsList);
                if (res.totalfriendsList.length > 0) {
                    var final_array = [];
                    var array=res.totalfriendsList;
                    res.totalfriendsList.forEach(function(element, index) {
                        db.query(`SELECT * FROM tbl_user_profile WHERE user_id = ?`, [element], function(err, rows, fields) {
                            if (err) {
                                return res.status(400).json({
                                    status: 400,
                                    msg: err,
                                     friendList:[]
                                });
                            } else {
                                 if(rows.length<=0){
                                    rows[0]={};
                                }
                                if (rows.length > 0) {
                                    db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [element, element, '1'], function(error, results11, fields) {
                                        if (error) {
                                            rows[0].totalfriend = 0;


                                        } else {
                                            rows[0].totalfriend = results11.length;


                                        }

                                        final_array.push(rows[0]);
                                        if (index === array.length - 1) {
                                            return res.status(200).json({
                                                status: 200,
                                                msg: "Success",
                                                friendList: final_array
                                            });
                                        }
                                    });
                                }
                            }
                        });

                    });

                } else {
                    return res.status(404).json({
                        status: 404,
                        msg: "No Record Found1",
                         friendList:[]
                    });
                }
    }else{
        console.log(res.totalfriendsList);
        if (res.totalfriendsList.length > 0) {
        var mk=res.totalfriendsList;
               var d = [];
              console.log(res.groupdata);
   if (res.groupdata.length > 0){
        d = mk.filter(x => (res.groupdata).indexOf(x) === -1);
    } else {
            d = mk;
    }
    console.log(d);
    if(d.length>0){
                    var final_array = [];
                    var array=res.totalfriendsList;
                   d.forEach(function(element, index) {
                    //   var result = results[key];
                     //  var element=result.user_id;
                        db.query(`SELECT * FROM tbl_user_profile WHERE user_id = ?`, [element], function(err, rows, fields) {
                            if (err) {
                                return res.status(400).json({
                                    status: 400,
                                    msg: err
                                });
                            } else {
                                if(rows.length<=0){
                                    rows[0]={};
                                }
                                //console.log(row);
                                if (rows.length > 0) {
                                    db.query(`SELECT * FROM tbl_friend_request WHERE (receiver_user_id = ? or sender_user_id = ?) AND request_status = ?`, [element, element, '1'], function(error, results11, fields) {
                                        if (error) {
                                            rows[0].totalfriend = 0;


                                        } else {
                                            rows[0].totalfriend = results11.length;


                                        }

                                        final_array.push(rows[0]);
                                        if (index === d.length - 1) {
                                            return res.status(200).json({
                                                status: 200,
                                                msg: "Success",
                                                friendList: final_array
                                            });
                                        }
                                    });
                                }
                            }
                        });

                    });
}else {
                    return res.status(404).json({
                        status: 404,
                        msg: "No Record Found",
                        friendList:[]
                    });
                }
        
      
        } else {
                    return res.status(404).json({
                        status: 404,
                        msg: "No Record Found",
                         friendList:[]
                    });
                }
    }
    }
    
});
module.exports = app;