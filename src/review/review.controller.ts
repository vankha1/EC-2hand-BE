import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard';
import { TCurrentUser } from '../types';
import { CurrentUser } from '../users/decorator';
import { CreateReviewDto } from './dto/create.dto';
import { UpdateReviewDto } from './dto/update.dto';
import { ReviewService } from './review.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Post()
    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Create a review' })
    @ApiBearerAuth()
    @ApiBody({ type: CreateReviewDto })
    async createReview(
        @Body() createReviewDto: CreateReviewDto,
        @CurrentUser() user: TCurrentUser,
    ) {
        if (!createReviewDto.userId) {
            createReviewDto.userId = user._id.toString();
        }
        return this.reviewService.createReview(createReviewDto);
    }

    @Get('/product/:productId')
    @ApiOperation({ summary: 'Get reviews for a product' })
    @ApiParam({ name: 'productId', required: true })
    async getReviewsByProduct(@Param('productId') productId: string) {
        return this.reviewService.getReviewsByProduct(productId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a review by id' })
    @ApiParam({ name: 'id', required: true })
    async getReview(@Param('id') id: string) {
        return this.reviewService.getReviewById(id);
    }

    @Patch(':id')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a review' })
    async updateReview(
        @Param('id') id: string,
        @Body() reviewData: UpdateReviewDto,
        @CurrentUser() user: TCurrentUser,
    ) {
        if (!reviewData.userId) {
            reviewData.userId = user._id.toString();
        }
        return this.reviewService.updateReview(id, reviewData);
    }

    @Delete(':id')
    @UseGuards(JwtGuard)
    // @UseGuards(RoleGuard(Role.ADMIN))
    @ApiBearerAuth()
    @ApiParam({ name: 'id', required: true })
    @ApiOperation({ summary: 'Delete a review' })
    async deleteReview(@Param('id') id: string) {
        return this.reviewService.deleteReview(id);
    }
}
