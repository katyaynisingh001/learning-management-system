import User from "../models/User.js";

export const getUserCount = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        return res.status(200).json({
            success: true,
            totalUsers,
        });
    } catch (error) {
        console.error("User count error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch user count",
        });
    }
};
