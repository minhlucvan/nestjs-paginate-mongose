import { CollectionProperties, ApiExpose } from '../../../../../src';

export class CatProperties extends CollectionProperties {
  @ApiExpose({
    sortable: true,
    filterable: true,
    filterOperators: ['$eq'],
  })
  readonly id: string;

  @ApiExpose({
    sortable: true,
    filterable: true,
    filterOperators: ['$eq', '$regex'],
  })
  readonly name: string;

  @ApiExpose({
    sortable: true,
    filterable: true,
    filterOperators: ['$eq', '$in'],
  })
  readonly color: string;

  @ApiExpose({
    sortable: true,
    filterable: true,
    filterOperators: ['$eq', '$gt', '$lt'],
  })
  readonly age: number;

  readonly unsortable: string;
}
