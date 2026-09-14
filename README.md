# D1LANDANDHOUSE — Backend API

Express + TypeScript + MongoDB (Mongoose) backend for the D1LANDANDHOUSE property platform.
MVP slice of the full system design (see the sibling `system-design.md`/`openapi.yaml`):
auth, properties, projects, leads, promotions, media upload, site settings.

## Setup

```bash
npm install
cp .env.example .env   # then fill in real values (already done for local dev)
npm run seed            # creates the Owner account + amenities + 3 sample properties
npm run dev              # http://localhost:4000/api/v1
```

Swagger docs (dev only): `http://localhost:4000/docs`

## Simplifications vs. the full system design (documented, not silently dropped)

- **No Redis/BullMQ.** Promotion lookups and lead notifications run synchronously/inline
  instead of through a queue+worker. Lead creation just logs; real email/LINE Notify
  sending needs SMTP/LINE credentials plus reintroducing a queue.
- **No image resizing (sharp).** Uploaded media is stored as a single original file;
  `variants.thumb/medium/large` all point at the same URL. Multi-size WebP/AVIF generation
  is a follow-up.
- **Only Property, Project, Lead, Promotion, Media, User, SiteSettings are modeled.**
  Customer accounts, Articles, Locations (Thai province/district seed data), Appointments,
  SavedSearch/Favorites, Pages/Banners/Menus, AuditLog, AnalyticsEvent are in
  `system-design.md` section 6 but not yet implemented.
- Local disk storage for uploads (`/uploads`), not GCS/S3/R2.

## Branches

`main` (production) / `staging` / `dev` (default working branch).
