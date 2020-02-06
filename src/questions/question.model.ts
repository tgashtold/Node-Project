import {IUserInfo} from '../users/user.model';

export interface IQuestion {
    id: string;
    author: IUserInfo;
    title: string;
    hashTags: Array<string>;
    creationDate: Date;
    description: string;
    isClosed: boolean;
}

export interface IQuestionInfo extends IQuestion {
    answersQty: number;
    latestAnswerDate: Date | null;
}
