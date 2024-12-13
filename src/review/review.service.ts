import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument, Review, ReviewDocument } from 'src/schema';
import { CreateReviewDto } from './dto/create.dto';
import { productMess, reviewMess } from 'src/contants';
import { ProductService } from 'src/product/product.service';
import { unSelectedFields } from 'src/types';
import { UpdateReviewDto } from './dto/update.dto';

@Injectable()
export class ReviewService {
    constructor(
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
        private readonly productService: ProductService,
    ) {}

    // Create a new review
    async createReview(createReviewDto: CreateReviewDto) {
        try {
            const { productId, userId, ...reviewData } = createReviewDto;

            const product = await this.productService.findOne(productId);
            if (!product) {
                throw new NotFoundException(productMess.NOT_FOUND);
            }

            const newReview = new this.reviewModel({
                ...reviewData,
                userId: new Types.ObjectId(userId),
                productId: new Types.ObjectId(productId),
                isDeleted: false,
            });

            await newReview.save();

            const { avgRating } = await this.calculateAverageRating(productId);
            
            product.avgStar = avgRating

            await product.save();

            return {
                message: reviewMess.CREATED,
                review: newReview,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // Get all reviews for a product using aggregate
    async getReviewsByProduct(productId: string) {
        try {
            const reviews = await this.reviewModel.aggregate<ReviewDocument>([
                {
                    $match: {
                        productId: new Types.ObjectId(productId),
                        isDeleted: false,
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        foreignField: '_id',
                        localField: 'userId',
                        pipeline: [
                            {
                                $project: {
                                    ...unSelectedFields,
                                    password: 0,
                                    email: 0,
                                    role: 0,
                                },
                            },
                        ],
                        as: 'user',
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        foreignField: '_id',
                        localField: 'productId',
                        pipeline: [
                            {
                                $project: {
                                    ...unSelectedFields,
                                },
                            },
                        ],
                        as: 'product',
                    },
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $unwind: {
                        path: '$product',
                        preserveNullAndEmptyArrays: true,
                    },
                },
            ]);

            return reviews;
        } catch (error) {
            throw new Error(`Error finding reviews: ${error.message}`);
        }
    }

    // Get a single review by ID using aggregate
    async getReviewById(id: string) {
        try {
            const reviews = await this.reviewModel.aggregate([
                { $match: { _id: new Types.ObjectId(id) } },
                {
                    $lookup: {
                        from: 'users',
                        foreignField: '_id',
                        localField: 'userId',
                        pipeline: [
                            {
                                $project: {
                                    ...unSelectedFields,
                                    password: 0,
                                    email: 0,
                                    role: 0,
                                },
                            },
                        ],
                        as: 'user',
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        foreignField: '_id',
                        localField: 'productId',
                        pipeline: [
                            {
                                $project: {
                                    ...unSelectedFields,
                                },
                            },
                        ],
                        as: 'product',
                    },
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $unwind: {
                        path: '$product',
                        preserveNullAndEmptyArrays: true,
                    },
                },
            ]);

            if (reviews.length === 0) {
                throw new NotFoundException(`Review with ID ${id} not found`);
            }

            return reviews[0];
        } catch (error) {
            throw new Error(`Error finding review: ${error.message}`);
        }
    }

    // Update a review
    async updateReview(id: string, updateData: UpdateReviewDto) {
        try {
            const _id = new Types.ObjectId(id);
            const userId = new Types.ObjectId(updateData.userId);

            const review = await this.reviewModel
                .findOneAndUpdate({ _id, userId }, updateData, {
                    new: true,
                })
                .exec();

            if (!review) {
                throw new NotFoundException(
                    `Review with ID ${id} not found or you don't have permission to update it`,
                );
            }

            return {
                message: reviewMess.UPDATED,
                review,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // Delete a review
    async deleteReview(id: string) {
        try {
            const result = await this.reviewModel
                .updateOne({ _id: id, isDeleted: false }, { isDeleted: true })
                .exec();

            if (result.matchedCount === 0) {
                return { message: "Review've already deleted" };
            }

            return { message: 'Review deleted successfully' };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // Calculate average rating for a product
    async calculateAverageRating(productId: string) {
        const reviews = await this.reviewModel.aggregate([
            { $match: { productId: new Types.ObjectId(productId) } },
            {
                $group: {
                    _id: '$productId',
                    avgRating: { $avg: '$numberOfStar' },
                },
            },
        ]);

        if (reviews.length === 0) {
            throw new NotFoundException(
                `No reviews found for product with ID ${productId}`,
            );
        }

        return { productId, avgRating: reviews[0].avgRating };
    }
}
