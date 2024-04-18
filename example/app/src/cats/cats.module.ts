import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CatSchema } from './schemas/cat.schema';
import { CatsFactoryService } from './cats.factory.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'cats', schema: CatSchema }])],
  controllers: [CatsController],
  providers: [CatsService, CatsFactoryService],
})
export class CatsModule {}
