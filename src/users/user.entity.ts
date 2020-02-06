
export interface IProgramUser {
	Id: string;
	FirstName: string;
	LastName: string;
	Email: string;
	Password: string;
	WorkExperience: number | null;
	WorkPositionId: number | null;
}