import sql from "../config/db.js"


export const getUserCreations = async(request, respone) => {
    try{
        const {userId} = request.auth();
        const creations = await sql`select * from creations where user_id = ${userId} order by created_at DESC`;

        respone.json({success: true, creations});

    }catch (error) {
        respone.json({
            success : false,
            message : error.message
        })
    }
}


export const getPublishedCreations = async(request, respone) => {
    try{
        await sql`select * from creations where publish = true order by created_at DESC`;

        respone.json({success: true, creations});

    }catch (error) {
        respone.json({
            success : false,
            message : error.message
        })
    }
}







export const toggleLikeCreation = async(request, respone) => {
    try{
        const {userId} = request.auth();
        const {id} = request.body;

        const creation = await sql`select * from creations where user_id = ${id}`;
        if(!creation) {
            return respone.json({success : false, message: "creation not found"})
        }


        const currentLikes = creation.likes;
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if(currentLikes.includes(userIdStr)){
            updatedLikes = currentLikes.filter((user) => user !== userIdStr);
        }else{
            updatedLikes = [...currentLikes, userIdStr]
            message = 'Creation liked'
        }

        const formattedArray = `{${updatedLikes.join(',')}}`
        
        await sql`update creations set likes = ${formattedArray}::text[] where id = ${id}`;

        respone.json({success: true, creations});

    }catch (error) {
        respone.json({
            success : false,
            message : error.message
        })
    }
}