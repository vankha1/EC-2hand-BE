import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiBody,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { Review, Role } from 'src/schema';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create.dto';
import { CurrentUser } from 'src/users/decorator';
import { TCurrentUser } from 'src/types';
import RoleGuard, { JwtGuard } from 'src/auth/guard';
import { UpdateReviewDto } from './dto/update.dto';

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
