# GestionSoutenance-Front

Angular workspace for the soutenance management front-end.

The app is now flattened at the repository root, so there is no nested `frontend` folder.

## Structure

- `src/app/core` for singleton services, guards, interceptors, and shared domain models
- `src/app/features` for business areas such as soutenances, jurys, salles, notes, and results
- `src/app/shared` for reusable components, directives, and pipes
- `src/environments` for environment-specific configuration

## Docker

The full stack is orchestrated from the backend workspace:

```powershell
cd ..\projet-soa
docker compose up --build
```

The production Docker build serves Angular through Nginx and proxies `/api` to the backend container, so the app is available at http://localhost:4200 without CORS configuration.
