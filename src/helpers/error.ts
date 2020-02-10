export class ErrorHandler extends Error {
    statusCode: number;
    message: string;

    constructor(statusCode: number, message: string) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

export const handleError = (err, res) => {
    const {statusCode, message} = err;

    res.status(200).json({
        status: 'error',
        statusCode,
        message
    });
};


