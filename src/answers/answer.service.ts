import { AnswerDataAccess } from './answer.data-access';
import { UserService } from '../users/user.service';
import { QuestionService } from '../questions/question.service';
import { IAnswer, IAnswerInfo } from './answer.model';
import shortId from 'shortid';
import { IAnswersTable } from './answer.entity';

export class AnswerService {
	static async adoptAnswerForClient(answer: IAnswersTable): Promise<any> {
		const answerForClient: IAnswerInfo = {
			id: answer.Id,
			question: await QuestionService.getQuestionById(answer.QuestionId),
			text: answer.Text,
			author: await UserService.getUserById(answer.UserId),
			creationDate: answer.Date,
			isAccepted: !!answer.IsAccepted,
			likes: {
				quantity: await AnswerDataAccess.findAnswerLikesCount(answer.Id),
				users: (await AnswerDataAccess.findUsersIdLikedAnswer(answer.Id)).map(
					(userIdObj: any) => userIdObj.UserId
				)
			}
		};

		return answerForClient;
	}

	static async getQuestionAnswersCount(questionId: string) {
		return await AnswerDataAccess.findQuestionAnswersCount(questionId);
	}

	static async handleLikeAnswer(answerId: string, userId: string) {
		const isLike: boolean = !!await AnswerDataAccess.findLike(answerId, userId);

		if (isLike) {
			await AnswerDataAccess.deleteLike(answerId, userId);
		} else {
			await AnswerDataAccess.insertLike(answerId, userId);
		}
	}

	static async createAndGetNewAnswer(newAnswer: IAnswer) {
		const answerForDB: IAnswersTable = {
			Id: shortId.generate(),
			QuestionId: newAnswer.question.id,
			Text: newAnswer.text.trim(),
			UserId: newAnswer.author.id,
			Date: newAnswer.creationDate,
			IsAccepted: 0
		};

		await AnswerDataAccess.insertAnswer(answerForDB);

		const answerForClient: IAnswerInfo = await AnswerService.getAnswerById(answerForDB.Id);

		return answerForClient;
	}

	static async acceptAnswerAndGetBack(answerId: string) {
		await AnswerDataAccess.acceptAnswer(answerId);

		return await AnswerService.getAnswerById(answerId);
	}

	static async getAnswersFromRequestedPosition(
		questionId: string,
		requestedStartPosition: number,
		requestedAnswersNumber: number
	): Promise<any> {
		const questionAnswers: IAnswerInfo[] = await this.getAnswersByQuestionId(questionId);
		const answersForClient: IAnswerInfo[] = questionAnswers.slice(
			requestedStartPosition,
			requestedStartPosition + requestedAnswersNumber
		);

		return answersForClient;
	}

	static async getAnswerById(answerId: string): Promise<any> {
		const answerFromDB: IAnswersTable | undefined = await AnswerDataAccess.findAnswerById(answerId);

		if (!answerFromDB) return null;

		const answerForClient: IAnswerInfo = await this.adoptAnswerForClient(answerFromDB);

		return answerForClient;
	}

	static async getAnswersByQuestionId(questionId: string): Promise<any> {
		const answers: IAnswersTable[] = await AnswerDataAccess.findAnswersByQuestionId(questionId);
		const adoptedAnswers: IAnswerInfo[] = [];

		for (let i = 0; i < answers.length; i++) {
			const adoptedAnswer: IAnswerInfo = await this.adoptAnswerForClient(answers[i]);

			adoptedAnswers.push(adoptedAnswer);
		}

		return adoptedAnswers;
	}
}
