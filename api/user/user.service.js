const dbService = require('../../services/db.service');
const logger = require('../../services/logger.service');
const reviewService = require('../review/review.service');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
	query,
	getById,
	getByUsername,
	remove,
	update,
	add,
	getByEmail
};

async function query(filterBy = {}) {
	const criteria = _buildCriteria(filterBy);
	try {
		const collection = await dbService.getCollection('user');
		var users = await collection.find(criteria).toArray();
		users = users.map((user) => {
			delete user.password;
			user.createdAt = ObjectId(user._id).getTimestamp();
			// Returning fake fresh data
			// user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
			return user;
		});
		return users;
	} catch (err) {
		logger.error('cannot find users', err);
		throw err;
	}
}

async function getById(userId) {
	try {
		// console.log('userId from getById', userId);
		const collection = await dbService.getCollection('user');
		const user = await collection.findOne({ _id: ObjectId(userId) });
		// console.log('user from getById', user);
		delete user.password;

		user.givenReviews = await reviewService.query({
			byUserId: ObjectId(user._id),
		});
		user.givenReviews = user.givenReviews.map((review) => {
			delete review.byUser;
			return review;
		});

		return user;
	} catch (err) {
		logger.error(`while finding user ${userId}`, err);
		throw err;
	}
}
async function getByUsername(username) {
	try {
		const collection = await dbService.getCollection('user');
		const user = await collection.findOne({ username });
		return user;
	} catch (err) {
		logger.error(`while finding user ${username}`, err);
		throw err;
	}
}
async function getByEmail(email) {
	try {
		const collection = await dbService.getCollection('user');
		const user = await collection.findOne({ email });
		console.log('user',user);
		return user;
	} catch (err) {
		logger.error(`while finding user ${email}`, err);
		throw err;
	}
}

async function remove(userId) {
	try {
		const collection = await dbService.getCollection('user');
		await collection.deleteOne({ _id: ObjectId(userId) });
	} catch (err) {
		logger.error(`cannot remove user ${userId}`, err);
		throw err;
	}
}

async function update(user) {
	try {
		// peek only updatable fields!
		var id = ObjectId(user._id) // needed for the returnd obj
		// };
		user._id=id
		const collection = await dbService.getCollection('user');
		await collection.updateOne({ _id: user._id },{ $set: {...user} });
		return user
	} catch (err) {
		logger.error(`cannot update user ${user._id}`, err);
		throw err;
	}
}

async function add(user) {
	console.log('userservice',user );
	try {
		// peek only updatable fields!
	
		// const userToAdd = {
		// 	email: user.email,
		// 	password: user.password,
		// 	fullname: user.fullname,
		// 	imgUrl:user.imgUrl,
		// 	boards: user.boards
		// };
		// console.log(userToAdd, 'userToAdd');
		const collection = await dbService.getCollection('user');
		var newUser= await collection.insertOne(user);
		// console.log('newUser',newUser );
		return newUser;
	} catch (err) {
		logger.error('cannot insert user', err);
		throw err;
	}
}

function _buildCriteria(filterBy) {
	const criteria = {};
	if (filterBy.txt) {
		const txtCriteria = { $regex: filterBy.txt, $options: 'i' };
		criteria.$or = [
			{
				username: txtCriteria,
			},
			{
				fullname: txtCriteria,
			},
		];
	}
	if (filterBy.minBalance) {
		criteria.balance = { $gte: filterBy.minBalance };
	}
	return criteria;
}
