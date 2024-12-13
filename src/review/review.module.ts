import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from 'src/product/product.module';
import { Review, ReviewSchema } from 'src/schema';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Review.name, schema: ReviewSchema },
        ]),
        ProductModule,
    ],
    controllers: [ReviewController],
    providers: [ReviewService],
})
export class ReviewModule {}
