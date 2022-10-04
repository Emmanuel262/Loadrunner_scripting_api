import express from "express";
import productController from "../controllers/productController.js";

const router = express.Router();

router.get("/search", new productController().main_search);
router.get("/categories/houses", new productController().category_houses);
router.get("/categories/computers", new productController().category_computers);
router.get("/categories/fashions", new productController().category_fashions);
router.get("/categories/furnitues", new productController().category_furnitues);
router.get("/categories/cars", new productController().category_cars);

export default router;
