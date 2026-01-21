# Route Care - Setup Guide

## 🚀 Quick Start Checklist

Before running the application, complete these steps:

### 1. ✅ Firebase Configuration (Already Done)
Your `.env.local` file is already configured with Firebase credentials.

### 2. 🔒 Deploy Firestore Security Rules

**IMPORTANT:** You must deploy the security rules to Firebase.

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

**Files to deploy:**
- `firestore.rules` - Database security
- `storage.rules` - File upload security

### 3. 📸 Cloudinary Setup (Required for Media Uploads)

1. **Create Free Account:**
   - Go to https://cloudinary.com/users/register/free
   - Sign up (completely free)

2. **Get Your Credentials:**
   - After signup, go to Dashboard
   - Copy your **Cloud Name**

3. **Create Upload Preset:**
   - Go to Settings → Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Set **Signing Mode** to "Unsigned"
   - Set **Folder** to "route-care" (optional)
   - Save and copy the preset name

4. **Add to `.env.local`:**

```env
# Add these lines to your existing .env.local file
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name_here
```

### 4. 🗄️ Firestore Database Setup

**Create Firestore Indexes:**

You need to create a composite index for the caretaker ID lookup.

**Option A: Automatic (Recommended)**
- Try to add a caretaker in the app
- Firebase will show an error with a link
- Click the link to auto-create the index

**Option B: Manual**
1. Go to Firebase Console → Firestore Database → Indexes
2. Create a composite index:
   - Collection: `caretakers`
   - Fields: `caretakerId` (Ascending)
   - Query scope: Collection

### 5. 🔄 Restart Dev Server

After adding Cloudinary credentials:

```bash
# Stop the current server (Ctrl+C)
# Restart it
npm run dev
```

---

## ✅ Verification Steps

### Test 1: Homepage
- Visit http://localhost:3000
- Should see modern hero section
- Navigation should work
- No console errors

### Test 2: Caretaker Registration
1. Click "Get Started"
2. Sign up as new user
3. Select "Caretaker / Service Provider"
4. Complete profile
5. **Check:** Caretaker ID is generated (format: CT-XXXXXX)
6. **Check:** ID is displayed prominently
7. **Check:** Copy button works

### Test 3: NRI Registration
1. Sign up as different user
2. Select "NRI / Property Owner"
3. Complete profile (skip caretaker for now)
4. Go to dashboard
5. Click "Add Caretaker"
6. Enter the caretaker ID from Test 2
7. **Check:** Validation works
8. **Check:** Caretaker is added successfully

### Test 4: Media Upload (After Cloudinary Setup)
1. Login as caretaker
2. Create a service request (if feature exists)
3. Try uploading an image
4. **Check:** Cloudinary widget opens
5. **Check:** Upload succeeds
6. **Check:** URL is saved to Firestore

---

## 🐛 Common Issues

### Issue: "Caretaker ID not found"
**Solution:** Make sure Firestore rules are deployed and the caretaker profile was created successfully.

### Issue: Cloudinary widget doesn't open
**Solution:** 
- Check browser console for errors
- Verify `.env.local` has correct credentials
- Restart dev server after adding credentials

### Issue: "Permission denied" errors
**Solution:** Deploy Firestore and Storage rules:
```bash
firebase deploy --only firestore:rules,storage:rules
```

### Issue: CSS not loading properly
**Solution:** Clear browser cache and restart dev server

---

## 📋 Environment Variables Checklist

Your `.env.local` should have:

```env
# Firebase (Already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# Cloudinary (Add these)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
```

---

## 🎯 Priority Order

1. **Deploy Firestore Rules** (Critical - app won't work without this)
2. **Test basic flows** (registration, login, dashboards)
3. **Setup Cloudinary** (Only needed for media uploads)
4. **Create Firestore indexes** (As needed when errors occur)

---

## 💡 Tips

- **Firestore Rules:** Must be deployed for the app to work
- **Cloudinary:** Optional for now, but needed for media features
- **Dev Server:** Restart after any `.env.local` changes
- **Browser Cache:** Clear if styles look broken

---

## 🆘 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check terminal for server errors
3. Verify all environment variables are set
4. Ensure Firebase rules are deployed
5. Try clearing browser cache and restarting server
