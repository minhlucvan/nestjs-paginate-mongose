import {
  CollectionProperties,
  CollectionDto,
  SortValidationError,
} from '@forlagshuset/nestjs-mongoose-paginate';
import { FilterSchemaValidator } from './filter-schema.validator';
import { BadRequestException } from '@nestjs/common';
import { EApiFilterOperator } from './property.decorator';

export type FilterableParameters = Record<string, unknown>;
export class FilterValidationError extends BadRequestException {}

const allowedKeys = [
  '$eq',
  '$gt',
  '$gte',
  '$in',
  '$lt',
  '$lte',
  '$ne',
  '$nin',
  '$and',
  '$not',
  '$nor',
  '$or',
  '$regex',
];

export class FilterParser {
  constructor(private collectionPropsClass: typeof CollectionProperties) {}

  parse(filter: CollectionDto): FilterableParameters {
    const fltr = this.transform(filter.filter);

    if (fltr === undefined || fltr === null || Object.keys(fltr).length === 0) {
      return {};
    }

    const validator = new FilterSchemaValidator().validate(fltr);
    if (validator) {
      return fltr;
    }
  }

  private transform(v: string | FilterableParameters) {
    if (v instanceof Array) {
      for (const k of v) {
        this.transform(k);
      }
    } else if (v instanceof Object) {
      for (const key in v) {
        const value = this.transformValue(key, v[key]);
        if (/^\$/.test(key)) {
          this.validateAllowedKey(key, value);
          v[key] = value;
        } else {
          const prop = this.validateProperty(key, value);
          if (prop !== key) {
            v[prop] = value;
            delete v[key];
          }
        }
      }
      return v;
    }
  }

  private validateProperty(prop: string, value: any) {
    if (
      !Object.keys(this.collectionPropsClass.prototype.__props).includes(prop)
    )
      throw new FilterValidationError(
        `Property '${prop}' is not exposed for filtering.`,
      );

    this.transform(value);

    return this.collectionPropsClass.prototype.__props[prop]?.name ?? prop;
  }

  private validateAllowedKey(key: string, value: any) {
    if (!allowedKeys.includes(key))
      throw new FilterValidationError(
        `Key '${key}' is not allowed for filtering.`,
      );

    this.transform(value);
  }

  private transformValue(key: string, value: any) {
    if (key === EApiFilterOperator.IN.toString()) {
      if (typeof value !== 'string') {
        return value;
      }
      return value.split(',').map((e) => e.trim());
    }
    return value;
  }
}
