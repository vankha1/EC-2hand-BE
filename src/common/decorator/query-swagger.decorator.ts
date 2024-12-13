import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiPaginatedQuery() {
    return applyDecorators(
        ApiQuery({
            name: 'page',
            required: false,
            description: 'Page number (default is 1)',
            example: 1,
        }),
        ApiQuery({
            name: 'limit',
            required: false,
            description: 'Number of items per page (default is 10)',
            example: 10,
        }),
        ApiQuery({
            name: 'sort',
            required: false,
            description: 'Field to sort by (default is createdAt)',
            example: 'createdAt',
        }),
    );
}
