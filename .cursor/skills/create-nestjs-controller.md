# Skill: Create a NestJS REST Controller

## Template
\`\`\`typescript
// src/<feature>/<feature>.controller.ts
import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, HttpCode, HttpStatus,
  ParseUUIDPipe, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { <Feature>Service } from './<feature>.service';
import { Create<Feature>Dto } from './dto/create-<feature>.dto';
import { Update<Feature>Dto } from './dto/update-<feature>.dto';

@ApiTags('<feature>')
@Controller('<feature>')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class <Feature>Controller {
  constructor(private readonly <feature>Service: <Feature>Service) {}

  @Post()
  @ApiOperation({ summary: 'Create <feature>' })
  @ApiResponse({ status: 201, description: 'Created successfully.' })
  create(@Body() dto: Create<Feature>Dto) {
    return this.<feature>Service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all <feature>s' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.<feature>Service.findAll({ page: +page, limit: +limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get <feature> by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.<feature>Service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update <feature>' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Update<Feature>Dto,
  ) {
    return this.<feature>Service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete <feature>' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.<feature>Service.remove(id);
  }
}
\`\`\`

## Checklist
- [ ] All routes use proper HTTP method decorators.
- [ ] Request data extracted via \`@Param()\`, \`@Body()\`, \`@Query()\` — not raw \`req\`.
- [ ] \`ValidationPipe\` applied with \`whitelist: true\`.
- [ ] Swagger decorators for API documentation.
- [ ] \`ParseUUIDPipe\` (or \`ParseIntPipe\`) for ID params.
- [ ] No business logic — only calls to service methods.
- [ ] Proper HTTP status codes for each operation.
- [ ] No long-running, CPU-heavy synchronous tasks inside route handlers (keeps event loop free).
