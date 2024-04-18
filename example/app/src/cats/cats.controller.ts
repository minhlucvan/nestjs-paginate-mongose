import { Controller, Post, Query } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { CatProperties } from './dtos/cat.props';
import { CatDto } from './dtos/cat.dto';
import {
  ApiCollectionDto,
  ApiPaginatedQuery,
  ApiPaginatedResponse,
  CollectionResponse,
} from '../../../../src';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly service: CatsService) {}

  @Post('seed')
  async seed() {
    return this.service.seed(20);
  }

  @Get('list')
  @ApiPaginatedQuery(CatProperties)
  @ApiPaginatedResponse(CatDto)
  async filter(
    @Query() collectionDto: ApiCollectionDto,
  ): Promise<CollectionResponse<CatDto>> {
    return await this.service.list(collectionDto);
  }
}
