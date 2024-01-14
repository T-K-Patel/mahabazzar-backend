import { Router } from "express";
import ProductController from "../controllers/products.controller.js";

const ProductRoutes = Router();

ProductRoutes.route("/add-new").post(ProductController.addProduct);

export default ProductRoutes;
