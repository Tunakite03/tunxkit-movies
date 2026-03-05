# Skill: Create NestJS DTOs

## Create DTO

\`\`\`typescript
// src/<feature>/dto/create-<feature>.dto.ts
import {
IsString, IsNotEmpty, IsEmail, IsOptional,
MinLength, MaxLength, IsEnum, IsNumber, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Create<Feature>Dto {
@ApiProperty({ description: 'Name of the <feature>', example: 'Example' })
@IsString()
@IsNotEmpty()
@MinLength(2)
@MaxLength(100)
name: string;

@ApiProperty({ description: 'Email address', example: 'user@example.com' })
@IsEmail()
email: string;

@ApiPropertyOptional({ description: 'Optional description' })
@IsOptional()
@IsString()
@MaxLength(500)
description?: string;
}
\`\`\`

## Update DTO (using mapped types)

\`\`\`typescript
// src/<feature>/dto/update-<feature>.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { Create<Feature>Dto } from './create-<feature>.dto';

export class Update<Feature>Dto extends PartialType(Create<Feature>Dto) {}
\`\`\`

## Response DTO

\`\`\`typescript
// src/<feature>/dto/<feature>-response.dto.ts
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class <Feature>ResponseDto {
@Expose() id: string;
@Expose() name: string;
@Expose() email: string;
@Expose() createdAt: Date;
// password, internal fields etc. are excluded automatically
}
\`\`\`

## Checklist

- [ ] Every field has \`class-validator\` decorators.
- [ ] \`@ApiProperty()\` / \`@ApiPropertyOptional()\` for Swagger.
- [ ] Update DTO extends \`PartialType(CreateDto)\` — DRY.
- [ ] Response DTO uses \`@Exclude()\`/\`@Expose()\` to control output.
- [ ] Optional fields marked with \`@IsOptional()\` + \`?\` suffix.
- [ ] No raw \`any\` types in DTOs.
