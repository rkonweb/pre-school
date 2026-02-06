# Google Drive API Setup Guide

## Overview
This application uses Google Drive API to store uploaded files (question papers, worksheets, etc.). If Google Drive is not configured, files are automatically saved to local storage as a fallback.

## Quick Start (Local Storage)
**No setup required!** Files will be saved to `public/uploads/` directory automatically.

## Google Drive Setup (Optional)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Note your project name

### Step 2: Enable Google Drive API

1. In the Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click **Enable**

### Step 3: Create Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Fill in the details:
   - **Service account name**: `preschool-file-upload`
   - **Service account ID**: (auto-generated)
   - Click **Create and Continue**
4. Skip optional steps and click **Done**

### Step 4: Generate Credentials

1. Click on the created service account
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON** format
5. Click **Create** - a JSON file will be downloaded

### Step 5: Configure Environment Variables

1. Open the downloaded JSON file
2. Copy the values to your `.env` file:

```env
GOOGLE_DRIVE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**Important**: The private key must include the `\n` characters. Copy it exactly as shown in the JSON file.

### Step 6: Create Drive Folder (Optional)

If you want files in a specific folder:

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder (e.g., "PreSchool Uploads")
3. Right-click the folder > **Share**
4. Share with your service account email (from Step 5)
5. Give **Editor** permissions
6. Copy the folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
7. Add to `.env`:

```env
GOOGLE_DRIVE_FOLDER_ID="your-folder-id-here"
```

If you skip this step, files will be uploaded to the root of the service account's Drive.

### Step 7: Restart Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

## Verification

1. Go to an exam edit page
2. Try uploading a PDF question paper
3. Check the console logs:
   - `✅ File uploaded to Google Drive:` - Success!
   - `⚠️ Google Drive not configured, using local storage fallback` - Using local storage

## Troubleshooting

### "Google Drive not configured"
- Check that `GOOGLE_DRIVE_CLIENT_EMAIL` and `GOOGLE_DRIVE_PRIVATE_KEY` are set in `.env`
- Ensure the private key includes `\n` characters (not literal backslash-n)
- Restart the server after adding environment variables

### "Permission denied"
- Make sure the folder is shared with the service account email
- Check that the service account has "Editor" permissions

### "Invalid credentials"
- Verify the private key is copied correctly with all newlines
- Ensure there are no extra spaces or quotes in the `.env` file

### Files still going to local storage
- Check server console for error messages
- Verify Google Drive API is enabled in Cloud Console
- Confirm service account has access to the folder

## File URLs

### Google Drive URLs
Format: `https://drive.google.com/uc?export=view&id=FILE_ID`
- Publicly accessible
- No expiration
- Can be viewed directly in browser

### Local Storage URLs
Format: `/uploads/worksheets/timestamp_filename.pdf`
- Served from `public/uploads/` directory
- Accessible via your domain
- Stored on server filesystem

## Security Notes

- **Never commit `.env` file** to version control
- Service account credentials should be kept secure
- Files are made publicly readable by default
- Consider implementing access control for sensitive files
