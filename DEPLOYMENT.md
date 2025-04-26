# Vercel Deployment Guide for Tailor CV

This guide helps you deploy the Tailor CV application to Vercel.

## Prerequisites

1. [Vercel account](https://vercel.com/signup)
2. [GitHub repository](https://github.com) with your Tailor CV codebase
3. PostgreSQL database (you can use [Supabase](https://supabase.com), [Neon](https://neon.tech), or any other PostgreSQL provider)

## Environment Variables

Configure the following environment variables in your Vercel project settings:

```
# Database connection
DATABASE_URL="postgresql://username:password@host:port/tailor_cv?schema=public"

# Authentication
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# OAuth Providers (Optional, if you're using social logins)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""

# API Keys
NEXT_PUBLIC_API_URL_DEESEEK="your-deepseek-api-key"
NEXT_PUBLIC_API_URL_GEMINIS="your-gemini-api-key"
NEXT_PUBLIC_API_RESEND_API_KEY="your-resend-api-key"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

## Deployment Steps

### 1. Connect your repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project settings:
   - Framework preset: Next.js
   - Root directory: ./
   - Build command: `prisma generate && next build`
   - Output directory: .next

### 2. Set up environment variables

1. Copy all environment variables from the list above
2. In the Vercel project settings, go to "Environment Variables"
3. Add each variable with its corresponding value

### 3. Configure Vercel Blob Storage

The application uses Vercel Blob Storage for storing PDF templates. To set it up:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) > Storage
2. Create a new Blob storage or use an existing one
3. Get your Blob read-write token
4. Add it as the `BLOB_READ_WRITE_TOKEN` environment variable

### 4. Set up PostgreSQL database

1. Create a new PostgreSQL database with your preferred provider
2. Get the connection string
3. Add it as the `DATABASE_URL` environment variable
4. Ensure your database is accessible from Vercel's servers

### 5. Deploy

1. Click "Deploy" and wait for the build to complete
2. After successful deployment, the database schema will be automatically created thanks to the `prisma generate` step in the build command

## Troubleshooting

### Database connection issues

- Ensure your database allows connections from Vercel's IP addresses
- Check if your connection string is correct and includes all required parameters

### Missing API responses

- Verify that all API keys are correctly set in the environment variables
- Check if any of your API providers have usage limits or require additional configuration

### Template management issues

- Ensure the Blob storage is correctly configured with proper permissions
- Check if the `BLOB_READ_WRITE_TOKEN` has the correct permissions

## Post-Deployment

After successful deployment, you can:

1. Set up a custom domain in your Vercel project settings
2. Configure environment variables for production
3. Monitor application performance in the Vercel dashboard

## Scaling

As your application grows:

1. Consider using Vercel's Edge Functions for improved global performance
2. Use connection pooling for your database
3. Set up monitoring and alerts for your API usage 