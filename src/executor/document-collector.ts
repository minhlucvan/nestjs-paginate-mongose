import {
  CollectionDto,
  CollectionResponse,
  Pagination,
} from '@forlagshuset/nestjs-mongoose-paginate';
import { SortableParameters } from '../sorter/parser';
import { CounterDto } from '../input.dto';
import { HydratedDocument, Model, Query } from 'mongoose';

export class DynamicDocumentCollector<T> {
  constructor(protected model: Model<T>) {}

  async find(query: CollectionDto): Promise<CollectionResponse<T>> {
    const q = this.buildFindQuery(query)
      .sort(query.sorter)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit);

    if (query.sorter) {
      const sortOptions: SortableParameters =
        '_id' in query.sorter ? query.sorter : { ...query.sorter, _id: 'asc' };
      q.sort(sortOptions);
    }

    const data = (await q.exec()) as T[];

    return {
      data,
      pagination: await this.paginate(query),
    };
  }

  protected buildFindQuery(
    query: CollectionDto,
  ): Query<
    HydratedDocument<T, Record<string, any>, Record<string, any>>[],
    HydratedDocument<T, Record<string, any>, Record<string, any>>,
    Record<string, any>,
    T
  > {
    const q = this.model.find(query.filter);
    return q;
  }

  protected async paginate(query: CollectionDto) {
    const count: number = await this.count(query);
    const pagination: Pagination = {
      total: count,
      page: query.page,
      limit: query.limit,
      next:
        (query.page + 1) * query.limit >= count ? undefined : query.page + 1,
      prev: query.page == 0 ? undefined : query.page - 1,
    };

    return pagination;
  }

  protected async count(query: CounterDto): Promise<number> {
    return this.model.countDocuments(query.filter).exec();
  }
}
