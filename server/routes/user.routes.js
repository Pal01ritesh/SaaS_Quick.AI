import express from 'express';
import { getPublishedCreations, getUserCreations, toggleLikeCreation } from '../controllers/user.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const userRouter = express.Router();


userRouter.get('/get-user-creations', auth, getUserCreations)
userRouter.get('/get-published-creations', auth, getPublishedCreations)
userRouter.get('/toggle-like-creation/:id', auth, toggleLikeCreation)


export default userRouter;