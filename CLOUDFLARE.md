# Cloudflare Pages Deployment

This project is configured for deployment on Cloudflare Pages.

## Setup Requirements

1. **Cloudflare Account Setup**:
   - Create a Cloudflare account if you don't have one
   - Create a Cloudflare Pages project
   - Generate an API token with Pages deployment permissions

2. **GitHub Repository Secrets**:
   Add the following secrets to your GitHub repository:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

3. **Environment Variables**:
   Configure these environment variables in your Cloudflare Pages project settings:
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_KEY`: Your Supabase service role key
   - `PUBLIC_SUPABASE_URL`: Same as SUPABASE_URL
   - `PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `OPENROUTER_API_KEY`: Your OpenRouter API key

## Deployment Process

The project uses GitHub Actions for CI/CD. When code is pushed to the `master` branch, it triggers:
1. Code linting
2. Unit tests with coverage report
3. Build process
4. Deployment to Cloudflare Pages

You can also manually trigger a deployment from GitHub Actions using the workflow_dispatch event.

## Local Development with Cloudflare

For local development with Cloudflare compatibility:

```bash
# Install Wrangler
npm install -g wrangler

# Run development server
npm run dev

# Deploy manually using Wrangler
wrangler pages publish dist --project-name=10x-cards
```

## Troubleshooting

- **Build Errors**: Check that your Astro configuration is correctly set up for Cloudflare
- **Environment Variables**: Verify all required environment variables are set correctly
- **Routing Issues**: Review `_routes.json` for client-side routing configuration 