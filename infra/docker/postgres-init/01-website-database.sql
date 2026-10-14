-- Local development only. The website owns a separate database from the
-- e-learning API (ADR-007); both have a `users` table, so they must never
-- share one. Postgres runs this once, when the data volume is first created;
-- on an older volume, run it manually or `docker compose down -v`.
CREATE DATABASE zgate_website OWNER zgate;
