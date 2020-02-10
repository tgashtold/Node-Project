import {handleError, ErrorHandler} from '../../helpers/error';

export function sendError(err: any, req: any, res: any, next: any): any {
    if (err instanceof ErrorHandler) {
        handleError(err, res);
    } else {
        res.status(500).send({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error. Please try again'
        });
    }
}
