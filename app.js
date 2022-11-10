require('dotenv').config();
const fs = require('fs');
const fastify = require('fastify')({
	logger: true,
// 	https:{
// 	     key: fs.readFileSync('../../ssl/namecheap/zktor_com.key'),
//         cert: fs.readFileSync('../../ssl/namecheap/zktor_com.crt'),
// 	}
});
fastify.setErrorHandler(function (err, req, res) {
    console.log(req.headers);
    console.log(req.body);
		let errorName = define.DEFAULT_ERROR_NAME;
		let errorMessage = define.DEFAULT_ERROR_MESSAGE;
		if (err.name)
			errorName = err.name;
		if (err.message)
			errorMessage = err.message;
		return res.status(400).send({
			status: 400,
			error: errorName,
			msg: errorMessage
		});
	});
	fastify.register(require('fastify-cors'), {
		origin: true,
		allowedHeaders: [
			'Origin', 
			'X-Requested-With', 
			'Accept', 
			'Content-Type', 
			'Authorization'
		],
		methods: ['GET', 'PUT', 'OPTIONS', 'POST', 'DELETE'],
	  });
// fastify.register(require('@fastify/swagger'), {
//   routePrefix: '/documentation',
//         exposeRoute: true
//       });
// fastify.register(require('@fastify/multipart'), { attachFieldsToBody: 'keyValues' });
var path = require('path');
global.define = require("./config/constants");
const multer = require("fastify-multer");
fastify.register(multer.contentParser)
const routes = require("./routes/route");
routes.forEach((route, index) => {
	fastify.route(route)
});
const PORT = process.env.PORT
const start = async () => {
	try {
		await fastify.listen(PORT, '127.0.0.1', function() {});
	} catch (error) {
		fastify.log.error(error)
		process.exit(1)
	}
}
start()
