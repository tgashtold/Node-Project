import {db} from '../config/db.config';
import {IAnswersTable} from './answer.entity';

export class AnswerDataAccess {
    static async insertAnswer(answer: IAnswersTable): Promise<void> {
        await db('Answers').insert(answer);
    }

    static async insertLike(answerId: string, userId: string): Promise<void> {
        await db('AnswersLikes').insert({
            UserId: userId,
            AnswerId: answerId
        });
    }

    static async deleteLike(answerId: string, userId: string): Promise<void> {
        await db('AnswersLikes').where('UserId', userId).andWhere('AnswerId', answerId).del();
    }

    static async findLike(answerId: string, userId: string): Promise<any> {
        return (await db('AnswersLikes').select().where('UserId', userId).andWhere('AnswerId', answerId))[0];
    }

    static async findAnswerById(answerId: string): Promise<any> {
        return (await db('Answers').select().where('Id', answerId))[0];
    }

    static async acceptAnswer(answerId: string): Promise<void> {
        await db('Answers').where('Id', answerId).update({IsAccepted: 1});
    }

    static async findQuestionAnswersCount(questionId: string): Promise<any> {
        return (await db('Answers').count('* as AnswersCount').where('QuestionId', questionId))[0].AnswersCount;
    }

    static async findQuestionLatestAnswerDate(questionId: string): Promise<any> {
        return (await db('Answers').select('Date').where('QuestionId', questionId).orderBy('Date'))[0].Date;
    }

    static async findAnswerLikesCount(answerId: string): Promise<any> {
        return (await db('AnswersLikes').count('* as LikesNumber').where('AnswerId', answerId))[0].LikesNumber;
    }

    static async findUsersIdLikedAnswer(answerId: string): Promise<any> {
        return await db('AnswersLikes').select('UserId').where('AnswerId', answerId);
    }

    static async findAnswersByQuestionId(questionId: string): Promise<any> {
        return await db('Answers').select().where('QuestionId', questionId).orderBy('Date', 'desc');
    }
}
