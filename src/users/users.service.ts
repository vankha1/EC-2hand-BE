import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { userMess } from 'src/contants';
import { User, UserDocument } from 'src/schema/users.schema';
import { TCurrentUser } from 'src/types';
import { UpdateProfileDto } from './dto/update.dto';
import { CloudinaryService } from 'src/cloudinary';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private cloudinaryService: CloudinaryService,
    ) {}

    async findAllProfiles(queryDto: {
        matches: any;
        page: number;
        limit: number;
        sort: string;
    }) {
        const { matches, page, limit, sort } = queryDto;
        const users = await this.userModel
            .find(matches)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();
        return users;
    }

    // for auth-> register
    async createNewUser(createUserDto: RegisterDto) {
        try {
            const newUser = new this.userModel(createUserDto);
            const result = await newUser.save();
            return result;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async getProfile(userId: string) {
        try {
            const user = await this.findUser('id', userId);
            if (!user) throw new BadRequestException(userMess.NOT_FOUND);

            return user;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async updateProfile(
        updateProfileDto: UpdateProfileDto,
        currentUser: TCurrentUser,
    ) {
        try {
            const targetUser = await this.findUser(
                'id',
                currentUser._id.toString(),
            );

            if (!targetUser) throw new BadRequestException(userMess.NOT_FOUND);

            await this.userModel.findOneAndUpdate(
                targetUser._id,
                updateProfileDto,
            );

            return {
                message: userMess.UPDATED,
                statusCode: HttpStatus.OK,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async updateAvatar(
        images: Express.Multer.File[],
        currentUser: TCurrentUser,
    ) {
        try {
            const targetUser = await this.findUser(
                'id',
                currentUser._id.toString(),
            );

            if (!targetUser) throw new BadRequestException(userMess.NOT_FOUND);
            // upload to cloudinary
            const result = await this.cloudinaryService.uploadImage(images[0]);

            console.log("Check ", result);
            // update user avatar
            await this.userModel.findOneAndUpdate(targetUser._id, {
                avatar: result.url,
            });
            return {
                message: userMess.UPDATED,
                avatar: result.url,
                statusCode: HttpStatus.OK,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // for auth-> register/login
    async findUser(
        fieldName: string,
        value: any,
        options?: { select?: string[] },
    ) {
        let query: any;

        if (fieldName === 'id') {
            query = this.userModel.findById(value);
        } else {
            query = this.userModel.findOne({ [fieldName]: value });
        }

        if (options) {
            const { select } = options;
            if (select) {
                query.select(select);
            }
        }
        const res = await query.lean().exec();
        return res;
    }
}
