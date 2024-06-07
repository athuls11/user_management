import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop()
  middleName?: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['admin', 'user'] })
  role: string;

  @Prop()
  department?: string;

  @Prop({ default: Date.now })
  createdTime?: Date;

  @Prop({ default: Date.now })
  updatedTime?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
