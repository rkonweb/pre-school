# Homework Module - Complete Setup Guide

## 🎯 Overview
The Homework Module is now fully implemented with:
- ✅ Teacher Assignment Interface (Homework Builder)
- ✅ Parent Submission UI with celebration animations
- ✅ Teacher Evaluation Dashboard with digital stickers
- ✅ Google Cloud Storage integration for media uploads
- ✅ Automated reminder system with push notifications
- ✅ In-app notification center

---

## 📋 Prerequisites

### 1. Google Cloud Storage Setup
1. Create a Google Cloud Project
2. Enable Cloud Storage API
3. Create a storage bucket (e.g., `preschool-homework`)
4. Create a service account with Storage Admin role
5. Download the service account JSON key

### 2. Web Push Notifications Setup
Run the VAPID key generator:
```bash
node scripts/generate-vapid-keys.js
```

---

## 🔧 Environment Variables

Add these to your `.env` file:

```env
# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=preschool-homework
GOOGLE_CLOUD_CREDENTIALS={"type":"service_account","project_id":"..."}

# Web Push Notifications (from generate-vapid-keys.js)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:admin@preschool.com

# Cron Job Security
CRON_SECRET=your-random-secret-key
```

---

## 🗄️ Database Migration

Run Prisma migration to create new tables:

```bash
npx prisma migrate dev --name add_homework_and_notifications
```

This will create:
- `Homework` - Assignment details
- `HomeworkSubmission` - Student submissions
- `HomeworkReadReceipt` - View tracking
- `HomeworkTemplate` - Super Admin templates
- `Notification` - In-app notifications
- `PushSubscription` - Push notification subscriptions
- `NotificationSchedule` - Scheduled notifications

---

## 🚀 Features Implemented

### 1. Teacher Homework Builder (`/s/[slug]/homework`)
**Location:** `src/app/s/[slug]/(dashboard)/homework/page.tsx`

Features:
- Create homework with title, description, instructions
- Upload video guides (1-minute max)
- Attach voice notes
- Add PDF worksheets
- Assign to: Class, Group, or Individual students
- Schedule release time
- Set due dates
- Pull from template library

### 2. Parent Submission UI
**Location:** `src/components/parent/ParentHomework.tsx`

Features:
- Vibrant task cards with status badges
- Video/audio player for teacher instructions
- Camera capture for photos
- Video recording (15 seconds max)
- Automatic image compression (1920x1080, 80% quality)
- Upload progress tracking
- Parent feedback toggles (Enjoyed/Okay/Difficult)
- Celebration animation on submission (confetti + star)

### 3. Teacher Evaluation Dashboard
**Location:** Built into homework page

Features:
- Submission grid with thumbnails
- One-tap grading with 5 digital stickers:
  - ⭐ Excellent
  - ✨ Creative
  - 👍 Keep it Up
  - ⭐ Star
  - 🏅 Medal
- Teacher comments
- Auto-link to student portfolio
- Milestone type tagging (Social/Cognitive/Physical/Creative)

### 4. Media Upload System
**Location:** `src/components/upload/MediaUploader.tsx`

Features:
- Camera/video capture support
- File type validation
- Size limits (5MB images, 15MB videos)
- Video duration validation (15s max)
- Client-side image compression
- Upload progress bar
- Preview before upload
- Direct upload to Google Cloud Storage

### 5. Notification System
**Location:** `src/components/notifications/NotificationCenter.tsx`

Features:
- In-app notification center (slide-in panel)
- Bell icon with unread badge
- Mark all as read
- Notification types:
  - 📅 Homework Reminder
  - ✨ Homework Reviewed
  - 📢 Announcement
  - ⚠️ Alert
- Time-ago formatting
- Deep links to relevant pages

### 6. Push Notifications
**Location:** `src/lib/push-notifications.ts`

Features:
- Web Push API integration
- Service worker for background notifications
- Permission request flow
- Device type detection
- Subscription management
- Click-to-open functionality

### 7. Automated Reminders
**Location:** `src/app/actions/notification-actions.ts`

Features:
- Schedule homework reminders
- Saturday evening reminders (6 PM)
- Target parents who haven't viewed homework
- Multi-channel delivery (Push/Email/SMS)
- Cron job for processing scheduled notifications

---

## 🔄 Automated Reminder Flow

1. **Homework Created** → Teacher publishes homework
2. **Read Receipt Tracking** → System tracks who viewed it
3. **Reminder Scheduling** → Auto-schedule for Saturday 6 PM
4. **Cron Job** → Runs every minute via `/api/cron/notifications`
5. **Notification Delivery** → Sends push + in-app notifications
6. **Parent Action** → Parent receives reminder and completes homework

---

## 📱 Setting Up Cron Jobs

### Option 1: Vercel Cron (Recommended for Vercel deployments)
Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/notifications",
    "schedule": "* * * * *"
  }]
}
```

### Option 2: External Cron Service
Use services like:
- **cron-job.org**
- **EasyCron**
- **GitHub Actions**

Configure to call:
```
GET https://your-domain.com/api/cron/notifications
Authorization: Bearer your-cron-secret
```

---

## 🧪 Testing

### Test Homework Creation
1. Navigate to `/s/[slug]/homework`
2. Click "Create Homework"
3. Fill in details and attach media
4. Assign to a class
5. Publish

### Test Parent Submission
1. Open parent homework page
2. Click on a task card
3. Select Photo or Video
4. Upload media
5. Add notes and feedback
6. Submit
7. Watch celebration animation! 🎉

### Test Notifications
1. Enable push notifications
2. Create a homework assignment
3. Schedule a reminder
4. Wait for scheduled time or manually trigger cron
5. Check notification center

### Test Push Notifications
1. Click "Enable Notifications" button
2. Grant permission
3. Send a test notification via server action
4. Verify notification appears

---

## 📊 Server Actions Reference

### Homework Actions (`homework-actions.ts`)
- `createHomeworkAction()` - Create new homework
- `publishHomeworkAction()` - Publish draft
- `getSchoolHomeworkAction()` - Get all homework
- `submitHomeworkAction()` - Submit homework
- `recordReadReceiptAction()` - Track views
- `getHomeworkSubmissionsAction()` - Get submissions
- `gradeSubmissionAction()` - Add teacher feedback
- `getHomeworkTemplatesAction()` - Get templates
- `createHomeworkTemplateAction()` - Create template

### Notification Actions (`notification-actions.ts`)
- `createNotificationAction()` - Create in-app notification
- `getUserNotificationsAction()` - Get user notifications
- `markNotificationReadAction()` - Mark as read
- `markAllNotificationsReadAction()` - Mark all as read
- `subscribeToPushAction()` - Subscribe to push
- `sendPushNotificationAction()` - Send push notification
- `scheduleNotificationAction()` - Schedule notification
- `processPendingNotificationsAction()` - Process scheduled
- `scheduleHomeworkRemindersAction()` - Schedule homework reminders

---

## 🎨 UI Components

### Teacher Components
- `HomeworkPage` - Main homework dashboard
- `HomeworkCard` - Homework preview card
- `HomeworkBuilder` - Creation modal
- `SubmissionReview` - Review modal
- `SubmissionCard` - Individual submission card

### Parent Components
- `ParentHomeworkPage` - Parent homework view
- `TaskCard` - Homework task card
- `TaskDetailModal` - Detailed task view
- `CelebrationOverlay` - Success animation

### Shared Components
- `MediaUploader` - File upload component
- `NotificationCenter` - Notification panel
- `PushNotificationButton` - Enable notifications button

---

## 🔐 Security Considerations

1. **File Upload Validation**
   - File type checking
   - Size limits enforced
   - Sanitized filenames
   - Public URL generation

2. **Notification Authorization**
   - Cron secret for API protection
   - User-specific notifications
   - Permission-based access

3. **Data Privacy**
   - Student data protected
   - Parent-only access to own child's homework
   - Teacher access to assigned classes only

---

## 📈 Performance Optimizations

1. **Image Compression**
   - Client-side resize to 1920x1080
   - 80% JPEG quality
   - Reduces upload time and storage costs

2. **Notification Batching**
   - Process up to 100 notifications per cron run
   - Prevents timeout issues

3. **Lazy Loading**
   - Notifications loaded on demand
   - Pagination for large lists

---

## 🐛 Troubleshooting

### Push Notifications Not Working
1. Check VAPID keys are set correctly
2. Verify service worker is registered (`/sw.js`)
3. Check browser console for errors
4. Ensure HTTPS (required for push notifications)

### File Upload Failing
1. Verify GCS credentials are correct
2. Check bucket permissions
3. Ensure bucket name matches `.env`
4. Check file size limits

### Cron Job Not Running
1. Verify cron secret matches
2. Check cron schedule syntax
3. Review server logs for errors
4. Test endpoint manually with curl

---

## 🎯 Next Steps

1. **Run Database Migration**
   ```bash
   npx prisma migrate dev --name add_homework_and_notifications
   ```

2. **Generate VAPID Keys**
   ```bash
   node scripts/generate-vapid-keys.js
   ```

3. **Configure Environment Variables**
   - Add all required env vars to `.env`

4. **Set Up Cron Job**
   - Configure Vercel Cron or external service

5. **Test All Features**
   - Create homework
   - Submit as parent
   - Grade as teacher
   - Test notifications

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review server logs
3. Check browser console
4. Verify environment variables
5. Test with sample data

---

**🎉 The Homework Module is now ready to use!**
