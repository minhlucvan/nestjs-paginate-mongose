import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import {
  CollectionProperties,
  CollectionDto,
} from './dto/api-property.decorator';
import { FilterParser } from './filter/parser';
import { SorterParser } from './sorter/parser';
import { parseDotObject } from './utils/dots-object-parser';

@Injectable()
export class ParseQueryPipe implements PipeTransform {
  constructor(private propsClass: typeof CollectionProperties) {}

  transform(value: CollectionDto, _metadata: ArgumentMetadata) {
    const parsedValue = parseDotObject(value);
    const filterParams = new FilterParser(this.propsClass).parse(parsedValue);
    const sorterParams = new SorterParser(this.propsClass).parse(
      parsedValue.sort,
    );
    const { sort: _, ...rest } = value;

    return { ...rest, filter: filterParams, sorter: sorterParams };
  }
}
