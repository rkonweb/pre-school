# 📱 Phone Number Management - Identity Settings

## ✅ What's Been Added

I've successfully added phone number management to the Identity Settings page with OTP verification.

### 📍 **Location:**
```
http://localhost:3001/s/test4/settings/identity
```

## 🔐 **Features**

### **1. View Current Phone Number**
- Displays registered phone number
- Shows "+91 XXXXXXXXXX" format
- "No phone number registered" if none exists

### **2. Add Phone Number (First Time)**
- If no phone registered, directly enter new number
- Verify with OTP (use `1234` for testing)
- Phone number saved to account

### **3. Change Phone Number (With Security)**
- **Step 1:** Verify old number with OTP
- **Step 2:** Enter new 10-digit number
- **Step 3:** Verify new number with OTP
- **Step 4:** Phone number updated

## 🎨 **UI Design**

### **Idle State** (Default)
- Shows current phone number in gray box
- "Change Number" or "Add Number" button

### **Verify Old Number** (Amber/Orange)
- OTP input field
- "Verify" button
- "Cancel" button
- Shows hint: "Use 1234 for testing"

### **Enter New Number** (Blue)
- Phone input with +91 prefix
- Auto-formats to 10 digits only
- "Send OTP" button
- "Cancel" button

### **Verify New Number** (Green)
- OTP input field
- "Verify & Update" button
- "Cancel" button
- Shows hint: "Use 1234 for testing"

## 🔄 **Flow Diagram**

```
┌─────────────────┐
│   Idle State    │
│  Show Current   │
│     Phone       │
└────────┬────────┘
         │
         │ Click "Change Number"
         ▼
┌─────────────────┐
│  Verify Old #   │ ◄─── If phone exists
│  Enter OTP      │
└────────┬────────┘
         │
         │ OTP Verified
         ▼
┌─────────────────┐
│  Enter New #    │ ◄─── If no phone, start here
│  10 digits      │
└────────┬────────┘
         │
         │ Send OTP
         ▼
┌─────────────────┐
│  Verify New #   │
│  Enter OTP      │
└────────┬────────┘
         │
         │ OTP Verified
         ▼
┌─────────────────┐
│  Phone Updated  │
│  Back to Idle   │
└─────────────────┘
```

## 🔧 **Technical Implementation**

### **State Management:**
```typescript
const [currentPhone, setCurrentPhone] = useState<string>("");
const [newPhone, setNewPhone] = useState("");
const [oldPhoneOtp, setOldPhoneOtp] = useState("");
const [newPhoneOtp, setNewPhoneOtp] = useState("");
const [phoneStep, setPhoneStep] = useState<"idle" | "verify-old" | "enter-new" | "verify-new">("idle");
const [isPhoneLoading, setIsPhoneLoading] = useState(false);
```

### **Functions:**
- `startPhoneChange()` - Initiates phone change process
- `verifyOldPhone()` - Verifies current phone with OTP
- `sendNewPhoneOtp()` - Sends OTP to new number
- `verifyNewPhone()` - Verifies new phone and updates
- `cancelPhoneChange()` - Cancels the process

### **API Calls:**
- `getCurrentUserAction()` - Gets current user's phone
- `sendOtpAction(phone, "login")` - Sends OTP
- `verifyOtpAction(phone, otp)` - Verifies OTP

## 🎯 **Security Features**

1. **Old Number Verification**
   - Must verify current number before changing
   - Prevents unauthorized changes

2. **OTP Verification**
   - Both old and new numbers require OTP
   - 4-digit OTP code

3. **Testing OTP: 1234**
   - Works for any phone number
   - Displayed in UI for convenience

4. **Input Validation**
   - Only accepts 10-digit numbers
   - Auto-strips non-numeric characters

## 📱 **User Experience**

### **Visual Feedback:**
- **Amber** - Verifying old number (security check)
- **Blue** - Entering new number
- **Green** - Verifying new number (almost done!)
- **Gray** - Idle state

### **Loading States:**
- Spinner icon during API calls
- Buttons disabled while loading
- Clear status messages

### **Error Handling:**
- Toast notifications for errors
- Validation before API calls
- Cancel button at every step

## 🚀 **How to Use**

### **For Users:**

1. **Go to Settings → Identity**
2. **Scroll to "Registered Phone Number" section**
3. **Click "Change Number" or "Add Number"**
4. **If changing:**
   - Enter OTP for current number (use `1234`)
   - Click "Verify"
5. **Enter new 10-digit number**
6. **Click "Send OTP"**
7. **Enter OTP for new number (use `1234`)**
8. **Click "Verify & Update"**
9. **Done! Phone number updated**

### **For Testing:**
- OTP is always `1234`
- Works for any phone number
- Check console for OTP logs

## 📝 **Files Modified**

1. **`src/components/dashboard/settings/IdentityForm.tsx`**
   - Added phone number management UI
   - Added OTP verification flow
   - Added state management
   - Added handlers for phone change

2. **Imports Added:**
   - `Phone` icon from lucide-react
   - `Shield` icon from lucide-react
   - `sendOtpAction` from auth-actions
   - `verifyOtpAction` from auth-actions
   - `getCurrentUserAction` from session-actions

## ✨ **Summary**

The phone number management feature is now **fully functional** with:
- ✅ View current phone number
- ✅ Add phone number (first time)
- ✅ Change phone number (with old number verification)
- ✅ OTP verification for security
- ✅ Beautiful multi-step UI
- ✅ Testing OTP: `1234`
- ✅ Input validation
- ✅ Loading states
- ✅ Error handling

**Visit the Identity Settings page to manage your phone number!** 🎉
