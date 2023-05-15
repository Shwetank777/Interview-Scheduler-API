import * as Mongo from '../data/mongo/mongoHelper.js';
import { SCHEDULES } from '../data/mongo/mongoCollections.js';
import * as user from './userService.js';
import { USER_TYPES } from '../utils/constants.js';

const prepareScheduleData = async (scheduleData) => {
	scheduleData.scheduleId = scheduleData._id;
	scheduleData.user1Data = await user.fetchUserById(scheduleData.user1Id);
	scheduleData.user2Data = await user.fetchUserById(scheduleData.user2Id);
	scheduleData.scheduledByData = await user.fetchUserById(scheduleData.scheduledBy);
	scheduleData.scheduledAt = scheduleData.scheduledAt ? new Date(scheduleData.scheduledAt).toISOString() : undefined;
	delete scheduleData._id;

	return scheduleData;
};

export const fetchSchedules = async (userId, page, pageSize, listUpcoming = true) => {
	const criteria = {};

	const currentTimeStamp = new Date();
	const userData = await user.fetchUserById(userId);

	if (userData.type === USER_TYPES.COMPANY.key) {
		criteria['createdBy'] = userId;
	} else if (userData.type === USER_TYPES.USER.key) {
		criteria['$or'] = [{ user1Id: userId }, { user2Id: userId }];
	}

	if (listUpcoming) {
		criteria['scheduledAt'] = { $gte: currentTimeStamp };
	} else {
		criteria['scheduledAt'] = { $lt: currentTimeStamp };
	}

	const scheduleList = await Mongo.findByCriteriaPaginated(SCHEDULES, criteria, { scheduledAt: listUpcoming ? 1 : -1 }, page, pageSize);

	if (!scheduleList.length) {
		throw new Error('No schedules found.');
	}

	return Promise.all(
		scheduleList.map(async (scheduleData) => {
			return await prepareScheduleData(scheduleData);
		})
	);
};

export const fetchUpcomingSchedulesByDate = async (userId, scheduledFrom, scheduledTo) => {
	const criteria = {
		user2Id: userId,
		$or: [
			{ $and: [{ scheduledFrom: { $lte: scheduledFrom } }, { scheduledTo: { $gte: scheduledTo } }] }, // complete overlapping
			{ $and: [{ scheduledFrom: { $lte: scheduledFrom } }, { scheduledTo: { $gte: scheduledFrom } }] }, // starting overlapping
			{ $and: [{ scheduledFrom: { $lte: scheduledTo } }, { scheduledTo: { $gte: scheduledTo } }] },  // ending overlapping
		],
	};
    console.log(JSON.stringify(criteria));
	const scheduleList = await Mongo.findByCriteria(SCHEDULES, criteria);
    console.log("Here 0", scheduleList);
	return scheduleList.length ? scheduleList : [];
};

export const createSchedule = async (scheduleData) => {
	await Mongo.createOne(SCHEDULES, scheduleData);

	return `Schedule created.`;
};

export const deleteSchedule = async (scheduleId) => {
	const criteria = {
		_id: scheduleId,
	};

	await Mongo.deleteOneByCriteria(SCHEDULES, criteria);

	return `Schedule deleted.`;
};
