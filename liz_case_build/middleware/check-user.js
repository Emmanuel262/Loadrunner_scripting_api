import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export async function checkAuthentication(req, res, next) {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new Error("You are not logged in! Please log in to get access.");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new Error("The user belonging to this token does no longer exist.");
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.userData = decoded;
    req.user = currentUser;
    res.locals.user = currentUser;

    next();
  } catch (error) {
    res.locals.user = null;
    return res.status(401).json({
      message:
        "You are not allowed to access this endpoint. Please login to your credential or contact webpage owner",
      Error: error,
    });
  }
}

// export async function requireAuth(req, res, next) {
//   const token = req.cookies.jwt;

//   // Check json web token exists & is verified
//   if (token) {
//     jwt.verify(token, "net ninja secret", (error, decodedToken) => {
//       if (error) {
//         console.log(error.message);
//         res.redirect("/login");
//       } else {
//         console.log(decodedToken);
//         next();
//       }
//     });
//   } else {
//     res.redirect("/login");
//   }
// }

// Check current user
export async function checkuser(req, res, next) {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (error, decodedToken) => {
      if (error) {
        console.log(error.message);
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
}

// module.exports = { requireAuth, checkuser };
