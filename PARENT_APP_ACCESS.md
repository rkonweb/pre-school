# 📱 How to Access the Parent App

## 🚀 Quick Start

### **Option 1: Direct URL Access**
Navigate to:
```
http://localhost:3000/parent/student-1
```

This will take you directly to the homework dashboard for student-1.

---

### **Option 2: From Parent Dashboard**
1. Go to: `http://localhost:3000/parent`
2. Click on the **"Homework"** card (blue card with book icon)
3. You'll be redirected to the homework page

---

## 📍 URL Structure

```
/parent                    → Parent dashboard (main page)
/parent/[studentId]        → Student-specific dashboard with homework
```

### Examples:
- `/parent/student-1` → Emma's homework
- `/parent/student-2` → Liam's homework
- `/parent/abc123` → Any student by ID

---

## 🎯 What You'll See

### **Parent Dashboard** (`/parent`)
- Student status card (mood, lunch, nap)
- Quick actions:
  - 📚 **Homework** (3 New Tasks)
  - 💳 Make Payment
  - 💬 Staff Chat
- Today's timeline
- School announcements

### **Homework Dashboard** (`/parent/[studentId]`)
- Student info header
- Notification center (bell icon)
- Push notification toggle
- Bottom navigation:
  - 🏠 Home
  - 📚 **Homework** (active by default)
  - 📅 Calendar
  - 👤 Profile

---

## 📚 Homework Features

Once on the homework page, you can:

1. **View Tasks**
   - See all homework assignments
   - Status badges (New/Submitted/Reviewed)
   - Due dates
   - Media attachments (video/voice/worksheet)

2. **Submit Homework**
   - Click on a task card
   - Watch teacher's video guide
   - Upload photo or video (15s max)
   - Add notes
   - Select feedback (Enjoyed/Okay/Difficult)
   - Submit and see celebration animation! 🎉

3. **View Feedback**
   - See teacher's digital stickers
   - Read teacher comments
   - Check review status

---

## 🔔 Notifications

### Enable Push Notifications:
1. Click "🔕 Enable Notifications" button in header
2. Grant permission when prompted
3. Button changes to "🔔 Notifications On"

### View Notifications:
1. Click the bell icon (🔔) in header
2. Slide-in panel shows all notifications
3. Click "Mark All as Read" to clear

---

## 🎨 Demo Student IDs

For testing, use these student IDs:
- `student-1` → Emma Johnson (Nursery A, Age 3)
- `student-2` → Liam Johnson (Pre-K B, Age 4)

---

## 🧪 Testing the Full Flow

### **As a Teacher:**
1. Go to `/s/[slug]/homework`
2. Click "Create Homework"
3. Fill in details, add video/voice/worksheet
4. Assign to a class
5. Publish

### **As a Parent:**
1. Go to `/parent/student-1`
2. See the new homework task
3. Click on it
4. Upload a photo/video
5. Add feedback
6. Submit
7. Watch the celebration! 🎉

### **As a Teacher (Review):**
1. Go back to `/s/[slug]/homework`
2. Click on the homework
3. See submission grid
4. Click on a submission
5. Award a digital sticker
6. Add comment

### **As a Parent (View Feedback):**
1. Go back to `/parent/student-1`
2. See "Reviewed!" badge on task
3. Click to view teacher's feedback
4. See the digital sticker and comment

---

## 🎯 Quick Links

| Page | URL | Description |
|------|-----|-------------|
| **Parent Dashboard** | `/parent` | Main parent page |
| **Homework (Student 1)** | `/parent/student-1` | Emma's homework |
| **Homework (Student 2)** | `/parent/student-2` | Liam's homework |
| **Teacher Homework** | `/s/[slug]/homework` | Create & review homework |

---

## 💡 Tips

1. **Mobile View**: The parent app is mobile-optimized. Try resizing your browser to see the responsive design.

2. **Bottom Navigation**: Use the bottom nav to switch between Home/Homework/Calendar/Profile.

3. **Notifications**: Enable push notifications to receive reminders even when the app is closed.

4. **Media Upload**: 
   - Photos: Max 5MB, auto-compressed to 1920x1080
   - Videos: Max 15 seconds, 15MB
   - Camera capture supported on mobile devices

5. **Celebration Animation**: Don't skip it! It's designed to make homework submission fun for kids. 🎊

---

## 🐛 Troubleshooting

**Can't see homework?**
- Make sure homework is published by teacher
- Check that it's assigned to the correct student
- Verify the student ID in the URL

**Upload not working?**
- Check file size limits
- Ensure you've selected Photo or Video first
- Verify Google Cloud Storage is configured

**Notifications not appearing?**
- Grant browser notification permission
- Check that service worker is registered
- Verify VAPID keys are set in `.env`

---

## 🎉 You're All Set!

The Parent App is ready to use. Start by visiting:
```
http://localhost:3000/parent/student-1
```

Enjoy the homework experience! 📚✨
