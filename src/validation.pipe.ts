import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { FilterParser } from './filter/filter-parser';
import { SorterParser } from './sorter/sorter-parser';
import { parseDotObject } from './utils/dots-object-parser';
import { ApiCollectionDto } from './input.dto';
import { CollectionProperties } from './property';

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private propsClass: typeof CollectionProperties) {}

  transform(value: ApiCollectionDto, _metadata: ArgumentMetadata) {
    const parsedValue = parseDotObject(value);
    const filterParams = new FilterParser(this.propsClass).parse(parsedValue);
    const sorterParams = new SorterParser(this.propsClass).parse(
      parsedValue.sort,
    );
    const { sort: _, ...rest } = value;

    return { ...rest, filter: filterParams, sorter: sorterParams };
  }
}
