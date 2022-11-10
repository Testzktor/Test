const db = require("../../config/connection");
const middleware = require("../../middleware/authentication");
exports.get_news = async (req, res) => {
	try {
    if (req.query.page_no) {
        var no_of_records_per_page = 10;
        var rowno = req.query.page_no;
        if (rowno != 0) {
            rowno = (rowno - 1) * no_of_records_per_page;
        }
        db.query(`SELECT * FROM tbl_news LIMIT ? OFFSET ?; SELECT COUNT(*) AS numrows FROM tbl_news `, [no_of_records_per_page, rowno], function(error, results, fields) {
            if (error) throw error;
            if (results[0].length > 0) {
                var final_array = [];
                var final_array_one = [];
                var comment = [];
                var rating = 0;
                var rating_count = 0;
                var flag = 2;
                if (results[0].length > 0) {
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
                        return res.status(200).send({
                            status: 200,
                            msg: "Success",
                            NewsListCount: results[1][0].numrows,
                            NewsList: results[0],
                            pagination: pagination
                        });
                    } else {
                        return res.status(404).send({
                            status: 404,
                            msg: "Page no missing or Its incorrect.",
                              NewsListCount: 0,
                            NewsList: [],
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
                    if (idx === array.length - 1) {
                        return res.status(200).send({
                            status: 200,
                            msg: "Success",
                            NewsList: final_array
                        });
                    }
                }


            } else {
                return res.status(404).send({
                    status: 404,
                    msg: "Record not found",
                           NewsListCount: 0,
                            NewsList: [],
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
        return res.status(400).send({
            status: 400,
            msg: "fail",
                   NewsListCount: 0,
                            NewsList: [],
                            pagination:  {
                                        total_rows: 0,
                                        total_pages: 0,
                                        per_page: 0,
                                        offset: 0,
                                        current_page_no: '0'
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
exports.get_all_news = async (req, res) => {
	try {
    db.query(`SELECT * FROM tbl_news`, function(error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            var final_array = [];
            var final_array_one = [];
            var comment = [];
            var rating = 0;
            var rating_count = 0;
            var flag = 2;
            if (results.length > 0) {

                return res.status(200).send({
                    status: 200,
                    msg: "Success",
                    NewsListCount: results.length,
                    NewsList: results

                });

            } else {

                return res.status(200).send({
                    status: 200,
                    msg: "Success",
                    NewsList: final_array,
                    NewsListCount: final_array.length,
                });
            }


        } else {
            return res.status(404).send({
                status: 404,
                msg: "Record not found",
                  NewsList: [],
                    NewsListCount:0,
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