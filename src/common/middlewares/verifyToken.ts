import jwt from 'jsonwebtoken';
import { tokenConfig } from '../../config/token.config';

export async function verifyToken(req, res, next) {
	const token = req.cookies['token'];

	if (!token)
		return res.status(200).send({
			authorized: false,
			user: null
		});
	try {
		const decodedToken: any = await jwt.verify(token, tokenConfig.secret);

		req.userId = decodedToken.userId;

		next();
	} catch (e) {
		if (jwt.TokenExpiredError) {
			res.status(200).send({
				authorized: false,
				user: null
			});
		}

		res.status(500).send({
			authorized: false,
			user: null
		});
	}
}
