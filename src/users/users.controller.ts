import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Query,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { ApiPaginatedQuery } from 'src/common/decorator/query-swagger.decorator';
import { TCurrentUser } from 'src/types';
import { CurrentUser } from './decorator';
import { UpdateProfileDto } from './dto/update.dto';
import { UsersService } from './users.service';
@Controller('users')
@ApiTags('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    // @UseGuards(RoleGuard(Role.ADMIN))
    @UseGuards(JwtGuard)
    @Get()
    @ApiBearerAuth()
    @ApiPaginatedQuery()
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('sort') sort: string,
    ) {
        const queryDto = { matches: {}, page, limit, sort };
        return await this.userService.findAllProfiles(queryDto);
    }

    @UseGuards(JwtGuard)
    @Get('profile/:id')
    @ApiBearerAuth()
    async getProfile(@Param('id') userId: string) {
        return await this.userService.getProfile(userId);
    }

    @UseGuards(JwtGuard)
    @Get('me')
    @ApiBearerAuth()
    async whoAmI(@CurrentUser() user: TCurrentUser) {
        return await this.userService.getProfile(user._id.toString());
    }

    @UseGuards(JwtGuard)
    @Patch()
    async updateProfile(
        @CurrentUser() user: TCurrentUser,
        @Body() updatedProfileDto: UpdateProfileDto,
    ) {
        return await this.userService.updateProfile(updatedProfileDto, user);
    }

    @UseGuards(JwtGuard)
    @Patch('avatar')
    @ApiBearerAuth()
    @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
    async updateAvatar(
        @CurrentUser() user: TCurrentUser,
        @UploadedFiles() file: { image: Express.Multer.File[] },
    ) {
        return await this.userService.updateAvatar(file.image, user);
    }
}
