import express from "express";
import homeController from "../controllers/homeController.js";
import productController from "../controllers/productController.js";
import bidController from "../controllers/biddersController.js";
import upload from "../middleware/multer.js";
import { checkAuthentication } from "../middleware/check-user.js";
import restrictTo from "../middleware/admin_restrict.js";
import Product from "../models/productModel.js";

const router = express.Router();

router.get("/home", new productController().render_products);
router.get("/", new productController().render_home);
router.get("/user_dashboard", new productController().get_dashboard);
router.get("/user/dashboard", new productController().get_dashboard);
router.get("/login", new productController().render_login);
router.get("/register", new productController().render_register);
router.get("/products/:id", async (req, res) => {
  try {
    await Product.findOne({ _id: req.params.id })
      .populate({
        path: "bidders",
        model: "User",
        populate: {
          path: "bid",
          model: "Bid",
        },
      })
      .then((product) => {
        res.render("details", { product });
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  } catch (error) {
    res.status(404).json({
      Message: error.message,
    });
  }
});
router.get("/:id", new productController().get_product_one);
// router.get("/search:searchItem", new productController().main_search);

export default router;
