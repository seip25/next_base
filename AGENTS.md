<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Architecture Rules for AI Agents

1. **Language Specification**:
   - Write all application code in **JavaScript** (`.js` / `.mjs`). Do not create `.ts` or `.tsx` files.

2. **Clean Root Directory**:
   - Docker configuration (`Dockerfile`) and Nginx configuration (`nginx.conf`) MUST reside inside `docker/` (`docker/Dockerfile`, `docker/nginx.conf`). Keep project root clean.

3. **Code Style & Documentation**:
   - Do NOT write standard code comments (`//` or inline block comments).
   - ONLY write JSDoc documentation blocks (`/** ... */`) when documenting functions or classes.
   - Write all code, variable names, class names, functions, and documentation strictly in **English**.
   - Use ES6 `class` structures for services placed in `services/`.

4. **Next.js Conventions**:
   - Use `src/proxy.js` for request proxying and middleware behavior instead of deprecated `middleware.ts`.
