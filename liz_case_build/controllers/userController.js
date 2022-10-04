import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const handleErrors = (err) => {
  let errors = {
    fullNames: "",
    company: "",
    email: "",
    password: "",
    passwordConfirm: "",
    generalError: "",
  };

  // password do not match
  if (err.message === "Password does not match") {
    errors.passwordConfirm = "Passwords do not match";
  }
  // Incorrect email
  if (err.message === "incorrect email") {
    errors.email = "Email is not registered";
  }
  // Incorrect password
  if (err.message === "incorrect password") {
    errors.password = "Incorrect password";
  }

  // duplicate error code
  if (err.code === 11000) {
    errors.email = "Email is already registered.";
    return errors;
  }

  if (err.message === "One or more input field is missing value.") {
    errors.generalError = "One or more input field is missing value.";
  }

  // Validation error
  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id, userEmail) => {
  return jwt.sign(
    {
      id,
      userEmail,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    }
  );
};

class UserController {
  async login_check(req, res, next) {
    if (Object.keys(req.body).length > 0) {
      let bodyKeys = Object.keys(req.body);
      var requiredObject = ["email", "password"];
      bodyKeys.forEach((key) => {
        if (!requiredObject.includes(key)) {
          throw new Error(`"${key}" is not part of required body field.`);
        }
      });
    }
    if (Object.keys(req.body).length == 0) {
      throw new Error("You are required to provide an Email and password");
    }

    next();
  }
  async login_post(req, res) {
    const { email, password } = req.body;
    console.log(req.body);

    try {
      const user = await User.login(email, password);
      if (!user) {
        throw new Error("Incorrect email or password.");
      }
      const token = createToken(user._id, user.email);
      // res.cookie("jwt", token, {
      //   expires: new Date(
      //     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      //   ),
      //   secure: req.secure || req.headers["x-forwarded-photo"] === "https",
      // });
      // Remove password from output
      user.password = undefined;
      res.header("Token", token);
      res.header("Set-Cookie", `jwt=${token}; path=/;`);
      res.setHeader("SET-COOKIE", "JSESSIONID=" + token + "; HttpOnly");
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(200).json({
        status: "User login Successful",
        user: {
          userEmail: user.email,
          userName: user.firstName,
          userLastName: user.role,
        },
        token: {
          token,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ Error: error.message });
    }
  }

  async logout_get(req, res) {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({
      status: "User logout successful",
    });
  }
  async logout_get_home(req, res) {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/");
  }

  async signup_post(req, res) {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      passwordConfirm,
    } = req.body;
    console.log(req.body);

    try {
      if (password !== passwordConfirm) {
        throw new Error("Password does not match");
      }
      if (!firstName || !lastName || !email || !password || !passwordConfirm) {
        throw new Error("One or more input field is missing value.");
      }
      const user = await User.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        passwordConfirm,
      });
      console.log(user._id);
      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOny: true, maxAge: maxAge * 1000 });
      res.status(200).json({
        status: "Successful created",
        user,
      });
    } catch (error) {
      console.log(error);
      const errors = handleErrors(error);
      res.status(400).json({ ErrorMessage: error });
    }
  }
}

export default UserController;
