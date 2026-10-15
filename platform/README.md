# Platform

The only runtime pieces the two products share. Product code never imports from here.

| Folder           | What it holds                                                                    |
| ---------------- | -------------------------------------------------------------------------------- |
| `edge/`          | `Caddyfile` (TLS, `www.` / `cms.` / `learn.` routing) and its `edge.env.example` |
| `observability/` | Uptime-check placeholder; monitoring and logging plans                           |
| `scripts/`       | `dev.Dockerfile` (the development image every Compose Node service uses)         |
