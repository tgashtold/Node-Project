const db = require('../db');
import {IAnswersTable} from './answer.model';

class AnswerDataAccess {
    static async insertAnswer(answer: IAnswersTable) {
        await db('Answers').insert(answer);
    }

    static async insertLike(answerId: string, userId: string) {
        await db('AnswersLikes').insert({
            UserId: userId,
            AnswerId: answerId
        });
    }

    static async deleteLike(answerId: string, userId: string) {
        await db('AnswersLikes').where('UserId', userId).andWhere('AnswerId', answerId).del();
    }

    static async findLike(answerId: string, userId: string) {
        return (await db('AnswersLikes').select().where('UserId', userId).andWhere('AnswerId', answerId))[0];
    }

    static async findAnswerById(answerId: string) {
        return (await db('Answers').select().where('Id', answerId))[0];
    }

    static async acceptAnswer(answerId: string) {
        await db('Answers').where('Id', answerId).update({IsAccepted: 1});
    }

    static async findQuestionAnswersCount(questionId: string) {
        return (await db('Answers').count('* as AnswersCount').where('QuestionId', questionId))[0].AnswersCount;
    }

    static async findQuestionLatestAnswerDate(questionId: string) {
        return (await db('Answers').select('Date').where('QuestionId', questionId).orderBy('Date'))[0].Date;
    }

    static async findAnswerLikesCount(answerId: string) {
        return (await db('AnswersLikes').count('* as LikesNumber').where('AnswerId', answerId))[0].LikesNumber;
    }

    static async findAnswerQuestionId(answerId: string) {
        return (await db('Answers').select('QuestionId').where('Id', answerId))[0].QuestionId;
    }

    static async findUsersIdLikedAnswer(answerId: string) {
        return await db('AnswersLikes').select('UserId').where('AnswerId', answerId);
    }

    static async findAnswersByQuestionId(questionId: string) {
        return await db('Answers').select().where('QuestionId', questionId).orderBy('Date', 'desc');
    }
}

module.exports = AnswerDataAccess;
