const shortId = require('shortid');
const dataAccess = require('./answer.data-access');
const answerService = require('./answer.service');
const questionService = require('../questions/question.service');
const errorsHandler = require('../helpers/error');
const questionDataAccess = require('../questions/question.data-access');
import {
    IAnswer,
    IAnswersTable,
    IAnswerInfo,
    IGetQuestionAndAnswersResponse,
    IAcceptAnswerResponse,
    IAddLikeAndUpdateResponse
} from './answer.model';
import {IQuestionInfo} from '../questions/question.model';

class AnswerController {
    static async getAnswersFromRequestedPosition(req, res, next) {
        try {
            const questionId: string = req.params.questionId;
            const requestedAnswersNumber: number = +req.params.answersCount;
            const requestedStartPosition: number = +req.params.startNumber;

            const answersForClient: IAnswerInfo[] = await answerService.getAnswersFromRequestedPosition(
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

            await dataAccess.acceptAnswer(answerId);

            const questionId: string = await dataAccess.findAnswerQuestionId(answerId);

            await questionDataAccess.closeQuestion(questionId);

            const responseForClient: IAcceptAnswerResponse = {
                currentQuestion: await questionService.getQuestionById(questionId),
                updatedAnswer: await answerService.getAnswerById(answerId)
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
            const question: IQuestionInfo = await questionService.getQuestionById(questionId);

            if (!question) throw new errorsHandler.ErrorHandler(404, 'The question does`t exist');

            const questionAnswers: IAnswerInfo[] = await answerService.getAnswersByQuestionId(questionId);
            const infoForClient: IGetQuestionAndAnswersResponse = {
                currentQuestion: question,
                answers: questionAnswers.slice(0, requestedAnswersNumber),
                answersTotalQty: questionAnswers.length
            };

            res.send(infoForClient);
        } catch (error) {
            next(error);
        }
    }

    static async addLikeAndUpdateQuestionAndAnswers(req, res, next) {
        try {
            const {answerId, userId, questionId, answersCount, answersStartNumber} = req.body;
            const isLike: boolean = !!await dataAccess.findLike(answerId, userId);

            if (isLike) {
                await dataAccess.deleteLike(answerId, userId);
            } else {
                await dataAccess.insertLike(answerId, userId);
            }

            const answersForClient: IAnswerInfo[] = await answerService.getAnswersFromRequestedPosition(
                questionId,
                answersStartNumber,
                answersCount
            );

            const responseForClient: IAddLikeAndUpdateResponse = {
                currentQuestion: await questionService.getQuestionById(questionId),
                answers: answersForClient
            };

            res.send(responseForClient);
        } catch (error) {
            next(error);
        }
    }

    static async createAndPostAnswer(req, res, next) {
        try {
            const newAnswer: IAnswer = req.body;
            const answerForDB: IAnswersTable = {
                Id: shortId.generate(),
                QuestionId: newAnswer.question.id,
                Text: newAnswer.text.trim(),
                UserId: newAnswer.author.id,
                Date: newAnswer.creationDate,
                IsAccepted: 0
            };

            await dataAccess.insertAnswer(answerForDB);

            const answerForClient: IAnswerInfo = await answerService.getAnswerById(answerForDB.Id);

            res.send(answerForClient);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AnswerController;
