import express from "express";
import productController from "../controllers/productController.js";
import bidController from "../controllers/biddersController.js";
import upload from "../middleware/multer.js";
import { checkAuthentication } from "../middleware/check-user.js";
import restrictTo from "../middleware/admin_restrict.js";

const router = express.Router();

router.get("/", new productController().get_products);
router.get("/users", new productController().get_users);
router.get("/:id", new productController().get_product);

router.get("/edit_product/:id", new productController().get_product_edit_page);

router.delete(
  "/delete/:id",
  checkAuthentication,
  restrictTo("admin"),
  new productController().delete_product
);

router.post(
  "/product",
  checkAuthentication,
  restrictTo("admin"),
  upload.array("product_photos", 2),
  new productController().check_before_create_product,
  new productController().create_product
);

router.patch(
  "/edit/:id",
  checkAuthentication,
  restrictTo("admin"),

  upload.array("product_photos", 2),
  new productController().check_before_update_product,
  new productController().update_product
);

// creating bid
router.post(
  "/bid/:id",
  checkAuthentication,
  new bidController().checkErrorBeforeBid,
  new bidController().createBid
);

router.post(
  "/testing_create",
  upload.array("product_photos", 2),
  new productController().create_testing
);

export default router;
