const shortId = require('shortid');
const dataAccess = require('./question.data-access');
const questionService = require('./question.service');
import { IQuestion, IQuestionInfo, IQuestionsTable } from './question.model';

class QuestionController {
	static async createAndPostQuestion(req, res, next) {
		try {
			const newQuestion: IQuestion = req.body;
			const questionForDB: IQuestionsTable = {
				Id: shortId.generate(),
				UserId: newQuestion.author.id,
				Title: newQuestion.title.trim(),
				Date: newQuestion.creationDate,
				Description: newQuestion.description.trim(),
				IsClosed: 0
			};

			await questionService.addHashtags(newQuestion.hashTags, questionForDB.Id);
			await dataAccess.insertQuestion(questionForDB);

			const questionForClient: IQuestionInfo = await questionService.getQuestionById(questionForDB.Id);

			res.send(questionForClient);
		} catch (error) {
			next(error);
		}
	}

	static async getQuestions(req, res, next) {
		try {
			const questions: Array<IQuestionsTable> = await dataAccess.findQuestions();
			const questionsForClient: Array<IQuestionInfo> = await questionService.adoptQuestionsForClient(questions);

			res.send(questionsForClient);
		} catch (error) {
			next(error);
		}
	}

	static async getTags(req, res, next) {
		try {
			const hashtags: Array<any> = await dataAccess.findHashtags();
			const hashtagsForClient: Array<string> = hashtags.map((hashtagObg: any) => hashtagObg.Hashtag);

			res.send(hashtagsForClient);
		} catch (error) {
			next(error);
		}
	}

	static async getQuestionsByTag(req, res, next) {
		try {
			const tagNameForAllQuestions: string = 'all';
			const hashtag: string = req.params.tag;
			let questions: Array<IQuestionsTable> = [];

			if (hashtag === tagNameForAllQuestions) {
				questions = await dataAccess.findQuestions();
			} else {
				questions = await dataAccess.findQuestionsByTag(hashtag);
			}

			const questionsForClient: Array<IQuestionInfo> = await questionService.adoptQuestionsForClient(questions);

			res.send(questionsForClient);
		} catch (error) {
			next(error);
		}
	}

	static async getQuestionsBySearchedTitle(req, res, next) {
		try {
			const searchedText: string = req.params.text;
			const searchedQuestions: Array<IQuestionsTable> = await questionService.getQuestionsFilteredByTitle(
				searchedText
			);
			const questionsForClient: Array<IQuestionInfo> = await questionService.adoptQuestionsForClient(
				searchedQuestions
			);

			res.send(questionsForClient);
		} catch (error) {
			next(error);
		}
	}
}

module.exports = QuestionController;
