const shortId = require('shortid');
const errorsHandler = require('../helpers/error');
const dataAccess = require('./user.data-access');
const userService = require('./user.service');
const questionService = require('../questions/question.service');
const jwt = require('jsonwebtoken');
const config = require('../config');
import {
    IUser,
    IPersonalInfo,
    IUserInfoInDB,
    IUserInfo,
} from './user.model';

class UserController {
    static async createAndPostUser(req, res, next) {
        try {
            const newUser: IUser = req.body;
            const isEmailFree: boolean = await userService.isEmailAvailable(newUser.personalData.email);

            if (!isEmailFree) {
                throw new errorsHandler.ErrorHandler(406, 'The user with such e-mail already exists');
            } else {
                const user: IUserInfoInDB = {
                    id: shortId.generate(),
                    ...newUser
                };

                await userService.addUser(user);

                const userForClient: IUserInfo = await userService.getUserByPasswordAndEmail(
                    user.password,
                    user.personalData.email,
                );
                userForClient.questions = await questionService.getUserQuestions(userForClient.id);

                const token: string = await userService.generateToken(userForClient.id);

                res.send({
                    user: userForClient,
                    token: token,
                });
            }
        } catch (error) {
            next(error);
        }
    }

    static async getUserByPasswordAndEmail(req, res, next) {
        try {
            const userPassword: string = req.params.password;
            const userEmail: string = req.params.email;

            const userForClient: IUserInfo | null = await userService.getUserByPasswordAndEmail(
                userPassword,
                userEmail
            );

            if (!userForClient) throw new errorsHandler.ErrorHandler(404, 'The user does`t exist');

            userForClient.questions = await questionService.getUserQuestions(userForClient.id);

            const token: string = await userService.generateToken(userForClient.id);

            res.send({
                user: userForClient,
                token: token,
            });

        } catch (error) {
            next(error);
        }
    }

    static async authorizeUser(req, res, next) {
        try {
            const token = req.headers['x-access-token'];

            if (!token) return res.status(403).send({
                authorized: false,
                user: null
            });

            jwt.verify(token, config.secret, async (err, decoded) => {
                if (err) return res.status(500).send({
                    authorized: false,
                    user: null
                });

                const userForClient: IUserInfo | null = await userService.getUserById(decoded.userId);

                userForClient.questions = await questionService.getUserQuestions(userForClient.id);

                return res.status(200).send({
                    authorized: true,
                    user: userForClient
                });
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserById(req, res, next) {
        try {
            const userId: string = req.params.id;

            const userForClient: IUserInfo | null = await userService.getUserById(userId);

            if (!userForClient) throw new errorsHandler.ErrorHandler(404, 'The user does`t exist');

            userForClient.questions = await questionService.getUserQuestions(userForClient.id);

            const token: string = await userService.generateToken(userForClient.id);

            res.send({
                user: userForClient,
                token: token,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateUserPersonnalInfo(req, res, next) {
        try {
            const updatedPersonalInfo: IPersonalInfo = req.body;
            const userId: string = req.params.id;
            const userEmail: string = await dataAccess.findUserEmail(userId);

            if (updatedPersonalInfo.email.trim() !== userEmail) {
                const isEmailFree: boolean = await userService.isEmailAvailable(updatedPersonalInfo.email);

                if (!isEmailFree) {
                    updatedPersonalInfo.email = userEmail;
                }
            }

            await userService.updateUserPersonalInfo(userId, updatedPersonalInfo);

            const updatedUser: IUserInfo = await userService.getUserById(userId);
            updatedUser.questions = await questionService.getUserQuestions(updatedUser.id);

            res.send(updatedUser);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;
