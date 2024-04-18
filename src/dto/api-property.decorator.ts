import { CollectionProperties, CollectionPropertyOptions } from '../property';

export type ApiFilterOperator =
  | '$eq'
  | '$gt'
  | '$gte'
  | '$in'
  | '$lt'
  | '$lte'
  | '$ne'
  | '$nin'
  | '$and'
  | '$not'
  | '$nor'
  | '$or'
  | '$regex';

export enum EApiFilterOperator {
  EQ = '$eq',
  GT = '$gt',
  GTE = '$gte',
  IN = '$in',
  LT = '$lt',
  LTE = '$lte',
  NE = '$ne',
  NIN = '$nin',
  AND = '$and',
  NOT = '$not',
  NOR = '$nor',
  OR = '$or',
  REGEX = '$regex',
}

export const DEFAULT_FILTER_OPERATORS: EApiFilterOperator[] =
  Object.values(EApiFilterOperator);

export type ApiFilterOperators = EApiFilterOperator[] | ApiFilterOperator[];

export type ApiCollectionPropertyOptions = CollectionPropertyOptions & {
  filterOperators?: ApiFilterOperators;
  transform?: (key, value) => any;
  description?: string;
};

export type ApiCollectionProperties = CollectionProperties & {
  __props: Record<string, ApiCollectionPropertyOptions>;
};

export const ApiExpose = (options?: ApiCollectionPropertyOptions) => {
  return (target: ApiCollectionProperties, propertyName: string) => {
    target.__props = target.__props ?? {};
    const propName = options?.name ?? propertyName;
    const sortable = options?.sortable ?? false;
    const filterable = options?.filterable ?? false;
    const filterOperators =
      options?.filterOperators ?? DEFAULT_FILTER_OPERATORS;
    const def = options?.default ?? false;
    const description = options?.description ?? '';

    target.__props[propName] = {
      name: propertyName,
      sortable,
      filterable,
      default: def,
      filterOperators,
      description,
    };
  };
};
