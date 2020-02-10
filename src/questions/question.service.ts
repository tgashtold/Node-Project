import {QuestionDataAccess} from './question.data-access';
import {UserService} from '../users/user.service';
import {AnswerDataAccess} from '../answers/answer.data-access';
import {IQuestion, IQuestionInfo} from './question.model';
import {IQuestionsTable} from './question.entity';
import {ErrorHandler} from '../helpers/error';
import shortId from 'shortid';

export class QuestionService {
    static async addHashtags(hashtagsArr: string[], questionId: string): Promise<any> {
        hashtagsArr.forEach(async (questionsHashtag: string) => {
            const hashtag: string = questionsHashtag.trim().toLowerCase();
            let hashtagId: number | null = await QuestionDataAccess.findHashtagId(hashtag);

            if (hashtagId) {
                await QuestionDataAccess.insertIntoQuestionHashtags(hashtagId, questionId);
            } else {
                await QuestionDataAccess.insertHashtag(hashtag);
                hashtagId = await QuestionDataAccess.findHashtagId(hashtag);
                await QuestionDataAccess.insertIntoQuestionHashtags(hashtagId, questionId);
            }
        });
    }

    static async closeQuestionAndGetBack(questionId: string): Promise<any> {
        await QuestionDataAccess.closeQuestion(questionId);

        return await QuestionService.getQuestionById(questionId);
    }

    static async createAndGetQuestion(newQuestion: IQuestion): Promise<any> {
        const questionForDB: IQuestionsTable = {
            Id: shortId.generate(),
            UserId: newQuestion.author.id,
            Title: newQuestion.title.trim(),
            Date: newQuestion.creationDate,
            Description: newQuestion.description.trim(),
            IsClosed: 0
        };

        await QuestionService.addHashtags(newQuestion.hashTags, questionForDB.Id);
        await QuestionDataAccess.insertQuestion(questionForDB);

        const questionForClient: IQuestionInfo = await QuestionService.getQuestionById(questionForDB.Id);

        return questionForClient;
    }

    static async getQuestionsByTag(hashtag: string): Promise<any> {
        const tagNameForAllQuestions: string = 'all';
        let questions: Array<IQuestionsTable> = [];

        if (hashtag === tagNameForAllQuestions) {
            questions = await QuestionDataAccess.findQuestions();
        } else {
            questions = await QuestionDataAccess.findQuestionsByTag(hashtag);
        }

        const questionsForClient: Array<IQuestionInfo> = await this.adoptQuestionsForClient(questions);

        return questionsForClient;
    }

    static async adoptQuestionsForClient(questions: Array<IQuestionsTable>): Promise<any> {
        const questionsForClient: IQuestionInfo[] = [];

        for (let i = 0; i < questions.length; i++) {
            const adoptQuestionForClient: IQuestionInfo = await this.adoptQuestionForClient(questions[i]);

            questionsForClient.push(adoptQuestionForClient);
        }

        return questionsForClient;
    }

    static async getUserQuestions(userId: string): Promise<any> {
        const userQuestions: IQuestionsTable[] = await QuestionDataAccess.findUserQuestions(userId);

        if (userQuestions.length === 0) return userQuestions;

        const adoptedQuestions: IQuestionInfo = await QuestionService.adoptQuestionsForClient(userQuestions);

        return adoptedQuestions;
    }

    static async getQuestionsFilteredByTitle(searchedText: string): Promise<any> {
        const questions: Array<IQuestionsTable> = await QuestionDataAccess.findQuestions();

        if (questions.length === 0) return [];

        const searchWordsArr = searchedText.trim().split(' ').map((word) => word.trim());
        const searchedQuestions = await questions.filter((question: IQuestionsTable) => {
            const isRequestRelevant: boolean = searchWordsArr.every((searchedWord: string) => {
                return new RegExp(searchedWord, 'gi').test(question.Title);
            });

            if (isRequestRelevant) return question;
        });

        const questionsForClient: Array<IQuestionInfo> = await QuestionService.adoptQuestionsForClient(
            searchedQuestions
        );
        return questionsForClient;
    }

    static async adoptQuestionForClient(question: IQuestionsTable): Promise<any> {
        const questionHashtagsFromDB: any[] = await QuestionDataAccess.findQuestionHashtags(question.Id);
        const questionHashtags: string[] = questionHashtagsFromDB.map((hashtagObj) => hashtagObj.Hashtag);
        const answersQty: number = await AnswerDataAccess.findQuestionAnswersCount(question.Id);

        let latestAnswerDate: null | Date = null;

        if (answersQty > 0) {
            latestAnswerDate = await AnswerDataAccess.findQuestionLatestAnswerDate(question.Id);
        }

        const questionForClient: IQuestionInfo = {
            id: question.Id,
            author: await UserService.getUserById(question.UserId),
            title: question.Title,
            hashTags: questionHashtags,
            creationDate: question.Date,
            description: question.Description,
            isClosed: !!question.IsClosed,
            answersQty: answersQty,
            latestAnswerDate: latestAnswerDate
        };

        return questionForClient;
    }

    static async getQuestionById(questionId: string): Promise<any> {
        const questionFromDB: IQuestionsTable | undefined = await QuestionDataAccess.findQuestionById(questionId);

        if (!questionFromDB) throw new ErrorHandler(404, 'The question does`t exist');

        const questionForClient: IQuestionInfo = await this.adoptQuestionForClient(questionFromDB);

        return questionForClient;
    }
}
