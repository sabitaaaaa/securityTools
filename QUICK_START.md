# 🚀 Quick Start Guide

## Everything is Ready!

Your cybersecurity platform is fully set up and ready to use.

## ⚡ Start Now (3 Steps)

### Step 1: Database (Optional but Recommended)
```bash
mysql -u root -p < database/schema.sql
```
Or skip this step - the app works without it!

### Step 2: Start the Application
```bash
npm run dev:all
```
This starts both frontend (port 3000) and backend (port 3001) together.

### Step 3: Open Your Browser
Navigate to: **http://localhost:3000**

## 🎯 What You Get

✅ **7 Professional Security Tools**
- Port Scanner
- Log File Analyzer  
- Website Status Checker
- Directory Discovery
- IP Geolocation
- Metadata Extractor
- Subdomain Finder

✅ **Beautiful Modern UI**
- Dark cybersecurity theme
- Responsive design
- Smooth animations

✅ **Full Backend API**
- Express.js server
- MySQL integration
- All tools functional

## 📝 Configuration

Edit `.env.local` or `.env` to set your MySQL password:
```env
DB_PASSWORD=your_password_here
```

If you don't have MySQL, the app still works - just without saving scan history.

## 🛠️ Alternative: Run Separately

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
npm run server
```

## ✅ Verification

Check if everything is working:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api/health

## 🎉 You're All Set!

Start exploring the tools and enjoy your cybersecurity platform!
