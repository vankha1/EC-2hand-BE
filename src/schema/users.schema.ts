import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
  timestamps: true,
})
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  fullname: string;

  @Prop({ index: true })
  username?: string;

  @Exclude()
  @Prop()
  password?: string;

  @Prop({ default: Role.USER })
  role?: Role;

  @Prop()
  dateOfBirth?: Date;

  @Prop()
  avatar?: string;

  @Prop()
  location?: string;

  @ApiProperty({
    description: 'State of document',
    example: true,
    default: false,
  })
  @Prop()
  isDeleted: boolean;

  @Prop()
  phoneNumber?: string;

  @Prop()
  school?: string;

  @Prop()
  faculty?: string;

  @Prop()
  studentCode?: string;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  __v: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
