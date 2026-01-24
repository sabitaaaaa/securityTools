# Quick Setup Guide

## ✅ Dependencies Installed
All npm packages have been installed successfully.

## 📋 Next Steps

### 1. Database Setup (Required for full functionality)

**Option A: Using MySQL Command Line**
```bash
mysql -u root -p < database/schema.sql
```

**Option B: Manual Setup**
1. Open MySQL Workbench or your MySQL client
2. Create a new database:
   ```sql
   CREATE DATABASE cybersecurity_db;
   ```
3. Run the SQL file: `database/schema.sql`

**Option C: Skip Database (Limited Functionality)**
- The app will work without MySQL, but scan history won't be saved
- All tools will function normally

### 2. Configure Environment Variables

Edit `.env.local` file with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cybersecurity_db
DB_PORT=3306

API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
PORT=3001
```

### 3. Start the Application

**Option A: Run Both Frontend and Backend Together**
```bash
npm run dev:all
```

**Option B: Run Separately (Two Terminals)**

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend:
```bash
npm run server
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🛠️ Available Tools

1. **Port Scanner** - `/tools/port-scanner`
2. **Log File Analyzer** - `/tools/log-analyzer`
3. **Website Status Checker** - `/tools/website-checker`
4. **Directory Discovery** - `/tools/directory-discovery`
5. **IP Geolocation** - `/tools/ip-geolocation`
6. **Metadata Extractor** - `/tools/metadata-extractor`
7. **Subdomain Finder** - `/tools/subdomain-finder`

## 🔧 Troubleshooting

### Port Already in Use
If port 3000 or 3001 is already in use:
- Change `PORT` in `.env.local` for backend
- Change Next.js port: `npm run dev -- -p 3002`

### Database Connection Issues
- Verify MySQL is running
- Check credentials in `.env.local`
- Ensure database `cybersecurity_db` exists
- The app will work without database (just no history)

### Module Not Found Errors
```bash
npm install
```

## 📝 Notes

- The application works without MySQL, but scan history won't be saved
- All tools are fully functional
- Make sure you have permission before scanning any systems
- Use responsibly and ethically

## 🚀 Production Build

```bash
npm run build
npm start
```
