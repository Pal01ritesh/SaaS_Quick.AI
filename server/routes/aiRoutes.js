import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import { generateArticle, resumeReview } from '../controllers/article.controller.js';
import { generateBlogTitle } from '../controllers/blog_title.controller.js';
import { generateImage, removeImage, removeImageBackground } from '../controllers/generate_image.controller.js';
import { upload } from '../middleware/multer.middleware.js';

const aiRouter = express.Router();

aiRouter.post('/generate-article', auth, generateArticle);
aiRouter.post('/generate-blog-title', auth, generateBlogTitle);
aiRouter.post('/generate-image', auth, generateImage);
aiRouter.post('/remove-image-background',upload.single('image'), auth, removeImageBackground);
aiRouter.post('/remove-image-object',upload.single('image'), auth, removeImage);
aiRouter.post('/resume-review',upload.single('resume'), auth, resumeReview);

export default aiRouter;
