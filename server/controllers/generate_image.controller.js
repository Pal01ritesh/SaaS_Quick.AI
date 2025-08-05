import sql from '../config/db.js';
import { v2 as cloudinary } from 'cloudinary';
import FormData from 'form-data';
import axios from 'axios';


export const generateImage = async (request, response) => {
  try {
    const { userId } = request.auth();
    const { prompt, publish } = request.body;
    const plan = request.plan;

    console.log(plan);

    if (!prompt) {
      return response.status(400).json({
        success: false,
        message: 'Missing prompt in request body.'
      });
    }

    if (plan !== 'premium') {
      return response.status(403).json({
        success: false,
        message: 'Feature only available for premium users. Upgrade to continue.'
      });
    }

    const formData = new FormData();
    formData.append('prompt', prompt);

    const { data } = await axios.post(
      'https://clipdrop-api.co/text-to-image/v1',
      formData,
      {
        headers: {
          'x-api-key': process.env.CLIPDROP_API_KEY
        },
        responseType: 'arraybuffer'
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;
    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    response.json({ success: true, content: secure_url });
  } catch (error) {
    console.error('AI Generation Error:', error.message);
    response.status(500).json({
      success: false,
      message: 'Something went wrong while generating the image.'
    });
  }
};

// Background remover


export const removeImageBackground = async (request, response) => {
    try {
      const { userId } = request.auth();
      const { image } = request.file;
      const plan = request.plan;
  
      console.log(plan);

  
      if (plan !== 'premium') {
        return response.status(403).json({
          success: false,
          message: 'Feature only available for premium users. Upgrade to continue.'
        });
      }
  
  
      const { secure_url } = await cloudinary.uploader.upload(image.path, {
        transformation : [
            {
                effect : 'background_removal',
                background_removal : 'remove_the_background'
            }
        ]
      });
  
      await sql`
        INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, "Remove background from image" , ${secure_url}, 'image')
      `;
  
      response.json({ success: true, content: secure_url });
    } catch (error) {
      console.error('AI Generation Error:', error.message);
      response.status(500).json({
        success: false,
        message: 'Something went wrong while generating the image.'
      });
    }
  };
  

// Object remover



  
export const removeImage = async (request, response) => {
    try {
      const { userId } = request.auth();
      const { object } = request.body;
      const { image } = request.file;
      const plan = request.plan;
  
      console.log(plan);

  
      if (plan !== 'premium') {
        return response.status(403).json({
          success: false,
          message: 'Feature only available for premium users. Upgrade to continue.'
        });
      }
  
  
      const { public_id } = await cloudinary.uploader.upload(image.path);

      const image_url = cloudinary.url(public_id , {
        transformation: [{effect: `gen_remove:${object}`}],
        resource_type: 'image'
      })
  
      await sql`
        INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${`Removed ${object} from image`} , ${image_url}, 'image')
      `;
  
      response.json({ success: true, content: image_url });
    } catch (error) {
      console.error('AI Generation Error:', error.message);
      response.status(500).json({
        success: false,
        message: 'Something went wrong while generating the image.'
      });
    }
  };




