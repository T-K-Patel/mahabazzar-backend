import { Router } from "express";
import AdminProductController from "../../controllers/admin.product.controller.js";

const adminInventoryRoutes = Router();

// Products Routes
adminInventoryRoutes
    .route("/products")
    .get(AdminProductController.getAllProducts);
adminInventoryRoutes
    .route("/product/:product_id")
    .get(AdminProductController.getProductById);
adminInventoryRoutes
    .route("/add-product")
    .post(AdminProductController.addProduct);
adminInventoryRoutes
    .route("/updateStock/:product_id")
    .put(AdminProductController.updateStock);
adminInventoryRoutes
    .route("/topSellingProducts")
    .get(AdminProductController.getTopSellingProductsInSixMonths);

export default adminInventoryRoutes;
