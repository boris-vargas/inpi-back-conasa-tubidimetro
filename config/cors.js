module.exports = function(req,res,next){

	res.header('Access-Control-Allow-Origin','*')
	res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS,PATH')
	res.header('Access-Control-Allow-Headers','Origin, X-Request-With, Content-Type, Accept, Authorization')
	next()
}