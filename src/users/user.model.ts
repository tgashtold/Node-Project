export interface IUser {
	password: string;
	personalData: IPersonalInfo;
}


export interface IUpdatedProgramUser {
	FirstName: string;
	LastName: string;
	Email: string;
	WorkExperience: number | null;
	WorkPositionId: number | null;
}

export interface IUserInfoInDB extends IUser {
	id: string;
}

export interface IUserInfo{
	id: string;
	personalData: IPersonalInfo;
	rating: IUserRating;
	questions: any[];
}

export interface IPersonalInfo {
	firstName: string;
	lastName: string;
	email: string;
	progLanguages: string[];
	workingPosition: string;
	workExperience: string;
}

export interface IUserRating {
	questionsTotal: number;
	answersTotal: number;
	answersAcceptedByOthers: number;
	answersLikedByOthers: number;
}

