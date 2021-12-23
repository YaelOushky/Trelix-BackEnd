const logger = require('../services/logger.service');

function requireAuth(req, res, next) {
	if (!req.session || !req.session.user) {
		console.log(req.session);
		res.status(401).end('Not authenticated, Please Login');
		return;
	}
	console.log('aa', req.session);
	next();
}

function requireAdmin(req, res, next) {
	const user = req.session.user;
	if (!user.isAdmin) {
		logger.warn(user.fullname + ' Attempt to perform admin action');
		res.status(403).end('Unauthorized Enough..');
		return;
	}
	next();
}

// module.exports = requireAuth

module.exports = {
	requireAuth,
	requireAdmin,
};
