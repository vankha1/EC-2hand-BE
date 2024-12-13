import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary';
import { productMess } from 'src/contants';
import { Product, ProductDocument } from 'src/schema/product.schema';
import { unSelectedFields } from 'src/types';
import { transactionCost } from 'src/utils';
import { CreateProductDto } from './dto/create.dto';
import { ProductQuery } from './dto/query.dto';
import { UpdateProductDto } from './dto/update.dto';

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        private cloudinaryService: CloudinaryService,
    ) { }

    async create(productData: CreateProductDto, images: Express.Multer.File[]) {
        try {
            const uploadPromises = images.map(async (image) => {
                const result = await this.cloudinaryService.uploadImage(image);
                return result.url;
            });

            const productImages = await Promise.all(uploadPromises);

            const { quantity, price } = productData;

            const product = new this.productModel({
                ...productData,
                soldQuantity: 0,
                images: productImages,
                userId: new Types.ObjectId(productData.userId),
                postingCost: transactionCost(quantity, price),
                avgStar: 0,
                isDeleted: false,
            });
            await product.save();

            return {
                message: productMess.CREATED,
                product,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async findAll({ matches, page, limit, sort }: ProductQuery) {
        const offset = (page - 1) * limit;

        try {
            const [products, totalDocs] = await Promise.all([
                this.productModel
                    .aggregate<ProductDocument>([
                        { $match: matches || {} },
                        { $skip: offset },
                        { $limit: limit },
                        { $sort: sort || { createdAt: 1 } },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'user',
                                pipeline: [
                                    {
                                        $project: {
                                            ...unSelectedFields,
                                            password: 0,
                                            email: 0,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $unwind: {
                                path: '$user',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ])
                    .exec(),
                this.productModel.countDocuments(matches).exec(),
            ]);

            const totalPages = Math.ceil(totalDocs / limit);

            return { products, totalDocs, totalPages };
        } catch (error) {
            throw new Error(`Error finding products: ${error.message}`);
        }
    }

    async findOne(id: string) {
        try {
            const product = await this.productModel.findById(new Types.ObjectId(id)).exec();
            if (!product) {
                throw new NotFoundException(`Product with ID ${id} not found`);
            }
            return product;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async update(
        id: string,
        productData: UpdateProductDto,
        images?: Express.Multer.File[],
        user?: any,
    ) {
        try {
            const existingProduct = await this.findOne(id);
            if (!existingProduct) {
                throw new NotFoundException(`Product with ID ${id} not found`);
            }

            let productImages = existingProduct.images;
            if (images && images.length > 0) {
                const uploadedImages = await Promise.all(
                    images.map(async (image) => {
                        const result =
                            await this.cloudinaryService.uploadImage(image);
                        return result.secure_url;
                    }),
                );
                productImages = uploadedImages;
            }

            let postingCost = existingProduct.postingCost;

            if (productData.price && productData.quantity) {
                postingCost = transactionCost(
                    productData.quantity,
                    productData.price,
                );
            }

            const updateData = {
                ...productData,
                images: productImages,
                postingCost,
                userId: user._id,
            };
            const updatedProduct = await this.productModel
                .findByIdAndUpdate(id, updateData, {
                    new: true,
                    runValidators: true,
                })
                .exec();

            return {
                message: productMess.UPDATED,
                product: updatedProduct,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async remove(id: string) {
        try {
            const result = await this.productModel
                .updateOne({ _id: id, isDeleted: false }, { isDeleted: true })
                .exec();

            if (result.matchedCount === 0) {
                throw new NotFoundException(
                    `Product with ID ${id} not found or already deleted`,
                );
            }

            return {
                message: productMess.DELETED,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async getallbrand() {
        try {
            const products = await this.productModel.aggregate([
                {
                    $group: {
                        _id: '$type',
                        type: { $first: '$type' },
                        image: { $first: '$images' },
                        brand: { $addToSet: '$brand' },
                    },
                },
                { $sort: { type: 1 } },
            ]);

            return products.map((group) => ({
                type: group.type,
                image: group.image,
                brand: group.brand,
            }));
        } catch (error) {
            console.error('Error in getallbrand:', error);
            throw new Error('Error retrieving brands');
        }
    }
}
