import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderState, PaymentMethod } from 'src/schema';
import { ProductService } from './../product/product.service';
import { OrderDto } from './dto/order.dto';
import { unSelectedFields } from 'src/types';
import { ProductItemDto } from 'src/common/dto/productItem.dto';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        private readonly productService: ProductService,
    ) {}

    // Generate a random order code for PayOS
    generateOrderCode(length: number) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte % 10).join('');
    }

    // Create an order
    async createOrder(orderData: OrderDto, userId: string) {
        const listOfSingleOrder = orderData.items.map((item) => {
            if (!item.productId || !item.quantity || !item.price) {
                throw new Error('Invalid product item data.');
            }
            return {
                ...item,
                productId: new Types.ObjectId(item.productId),
            };
        });

        const newOrder = new this.orderModel({
            state: orderData.state || OrderState.ORDERED,
            isDeleted: false,
            paymentMethod: orderData.paymentMethod || PaymentMethod.CASH,
            totalPrice: 0,
            listOfSingleOrder: listOfSingleOrder,
            receivingAddress: orderData.receivingAddress,
            receivingPhone: orderData.receivingPhone,
        
            userId: new Types.ObjectId(userId),
            orderCode: this.generateOrderCode(10),
            deliveryDate: orderData.deliveryDate,
        });

        const savedOrder = await newOrder.save();

        const updatedOrder = await this.calculateTotalPrice(
            savedOrder._id.toString(),
        );

        await this.updateProductSoldQuantity(listOfSingleOrder as any);

        return updatedOrder;
    }

    async getAllOrders() {
        const orders = await this.orderModel.aggregate<OrderDocument>([
            {
                $match: {
                    isDeleted: false,
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'listOfSingleOrder.productId',
                    foreignField: '_id',
                    as: 'products',
                },
            },
            {
                $addFields: {
                    listOfSingleOrder: {
                        $map: {
                            input: '$listOfSingleOrder',
                            as: 'item',
                            in: {
                                productId: '$$item.productId',
                                quantity: '$$item.quantity',
                                price: '$$item.price',
                                product: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$products',
                                                as: 'product',
                                                cond: {
                                                    $eq: [
                                                        '$$product._id',
                                                        '$$item.productId',
                                                    ],
                                                },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    totalPrice: {
                        $sum: {
                            $map: {
                                input: '$listOfSingleOrder',
                                as: 'item',
                                in: {
                                    $multiply: [
                                        '$$item.quantity',
                                        '$$item.product.price',
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    user: { password: 0, email: 0, ...unSelectedFields },
                    products: 0,
                },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        ]);

        return orders;
    }

    // Get all orders for a specific user
    async getOrders(userId: string) {
        const orders = await this.orderModel.aggregate<OrderDocument>([
            {
                $match: {
                    isDeleted: false,
                    userId: new Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'listOfSingleOrder.productId',
                    foreignField: '_id',
                    as: 'products',
                },
            },
            {
                $addFields: {
                    listOfSingleOrder: {
                        $map: {
                            input: '$listOfSingleOrder',
                            as: 'item',
                            in: {
                                productId: '$$item.productId',
                                quantity: '$$item.quantity',
                                price: '$$item.price',
                                product: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$products',
                                                as: 'product',
                                                cond: {
                                                    $eq: [
                                                        '$$product._id',
                                                        '$$item.productId',
                                                    ],
                                                },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    totalPrice: {
                        $sum: {
                            $map: {
                                input: '$listOfSingleOrder',
                                as: 'item',
                                in: {
                                    $multiply: [
                                        '$$item.quantity',
                                        '$$item.product.price',
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    user: { password: 0, email: 0, ...unSelectedFields },
                    products: 0,
                },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        ]);

        return orders;
    }

    // Get order details by order ID
    async getOrderById(id: string) {
        const order = await this.orderModel.aggregate([
            { $match: { _id: new Types.ObjectId(id), isDeleted: false } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'listOfSingleOrder.productId',
                    foreignField: '_id',
                    as: 'products',
                },
            },
            {
                $addFields: {
                    listOfSingleOrder: {
                        $map: {
                            input: '$listOfSingleOrder',
                            as: 'item',
                            in: {
                                productId: '$$item.productId',
                                quantity: '$$item.quantity',
                                price: '$$item.price',
                                product: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$products',
                                                as: 'product',
                                                cond: {
                                                    $eq: [
                                                        '$$product._id',
                                                        '$$item.productId',
                                                    ],
                                                },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    user: { password: 0, email: 0, ...unSelectedFields },
                    products: 0,
                },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        ]);

        if (!order || order.length === 0) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        return order[0];
    }

    // Update order status
    async updateOrderStatus(id: string, status: OrderState) {
        const order = await this.orderModel.findById(id);

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        order.state = status;
        return await order.save();
    }

    async updatePaymentStateByOrderCode(orderCode: string, paymentState: boolean) {
        const order = await this.orderModel.findOne({ orderCode: orderCode });

        if (!order) {
            throw new NotFoundException(`Order with order code: ${orderCode} not found`);
        }

        order.paymentState = paymentState;
        return await order.save();
    }

    private async calculateTotalPrice(orderId: string) {
        const order = await this.orderModel.findById(orderId);

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        const updatedOrder = order.listOfSingleOrder.reduce(
            (acc, item) => {
                acc.totalPrice += item.price * item.quantity;
                return acc;
            },
            { totalPrice: 0 },
        );

        order.totalPrice = updatedOrder.totalPrice;
        await order.save();

        return order;
    }

    private async updateProductSoldQuantity(listOfSingleOrder: ProductItemDto[]): Promise<void> {
        const updatePromises = listOfSingleOrder.map((item) => 
            this.productService.findOne(item.productId)
                .then((product) => {
                    console.log(product);
                    if (!product) {
                        throw new Error(`Product with ID ${item.productId} not found`);
                    }
                    product.soldQuantity += item.quantity;
                    return product.save();
                })
        );
    
        // Execute all promises concurrently and wait for them to finish
        await Promise.all(updatePromises);
    }
}
