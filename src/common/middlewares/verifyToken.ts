import jwt from 'jsonwebtoken';
import { tokenConfig } from '../../config/token.config';

export async function verifyToken(req, res, next) {
	// const token = req.headers['x-access-token'];
const token = req.cookies['token'];

	if (!token)
		return res.status(403).send({
			authorized: false,
			user: null
		});
	try {
		const decodedToken: any = await jwt.verify(token, tokenConfig.secret);

		req.userId = decodedToken.userId;

		next();
	} catch (e) {
		res.status(500).send({
			authorized: false,
			user: null
		});
	}
}
