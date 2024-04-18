import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
  ApiResponseOptions?: Omit<typeof ApiOkResponse, 'schema'>,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      ...ApiResponseOptions,
      schema: {
        title: `Paged${model.name}`,
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              pagination: {
                type: 'object',
                properties: {
                  total: {
                    type: 'number',
                  },
                  page: {
                    type: 'number',
                  },
                  limit: {
                    type: 'number',
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
