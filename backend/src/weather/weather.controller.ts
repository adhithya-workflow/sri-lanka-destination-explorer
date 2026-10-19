
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ServiceUnavailableException,
} from '@nestjs/common';

import { DestinationsService } from '../destinations/destinations.service';
import { WeatherService } from './weather.service';

@Controller('destinations')
export class WeatherController {
  constructor(
    private readonly destinationsService: DestinationsService,
    private readonly weatherService: WeatherService,
  ) {}

  @Get(':id/weather')
  async getWeather(@Param('id') id: string) {
    let destination;

    try {
      destination = await this.destinationsService.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'Unable to retrieve destination',
      );
    }

    return {
      destination: destination.name,
      ...(await this.weatherService.getCurrentWeather(
        destination.latitude,
        destination.longitude,
      )),
    };
  }
}
