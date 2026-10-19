
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';


import {
  Destination,
  DestinationSchema,
} from './destinations/destination.schema';

import { DestinationsController } from './destinations/destinations.controller';
import { DestinationsService } from './destinations/destinations.service';

import { WeatherController } from './weather/weather.controller';
import { WeatherService } from './weather/weather.service';

import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '8h' },
    }),

    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://127.0.0.1:27017/destination_explorer',
    ),
    MongooseModule.forFeature([
      {
        name: Destination.name,
        schema: DestinationSchema,
      },
    ]),
  ],
  controllers: [
    AppController,
    DestinationsController,
    WeatherController,
    AuthController,
  ],
  
  providers: [
    AppService,
    DestinationsService,
    WeatherService,
    AuthService,
    JwtAuthGuard,
  ],
})
export class AppModule {}
