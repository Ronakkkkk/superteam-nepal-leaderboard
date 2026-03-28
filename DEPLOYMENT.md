# Deployment Guide

## Environment Variables (add these in Vercel dashboard)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SECRET_KEY`
- `NEXT_PUBLIC_ADMIN_PASSWORD`
- `NEXT_PUBLIC_ADMIN_KEY`

## Supabase Setup

- Disable RLS on `ambassadors` table
- Disable RLS on `xp_transactions` table
- Run `supabase/migrations/001_init.sql` in SQL editor

## Weekly XP Reset

Run this in Supabase SQL editor every Monday:

```sql
UPDATE ambassadors SET weekly_xp = 0;
```

## Monthly XP Reset

Run this in Supabase SQL editor every 1st of month:

```sql
UPDATE ambassadors SET monthly_xp = 0;
```
