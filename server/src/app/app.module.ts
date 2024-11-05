import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { PeopleModule } from '../people/people.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';  // Add this import

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule global
    }),
    CacheModule.register({
      isGlobal: true, // Makes CacheModule global
      ttl: 3600, // 1 hour cache duration
    }),
    HttpModule.register({  // Add HttpModule for SWAPI calls
      timeout: 5000,
      maxRedirects: 5,
    }),
    PeopleModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}