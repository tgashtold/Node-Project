const dataAccess = require('./user.data-access');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
import {
    IPersonalInfo,
    IUserInfoInDB,
    IUserRating,
    IUserInfo,
    IProgramUser,
    IUpdatedProgramUser
} from './user.model';

class UserService {
    static saltRounds = 5;

    static async generateToken(userId: string) {
        const token = jwt.sign({userId: userId}, config.secret, {expiresIn: config.tokenExpiration});

        return token;
    }

    static async isEmailAvailable(email: string): Promise<any> {
        return !await dataAccess.findEmail(email.toLowerCase().trim());
    }

    static async addUserProgLanguages(progLanguangesArr: string[], userId: string): Promise<any> {
        progLanguangesArr.forEach(async (languageToAdd: string) => {
            const language:string = languageToAdd.toLowerCase().trim();
            let languageId: number | null = await dataAccess.findProgLanguageId(language);

            if (languageId) {
                await dataAccess.insertIntoUserProgLanguages(languageId, userId);
            } else {
                await dataAccess.insertProgLanguage(language);
                languageId = await dataAccess.findProgLanguageId(language);
                await dataAccess.insertIntoUserProgLanguages(languageId, userId);
            }
        });
    }

    static async updateUserProgLanguages(progLanguangesArr: string[], userId: string): Promise<any> {
        const userProgLanguagesId: any[] = await dataAccess.findUserProgLanguagesId(userId);

        userProgLanguagesId.forEach(async (userProgLanguageId) => {
            await dataAccess.deleteUserProgLanguage(userId, userProgLanguageId.ProgLanguageId);
        });

        await this.addUserProgLanguages(progLanguangesArr, userId);
    }

    static async adoptUserData(user: IProgramUser) {
        let userWorkPosition: number | null;

        if (user.WorkPositionId) {
            userWorkPosition = await dataAccess.findWorkPositionById(user.WorkPositionId);
        }

        const userRating: IUserRating = {
            questionsTotal: await dataAccess.findUserQuestionsCount(user.Id),
            answersTotal: await dataAccess.findUserAnswersCount(user.Id),
            answersAcceptedByOthers: await dataAccess.findUserAnswersAcceptedByOthers(user.Id),
            answersLikedByOthers: await dataAccess.findUserAnswersLikedByOthers(user.Id)
        };

        const userProgLanguagesFromDB: any[] = await dataAccess.findUserProgLanguages(user.Id);
        const userProgLanguages: string[] = userProgLanguagesFromDB.map((language) => language.Language);

        return {
            id: user.Id,
            personalData: {
                firstName: user.FirstName,
                lastName: user.LastName,
                email: user.Email,
                progLanguages: userProgLanguages,
                workingPosition: `${userWorkPosition || ''}`,
                workExperience: `${user.WorkExperience || ''}`
            },
            rating: userRating,
            questions: []
        };
    }

    static async getUserByPasswordAndEmail(password: string, email: string): Promise<any> {
        const user: IProgramUser | undefined = await dataAccess.findUserByEmail(email);

        if (!user) return null;

        const isPasswordCorrect = await bcrypt.compare(password, user.Password);

        if (!isPasswordCorrect) return null;

        const userForClient: IUserInfo = await this.adoptUserData(user);

        return userForClient;
    }


    static async getUserById(userId: string): Promise<any> {
        const user: IProgramUser | undefined = await dataAccess.findUserById(userId);

        if (!user) return null;

        return await this.adoptUserData(user);
    }

    static async updateUserPersonalInfo(userId: string, personalInfo: IPersonalInfo): Promise<any> {
        let workPositionId: number | null = await this.getWorkPositionId(personalInfo.workingPosition);

        const updatedUserInfoForDB: IUpdatedProgramUser = {
            FirstName: personalInfo.firstName,
            LastName: personalInfo.lastName,
            Email: personalInfo.email.trim().toLowerCase(),
            WorkExperience: +personalInfo.workExperience || null,
            WorkPositionId: workPositionId || null
        };

        await dataAccess.updateUser(userId, updatedUserInfoForDB);

        await this.updateUserProgLanguages(personalInfo.progLanguages, userId);
    }

    static async getWorkPositionId(userWorkPosition: string): Promise<any> {
        const workPosition: string = userWorkPosition.trim().toLowerCase();

        if (workPosition.length === 0) return null;

        let workPositionId: number | null = null;

        if (workPosition && workPosition.length > 0) {
            workPositionId = await dataAccess.findWorkPositionId(workPosition.trim());

            if (!workPositionId) {
                await dataAccess.insertWorkPosition(workPosition);

                workPositionId = await dataAccess.findWorkPositionId(workPosition.trim());
            }
        }

        return workPositionId;
    }

    static async addUser(user: IUserInfoInDB): Promise<any> {
        const workPositionId: number | null = await this.getWorkPositionId(user.personalData.workingPosition);

        const userForDB: IProgramUser = {
            Id: user.id,
            FirstName: user.personalData.firstName,
            LastName: user.personalData.lastName,
            Email: user.personalData.email.trim().toLowerCase(),
            Password: await bcrypt.hash(user.password, this.saltRounds),
            WorkExperience: user.personalData.workExperience.length > 0 ? +user.personalData.workExperience : null,
            WorkPositionId: workPositionId || null
        };

        await dataAccess.insertUser(userForDB);

        await this.addUserProgLanguages(user.personalData.progLanguages, user.id);
    }
}

module.exports = UserService;
