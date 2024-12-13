import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { ApiPaginatedQuery } from 'src/common/decorator/query-swagger.decorator';
import { Product } from 'src/schema/product.schema';
import { TCurrentUser } from 'src/types';
import { CurrentUser } from 'src/users/decorator';
import { CreateProductDto } from './dto/create.dto';
import { ProductQuery } from './dto/query.dto';
import { UpdateProductDto } from './dto/update.dto';
import { ProductService } from './product.service';
import { match } from 'assert';
import { Types } from 'mongoose';

@ApiTags('Product')
@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    // @Get('/')
    // @ApiBearerAuth()
    // @ApiPaginatedQuery()
    // async findAll(
    //     @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    //     @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    //     @Query('sort') sort = 'createdAt',
    // ) {
    //     const query: ProductQuery = {
    //         matches: { isDeleted: false },
    //         page,
    //         limit,
    //         sort: { [sort]: 1 },
    //     };

    //     return this.productService.findAll(query);
    // }

    @Post()
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new product' })
    @ApiBody({ description: 'Data for creating a new product', type: Product })
    @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
    @ApiResponse({
        status: 201,
        description: 'Product created successfully.',
        type: Product,
    })
    async create(
        @Body() productData: CreateProductDto,
        @UploadedFiles() files: { images?: Express.Multer.File[] },
        @CurrentUser() user: TCurrentUser,
    ) {
        if (!productData.userId) {
            productData.userId = user._id.toString();
        }
        const images = Array.isArray(files.images)
            ? files.images
            : [files.images];
        return this.productService.create(productData, images);
    }

    @Post('/products')
    @ApiOperation({ summary: 'Filter, or retrieve products' })
    @ApiBody({
        description: 'Filter, or retrieve products',
        type: ProductQuery,
    })
    async getProducts(@Body() body: ProductQuery) {
        const { matches = {}, page, limit, sort } = body;

        matches.isDeleted = false;

        if (matches.userId) { 
            matches.userId = { $eq: new Types.ObjectId(matches.userId) };
        }

        return this.productService.findAll({
            matches,
            page,
            limit,
            sort,
        });
    }

    @Get('search')
    @ApiOperation({ summary: 'Search for products' })
    @ApiPaginatedQuery()
    async search(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('sort') sort = 'createdAt',
        @Query('search') search?: string,
    ) {
        const query: ProductQuery = {
            matches: {
                isDeleted: false,
                $or: [{ productName: { $regex: search, $options: 'i' } }],
            },
            page,
            limit,
            sort: { [sort]: 1 },
        };

        return this.productService.findAll(query);
    }

    @Get('/getallbrand')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all product types, images, and associated brands' })
    @ApiResponse({
        status: 200,
        description: 'Successfully fetched product metadata.',
        schema: {
            example: [
                {
                    type: 'Beauty',
                    image: 'https://example.com/images/beauty.jpg',
                    brand: ['Dove', 'Sunsilk'],
                },
                {
                    type: 'Electronics',
                    image: 'https://example.com/images/electronics.jpg',
                    brand: ['Toshiba', 'Panasonic'],
                },
            ],
        },
    })
    @ApiResponse({ status: 404, description: 'Could not get all associated brands for all types.' })
    async getAllbrand() {
        return this.productService.getallbrand();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by ID' })
    @ApiResponse({ status: 200, description: 'Product found.', type: Product })
    @ApiResponse({ status: 404, description: 'Product not found.' })
    async findOne(@Param('id') id: string) {
        return this.productService.findOne(id);
    }

    @Put(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a product by ID' })
    @ApiBody({
        description: 'Updated data for the product',
        type: PartialType(Product),
    })
    @ApiResponse({
        status: 200,
        description: 'Product updated successfully.',
        type: Product,
    })
    @ApiResponse({ status: 404, description: 'Product not found.' })
    async update(
        @Param('id') id: string,
        @Body() productData: UpdateProductDto,
        @UploadedFiles()
        files: { images?: Express.Multer.File[] } = { images: [] },
        @CurrentUser() user: TCurrentUser,
    ) {
        const images = Array.isArray(files.images)
            ? files.images
            : [files.images].filter(Boolean);

        return this.productService.update(id, productData, images, user);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a product by ID' })
    @ApiResponse({
        status: 200,
        description: 'Product deleted successfully.',
        type: Product,
    })
    @ApiResponse({ status: 404, description: 'Product not found.' })
    async remove(@Param('id') id: string) {
        return this.productService.remove(id);
    }
}
