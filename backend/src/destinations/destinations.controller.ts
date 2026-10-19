
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { DestinationsService } from './destinations.service';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('destinations')
export class DestinationsController {
  constructor(
    private readonly destinationsService: DestinationsService,
  ) {}

  @Get()
  findAll() {
    return this.destinationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.destinationsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
  }) {
    return this.destinationsService.create(body);
  }
  
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      description?: string;
      latitude?: number;
      longitude?: number;
      imageUrl?: string;
    },
  ) {
    return this.destinationsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.destinationsService.remove(id);
  }
}
