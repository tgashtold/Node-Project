import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import userRouter from './users/user.router';
import answerRouter from './answers/answer.router';
import questionRouter from './questions/question.router';
import {corsOptions} from './config/cors.config'; 
import {sendError} from './common/middlewares/sendError'; 
import  cors from "cors";
import {commonConfig} from './config/common.config'; 
import cookieParser from 'cookie-parser';
const app = express();
const port = process.env.PORT || commonConfig.defaultPort;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan('common'));

app.use(cors(corsOptions));
app.use(cookieParser());

app.use('/user', userRouter);
app.use('/question', questionRouter);
app.use('/answer', answerRouter);

app.use(sendError);


app.listen(port, () => console.log('Server has been started...'));
