This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Google Maps and route configuration

Set these values in `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_browser_google_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Enable Maps JavaScript API and Places API (New), with billing. Restrict the
browser key to those APIs and your frontend's HTTP referrers, including
`http://localhost:3002/*` if using the current preview port. Configure the separate
server-only Routes API key as described in `backend/README.md`.

Run both the frontend and backend. Select a suggestion in each address field
(free text alone does not identify coordinates), or use the current location
as the origin. Then choose **Find route** to display the driving route, distance,
and duration. Editing either address clears the old route. Location access needs
HTTPS or localhost and browser permission. Passenger suggestions are still
frontend sample data, not live route matches.

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
