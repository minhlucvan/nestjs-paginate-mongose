import {
  CollectionResponse,
  CollectionResponseLinks,
  CollectionResponseMeta,
} from '../output.dto';
import { ApiCollectionDto } from '../input.dto';
import { SortableParameters } from '../sorter/sorter-parser';
import type { HydratedDocument, Model, Query } from 'mongoose';

/**
 * 
'data': [],
"meta": {
    "itemsPerPage": 5,
    "totalItems": 12,
    "currentPage": 2,
    "totalPages": 3,
    "sortBy": [["color", "DESC"]],
    "search": "i",
    "filter": {
      "age": "$gte:3"
    }
  },
  "links": {
    "first": "",
    "previous": "",
    "current": "",
    "next": "",
    "last": ""
  }
 */

export class DocumentCollector<T> {
  constructor(protected model: Model<T>) {}

  async find(query: ApiCollectionDto): Promise<CollectionResponse<T>> {
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
    const meta = await this.paginate(query);
    const links = this.generateLinks(meta);

    return {
      data,
      meta,
      links,
    };
  }

  protected buildFindQuery(
    query: ApiCollectionDto,
  ): Query<
    HydratedDocument<T, Record<string, any>, Record<string, any>>[],
    HydratedDocument<T, Record<string, any>, Record<string, any>>,
    Record<string, any>,
    T
  > {
    const q = this.model.find(query.filter);
    return q;
  }

  protected async paginate(query: ApiCollectionDto) {
    const count: number = await this.count(query);
    const limit = query.limit || 10;
    const pagination: CollectionResponseMeta = {
      itemsPerPage: limit,
      totalItems: count,
      currentPage: query.page,
      totalPages: Math.ceil(count / limit),
      // TODO: Implement sortBy
    };

    return pagination;
  }

  protected generateLinks(
    meta: CollectionResponseMeta,
  ): CollectionResponseLinks {
    const links: CollectionResponseLinks = {
      first: '',
      previous: '',
      current: '',
      next: '',
      last: '',
    };

    if (meta.currentPage > 1) {
      links.first = `?page=1&limit=${meta.itemsPerPage}`;
      links.previous = `?page=${meta.currentPage - 1}&limit=${
        meta.itemsPerPage
      }`;
    }

    if (meta.currentPage < meta.totalPages) {
      links.next = `?page=${meta.currentPage + 1}&limit=${meta.itemsPerPage}`;
      links.last = `?page=${meta.totalPages}&limit=${meta.itemsPerPage}`;
    }

    links.current = `?page=${meta.currentPage}&limit=${meta.itemsPerPage}`;

    return links;
  }

  protected async count(query: ApiCollectionDto): Promise<number> {
    return this.model.countDocuments(query.filter).exec();
  }
}
