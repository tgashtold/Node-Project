export {};
const express = require('express');
const answerRouter = express.Router();
const answerController = require('./answer.controller');
const checkAuthorization = require('../helpers/middleware');

answerRouter.post('/create', checkAuthorization, answerController.createAndPostAnswer);
answerRouter.get('/get/:questionId/:answersCount', answerController.getQuestionAndAnswers);
answerRouter.get('/get/:questionId/:answersCount/:startNumber', answerController.getAnswersFromRequestedPosition);
answerRouter.post('/addLike', checkAuthorization, answerController.addLikeAndUpdateQuestionAndAnswers);
answerRouter.post('/accept', checkAuthorization, answerController.acceptAnswer);

module.exports = answerRouter;
