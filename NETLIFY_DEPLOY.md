# Netlify Deployment Guide

This guide explains how to deploy Sourcer OS to Netlify.

## Prerequisites

- Netlify account (https://netlify.com)
- GitHub repository (or GitLab/Bitbucket)
- Supabase project set up

## Deployment Steps

### 1. Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "New site from Git"
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Select the `sourcing5` repository
5. Select branch: `main` (or your preferred branch)

### 2. Configure Build Settings

Netlify will auto-detect Next.js configuration, but ensure these settings:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `18.17.0` or higher

These are already configured in `netlify.toml`.

### 3. Set Environment Variables

In Netlify Dashboard, go to **Site settings > Build & deploy > Environment**

Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_NAME=Sourcer OS
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
```

#### Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Settings > API
3. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service role key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Configure Supabase

Your Supabase project must have the database schema initialized.

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy the contents from `supabase/migrations/001_initial_schema.sql`
4. Execute the query

### 5. Deploy

Once environment variables are set:

1. Push to your configured branch (usually `main`)
2. Netlify will automatically trigger a build
3. Deployment will complete in 1-3 minutes
4. Your site will be available at `https://your-site.netlify.app`

## Post-Deployment Configuration

### Update Supabase CORS

To allow your Netlify domain to access Supabase:

1. In Supabase dashboard, go to **Authentication > URL Configuration**
2. Add your Netlify URL to "Redirect URLs":
   - `https://your-site.netlify.app/auth/callback`
   - `https://your-site.netlify.app`

### Custom Domain (Optional)

1. In Netlify dashboard, go to **Site settings > Domain management**
2. Click "Add custom domain"
3. Follow the DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable to your custom domain

## Troubleshooting

### Build Fails with "Module not found"

**Solution**: Clear Netlify cache and redeploy
- Site settings > Build & deploy > Trigger new deploy

### Environment Variables Not Loading

**Solution**: Verify variables are set in Netlify dashboard, not in `.env.local`
- `.env.local` is git-ignored and won't be deployed
- All environment variables must be set in Netlify dashboard

### Supabase Connection Errors

**Solution**: Verify credentials and CORS settings
1. Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Ensure Netlify domain is added to Supabase CORS configuration
3. Check Supabase project status (may be paused if inactive)

### Database Migration Issues

**Solution**: Run migrations manually in Supabase
1. Go to Supabase SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql`
3. Verify tables exist in Supabase Tables section

## Local Development

### Running Locally with Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run dev server with Netlify context
netlify dev
```

This replicates the Netlify environment locally on `http://localhost:8888`

## CI/CD Configuration

The deployment is fully automated via GitHub (or your Git provider):

1. Push to `main` branch
2. Netlify automatically detects the push
3. Build runs using `netlify.toml` configuration
4. Site is deployed on success
5. Deployment preview available for pull requests

## Performance Optimization

### Enabled Optimizations

- ✅ SWC minification (faster builds)
- ✅ Compression (smaller bundle)
- ✅ Streaming for large responses
- ✅ Image optimization with Next.js Image component
- ✅ Server-side rendering for SEO

### Recommended Next Steps

1. Enable Netlify Analytics (dashboard > Site settings > Analytics)
2. Configure Netlify Forms for any contact forms
3. Set up error tracking (optional: Sentry/Rollbar integration)
4. Monitor Lighthouse scores in Netlify dashboard

## Resources

- [Netlify Next.js Guide](https://netlify.com/blog/2020/11/30/how-to-deploy-next.js-sites-to-netlify/)
- [Supabase CORS Configuration](https://supabase.com/docs/guides/hosting/overview#api-cors-settings)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
- [Next.js Deployment](https://nextjs.org/docs/deployment/static-exports)

## Support

For issues:
1. Check Netlify Deploy logs (Site overview > Deploy log)
2. Check browser console for errors
3. Review Supabase status
4. Create an issue in the repository

