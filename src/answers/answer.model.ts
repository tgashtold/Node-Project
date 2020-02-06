import {IQuestionInfo} from '../questions/question.model';
import {IUserInfo} from '../users/user.model';

export interface IAnswer {
    id: string;
    question: IQuestionInfo;
    text: string;
    author: IUserInfo;
    creationDate: Date;
    isAccepted: boolean;
}

export interface IAddLikeAndUpdateResponse {
    currentQuestion: IQuestionInfo;
    answers: IAnswerInfo[];
}

export interface IGetQuestionAndAnswersResponse {
    currentQuestion: IQuestionInfo;
    answers: IAnswerInfo[];
    answersTotalQty: number;
}

export interface IAnswerInfo extends IAnswer {
    likes: IAnswerLikes;
}

export interface IAnswerLikes {
    quantity: number;
    users: Array<string>;
}

export interface IAcceptAnswerResponse {
    currentQuestion: IQuestionInfo;
    updatedAnswer: IAnswerInfo;
}
