const dataAccess = require('./question.data-access');
const userService = require('../users/user.service');
const answerDataAccess = require('../answers/answer.data-access');
import {IQuestionInfo, IQuestionsTable} from './question.model';

export class QuestionService {
    static tagNameForAllQuestions: string = 'all';

    static async addHashtags(hashtagsArr: string[], questionId: string): Promise<any> {
        hashtagsArr.forEach(async (questionsHashtag: string) => {
            const hashtag: string = questionsHashtag.trim().toLowerCase();
            let hashtagId: number | null = await dataAccess.findHashtagId(hashtag);

            if (hashtagId) {
                await dataAccess.insertIntoQuestionHashtags(hashtagId, questionId);
            } else {
                await dataAccess.insertHashtag(hashtag);
                hashtagId = await dataAccess.findHashtagId(hashtag);
                await dataAccess.insertIntoQuestionHashtags(hashtagId, questionId);
            }
        });
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
        const userQuestions: IQuestionsTable[] = await dataAccess.findUserQuestions(userId);

        if (userQuestions.length === 0) return userQuestions;

        const adoptedQuestions: IQuestionInfo = await QuestionService.adoptQuestionsForClient(userQuestions);

        return adoptedQuestions;
    }

    static async getQuestionsFilteredByTitle(searchedText: string): Promise<any> {
        const questions: Array<IQuestionsTable> = await dataAccess.findQuestions();

        if (questions.length === 0) return [];

        const searchWordsArr = searchedText.trim().split(' ').map((word) => word.trim());
        const searchedQuestions = await questions.filter((question: IQuestionsTable) => {
            const isRequestRelevant: boolean = searchWordsArr.every((searchedWord: string) => {
                return new RegExp(searchedWord, 'gi').test(question.Title);
            });

            if (isRequestRelevant) return question;
        });

        return searchedQuestions;
    }

    static async adoptQuestionForClient(question: IQuestionsTable): Promise<any> {
        const questionHashtagsFromDB: any[] = await dataAccess.findQuestionHashtags(question.Id);
        const questionHashtags: string[] = questionHashtagsFromDB.map((hashtagObj) => hashtagObj.Hashtag);
        const answersQty: number = await answerDataAccess.findQuestionAnswersCount(question.Id);

        let latestAnswerDate: null | Date = null;

        if (answersQty > 0) {
            latestAnswerDate = await answerDataAccess.findQuestionLatestAnswerDate(question.Id);
        }

        const questionForClient: IQuestionInfo = {
            id: question.Id,
            author: await userService.getUserById(question.UserId),
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
        const questionFromDB: IQuestionsTable | undefined = await dataAccess.findQuestionById(questionId);

        if (!questionFromDB) return null;

        const questionForClient: IQuestionInfo = await this.adoptQuestionForClient(questionFromDB);

        return questionForClient;
    }
}

module.exports = QuestionService;
