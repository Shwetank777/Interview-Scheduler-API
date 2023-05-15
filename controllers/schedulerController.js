import * as scheduler from './../services/schedulerService.js';
import * as user from './../services/userService.js';

export const listUpcomingSchedules = async (email, page, pageSize) => {
	try {
		const userId = await user.fetchUserIdByEmail(email);
		return await scheduler.fetchSchedules(userId, page, pageSize, true);
	} catch (err) {
		throw err;
	}
};

export const listPastSchedules = async (email, page, pageSize) => {
	try {
		const userId = await user.fetchUserIdByEmail(email);
		return await scheduler.fetchSchedules(userId, page, pageSize, false);
	} catch (err) {
		throw err;
	}
};

export const schedule = async (email, scheduleData) => {
	try {
		if (scheduleData.user1Email === scheduleData.user2Email) {
			throw new Error('Cannot schedule a meeting between same users.');
		}

		const userId = await user.fetchUserIdByEmail(email);

		let scheduleDateTime = new Date(scheduleData.date);
		scheduleData.time = scheduleData.time.split(':');
		scheduleDateTime.setHours(scheduleData.time[0]);
		scheduleDateTime.setMinutes(scheduleData.time[1]);

		if (scheduleDateTime < new Date()) {
			throw new Error('Cannot schedule a meeting in past time.');
		}

		let formattedScheduleData = {
			user1Id: await user.fetchUserIdByEmail(scheduleData.user1Email),
			user2Id: await user.fetchUserIdByEmail(scheduleData.user2Email),
			scheduledBy: userId,
			scheduledFrom: scheduleDateTime.toISOString(),
		};

		scheduleDateTime.setTime(scheduleDateTime.getTime() + scheduleData.duration * 60 * 1000);
		formattedScheduleData = {
			...formattedScheduleData,
			scheduledTo: scheduleDateTime.toISOString(),
		};

		// const user1Schedules = await scheduler.fetchUpcomingSchedulesByDate(formattedScheduleData.user1Id, new Date(formattedScheduleData.scheduledFrom), new Date(formattedScheduleData.scheduledTo));
		const user2Schedules = await scheduler.fetchUpcomingSchedulesByDate(formattedScheduleData.user2Id, new Date(formattedScheduleData.scheduledFrom), new Date(formattedScheduleData.scheduledTo));

		// console.log(user1Schedules);
		console.log(user2Schedules);

		// return await scheduler.createSchedule(formattedScheduleData);
		return 'Done';
	} catch (err) {
		throw err;
	}
};
