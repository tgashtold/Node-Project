export {};
const express = require('express');
const questionRouter = express.Router();
const questionController = require('./question.controller');
const checkAuthorization = require('../helpers/middleware');

questionRouter.post('/create', checkAuthorization, questionController.createAndPostQuestion);
questionRouter.get('/all', questionController.getQuestions);
questionRouter.get('/tags', questionController.getTags);
questionRouter.get('/filtered/:tag', questionController.getQuestionsByTag);
questionRouter.get('/search/:text', questionController.getQuestionsBySearchedTitle);

module.exports = questionRouter;
