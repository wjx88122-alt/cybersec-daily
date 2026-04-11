This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Cloud-first triggering

Server-to-server follow-up calls now prefer a cloud base URL instead of the incoming local origin. Set `APP_BASE_URL` to your deployed domain (recommended), or rely on `VERCEL_URL` as a fallback.

The scheduled refresh pipeline stays in the cloud through a single `vercel.json` cron:

- `/api/cron`

That cron refreshes feeds first, then the downstream cloud routes chain automatically:

- `/api/images`
- `/api/translate`
- `/api/summarize`
- `/api/digest`

## Translation self-healing

To reduce recurring cases where recent English items appear without Chinese translations, the translation pipeline now has multiple safeguards:

- `/api/cron` refreshes feeds and immediately schedules a recent-only translation repair
- `/api/translate?scope=recent` always prioritizes the latest 24 hours before backlog items
- partial batch results are retried item-by-item inside `lib/translate.ts`
- public feed reads (`/api/feed`, `/api/feed-a`, `/api/feed-b`, `/api/feed-ai`) can trigger a throttled self-heal repair if recent items are still missing Chinese fields
- `/api/translation-health` exposes the latest translation health snapshot, including recent missing counts and sampled missing items

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
