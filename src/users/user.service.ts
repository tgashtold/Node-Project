import { UserDataAccess } from './user.data-access';
// import bcrypt from 'bcrypt';
import * as argon2 from 'argon2';
import shortId from 'shortid';
import jwt from 'jsonwebtoken';
import { QuestionService } from '../questions/question.service';
import { ErrorHandler } from '../helpers/error';
import { tokenConfig } from '../config/token.config';
import { IPersonalInfo, IUserInfoInDB, IUserRating, IUserInfo, IUpdatedProgramUser, IUser } from './user.model';
import { IProgramUser } from './user.entity';

export class UserService {
	static saltRounds = 5;

	static async generateToken(userId: string) {
		const token = jwt.sign({ userId: userId }, tokenConfig.secret, { expiresIn: tokenConfig.tokenExpiration });

		return token;
	}

	static async isEmailAvailable(email: string): Promise<any> {
		return !await UserDataAccess.findEmail(email.toLowerCase().trim());
	}

	static async createAndGetNewUser(newUser: IUser) {
		const isEmailFree: boolean = await this.isEmailAvailable(newUser.personalData.email);

		if (!isEmailFree) {
			throw new ErrorHandler(406, 'The user with such e-mail already exists');
		} else {
			const user: IUserInfoInDB = {
				id: shortId.generate(),
				...newUser
			};

			await this.addUser(user);

			const userForClient: IUserInfo = await this.getUserByPasswordAndEmail(
				user.password,
				user.personalData.email
			);
			userForClient.questions = await QuestionService.getUserQuestions(userForClient.id);

			return userForClient;
		}
	}

	static async addUserProgLanguages(progLanguangesArr: string[], userId: string): Promise<any> {
		progLanguangesArr.forEach(async (languageToAdd: string) => {
			const language: string = languageToAdd.toLowerCase().trim();
			let languageId: number | null = await UserDataAccess.findProgLanguageId(language);

			if (languageId) {
				await UserDataAccess.insertIntoUserProgLanguages(languageId, userId);
			} else {
				await UserDataAccess.insertProgLanguage(language);
				languageId = await UserDataAccess.findProgLanguageId(language);
				await UserDataAccess.insertIntoUserProgLanguages(languageId, userId);
			}
		});
	}

	static async updateUserProgLanguages(progLanguangesArr: string[], userId: string): Promise<any> {
		const userProgLanguagesId: any[] = await UserDataAccess.findUserProgLanguagesId(userId);

		userProgLanguagesId.forEach(async (userProgLanguageId) => {
			await UserDataAccess.deleteUserProgLanguage(userId, userProgLanguageId.ProgLanguageId);
		});

		await this.addUserProgLanguages(progLanguangesArr, userId);
	}

	static async adoptUserData(user: IProgramUser) {
		let userWorkPosition: number | null;

		if (user.WorkPositionId) {
			userWorkPosition = await UserDataAccess.findWorkPositionById(user.WorkPositionId);
		}

		const userRating: IUserRating = {
			questionsTotal: await UserDataAccess.findUserQuestionsCount(user.Id),
			answersTotal: await UserDataAccess.findUserAnswersCount(user.Id),
			answersAcceptedByOthers: await UserDataAccess.findUserAnswersAcceptedByOthers(user.Id),
			answersLikedByOthers: await UserDataAccess.findUserAnswersLikedByOthers(user.Id)
		};

		const userProgLanguagesFromDB: any[] = await UserDataAccess.findUserProgLanguages(user.Id);
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
		const user: IProgramUser | undefined = await UserDataAccess.findUserByEmail(email);

		if (!user) throw new ErrorHandler(404, 'The user does`t exist');

		// const isPasswordCorrect = await bcrypt.compare(password, user.Password);
		const isPasswordCorrect = await argon2.verify(user.Password, password);
		if (!isPasswordCorrect) throw new ErrorHandler(404, 'The user does`t exist');

		const userForClient: IUserInfo = await this.adoptUserData(user);
		userForClient.questions = await QuestionService.getUserQuestions(userForClient.id);

		return userForClient;
	}

	static async getUserById(userId: string): Promise<any> {
		const user: IProgramUser | undefined = await UserDataAccess.findUserById(userId);

		if (!user) return null;

		return await this.adoptUserData(user);
	}

	static async getUserByIdWithQuestions(userId: string) {
		const userForClient: IUserInfo | null = await this.getUserById(userId);

		if (!userForClient) throw new ErrorHandler(404, 'The user does`t exist');

		userForClient.questions = await QuestionService.getUserQuestions(userForClient.id);

		return userForClient;
	}

	static async updatePersonalInfoAndGetUpdatedUser(updatedPersonalInfo: IPersonalInfo, userId: string) {
		const userEmail: string = await UserDataAccess.findUserEmail(userId);

		if (updatedPersonalInfo.email.trim() !== userEmail) {
			const isEmailFree: boolean = await UserService.isEmailAvailable(updatedPersonalInfo.email);

			if (!isEmailFree) {
				updatedPersonalInfo.email = userEmail;
			}
		}

		await UserService.updateUserPersonalInfo(userId, updatedPersonalInfo);

		const updatedUser: IUserInfo = await UserService.getUserById(userId);
		updatedUser.questions = await QuestionService.getUserQuestions(updatedUser.id);

		return updatedUser;
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

		await UserDataAccess.updateUser(userId, updatedUserInfoForDB);

		await this.updateUserProgLanguages(personalInfo.progLanguages, userId);
	}

	static async getWorkPositionId(userWorkPosition: string): Promise<any> {
		const workPosition: string = userWorkPosition.trim().toLowerCase();

		if (workPosition.length === 0) return null;

		let workPositionId: number | null = null;

		if (workPosition && workPosition.length > 0) {
			workPositionId = await UserDataAccess.findWorkPositionId(workPosition.trim());

			if (!workPositionId) {
				await UserDataAccess.insertWorkPosition(workPosition);

				workPositionId = await UserDataAccess.findWorkPositionId(workPosition.trim());
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
			Password: await argon2.hash(user.password),
			// Password: await bcrypt.hash(user.password, this.saltRounds),
			WorkExperience: user.personalData.workExperience.length > 0 ? +user.personalData.workExperience : null,
			WorkPositionId: workPositionId || null
		};

		await UserDataAccess.insertUser(userForDB);

		await this.addUserProgLanguages(user.personalData.progLanguages, user.id);
	}
}
