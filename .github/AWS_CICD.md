# CI/CD Frontend → AWS (GitHub Actions)

**Trunk-based:** rama `main`. Deploy solo en push a `main`.

## Credenciales AWS en GitHub

Mismo criterio que el backend: **Settings → Secrets and variables → Actions → Secrets**

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

**Variables:** `AWS_REGION` = `us-east-2`, `FRONTEND_S3_BUCKET`, `VITE_API_URL`, `CLOUDFRONT_DISTRIBUTION_ID`, etc.

No uses variables de CloudShell en el repositorio; caducan y no funcionan fuera de CloudShell.

| Workflow | Disparador | Acción |
|----------|------------|--------|
| `ci.yml` | PR / push | `npm ci` + `npm run build` + artefacto `dist/` |
| `deploy.yml` | Push `main` / manual | Build con `VITE_*` → **S3** → invalidación **CloudFront** |

## Secrets (GitHub)

**OIDC (recomendado):**

- `AWS_ROLE_ARN` — rol con `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` sobre el bucket frontend y `cloudfront:CreateInvalidation`.

**Alternativa:**

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Trust policy OIDC: cambia el repo a `AdminMod18/KL_SYTEM_ECOMERCE_FRONTEND`.

## Variables de repositorio

| Variable | Ejemplo | Obligatorio |
|----------|---------|-------------|
| `AWS_REGION` | `us-east-1` | No (default us-east-1) |
| `FRONTEND_S3_BUCKET` | `kl-ecommerce-dev-frontend` | **Sí** (deploy) |
| `CLOUDFRONT_DISTRIBUTION_ID` | `E1234ABCDEF` | No (recomendado) |
| `VITE_API_URL` | `https://d111.cloudfront.net/api` | **Sí** (deploy prod) |
| `VITE_ADMIN_URL` | `https://d111.cloudfront.net/api/admin` | No |
| `VITE_ANALYTICS_URL` | `https://d111.cloudfront.net/api/analytics` | No |
| `VITE_API_TIMEOUT` | `20000` | No |

`VITE_*` se inyectan en **build time** (Vite). Deben apuntar al mismo origen que CloudFront expone para `/api/*` (API Gateway → ALB).

## Arquitectura

```
Usuario → CloudFront → S3 (React build)
         → CloudFront /api/* → API Gateway → ALB → ECS
```

## No necesitas SSM para el pipeline

El workflow solo sube archivos estáticos. Los secretos de la app backend viven en ECS/RDS, no en este repo.

## Probar build local con mismas URLs que prod

```bash
export VITE_API_URL=https://TU_CLOUDFRONT_DOMAIN/api
npm run build
```
