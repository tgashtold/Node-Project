const dataAccess = require('./answer.data-access');
const userService = require('../users/user.service');
const questionService = require('../questions/question.service');
import {
    IAnswerInfo,
    IAnswersTable,
} from './answer.model';

class AnswerService {
    static async adoptAnswerForClient(answer: IAnswersTable): Promise<any> {
        const answerForClient: IAnswerInfo = {
            id: answer.Id,
            question: await questionService.getQuestionById(answer.QuestionId),
            text: answer.Text,
            author: await userService.getUserById(answer.UserId),
            creationDate: answer.Date,
            isAccepted: !!answer.IsAccepted,
            likes: {
                quantity: await dataAccess.findAnswerLikesCount(answer.Id),
                users: (await dataAccess.findUsersIdLikedAnswer(answer.Id)).map((userIdObj: any) => userIdObj.UserId)
            }
        };

        return answerForClient;
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
        const answerFromDB: IAnswersTable | undefined = await dataAccess.findAnswerById(answerId);

        if (!answerFromDB) return null;

        const answerForClient: IAnswerInfo = await this.adoptAnswerForClient(answerFromDB);

        return answerForClient;
    }

    static async getAnswersByQuestionId(questionId: string): Promise<any> {
        const answers: IAnswersTable[] = await dataAccess.findAnswersByQuestionId(questionId);
        const adoptedAnswers: IAnswerInfo[] = [];

        for (let i = 0; i < answers.length; i++) {
            const adoptedAnswer: IAnswerInfo = await this.adoptAnswerForClient(answers[i]);

            adoptedAnswers.push(adoptedAnswer);
        }

        return adoptedAnswers;
    }
}

module.exports = AnswerService;
