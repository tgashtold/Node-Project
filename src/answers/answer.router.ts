import express from 'express';
import { AnswerController } from './answer.controller';
import { verifyToken } from '../common/middlewares/verifyToken';

const answerRouter = express.Router();

answerRouter.post('/create', verifyToken, AnswerController.createAndPostAnswer);
answerRouter.get('/get/:questionId/:answersCount', AnswerController.getQuestionAndAnswers);
answerRouter.get('/get/:questionId/:answersCount/:startNumber', AnswerController.getAnswersFromRequestedPosition);
answerRouter.post('/addLike', verifyToken, AnswerController.addLikeAndUpdateQuestionAndAnswers);
answerRouter.post('/accept', verifyToken, AnswerController.acceptAnswer);

export default answerRouter;
