import {db} from '../config/db.config';
import {IUpdatedProgramUser} from './user.model';
import {IProgramUser} from './user.entity';

export class UserDataAccess {
    static async findPassword(password: string): Promise<any> {
        return (await db('ProgramUsers').select('Password').where('Password', password))[0];
    }

    static async findEmail(email: string): Promise<any> {
        return (await db('ProgramUsers').select('Email').where('Email', email))[0];
    }

    static async findUserEmail(userId: string): Promise<any> {
        return (await db('ProgramUsers').select('Email').where('Id', userId))[0].Email;
    }

    static async findWorkPositionId(workPosition: string): Promise<any> {
        const dbResponse: Array<any> = await db('WorkPosition').select('Id').where('Position', workPosition);
        const workPositionId: number | null = dbResponse.length > 0 ? dbResponse[0].Id : null;

        return workPositionId;
    }

    static async insertWorkPosition(workPosition: string): Promise<any> {
        await db('WorkPosition').insert({Position: workPosition});
    }

    static async insertProgLanguage(progLanguange: string): Promise<any> {
        await db('ProgLanguages').insert({Language: progLanguange});
    }

    static async findUserProgLanguagesId(userId: string): Promise<any> {
        return await db('UsersProgLanguages').select('ProgLanguageId').where('UserId', userId);
    }

    static async deleteUserProgLanguage(userId: string, progLanguageId: number): Promise<void> {
        await db('UsersProgLanguages').where('UserId', userId).andWhere('ProgLanguageId', progLanguageId).del();
    }

    static async findProgLanguageId(progLanguange: string): Promise<any> {
        const progLanguageInDB: any[] = await db('ProgLanguages').select('Id').where('Language', progLanguange);
        const progLanguageId: number | null = progLanguageInDB.length > 0 ? progLanguageInDB[0].Id : null;

        return progLanguageId;
    }

    static async insertIntoUserProgLanguages(progLanguangeId: number, userId: string): Promise<any> {
        await db('UsersProgLanguages').insert({ProgLanguageId: progLanguangeId, UserId: userId});
    }

    static async insertUser(user: IProgramUser): Promise<any> {
        await db('ProgramUsers').insert(user);
    }

    static async updateUser(userId: string, userInfo: IUpdatedProgramUser): Promise<any> {
        await db('ProgramUsers').update(userInfo).where('Id', userId);
    }

    static async findUserByEmail(email: string): Promise<any> {
        return (await db('ProgramUsers').select().where('Email', email))[0];
    }

    static async findUserById(userId: string): Promise<any> {
        return (await db('ProgramUsers').select().where('Id', userId))[0];
    }

    static async findWorkPositionById(workPositionId: number): Promise<any> {
        return (await db('WorkPosition').select('Position').where('Id', workPositionId))[0].Position;
    }

    static async findUserQuestionsCount(userId: string): Promise<any> {
        return (await db('Questions').count('* as questionsTotal').where('UserId', userId))[0].questionsTotal;
    }

    static async findUserAnswersCount(userId: string): Promise<any> {
        return (await db('Answers').count('* as answersTotal').where('UserId', userId))[0].answersTotal;
    }

    static async findUserAnswersAcceptedByOthers(userId: string): Promise<any> {
        return (await db('Answers')
            .count('* as answersAcceptedByOthers')
            .where('UserId', userId)
            .andWhere('IsAccepted', 1))[0].answersAcceptedByOthers;
    }

    static async findUserAnswersLikedByOthers(userId: string): Promise<any> {
        return (await db('Answers')
            .count('* as answersLikedByOthers')
            .join('AnswersLikes', 'Answers.Id', 'AnswersLikes.AnswerId')
            .where('Answers.UserId', userId))[0].answersLikedByOthers;
    }

    static async findUserProgLanguages(userId: string): Promise<any> {
        return await db('UsersProgLanguages')
            .select('Language')
            .join('ProgLanguages', 'ProgLanguages.Id', 'UsersProgLanguages.ProgLanguageId')
            .where('UsersProgLanguages.UserId', userId);
    }
}
