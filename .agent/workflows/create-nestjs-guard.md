# Skill: Create a NestJS Guard

## Auth Guard Template

\`\`\`typescript
// src/auth/guards/jwt-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
constructor(private readonly reflector: Reflector) {}

canActivate(context: ExecutionContext): boolean {
// Check if route is marked as public
const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
context.getHandler(),
context.getClass(),
]);
if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Missing auth token');

    try {
      // validate token, attach user to request
      // request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

}

private extractToken(request: any): string | null {
const [type, token] = request.headers.authorization?.split(' ') ?? [];
return type === 'Bearer' ? token : null;
}
}
\`\`\`

## Custom Public Decorator

\`\`\`typescript
// src/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
\`\`\`

## Usage

\`\`\`typescript
// Apply globally in main.ts
app.useGlobalGuards(new JwtAuthGuard(new Reflector()));

// Skip auth for specific routes
@Public()
@Get('health')
healthCheck() { return { status: 'ok' }; }
\`\`\`

## Checklist

- [ ] Guard implements \`CanActivate\` interface.
- [ ] Uses \`Reflector\` to check metadata for public routes.
- [ ] Throws \`UnauthorizedException\` with clear message.
- [ ] Token extraction handles missing/malformed headers gracefully.
- [ ] Guard registered globally or per-controller as appropriate.
- [ ] Corresponding \`@Public()\` decorator for unauthenticated routes.
