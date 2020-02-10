import {QuestionDataAccess} from './question.data-access';
import {QuestionService} from './question.service';
import {IQuestion, IQuestionInfo} from './question.model';
import {IQuestionsTable} from './question.entity';

export class QuestionController {
    static async createAndPostQuestion(req, res, next): Promise<any> {
        try {
            const newQuestion: IQuestion = req.body;
            const questionForClient: IQuestionInfo = await QuestionService.createAndGetQuestion(newQuestion);

            res.send(questionForClient);
        } catch (error) {
            next(error);
        }
    }

    static async getQuestions(req, res, next): Promise<any> {
        try {
            const questions: Array<IQuestionsTable> = await QuestionDataAccess.findQuestions();
            const questionsForClient: Array<IQuestionInfo> = await QuestionService.adoptQuestionsForClient(questions);

            res.send(questionsForClient);
        } catch (error) {
            next(error);
        }
    }

    static async getTags(req, res, next): Promise<any> {
        try {
            const hashtags: Array<any> = await QuestionDataAccess.findHashtags();
            const hashtagsForClient: Array<string> = hashtags.map((hashtagObg: any) => hashtagObg.Hashtag);

            res.send(hashtagsForClient);
        } catch (error) {
            next(error);
        }
    }

    static async getQuestionsByTag(req, res, next): Promise<any> {
        try {
            const hashtag: string = req.params.tag;
            const questionsForClient: Array<IQuestionInfo> = await QuestionService.getQuestionsByTag(hashtag);

            res.send(questionsForClient);
        } catch (error) {
            next(error);
        }
    }

    static async getQuestionsBySearchedTitle(req, res, next): Promise<any> {
        try {
            const searchedText: string = req.params.text;
            const searchedQuestions: Array<IQuestionsTable> = await QuestionService.getQuestionsFilteredByTitle(
                searchedText
            );

            res.send(searchedQuestions);
        } catch (error) {
            next(error);
        }
    }
}
