import User from "../models/userModel.js";

function restrictTo(...roles) {
  return async (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    try {
      const user = await User.findById(req.user.id);
      if (!roles.includes(req.user.role)) {
        throw new Error("You do not have permission to perform this action");
      }

      next();
    } catch (error) {
      return res.status(401).json({
        Error: error.message,
      });
    }
  };
}

export default restrictTo;
