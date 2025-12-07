# Quick Start Guide - NFONAP Elections Admin Dashboard

## 🚀 Getting Started

### 1. Access the Admin Dashboard
Open your browser and go to:
```
http://localhost:8000/admin.html
```

### 2. Login with Default Credentials
- **Username**: `admin`
- **Password**: `nfonap2025`

### 3. First Steps
After login, you'll see:
- Dashboard with statistics
- List of pre-loaded sample candidates
- Tools to manage candidates and data

## 📋 Quick Actions

### View Dashboard
- Statistics cards show: Total Candidates, Total Votes, Miss Candidates, Master Candidates
- Candidates table with filtering options

### Add a New Candidate
1. Click "Add Candidate" button
2. Fill in the form:
   - **Category**: Miss or Master
   - **Full Name**: Candidate's name
   - **Program**: Educational program
   - **Department**: Faculty/Department
   - **Biography**: About the candidate
   - **Email** (optional): Contact email
   - **Manifesto** (optional): Campaign manifesto

### Edit Candidate
1. Click "Edit" button in the candidates table
2. Modify any field
3. Click "Update Candidate"

### Delete Candidate
1. Click "Delete" button
2. Confirm the action
3. All votes for that candidate are automatically removed

### Filter Candidates
Use the filter buttons to view:
- **All**: All candidates
- **Miss**: Only Miss candidates
- **Master**: Only Master candidates

### Export Data
Click "Export" to download candidate data as CSV file.

### Backup/Restore Data
- **Backup Database**: Save all data as JSON
- **Restore Database**: Load a previously saved backup
- **Reset Database**: Clear all data (with safety confirmations)

## 🔒 Security Recommendations

1. **Change Default Password**
   - After first login, change the default password
   - Use a strong, unique password

2. **Never Share Credentials**
   - Keep admin credentials confidential
   - Don't share login details

3. **Regular Backups**
   - Create backups regularly
   - Store backups in a safe location

4. **Logout When Done**
   - Always logout after completing tasks
   - Especially on shared computers

## 📊 Understanding the Statistics

- **Total Candidates**: Count of all registered candidates
- **Total Votes**: Count of all votes cast in the election
- **Miss Candidates**: Count of Miss NFONAP candidates
- **Master Candidates**: Count of Master NFONAP candidates

Each statistic updates in real-time as you make changes.

## 💾 Data Management

### Backup Your Data
Regular backups ensure you don't lose important election data:
1. Click "Backup Database"
2. File is automatically downloaded as JSON
3. Save in a secure location

### Restore From Backup
If you need to restore data:
1. Click "Restore Database"
2. Select your backup JSON file
3. All data is restored (careful: overwrites current data)

### Reset Database
Use with caution - this permanently deletes all data:
1. Click "Reset Database"
2. Confirm twice (safety feature)
3. Type "RESET" to verify

## 🎯 Default Sample Data

The dashboard comes with 4 pre-loaded candidates for testing:

### Miss Candidates
1. **Amara Ndeze** - Computer Science
2. **Christelle Tanyi** - Business Administration

### Master Candidates
3. **David Ngufor** - Software Engineering
4. **Benjamin Nkwa** - Finance

You can edit, delete, or use these to understand how the system works.

## 🔧 Troubleshooting

### Login Issues
- Verify username and password are correct
- Check CAPS LOCK
- Try clearing browser cache

### Data Not Saving
- Ensure browser's localStorage is enabled
- Check that you have enough storage space
- Try refreshing the page

### Modal Won't Close
- Press Escape key
- Click outside the modal
- Refresh the page if needed

## 📱 Browser Compatibility

The dashboard works on:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (responsive design)

## ⌨️ Keyboard Shortcuts

- **Escape**: Close modals
- **Ctrl+Shift+Del**: Clear browser cache (if login issues)
- **F12**: Open browser developer tools

## 📞 Need Help?

If you encounter any issues:
1. Check the ADMIN_GUIDE.md for detailed documentation
2. Open browser console (F12) to see error messages
3. Try clearing browser cache and reloading
4. Check that all files (script.js, admin-script.js, style.css) are in place

## 🎉 You're All Set!

The Admin Dashboard is ready to use. Start by:
1. Logging in with the default credentials
2. Exploring the sample candidates
3. Testing the add, edit, and delete functions
4. Creating a backup of your data

---

**Happy administering! 🎓**
