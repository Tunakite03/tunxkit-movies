# Skill: Create a NestJS Module

## Template

\`\`\`typescript
// src/<feature>/<feature>.module.ts
import { Module } from '@nestjs/common';
import { <Feature>Controller } from './<feature>.controller';
import { <Feature>Service } from './<feature>.service';

@Module({
imports: [],
controllers: [<Feature>Controller],
providers: [<Feature>Service],
exports: [<Feature>Service], // export if other modules need this service
})
export class <Feature>Module {}
\`\`\`

## File structure

\`\`\`
src/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── dto/
│ ├── create-<feature>.dto.ts
│ └── update-<feature>.dto.ts
├── entities/
│ └── <feature>.entity.ts
├── <feature>.controller.spec.ts
└── <feature>.service.spec.ts
\`\`\`

## Checklist

- [ ] Module registered in parent module's \`imports\` array.
- [ ] Controller handles HTTP only — no business logic.
- [ ] Service contains all business logic, injected via constructor.
- [ ] DTOs created for all request bodies with \`class-validator\` decorators.
- [ ] Entity defined with proper TypeORM/Prisma decorators.
- [ ] Unit tests for service and controller.
- [ ] Exports only what other modules need.
