import { AnswerService } from './answer.service';
import { QuestionService } from '../questions/question.service';
import {
	IAnswer,
	IAnswerInfo,
	IGetQuestionAndAnswersResponse,
	IAcceptAnswerResponse,
	IAddLikeAndUpdateResponse
} from './answer.model';

export class AnswerController {
	static async getAnswersFromRequestedPosition(req, res, next) {
		try {
			const questionId: string = req.params.questionId;
			const requestedAnswersNumber: number = +req.params.answersCount;
			const requestedStartPosition: number = +req.params.startNumber;

			const answersForClient: IAnswerInfo[] = await AnswerService.getAnswersFromRequestedPosition(
				questionId,
				requestedStartPosition,
				requestedAnswersNumber
			);

			res.send(answersForClient);
		} catch (error) {
			next(error);
		}
	}

	static async acceptAnswer(req, res, next) {
		try {
			const answerId: string = req.body.id;
			const updatedAnswer = await AnswerService.acceptAnswerAndGetBack(answerId);
			const updatedQuestion = await QuestionService.closeQuestionAndGetBack(updatedAnswer.question.id);

			const responseForClient: IAcceptAnswerResponse = {
				currentQuestion: updatedQuestion,
				updatedAnswer: updatedAnswer
			};

			res.send(responseForClient);
		} catch (error) {
			next(error);
		}
	}

	static async getQuestionAndAnswers(req, res, next) {
		try {
			const questionId: string = req.params.questionId;
			const requestedAnswersNumber: number = +req.params.answersCount;

			const infoForClient: IGetQuestionAndAnswersResponse = {
				currentQuestion: await QuestionService.getQuestionById(questionId),
				answers: await AnswerService.getAnswersFromRequestedPosition(questionId, 0, requestedAnswersNumber),
				answersTotalQty: await AnswerService.getQuestionAnswersCount(questionId)
			};

			res.send(infoForClient);
		} catch (error) {
			next(error);
		}
	}

	static async addLikeAndUpdateQuestionAndAnswers(req, res, next) {
		try {
			const { answerId, userId, questionId, answersCount, answersStartNumber } = req.body;

			await AnswerService.handleLikeAnswer(answerId, userId);

			const responseForClient: IAddLikeAndUpdateResponse = {
				currentQuestion: await QuestionService.getQuestionById(questionId),
				answers: await AnswerService.getAnswersFromRequestedPosition(
					questionId,
					answersStartNumber,
					answersCount
				)
			};

			res.send(responseForClient);
		} catch (error) {
			next(error);
		}
	}

	static async createAndPostAnswer(req, res, next) {
		try {
			const newAnswer: IAnswer = req.body;
			const answerForClient: IAnswerInfo = await AnswerService.createAndGetNewAnswer(newAnswer);

			res.send(answerForClient);
		} catch (error) {
			next(error);
		}
	}
}
