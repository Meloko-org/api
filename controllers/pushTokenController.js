const { Expo } = require("expo-server-sdk");
const { isUser } = require("../modules/verification");
const { UserPushToken } = require("../models");

const expo = new Expo();

const registerPushToken = async (req, res) => {
  console.log("registerPushToken");
  try {
    const user = await isUser(req.auth.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé.",
      });
    }
    const userId = user._id;
    console.log("userId :", userId);
    const { token, platform } = req.body;

    // if (!Expo.isExpoPushToken(token)) {
    // 	return res.status(400).json({ error: "Invalid Expo push token" });
    // }

    // // ⛔ déjà enregistré ? → on ne recrée pas
    // const existing = await UserPushToken.findOne({ token });
    // console.log("existing token: user :", existing.user.toString())
    // if (existing) {

    // 	// si le token existe mais pas associé au bon user → on le réassigne
    // 	if (existing.user.toString() !== userId.toString()) {
    // 		existing.user = userId;
    // 		existing.platform = platform;
    // 		await existing.save();
    // 	}

    // 	return res.json({ success: true, reused: true });
    // }

    // // ✅ nouveau token
    // await UserPushToken.create({
    // 	user: userId,
    // 	token,
    // 	platform,
    // });

    // res.json({ success: true, created: true });

    if (!token || !platform) {
      return res.status(400).json({ success: false });
    }

    await UserPushToken.findOneAndUpdate(
      { token },
      { user: userId, platform },
      { upsert: true, new: true },
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

module.exports = {
  registerPushToken,
};
