# MongoDB Installation Guide for Windows 🗄

MongoDB is required for StudyMate to function fully. Here's how to install it on Windows.

## Option 1: MongoDB Community (Recommended - Free)

### 1. Download MongoDB Community
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - **Version**: Latest (6.x or higher)
   - **Platform**: Windows
   - **Package**: MSI installer
3. Click "Download"

### 2. Install MongoDB
1. Run the downloaded MSI installer
2. Choose "Complete" installation
3. Let the installer complete
4. MongoDB will be installed in: `C:\Program Files\MongoDB\Server\6.x\`

### 3. Configure MongoDB
1. MongoDB should be installed to: `C:\Program Files\MongoDB\Server\6.x\bin\`
2. Add MongoDB to your PATH:
   - Search "Environment Variables" in Windows
   - Edit "Path" variable
   - Add: `C:\Program Files\MongoDB\Server\6.x\bin\`
3. Create data directory:
   ```bash
   mkdir C:\data\db
   ```

### 4. Start MongoDB
```bash
mongod --dbpath C:\data\db
```

### 5. Run as Service (Optional)
To run MongoDB as a Windows service:
```bash
# Install as service
mongod --install --serviceName "MongoDB" --serviceDisplayName "MongoDB" --dbpath C:\data\db --logpath C:\data\log\mongod.log

# Start service
net start MongoDB

# Stop service
net stop MongoDB

# Remove service
mongod --remove --serviceName "MongoDB"
```

## Option 2: MongoDB Compass (GUI Tool)

1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Install the tool
3. Use it to manage and view your MongoDB databases
4. Connection string: `mongodb://localhost:27017/studymate`

## Option 3: MongoDB Atlas (Cloud - Free Tier)

### Why Use MongoDB Atlas?
- **No installation required** - Completely cloud-based
- **Free tier available** - 512MB storage (plenty for StudyMate)
- **Automatic backups** - Data is safe and redundant
- **Easy setup** - Get connection string in minutes

### Setup MongoDB Atlas:

1. **Create Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for free account
   - Verify your email

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Shared" (free tier)
   - Select a cloud provider and region
   - Click "Create"

3. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Select "Node.js" as your driver
   - Copy the connection string
   - Format: `mongodb+srv://<username>:<password>@cluster.mongodb.net/studymate`

4. **Update .env File**
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/studymate
   ```

### MongoDB Atlas Connection String Format:
```
mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority&appName=<application-name>
```

## Option 4: Docker (Advanced)

If you have Docker installed:

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or with custom configuration
docker run -d -p 27017:27017 -v /data/db:/data/db --name mongodb mongo:latest
```

## Verification 🔍

### Check if MongoDB is Running:

**Option 1: Command Line**
```bash
# Check if MongoDB is running
netstat -an | findstr "27017"
```

**Option 2: MongoDB Compass**
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. You should see the databases

**Option 3: Test Connection**
```bash
# Use MongoDB shell
mongo
# You should see MongoDB shell prompt
```

## Troubleshooting 🔧

### Port Already in Use:
If port 27017 is already in use:
```bash
# Find the process using the port
netstat -ano | findstr "27017"

# Kill the process (carefully!)
taskkill /PID <process-id> /F
```

### Firewall Issues:
If MongoDB can't connect:
1. Allow MongoDB in Windows Firewall:
   - Go to "Windows Defender Firewall"
   - Allow "mongod.exe" through firewall
   - Port: 27017

2. Check network settings:
   - Ensure localhost connections are allowed
   - Check if any VPN is blocking connections

### Data Directory Issues:
If MongoDB won't start due to data directory:
```bash
# Create data directory
mkdir C:\data\db

# Give permissions if needed
# In Windows Explorer: Right-click folder → Properties → Security → Edit permissions
```

## Quick Setup for StudyMate ⚡

### Fastest Path (MongoDB Atlas):
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account (takes 2-3 minutes)
3. Create cluster (takes 5-10 minutes)
4. Get connection string
5. Update `.env` file with your connection string
6. Restart StudyMate backend

### Recommended Setup (Local MongoDB):
1. Download MongoDB Community: https://www.mongodb.com/try/download/community
2. Install using MSI installer
3. Create data directory: `mkdir C:\data\db`
4. Start MongoDB: `mongod --dbpath C:\data\db`
5. Restart StudyMate backend

## Current Application Status 📱

With MongoDB installed and running, StudyMate will be fully functional:

- ✅ User registration and login
- ✅ Study material creation and storage
- ✅ GLM AI integration for content generation
- ✅ Progress tracking and statistics
- ✅ Wellness check-in and trends
- ✅ Achievement system and goals
- ✅ All database-dependent features

## Support 📚

- **MongoDB Documentation**: https://docs.mongodb.com/
- **MongoDB Community Forum**: https://community.mongodb.com/
- **MongoDB Support**: https://support.mongodb.com/
- **MongoDB Atlas Support**: https://support.mongodb.com/hc/en-us

---

Choose the installation method that works best for your setup. MongoDB Atlas is the fastest and easiest for getting started quickly!