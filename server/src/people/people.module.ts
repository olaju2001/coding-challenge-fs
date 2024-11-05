import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';

@Module({
  imports: [HttpModule],
  controllers: [PeopleController],
  providers: [PeopleService],
  exports: [PeopleService]
})
export class PeopleModule {}