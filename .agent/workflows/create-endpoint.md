# Skill: Create a REST API Endpoint

## Template (Express / Hono / Fastify pattern)

```typescript
// src/routes/<resource>.routes.ts
import { Router } from 'express'; // or equivalent
import { z } from 'zod';
import { <Resource>Service } from '../services/<resource>.service';

const router = Router();

const Create<Resource>Schema = z.object({
  // define body schema
});

router.post('/<resource>', async (req, res, next) => {
  try {
    const body = Create<Resource>Schema.parse(req.body);
    const result = await <Resource>Service.create(body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
```

## Checklist

- [ ] Input validated with schema (Zod / Joi) — never trust raw req.body.
- [ ] Correct HTTP status codes: 201 created, 200 ok, 400 bad input, 404 not found, 409 conflict.
- [ ] Errors forwarded to `next(err)` — not swallowed.
- [ ] Auth middleware applied where required.
- [ ] Response shape consistent with rest of API.
- [ ] Integration test added for happy path + error cases.
- [ ] Performance: DB calls are concurrent (`Promise.all`), no sync blocking calls.
