import { Router } from 'express';
import * as auth from '../controllers/authController.js';

const router = Router();

router.post('/signup', async (req, res, next) => {
	try {
		const { email, password, confirmPassword, type } = req.body;
		const userData = {
			email,
			password,
			confirmPassword,
			type,
		};

		res.data = await auth.signup(userData);
		next();
	} catch (err) {
		next(err);
	}
});

router.post('/login', async (req, res, next) => {
	try {
		const { email, password } = req.body;

		res.data = await auth.login(email, password);
		next();
	} catch (err) {
		next(err);
	}
});

router.get('/logout', async (req, res, next) => {
	try {
		const { sessionId } = req.session;

		res.data = await auth.logout(sessionId);
		next();
	} catch (err) {
		next(err);
	}
});

router.post('/resetPassword', async (req, res, next) => {
	try {
		const { email } = req.session;
		const { currentPassword, newPassword } = req.body;

		res.data = await auth.resetPassword(email, currentPassword, newPassword);
		next();
	} catch (err) {
		next(err);
	}
});

router.post('/sendPasswordVerificationMail', async (req, res, next) => {
	try {
		const { email } = req.body;

		res.data = await auth.sendPasswordVerificationMail(email);
		next();
	} catch (err) {
		next(err);
	}
});

router.post('/verifyNewPassword', async (req, res, next) => {
	try {
		const { email, passwordVerificationToken, newPassword } = req.body;

		res.data = await auth.verifyNewPassword(email, passwordVerificationToken, newPassword);
		next();
	} catch (err) {
		next(err);
	}
});

export default router;
