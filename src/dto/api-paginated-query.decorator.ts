// api-paginated-query.decorator.ts

import { ApiQuery } from '@nestjs/swagger';
import { applyDecorators, UsePipes } from '@nestjs/common';
import {
  ApiFilterOperators,
  DEFAULT_FILTER_OPERATORS,
} from './api-property.decorator';
import { ValidationPipe } from '../validation.pipe';

export type FilterOption = {
  name: string;
  filterable: boolean;
  operators: ApiFilterOperators[];
  description?: string;
};

export function ApiPaginatedQuery(dtoType: any): MethodDecorator {
  const filterProperties = getFilterProperties(dtoType);
  const nonFilterProperties = getNonFilterProperties(dtoType);

  const queryParameters = [
    ApiQuery({
      name: 'page',
      type: 'number',
      required: false,
      description: 'Page number for pagination',
    }),
    ApiQuery({
      name: 'limit',
      type: 'number',
      required: false,
      description: 'Number of items per page',
    }),
  ];

  for (const prop of filterProperties) {
    for (const operator of prop.operators) {
      queryParameters.push(
        ApiQuery({
          name: `filter.${prop.name}.${operator}`,
          type: 'string',
          required: false,
          description: `Filter by ${prop.name} using ${operator}`,
        }),
      );
    }
  }
  for (const prop of nonFilterProperties) {
    queryParameters.push(
      ApiQuery({
        name: prop.name,
        type: 'string',
        required: false,
        description: prop.description,
      }),
    );
  }
  const decorators = [
    UsePipes(new ValidationPipe(dtoType)),
    ...queryParameters,
  ];

  return applyDecorators(...decorators);
}

function getFilterProperties(dtoType: any): FilterOption[] {
  const entries = Object.entries(dtoType.prototype.__props);
  const filters = [];

  for (const [key, value] of entries) {
    if (value['filterable']) {
      filters.push({
        name: key,
        filterable: value['filterable'],
        operators: value['filterOperators'] || DEFAULT_FILTER_OPERATORS,
      });
    }
  }

  return filters;
}

function getNonFilterProperties(dtoType: any): FilterOption[] {
  const entries = Object.entries(dtoType.prototype.__props);
  const filters = [];

  for (const [key, value] of entries) {
    if (!value['filterable']) {
      filters.push({
        name: key,
        filterable: value['filterable'],
        description: value['description'],
      });
    }
  }

  return filters;
}
