import Bid from "../models/bidModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import validator from "validator";
import twilio from "twilio";
import dotenv from "dotenv";

class BidController {
  async createBid(req, res) {
    const bid = req.body.bid;
    const firstName = req.user.firstName;
    const email = req.user.email;
    const product_id = req.params.id;

    await Bid.create({
      product: product_id,
      user: req.user.id,
      price: bid,
    })
      .then(async (result) => {
        const product = await Product.updateOne(
          { _id: product_id },
          { $push: { bidders: req.user.id } }
        );
        if (!product) {
          throw new Error("No document found with that ID");
        }
        return result._id;
      })
      .then(async (result) => {
        console.log(result._id);
        const user = await User.updateOne(
          { _id: req.user.id },
          { bid: result._id, products: product_id }
        );
        const newUser = User.findById({ _id: req.user.id });
        const sid = process.env.TWILIO_SID;
        const auth_token = process.env.TWILIO_TOKEN;

        twilio(sid, auth_token)
          .messages.create({
            from: "+15737993501",
            to: "+250787376958",
            body: `Hi ${firstName}, you have placed bid of amout ${bid}Rwf`,
          })
          .then((res) => {
            console.log("message was sent");
          })
          .catch((err) => {
            console.log(err);
          });
        if (!user) {
          throw new Error("No document found with that ID");
        }
        res.redirect("/home");
        // res.status(200).json({
        //   message: "Bid was saved successful!!!",
        // });
      })
      .catch((err) => {
        res.render("error_page");
        // res.status(400).json({
        //   savingProcess: "Unexpected Error. Your bid was not created.",
        //   ErrorMessage: err.message,
        // });
      });
  }

  async checkErrorBeforeBid(req, res, next) {
    try {
      const bid = req.body.bid;
      const firstName = req.user.firstName;
      const email = req.user.email;
      const product_id = req.params.id;

      const product = await Product.findById(product_id);
      if (!product) {
        throw new Error("no product found");
      }

      let errors = {};
      if (firstName == undefined) {
        errors.firstName = "firstName is not provided";
      }
      if (bid === undefined) {
        errors.firstName = "firstName is not provided";
      }
      if (email == undefined) {
        errors.email = "email is not provided";
      }
      if (bid == undefined) {
        errors.bid = "bid is not provided";
      }
      if (Object.values(errors).length > 0) {
        throw errors;
      }
      if (
        firstName.length === 0 ||
        !validator.isEmail(email) ||
        bid.length === 0
      ) {
        throw new Error("You must fill Names, Email and bid correctly.");
      }
      next();
    } catch (error) {
      // res.status(401).json({
      //   errorMessage: error.message,
      // });
      res.render("error_page");
    }
  }
}

export default BidController;
