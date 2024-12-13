import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductItemDto } from 'src/common/dto/productItem.dto';
import { ProductService } from 'src/product/product.service';
import { Cart, CartDocument } from 'src/schema';
import { unSelectedFields } from 'src/types';
import { CreateCartDto } from './dto/create.dto';

@Injectable()
export class CartService {
    constructor(
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
        private readonly productService: ProductService
    ) {}

    async createCart(cartData: CreateCartDto, userId: string) {
        const newCartItemsData = cartData.items.map((item: ProductItemDto) => {
            return {
                productId: new Types.ObjectId(item.productId),
                price: item.price,
                quantity: item.quantity,
                useInsurance: item.useInsurance ?? false,
            };
        });

        const cart = new this.cartModel({
            productItems: newCartItemsData,
            userId: new Types.ObjectId(userId),
        });
        await cart.save();

        return {
            cart,
            message: 'Cart successfully created.',
        };
    }

    async getCarts(userId: string) {
        const carts = await this.cartModel.aggregate([
            { $match: { userId: new Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productItems.productId',
                    foreignField: '_id',
                    as: 'products',
                },
            },
            {
                $addFields: {
                    productItems: {
                        $map: {
                            input: '$productItems',
                            as: 'item',
                            in: {
                                productId: '$$item.productId',
                                quantity: '$$item.quantity',
                                price: '$$item.price',
                                useInsurance: '$$item.useInsurance',
                                product: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$products',
                                                as: 'product',
                                                cond: { $eq: ['$$product._id', '$$item.productId'] },
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
                    user: { password: 0, email: 0 }, // Loại bỏ trường không cần trong user
                    products: 0, // Không cần trường "products" vì đã gắn vào "productItems"
                },
            },
        ]);
        return carts;
    }
    
    

    async getCartById(id: string) {
        const cart = await this.cartModel.aggregate([
            { $match: { _id: new Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productItems.productId',
                    foreignField: '_id',
                    as: 'products',
                },
            },
            {
                $addFields: {
                    productItems: {
                        $map: {
                            input: '$productItems',
                            as: 'item',
                            in: {
                                productId: '$$item.productId',
                                quantity: '$$item.quantity',
                                price: '$$item.price',
                                useInsurance: '$$item.useInsurance',
                                product: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$products',
                                                as: 'product',
                                                cond: { $eq: ['$$product._id', '$$item.productId'] },
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

        if (!cart || cart.length === 0) {
            throw new NotFoundException(`Cart with ID ${id} not found`);
        }

        return cart[0];
    }

    async updateCart(id: string, cartData: CreateCartDto) {
        const cart = await this.cartModel.findById(id);
        if (!cart) {
            throw new NotFoundException(`Cart with ID ${id} not found`);
        }
    
        const updatedProductItems = [...cart.productItems];
    
        cartData.items.forEach((newItem: ProductItemDto) => {
            const existingItemIndex = updatedProductItems.findIndex(
                (item) => item.productId.toString() === newItem.productId
            );
    
            if (existingItemIndex > -1) {
                // Sản phẩm đã tồn tại, cập nhật quantity
                updatedProductItems[existingItemIndex].quantity += newItem.quantity;
            } else {
                // Sản phẩm chưa tồn tại, thêm mới
                updatedProductItems.push({
                    productId: newItem.productId,
                    price: newItem.price,
                    quantity: newItem.quantity,
                    useInsurance: newItem.useInsurance,
                });
            }
        });
    
        const result = await this.cartModel.findByIdAndUpdate(
            id,
            { $set: { productItems: updatedProductItems } },
            { new: true }
        );
    
        if (!result) {
            throw new NotFoundException(`Cart with ID ${id} not found`);
        }
    
        const enrichedCart = await this.cartModel.aggregate([
            { $match: { _id: new Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productItems.productId',
                    foreignField: '_id',
                    as: 'products',
                },
            },
            {
                $addFields: {
                    productItems: {
                        $map: {
                            input: '$productItems',
                            as: 'item',
                            in: {
                                productId: '$$item.productId',
                                quantity: '$$item.quantity',
                                price: '$$item.price',
                                useInsurance: '$$item.useInsurance',
                                product: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$products',
                                                as: 'product',
                                                cond: { $eq: ['$$product._id', '$$item.productId'] },
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
                    products: 0, // Không cần trường "products"
                },
            },
        ]);
    
        return enrichedCart[0];
    }
    
    async removeItemFromCart(cartId: string, itemId: string): Promise<Cart> {
        const cart = await this.cartModel.findById(cartId);
        if (!cart) {
            throw new NotFoundException(`Cart with ID ${cartId} not found`);
        }

        const itemIndex = cart.productItems.findIndex(
            (item) => item.productId.toString() === itemId,
        );
        if (itemIndex === -1) {
            throw new NotFoundException(`Item with ID ${itemId} not found in the cart`);
        }

        cart.productItems.splice(itemIndex, 1);

        await cart.save();

        const newCart = await this.getCartById(cart._id.toString());

        return newCart;
    }
}
