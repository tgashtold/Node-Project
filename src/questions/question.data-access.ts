import { db } from '../config/db.config';
import { IQuestionsTable } from './question.entity';

export class QuestionDataAccess {
	static async insertQuestion(question: IQuestionsTable) {
		await db('Questions').insert(question);
	}

	static async findQuestions(): Promise<any> {
		return await db('Questions').select();
	}

	static async findUserQuestions(userId: string): Promise<any> {
		return await db('Questions').select().where('UserId', userId);
	}

	static async findQuestionsByTag(hashtag: string): Promise<any> {
		return await db('Hashtags')
			.select(
				'Questions.Id as Id',
				'Questions.UserId',
				'Questions.Title',
				'Questions.Date',
				'Questions.Description',
				'Questions.IsClosed'
			)
			.join('QuestionsHashtags', 'Hashtags.Id', 'QuestionsHashtags.HashtagId')
			.join('Questions', 'QuestionsHashtags.QuestionId', 'Questions.Id')
			.where('Hashtag', hashtag);
	}

	static async closeQuestion(questionId: string) {
		await db('Questions').where('Id', questionId).update({ IsClosed: 1 });
	}

	static async findHashtags(): Promise<any> {
		return await db('Hashtags').select('Hashtag');
	}

	static async insertHashtag(hashtag: string): Promise<any> {
		await db('Hashtags').insert({ Hashtag: hashtag });
	}

	static async findHashtagId(hashtag: string): Promise<any> {
		const hashtagInDB: any[] = await db('Hashtags').select('Id').where('Hashtag', hashtag);
		const hashtagId: number | null = hashtagInDB.length > 0 ? hashtagInDB[0].Id : null;

		return hashtagId;
	}

	static async findQuestionHashtagsId(questionId: string): Promise<any> {
		return await db('QuestionsHashtags').select('HashtagId').where('QuestionId', questionId);
	}

	static async insertIntoQuestionHashtags(hashtagId: number, questionId: string): Promise<any> {
		await db('QuestionsHashtags').insert({ QuestionId: questionId, HashtagId: hashtagId });
	}

	static async findQuestionHashtags(questionId: string): Promise<any> {
		return await db('QuestionsHashtags')
			.select('Hashtag')
			.join('Hashtags', 'Hashtags.Id', 'QuestionsHashtags.HashtagId')
			.where('QuestionsHashtags.QuestionId', questionId);
	}

	static async findQuestionById(questionId: string): Promise<any> {
		return (await db('Questions').select().where('Id', questionId))[0];
	}
}
