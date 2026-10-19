
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DestinationDocument =
  HydratedDocument<Destination>;

@Schema({ timestamps: true })
export class Destination {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, type: Number })
  latitude: number;

  @Prop({ required: true, type: Number })
  longitude: number;

  @Prop({ default: '' })
  imageUrl: string;
}

export const DestinationSchema =
  SchemaFactory.createForClass(Destination);
