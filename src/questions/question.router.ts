import express from 'express';
import {QuestionController} from './question.controller';
import {verifyToken} from '../common/middlewares/verifyToken';

const questionRouter = express.Router();

questionRouter.post('/create', verifyToken, QuestionController.createAndPostQuestion);
questionRouter.get('/all', QuestionController.getQuestions);
questionRouter.get('/tags', QuestionController.getTags);
questionRouter.get('/filtered/:tag', QuestionController.getQuestionsByTag);
questionRouter.get('/search/:text', QuestionController.getQuestionsBySearchedTitle);

export default questionRouter;
