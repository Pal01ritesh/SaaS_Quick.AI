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
    const image = request.file;
    const plan = request.plan;

    if (plan !== 'premium') {
      return response.status(403).json({
        success: false,
        message: 'Feature only available for premium users. Upgrade to continue.',
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: 'background_removal',
          background_removal: 'remove_the_background',
        },
      ],
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${'Remove background from image'}, ${secure_url}, 'image')
    `;

    response.json({ success: true, content: secure_url });
  } catch (error) {
    console.error('Background Removal Error:', error.message);
    response.status(500).json({
      success: false,
      message: 'Something went wrong while removing background.',
    });
  }
};


// Object remover



export const removeImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file; 
    const { object } = req.body; 
    const plan = req.plan;

    if (plan !== "premium") {
      return res.status(403).json({
        success: false,
        message: "Feature only available for premium users. Upgrade to continue.",
      });
    }

    if (!object) {
      return res.status(400).json({
        success: false,
        message: "Please specify an object name to remove.",
      });
    }

    const uploadResult = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: `gen_remove:prompt_the ${object}`,
        },
      ],
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed object: ${object}`}, ${uploadResult.secure_url}, 'image')
    `;

    return res.json({ success: true, content: uploadResult.secure_url });
  } catch (error) {
    console.error("Object removal with gen_remove error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove object from image.",
    });
  }
};
