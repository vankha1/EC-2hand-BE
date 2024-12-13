import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
