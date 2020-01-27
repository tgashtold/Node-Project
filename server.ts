const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const port = process.env.PORT || 5000;
const app = express();
const errorsHandler = require('./helpers/error');
const fs = require('file-system');
const shortId = require('shortid');
const userRouter = require('./users/user.router');
const answerRouter = require('./answers/answer.router');
const questionRouter = require('./questions/question.router');
const db = require('./db');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan('common'));
app.use((req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, x-access-token, Content-Type, Accept');
    next();
});

app.use('/user', userRouter);
app.use('/question', questionRouter);
app.use('/answer', answerRouter);

app.use((err, req, res, next) => {
    if (err instanceof errorsHandler.ErrorHandler) {
        errorsHandler.handleError(err, res);
    } else {
        res.status(500).send({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error. Please try again'
        });
    }
});


app.listen(port, () => console.log('Server has been started...'));
