# nestjs-paginate-mongoose

> Warning: This project is under development and is NOT ready for any use.

> Contribution: This project is open for contribution. Please submit a PR with the changes you would like to see.

[![npm version](https://badge.fury.io/js/%40forlagshuset%2Fnestjs-mongoose-paginate.svg)](https://badge.fury.io/js/%40forlagshuset%2Fnestjs-mongoose-paginate)
[![Build Status](https://travis-ci.com/forlagshuset/nestjs-mongoose-paginate.svg?branch=master)](https://travis-ci.com/forlagshuset/nestjs-mongoose-paginate)
[![Coverage Status](https://coveralls.io/repos/github/forlagshuset/nestjs-mongoose-paginate/badge.svg?branch=master)](https://coveralls.io/github/forlagshuset/nestjs-mongoose-paginate?branch=master)

Pagination and filtering module for `mongoose` repositories or custom aggregators using Nest.js framework.

- Pagination conforms to [JSON:API](https://jsonapi.org/format/#fetching-pagination).
- Sort by multiple columns
- Search across columns
- Select columns
- Filter using operators (`$eq`, `$not`, `$null`, `$in`, `$gt`, `$gte`, `$lt`, `$lte`, `$btw`, `$ilike`, `$sw`, `$contains`)
- Include relations and nested relations
- Support both moonose and custom aggregators
- Swagger documentation

# Installation

```bash
$ npm install @minhlucvan/nestjs-paginate-mongoose
```

# Recipes

The examples below are based on the following schema:

### Endpoint

```
GET http://localhost:3000/cats?limit=5&page=2&sortBy=color:DESC&search=i&filter.age=$gte:3&select=id,name,color,age
```

### Response

```json
{
  "data": [
    {
      "id": 4,
      "name": "George",
      "color": "white",
      "age": 3
    },
    {
      "id": 5,
      "name": "Leche",
      "color": "white",
      "age": 6
    },
    {
      "id": 2,
      "name": "Garfield",
      "color": "ginger",
      "age": 4
    },
    {
      "id": 1,
      "name": "Milo",
      "color": "brown",
      "age": 5
    },
    {
      "id": 3,
      "name": "Kitty",
      "color": "black",
      "age": 3
    }
  ],
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
    "first": "http://localhost:3000/cats?limit=5&page=1&sortBy=color:DESC&search=i&filter.age=$gte:3",
    "previous": "http://localhost:3000/cats?limit=5&page=1&sortBy=color:DESC&search=i&filter.age=$gte:3",
    "current": "http://localhost:3000/cats?limit=5&page=2&sortBy=color:DESC&search=i&filter.age=$gte:3",
    "next": "http://localhost:3000/cats?limit=5&page=3&sortBy=color:DESC&search=i&filter.age=$gte:3",
    "last": "http://localhost:3000/cats?limit=5&page=3&sortBy=color:DESC&search=i&filter.age=$gte:3"
  }
}
```


## Usage

### Register module

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaginateModule } from '@minhlucvan/nestjs-paginate-mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/test'),
    PaginateModule.forRoot()
  ],
})
export class AppModule {}
```

### Exposing properties

```typescript
import {
  CollectionProperties,
  ApiExpose
} from '@minhlucvan/nestjs-paginate-mongoose';

export class MyCollectionProperties extends CollectionProperties {
  @ApiExpose({ 
    sortable: true,
    filterable: true,
    filterOperators: ['$eq']
  })
  readonly id: string;

  @ApiExpose({
    sortable: true,
    filterable: true,
    filterOperators: ['$ilike', '$sw', '$contains']
  })
  readonly name: string;

  @ApiExpose({
    sortable: true,
    filterable: true,
    filterOperators: ['$eq']
  })
  readonly color: string;

  @ApiExpose({
    sortable: true,
    filterable: true,
    filterOperators: ['$eq', '$gt', '$gte', '$lt', '$lte', '$btw']
  })
  readonly age: number;

  readonly unsortable: string;
}
```

### Validation Pipe

```typescript
import {
  CollectionDto,
  ParseQueryPipe,
  CollectionResponse,
  ApiPaginatedQuery,
  ApiPaginatedResponse
} from '@minhlucvan/nestjs-paginate-mongoose';
import { MyCollectionProperties } from './my-collection-properties';
import { MyDocument } from './my-document';

@Controller()
export class AppController {

  @Get('list')
  @ApiPaginatedQuery(MyCollectionProperties)
  @ApiPaginatedResponse(MyDocument)
  async filter(
    @Query(new ValidationPipe(MyCollectionProperties))
    collectionDto: CollectionDto,
  ): Promise<CollectionResponse<MyDocument>> {
    return await this.service.list(collectionDto);
  }
}
```

### Document collector usage

```typescript
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  CollectionDto,
  DocumentCollector,
  CollectionResponse
} from '@forlagshuset/nestjs-mongoose-paginate';

@Injectable()
export class AppService {
  constructor(
    @InjectDocumentCollector('MyModel') private readonly myDocumentCollector: DocumentCollector<MyDocument>,
  )

  async list(
      collectionDto: CollectionDto,
  ): Promise<CollectionResponse<MyDocument>> {
    return this.myDocumentCollector.find(collectionDto);
  }
}
```


## Usgae with custom aggregator

### Define custom document collector

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyCustomDocumentCollector extends DocumentCollector<MyDocument> {
  constructor(
    @InjectModel('MyModel') private readonly myModel: Model<MyDocument>,
  ) {
    super(myModel);
  }

  protected buildFindQuery(query: CollectionDto): any {
    return this.myModel.aggregate([
      {
        $match: {
          $text: {
            $search: query.search,
          },
        },
      },
      {
        $sort: {
          [query.sortBy]: query.sortOrder,
        },
      },
      {
        $skip: query.skip,
      },
      {
        $limit: query.limit,
      },
    ]);
  }

 protected buildFindQuery(query: IAuditLogCollectionOptions): any {
    return this.model.aggregate(this.buildModelAggregateArray(query));
  }

  protected async count(query: IAuditLogCollectionOptions): Promise<number> {
    const [res] = await this.model
      .aggregate(
        this.buildModelAggregateArray(query, [
          {
            $count: 'countTotal',
          },
          {
            $limit: 1,
          },
        ]),
      )
      .exec();
    return res?.countTotal ?? 0;
  }
}
```

### Register custom document collector

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaginateModule } from '@minhlucvan/nestjs-paginate-mongoose';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MyModel', schema: MySchema },
    ]),
    PaginateModule.forFeature({
      documentCollectors: [MyCustomDocumentCollector],
    }),
  ],
  exports: [MyCustomDocumentCollector],
})
export class MyModule {}
```

### Inject custom document collector

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyService {
  constructor(
    @InjectDocumentCollector('MyModel') private readonly myDocumentCollector: DocumentCollector<MyDocument>,
  )

  async list(
      collectionDto: CollectionDto,
  ): Promise<CollectionResponse<MyDocument>> {
    return this.myDocumentCollector.find(collectionDto);
  }
}
```

## Filter operators

Filter operators must be whitelisted per column in the `CollectionProperties` class.

### Code

```typescript
import {
  CollectionProperties,
  ApiExpose
} from '@minhlucvan/nestjs-paginate-mongoose';

export class MyCollectionProperties extends CollectionProperties {
  @ApiExpose({ 
    sortable: true,
    filterable: true,
    filterOperators: ['$eq']
  })
  readonly id: string;

  @ApiExpose({
    sortable: true,
    filterable: true,
    filterOperators: ['$ilike', '$sw', '$contains']
  })
  readonly name: string;

  @ApiExpose({
    sortable: true,
    filterable: true,
    filterOperators: ['$eq']
  })
  readonly color: string;

  @ApiExpose({
    sortable: true,
    filterable: true,
    filterOperators: ['$eq', '$gt', '$gte', '$lt', '$lte', '$btw']
  })
  readonly age: number;

  readonly unsortable: string;
}
```

### Operators

- `?filter.id=$eq:1` is equivalent to `{ id: 1 }`
- `?filter.name=$ilike:john` is equivalent to `{ name: /john/i }`
- `?filter.name=$sw:john` is equivalent to `{ name: /^john/i }`
- `?filter.name=$contains:john` is equivalent to `{ name: /john/i }`
- `?filter.age=$gt:1` is equivalent to `{ age: { $gt: 1 } }`
- `?filter.age=$gte:1` is equivalent to `{ age: { $gte: 1 } }`
- `?filter.age=$lt:1` is equivalent to `{ age: { $lt: 1 } }`
- `?filter.age=$lte:1` is equivalent to `{ age: { $lte: 1 } }`
- `?filter.age=$btw:1,2` is equivalent to `{ age: { $gte: 1, $lte: 2 } }`

## Swagger documentation

Swagger documentation is generated automatically based on the `CollectionProperties` class.

## Troubleshooting

Any issues or questions can be posted in the [issues](https://github.com)

## Contributing

Contributions are welcome. Please submit a PR with the changes you would like to see.

## Inspiration

This package is highly inspired by:
- [nestjs-paginate](https://github.com/ppetzold/nestjs-paginate)
- [nestjs-mongoose-paginate](https://github.com/fagbokforlaget/nestjs-mongoose-paginate)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
