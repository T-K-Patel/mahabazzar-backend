import { z } from "zod";
import { ORDER_STATUS_ENUM, OrderItems, Product } from "../models/index.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../Errors/ApiError.js";
import { StatusCodes } from "http-status-codes";

let AdminProductController = {};

const productSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    price: z.number().min(0).nonnegative(),
    cost: z.number().min(0).nonnegative(),
    discountPercentage: z.number().min(0).max(100).default(0),
    stock: z.number().int().nonnegative(),
    category: z.string().min(1),
    thumbnail: z.string().min(1),
    images: z.array(z.string()).default([]),
});

AdminProductController.addProduct = async (req, res) => {
    const { success, data, error } = productSchema.safeParse(req.body);

    if (!success)
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Invalis Fields",
            error.format()
        );

    const product = await Product.create(data);
    if (!product)
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Some error occured while creating product."
        );

    res.status(StatusCodes.CREATED).json(
        new ApiResponse(product, "Product added successfully")
    );
};
const cache = { products: [], categories: [], cacheTime: 0 };
const limit = 20;
AdminProductController.getAllProducts = async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}/`);
    const page = url.searchParams.get("p") || 1;
    const filterCategoriesArr = url.searchParams.getAll("c");
    if (cache.cacheTime + 1000 * 60 * 3 < Date.now() || !cache.products || cache.products.length == 0) {
        console.log("Cache miss")
        cache.cacheTime = Date.now();
        cache.products = await Product.find().sort("-createdAt");
        cache.categories = cache.products.map((product) => product.category);
        cache.categories = [...new Set(cache.categories)];
        cache.categories.sort();
    }
    let products = cache.products;

    if (filterCategoriesArr.length > 0) {
        products = products.filter((product) =>
            filterCategoriesArr.includes(product.category)
        );
    }
    const uniqueCategories = cache.categories;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {
        totalProducts: products.length,
        page: page,
        categories: uniqueCategories,
    };
    if (startIndex >= products.length) {
        results.page = 1;
        results.results = products.slice(0, limit);
    }
    else results.results = products.slice(startIndex, endIndex);
    res.setHeader('Cache-Control', 's-maxage=300')
    res.status(200).json(new ApiResponse(results, "All Products"));
};

AdminProductController.getProductById = async (req, res) => {
    try {
        const { product_id } = req.params;
        const product = await Product.findById(product_id);
        if (!product) throw new Error("Product not found");
        res.status(200).json(new ApiResponse(product, "Product found"));
    } catch (error) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Product not found with specified product id"
        );
    }
};

AdminProductController.updateStock = async (req, res) => {
    const stock = Number(req.body.stock);
    const { product_id } = req.params;
    if (!stock || isNaN(stock) || parseInt(stock) != stock || stock <= 0)
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Stock must be a valid integer greater than 0"
        );
    let product;
    try {
        product = await Product.findByIdAndUpdate(
            product_id,
            { stock },
            { new: true }
        );
    } catch (e) { }
    if (!product) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Product not found with specified product id"
        );
    }
    res.status(StatusCodes.OK).json(new ApiResponse(product, "Stock updated"));
};

AdminProductController.getTopSellingProductsInSixMonths = async (req, res) => {
    const topSellingProducts = await OrderItems.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(
                        new Date().setMonth(new Date().getMonth() - 6)
                    ),
                },
            },
        },
        {
            $lookup: {
                from: "orders",
                localField: "order_id",
                foreignField: "_id",
                as: "order",
            },
        },
        {
            $unwind: "$order",
        },
        {
            $lookup: {
                from: "products",
                localField: "item",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            stock: 1,
                            title: 1,
                        },
                    },
                ],
                as: "product",
            },
        },
        {
            $unwind: "$product",
        },
        {
            $match: {
                "order.statusCode": ORDER_STATUS_ENUM.DELIVERED,
            },
        },
        {
            $group: {
                _id: "$item",
                title: {
                    $first: "$product.title",
                },
                totalQuantity: {
                    $sum: "$quantity",
                },
                avgPrice: {
                    $avg: "$price",
                },
                totalSales: {
                    $sum: { $multiply: ["$price", "$quantity"] },
                },
                totalCost: {
                    $sum: { $multiply: ["$cost", "$quantity"] },
                },
                stock: {
                    $first: "$product.stock",
                },
            },
        },
        {
            $sort: { totalQuantity: -1, totalSales: -1 },
        },
        {
            $limit: 5,
        },
    ]);

    res.status(StatusCodes.OK).json(
        new ApiResponse(topSellingProducts, "Top Selling Products")
    );
};

export default AdminProductController;
