import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/user.routes.js';
// import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

dotenv.config();

const app = express();
await connectCloudinary();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get('/', (request, response) => {
  response.send('server is live!');
});

app.use(requireAuth());
app.use('/api/ai', aiRouter);


app.use('/api/user', userRouter);




// app.get('/protected', ClerkExpressRequireAuth(), (req, res) => {
//   const user = req.auth.userId;
//   console.log('Clerk user:', user);
//   res.send(`Hello, user ${user}`);
// });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
