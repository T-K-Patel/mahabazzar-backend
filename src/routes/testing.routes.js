import { Router } from "express";
import { Order, Product, ORDER_STATUS_ENUM, User, OrderItems } from "../models/index.js";
import { faker } from "@faker-js/faker";
import { ApiResponse } from "../utils/ApiResponse.js";
const testingroutes = Router();

const numRange = ({ min, max }) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

testingroutes.route("/add-products").get(async (req, res) => {
    const data = [];
    for (let i = 0; i < 450; i++) {
        const price = numRange({ min: 100, max: 10000 });
        const images = [];
        let imgCount = numRange({ min: 1, max: 7 });
        for (let j = 0; j < imgCount; j++) {
            images.push(faker.image.url());
        }
        data.push({
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price,
            cost: price - numRange({ min: 70, max: Math.min(500, price) }),
            discountPercentage: numRange({ min: 0, max: 50 }),
            stock: numRange({ min: 0, max: 500 }),
            category: faker.commerce.department(),
            thumbnail: faker.image.url(),
            images
        });
    }
    const products = await Product.insertMany(data);
    res.status(201).json(new ApiResponse(products, "Products added successfully"));
})

testingroutes.route("/add-orders").get(async (req, res) => {
    const data = [];
    const users = await User.find();
    for (let i = 0; i < 80; i++) {
        data.push({
            user_id: users[numRange({ min: 0, max: users.length - 1 })]._id,
            address: {
                landmark: faker.location.streetAddress(),
                city: faker.location.city(),
                state: faker.location.state(),
                country: faker.location.country(),
                pincode: faker.location.zipCode({ country: "IN", format: "######" }),
                phone: faker.phone.number(),
                type: (["HOME", "WORK"])[numRange({ min: 0, max: 1 })]
            },
            items: [],
            statusCode: Object.values(ORDER_STATUS_ENUM)[numRange({ min: 0, max: Object.values(ORDER_STATUS_ENUM).length - 1 })],
            totalPrice: 0,
            delivery: faker.date.future()
        });
    }
    await Order.insertMany(data);
    const orders = await Order.find();
    const products = await Product.find();
    orders.forEach(async (order) => {
        const selected = [];
        let productCount = numRange({ min: 1, max: 7 });
        const map = new Map();
        for (let j = 0; j < productCount; j++) {
            const product = products[numRange({ min: 0, max: products.length - 1 })];
            if (!map.has(product._id)) {
                selected.push({
                    order_id: order._id,
                    item: product._id,
                    price: product.price,
                    cost: product.cost,
                    quantity: numRange({ min: 1, max: 5 })
                });
                order.items.push(product._id);
                map.set(product._id, true);
            }
        }
        order.totalPrice = selected.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
        await order.save();
        await OrderItems.insertMany(selected);
    })
    res.status(201).json(new ApiResponse(orders, "Orders added successfully"));
})

testingroutes.route("/deliver-order").get(async (req, res) => {
    const orders = await Order.find({ statusCode: ORDER_STATUS_ENUM.PROCESSING });
    orders.forEach(async (order) => {
        if (numRange({ min: 0, max: 10 }) < 3) {
            {
                order.statusCode = ORDER_STATUS_ENUM.DELIVERED;
                await order.save();
            }
        }
    })
    res.status(200).json(new ApiResponse(orders, "Orders delivered successfully"));
})

testingroutes.route("/rate-items").get(async (req, res) => {
    const orders = await Order.find({ statusCode: ORDER_STATUS_ENUM.DELIVERED });
    orders.forEach(async (order) => {
        order.items.forEach(async (item) => {
            if (numRange({ min: 0, max: 100 }) < 6) {
                const orderItem = await OrderItems.findOne({ order_id: order._id, item });
                orderItem.rating = numRange({ min: 1, max: 5 });
                await orderItem.save();
            }
        })
    })
    res.status(200).json(new ApiResponse(orders, "Items rated successfully"));
})

export default testingroutes;