import express from 'express';
import {UserController} from './user.controller';
import {verifyToken} from '../common/middlewares/verifyToken';

const userRouter = express.Router();

userRouter.get('/authorization', verifyToken, UserController.authorizeUser);
userRouter.post('/create', UserController.createAndPostUser);
userRouter.get('/get/:id', UserController.getUserById);
userRouter.get('/get/:password/:email', UserController.getUserByPasswordAndEmail);
userRouter.put('/update/:id', verifyToken, UserController.updateUserPersonnalInfo);
userRouter.delete('/logout', UserController.logOutUser);

export default userRouter;