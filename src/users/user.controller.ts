import {UserService} from './user.service';
import {IUser, IPersonalInfo, IUserInfo} from './user.model';
import {cookieConfig} from '../config/cookie.config';

export class UserController {
    static async createAndPostUser(req, res, next): Promise<any> {
        try {
            const newUser: IUser = req.body;
            const userForClient: IUserInfo = await UserService.createAndGetNewUser(newUser);
            const token = await UserService.generateToken(userForClient.id);

            res.cookie('token', token, cookieConfig);
            res.send(userForClient);
        } catch (error) {
            next(error);
        }
    }

    static async getUserByPasswordAndEmail(req, res, next): Promise<any> {
        try {
            const userPassword: string = req.params.password;
            const userEmail: string = req.params.email;
            const userForClient: IUserInfo | null = await UserService.getUserByPasswordAndEmail(
                userPassword,
                userEmail
            );
            const token = await UserService.generateToken(userForClient.id);

            res.cookie('token', token, cookieConfig);
            res.send(userForClient);
        } catch (error) {
            next(error);
        }
    }

    static async authorizeUser(req, res, next): Promise<any> {
        try {
            const userForClient: IUserInfo = await UserService.getUserByIdWithQuestions(req.userId);

            return res.status(200).send({
                authorized: true,
                user: userForClient
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserById(req, res, next): Promise<any> {
        try {
            const userId: string = req.params.id;
            const userForClient: IUserInfo | null = await UserService.getUserByIdWithQuestions(userId);
            const token = await UserService.generateToken(userForClient.id);

            res.cookie('token', token, cookieConfig);
            res.send(userForClient);
        } catch (error) {
            next(error);
        }
    }

    static async logOutUser(req, res, next) {
        try {
            res.clearCookie('token');
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    static async updateUserPersonnalInfo(req, res, next): Promise<any> {
        try {
            const updatedPersonalInfo: IPersonalInfo = req.body;
            const userId: string = req.params.id;
            const updatedUser: IUserInfo = await UserService.updatePersonalInfoAndGetUpdatedUser(
                updatedPersonalInfo,
                userId
            );

            res.send(updatedUser);
        } catch (error) {
            next(error);
        }
    }
}
