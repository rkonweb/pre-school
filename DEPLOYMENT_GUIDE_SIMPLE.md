# 🚀 Simple Deployment Guide: Preschool ERP

Follow these steps exactly to get your app online.

## 1. Setup Database (Neon)
1.  Go to **[neon.tech](https://neon.tech)** and Sign Up.
2.  Create a Project named `preschool-erp`.
3.  **Copy the Connection String**. It looks like: `postgres://user:pass@...`.
    *   Save this safe! We call this `DATABASE_URL`.

## 2. Sync Database Structure
*Before deploying, we need to tell the new database what tables (Students, Teachers) to create.*

1.  On your computer (VS Code), open `.env`.
2.  Replace the `DATABASE_URL` with your **Neon URL**.
3.  Open Terminal and run:
    ```bash
    npx prisma db push
    ```
4.  If it says "Generated Prisma Client", you are good!

## 3. Deployment (Vercel)
1.  Go to **[vercel.com](https://vercel.com)** and Sign Up with GitHub.
2.  Click **"Add New Project"** and find your repository.
3.  **Environment Variables** section:
    *   Name: `DATABASE_URL`
    *   Value: (Paste your Neon URL)
    *   Click **Add**.
4.  Click **Deploy**.

## 4. Admin Account Setup
*Your database is empty, so there is no Admin account.*

1.  Once the site is live (e.g., `preschool.vercel.app`), go to `/admin/login`.
2.  But wait! You cannot create an account there yet.
3.  Since this is a "Super Admin" setup, you might need to manually insert the first user via **Prisma Studio** or use the Signup flow if enabled.
4.  **Easiest Way**:
    *   Run `npx prisma studio` in your local terminal.
    *   It opens a webpage.
    *   Go to `User` table -> Add Record.
    *   Role: `ADMIN`.
    *   Mobile: `9999999999` (Your number).

Enjoy your app!
