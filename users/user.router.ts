export{}
const express = require('express');
const userRouter = express.Router();
const userController = require('./user.controller');
const checkAuthorization = require('../helpers/middleware');

userRouter.get('/authorization', userController.authorizeUser);
userRouter.post('/create', userController.createAndPostUser);
userRouter.get('/get/:id', userController.getUserById);
userRouter.get('/get/:password/:email', userController.getUserByPasswordAndEmail);
userRouter.put('/update/:id', checkAuthorization, userController.updateUserPersonnalInfo);

module.exports = userRouter;
