const dbService = require('../../services/db.service');
const ObjectId = require('mongodb').ObjectId;
const asyncLocalStorage = require('../../services/als.service');

async function query(filterBy = {}) {
    try {
        console.log('filterBy', filterBy);

        const criteria = _buildCriteria(filterBy);
        const collection = await dbService.getCollection('review');
        // const reviews = await collection.find(criteria).toArray();
        var reviews = await collection
            .aggregate([
                {
                    $match: criteria,
                },
                {
                    $lookup: {
                        localField: 'aboutBoardId',
                        from: 'board',
                        foreignField: '_id',
                        as: 'aboutBoard',
                    },
                },
                {
                    $unwind: '$aboutBoard',
                },
                {
                    $lookup: {
                        localField: 'byUserId',
                        from: 'user',
                        foreignField: '_id',
                        as: 'aboutUser',
                    },
                },
                {
                    $unwind: '$aboutUser',
                },
            ])
            .toArray();
        // console.log(reviews);
        reviews = reviews.map((review) => {
            review.aboutBoard = {
                _id: review.aboutBoard._id,
                name: review.aboutBoard.name,
            };
            review.aboutUser = {
                _id: review.aboutUser._id,
                fullname: review.aboutUser.fullname,
            };
            delete review.aboutBoardId;
            delete review.aboutUserId;
            return review;
        });

        return reviews;
        // return collection;
    } catch (err) {
        console.log(err);
        // logger.error('cannot find reviews', err);
        throw err;
    }
}

async function remove(reviewId) {
    try {
        const store = asyncLocalStorage.getStore();
        const { userId, isAdmin } = store;
        const collection = await dbService.getCollection('review');
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(reviewId) };
        if (!isAdmin) criteria.byUserId = ObjectId(userId);
        await collection.deleteOne(criteria);
    } catch (err) {
        logger.error(`cannot remove review ${reviewId}`, err);
        throw err;
    }
}

async function add(review) {
    try {
        // peek only updatable fields!
        const reviewToAdd = {
            byUserId: ObjectId(review.byUserId),
            aboutBoardId: ObjectId(review.aboutBoardId),
            txt: review.txt,
        };
        const collection = await dbService.getCollection('review');
        const addedReview = await collection.insertOne(reviewToAdd);

        console.log('addedReview', addedReview);
        return addedReview.ops[0];
    } catch (err) {
        logger.error('cannot insert review', err);
        throw err;
    }
}

function _buildCriteria(filterBy) {
    const criteria = {};
    // const criteria = { aboutToyId: { $eq: '61a275ff143bdd01344262f1' } };

    // filter by userId
    // if (filterBy.userId) {
    // 	const regex = new RegExp(filterBy.userId, 'i');
    // 	criteria.userId = { $regex: regex };
    // }

    // criteria.txt =

    // // filter by toyId
    if (filterBy.boardId) {
        criteria.aboutBoardId = { $eq: ObjectId(filterBy.boardId) };
    }
    if (filterBy.userId) {
        criteria.byUserId = { $eq: ObjectId(filterBy.userId) };
    }

    return criteria;
}

module.exports = {
    query,
    remove,
    add,
};
