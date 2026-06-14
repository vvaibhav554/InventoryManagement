# Windows Setup Guide for Inventory Management System

This guide provides step-by-step instructions for setting up and running the Inventory Management System on a Windows computer.

## Prerequisites

### System Requirements
- **Operating System:** Windows 10 or Windows 11
- **RAM:** Minimum 4GB, Recommended 8GB
- **Storage:** Minimum 2GB free space
- **Internet Connection:** Required for downloading dependencies

### Required Software
1. **Node.js** (v14 or higher)
2. **MongoDB** (v4.4 or higher)
3. **Git** (for cloning the repository)
4. **Visual Studio Code** (recommended IDE)

---

## Step 1: Install Node.js

### Download Node.js
1. Go to the official Node.js website: [https://nodejs.org/](https://nodejs.org)
2. Download the **LTS (Long Term Support)** version for Windows
3. Run the downloaded `.msi` installer

### Installation Process
1. **Run the installer**: Double-click the downloaded `.msi` file
2. **Accept the license agreement**: Click "Next"
3. **Choose installation location**: Accept the default location (recommended)
4. **Select features**: Ensure all features are selected
5. **Install**: Click "Install" and wait for completion
6. **Complete**: Click "Finish"

### Verify Installation
1. Open **Command Prompt** or **PowerShell**
2. Type the following commands:

```bash
node --version
npm --version
```

You should see version numbers displayed, like:
```
v18.17.0
9.6.7
```

---

## Step 2: Install MongoDB

### Download MongoDB Community Server
1. Go to MongoDB Download Center: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Select the following options:
   - **Version:** Latest stable version
   - **Platform:** Windows
   - **Package:** MSI
3. Download the `.msi` installer

### Installation Process
1. **Run the installer**: Double-click the downloaded `.msi` file
2. **Choose Setup Type**: Select "Complete" installation
3. **Service Configuration**:
   - Check "Install MongoDB as a Windows Service"
   - Select "Run service as Network Service user"
   - Check "Install MongoDB Compass" (optional but recommended)
4. **Install**: Click "Install" and wait for completion

### Configure MongoDB
1. **Create Data Directory**: MongoDB needs a place to store data
   - Open **Command Prompt as Administrator**
   - Create the data directory:
   ```bash
   mkdir C:\data\db
   ```

2. **Start MongoDB Service**:
   ```bash
   net start MongoDB
   ```

### Verify Installation
1. **Open MongoDB Compass** (if installed) or **Command Prompt**
2. **Using Command Prompt**:
   ```bash
   mongosh --version
   ```

3. **Test Connection**:
   ```bash
   mongosh
   ```
   You should see the MongoDB shell prompt.

---

## Step 3: Install Git

### Download Git
1. Go to Git website: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Download the latest version for Windows

### Installation Process
1. **Run the installer**: Double-click the downloaded `.exe` file
2. **Follow the setup wizard**: Accept default options
3. **Select editor**: Choose Visual Studio Code (if installed)
4. **Complete installation**: Click "Finish"

### Verify Installation
Open **Command Prompt** and type:
```bash
git --version
```

---

## Step 4: Install Visual Studio Code (Recommended)

### Download VS Code
1. Go to VS Code website: [https://code.visualstudio.com/](https://code.visualstudio.com)
2. Download the Windows version
3. Run the installer and follow the setup wizard

### Install VS Code Extensions
1. Open VS Code
2. Go to **Extensions** (Ctrl+Shift+X)
3. Install these recommended extensions:
   - **MongoDB for VS Code**
   - **REST Client**
   - **Live Server**
   - **Prettier - Code formatter**

---

## Step 5: Get the Project Files

### Option 1: Using Git (Recommended)
1. **Open Command Prompt**
2. Navigate to where you want to clone the project:
   ```bash
   cd C:\Projects\
   ```
3. Clone the repository:
   ```bash
   git clone <repository-url>
   cd InventoryManagement
   ```

### Option 2: Manual Download
1. **Download the project files** as a ZIP file
2. **Extract the ZIP file** to your desired location
3. **Navigate to the project folder** in Command Prompt

---

## Step 6: Install Project Dependencies

1. **Open Command Prompt** or **PowerShell**
2. **Navigate to the project directory**:
   ```bash
   cd C:\Projects\InventoryManagement
   ```
3. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

This will install all the required packages listed in `package.json`.

---

## Step 7: Configure Environment Variables

### Create Environment File
1. **Create a new file** named `.env` in the project root
2. **Open the file** in a text editor
3. **Add the following configuration**:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/inventory_management
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Important Notes:
- **JWT_SECRET**: Use a long, random string for security
- **MONGODB_URI**: This tells the application where to find your MongoDB database
- **PORT**: The port number the application will run on

---

## Step 8: Start the Application

### Option 1: Development Mode (Recommended for development)
1. **Open Command Prompt** in the project directory
2. **Run the development server**:
   ```bash
   npm run dev
   ```

### Option 2: Production Mode
1. **Open Command Prompt** in the project directory
2. **Run the production server**:
   ```bash
   npm start
   ```

### Access the Application
1. **Open your web browser**
2. **Navigate to**: [http://localhost:3000](http://localhost:3000)

You should see the Inventory Management System landing page.

---

## Step 9: Verify Everything Works

### Test the Application
1. **Create an account** by clicking "Get Started"
2. **Login** with your credentials
3. **Add an inventory item**:
   - Go to Items page
   - Click "Add Item"
   - Fill in the details and save
4. **Check the dashboard** for statistics and alerts

### Common Verification Steps
- ✅ Application loads without errors
- ✅ Database connection works
- ✅ User registration/login works
- ✅ Can add, edit, and delete items
- ✅ Low stock alerts appear correctly
- ✅ Reports generate properly

---

## Troubleshooting Common Windows Issues

### Issue 1: MongoDB Service Won't Start
**Problem:** `net start MongoDB` fails

**Solutions:**
1. **Run Command Prompt as Administrator**
2. **Check if MongoDB is already running**:
   ```bash
   net stop MongoDB
   net start MongoDB
   ```
3. **Check Windows Services**:
   - Press `Win + R`, type `services.msc`
   - Look for "MongoDB Server"
   - Right-click and select "Start"

### Issue 2: Port 3000 is Already in Use
**Problem:** Application won't start because port 3000 is occupied

**Solutions:**
1. **Find what's using the port**:
   ```bash
   netstat -ano | findstr :3000
   ```
2. **Kill the process**:
   ```bash
   taskkill /PID <process_id> /F
   ```
3. **Use a different port** by changing `.env` file:
   ```env
   PORT=3001
   ```

### Issue 3: npm install Fails
**Problem:** Package installation fails with errors

**Solutions:**
1. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```
2. **Delete node_modules folder**:
   ```bash
   rmdir /s node_modules
   ```
3. **Install again**:
   ```bash
   npm install
   ```

### Issue 4: Database Connection Error
**Problem:** Application can't connect to MongoDB

**Solutions:**
1. **Verify MongoDB is running**:
   ```bash
   net start MongoDB
   ```
2. **Check connection string in .env**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/inventory_management
   ```
3. **Test MongoDB connection manually**:
   ```bash
   mongosh
   use inventory_management
   db.test.insertOne({test: "connection"})
   db.test.find()
   ```

### Issue 5: Permission Denied Errors
**Problem:** Access denied when running commands

**Solutions:**
1. **Run Command Prompt as Administrator**
2. **Check file permissions** on project folders
3. **Disable Windows Defender temporarily** (for npm install)

---

## Development Workflow in Windows

### Using Windows Terminal (Recommended)
1. **Install Windows Terminal** from Microsoft Store
2. **Open multiple tabs** for different tasks
3. **Use PowerShell** for most commands
4. **Keep one tab running the server**

### VS Code Integration
1. **Open project in VS Code**
2. **Use integrated terminal** (Ctrl+`)
3. **Install recommended extensions**
4. **Use debugger** for troubleshooting

### Git Workflow
1. **Create feature branch**:
   ```bash
   git checkout -b feature/new-feature
   ```
2. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "Add new feature"
   ```
3. **Push changes**:
   ```bash
   git push origin feature/new-feature
   ```

---

## Production Deployment on Windows Server

### For Windows Server 2016/2019/2022

#### Step 1: Server Preparation
1. **Install Node.js**: Same as Windows 10/11
2. **Install MongoDB**: Same as Windows 10/11
3. **Configure Windows Firewall**:
   - Open port 3000 (or your chosen port)
   - Allow Node.js and MongoDB through firewall

#### Step 2: Install IIS (Optional)
1. **Server Manager** → **Add roles and features**
2. **Select Web Server (IIS)**
3. **Install Application Request Routing**
4. **Configure reverse proxy** to Node.js application

#### Step 3: Install PM2 for Process Management
1. **Install PM2 globally**:
   ```bash
   npm install -g pm2
   ```
2. **Create ecosystem.config.js**:
   ```javascript
   module.exports = {
     apps: [{
       name: 'inventory-system',
       script: 'server.js',
       instances: 2,
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```
3. **Start application with PM2**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

#### Step 4: Configure Windows Service
1. **Create Windows Service** using NSSM:
   ```bash
   nssm install InventorySystem "C:\Program Files\nodejs\node.exe" "C:\Projects\InventoryManagement\server.js"
   nssm start InventorySystem
   ```

---

## Backup and Recovery

### Database Backup
1. **Create backup script** (`backup.bat`):
   ```batch
   @echo off
   set BACKUP_DIR=C:\backups\inventory
   set DATE=%date:~-4,4%%date:~-7,2%%date:~-10,2%
   mkdir "%BACKUP_DIR%\%DATE%"
   mongodump --db inventory_management --out "%BACKUP_DIR%\%DATE%"
   echo Backup completed: %BACKUP_DIR%\%DATE%
   ```
2. **Schedule automatic backups** using Windows Task Scheduler

### Restore Database
1. **Stop MongoDB service**:
   ```batch
   net stop MongoDB
   ```
2. **Restore from backup**:
   ```batch
   mongorestore --drop C:\backups\inventory\20231201\inventory_management
   ```
3. **Start MongoDB service**:
   ```batch
   net start MongoDB
   ```

---

## Performance Optimization

### Windows Performance Tips
1. **Disable Windows Defender real-time protection** for project directories
2. **Add Node.js to Windows Defender exclusions**
3. **Use Windows Performance Monitor** to track resource usage
4. **Configure MongoDB for Windows**:
   - Increase memory allocation in `mongod.cfg`
   - Optimize storage engine settings

### Application Optimization
1. **Enable compression** in Express.js:
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```
2. **Use environment-specific settings**:
   ```javascript
   if (process.env.NODE_ENV === 'production') {
     app.enable('trust proxy');
   }
   ```

---

## Security Considerations

### Windows Security
1. **Run application as non-administrator user**
2. **Configure Windows Firewall properly**
3. **Use Windows Defender for real-time protection**
4. **Enable Windows BitLocker** for disk encryption

### Application Security
1. **Use HTTPS in production**:
   ```javascript
   const https = require('https');
   const fs = require('fs');
   ```
2. **Implement rate limiting**:
   ```javascript
   const rateLimit = require('express-rate-limit');
   ```
3. **Secure environment variables**:
   - Store secrets in Windows Credential Manager
   - Use encrypted configuration files

---

## Getting Help

### Resources
1. **Official Documentation**:
   - [Node.js Documentation](https://nodejs.org/docs/)
   - [MongoDB Documentation](https://docs.mongodb.com/)
   - [Express.js Documentation](https://expressjs.com/)

2. **Community Support**:
   - [Stack Overflow](https://stackoverflow.com/)
   - [Node.js Discord](https://discord.gg/nodejs)
   - [MongoDB Community Forums](https://community.mongodb.com/)

3. **Windows-Specific Help**:
   - [Windows Command Line Reference](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/)
   - [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)

### Common Commands Reference
| Command | Description |
|---------|-------------|
| `node --version` | Check Node.js version |
| `npm --version` | Check npm version |
| `net start MongoDB` | Start MongoDB service |
| `net stop MongoDB` | Stop MongoDB service |
| `mongosh` | Open MongoDB shell |
| `npm install` | Install dependencies |
| `npm run dev` | Start development server |
| `pm2 list` | List PM2 processes |

---

## Summary

Following this guide, anyone should be able to set up and run the Inventory Management System on a Windows computer. The process involves:

1. ✅ Installing required software (Node.js, MongoDB, Git)
2. ✅ Getting the project files
3. ✅ Installing dependencies
4. ✅ Configuring environment variables
5. ✅ Starting the application
6. ✅ Verifying everything works

The application will be accessible at `http://localhost:3000` and ready for use as a complete inventory management solution.

For any issues or questions, refer to the troubleshooting section or seek help from the recommended resources.