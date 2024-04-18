import { Injectable } from '@nestjs/common';
import {
  ApiCollectionDto,
  CollectionResponse,
  DocumentCollector,
} from '../../../../src';
import { CatDocument } from './schemas/cat.schema';
import { CatDto } from './dtos/cat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatsFactoryService } from './cats.factory.service';

@Injectable()
export class CatsService {
  constructor(
    @InjectModel('cats') private catModel: Model<CatDocument>,
    private readonly catsFactoryService: CatsFactoryService,
  ) {}

  async list(
    collectionOptions: ApiCollectionDto,
  ): Promise<CollectionResponse<CatDto>> {
    const catDocumentCollector = new DocumentCollector<CatDocument>(
      this.catModel,
    );
    return await catDocumentCollector.find(collectionOptions);
  }

  async seed(count: number) {
    const cats = Array.from({ length: count }, () =>
      this.catsFactoryService.generate({}),
    );
    await this.catModel.insertMany(cats);

    return cats;
  }
}
