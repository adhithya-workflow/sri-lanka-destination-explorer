
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Destination,
  DestinationDocument,
} from './destination.schema';

@Injectable()
export class DestinationsService {
  constructor(
    @InjectModel(Destination.name)
    private readonly destinationModel: Model<DestinationDocument>,
  ) {}

  async findAll() {
    return this.destinationModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string) {
    const destination = await this.destinationModel.findById(id).exec();

    if (!destination) {
      throw new NotFoundException('Destination not found');
    }

    return destination;
  }

  async create(data: {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
  }) {
    return this.destinationModel.create(data);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      latitude: number;
      longitude: number;
      imageUrl: string;
    }>,
  ) {
    const destination = await this.destinationModel
      .findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!destination) {
      throw new NotFoundException('Destination not found');
    }

    return destination;
  }

  async remove(id: string) {
    const destination = await this.destinationModel
      .findByIdAndDelete(id)
      .exec();

    if (!destination) {
      throw new NotFoundException('Destination not found');
    }

    return { message: 'Destination deleted successfully' };
  }
}
