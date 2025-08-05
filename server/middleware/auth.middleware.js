import { clerkClient } from "@clerk/express";

export const auth = async (request, response, next) => {
  try {
    const { userId } = await request.auth();

    const user = await clerkClient.users.getUser(userId);

    const plan = user.publicMetadata?.plan || "free";
    const isPremium = plan === "premium";

    if (!isPremium && user.privateMetadata?.free_usage) {
      request.free_usage = user.privateMetadata.free_usage;
    } else {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: 0,
        },
      });

      request.free_usage = 0;
    }

    request.plan = isPremium ? "premium" : "free";
    next();
  } catch (error) {
    response.json({ success: false, message: error.message });
  }
};
