# NFONAP Miss & Master Elections 2025 - Admin Dashboard

## Overview
The Admin Dashboard is a comprehensive management system for the NFONAP Elections 2025 platform. It allows administrators to manage candidates, monitor voting statistics, and export election data.

## Features

### 1. **Authentication & Security**
- Admin login with secure credentials
- Session management with automatic timeout
- Password change functionality
- Logout functionality

### 2. **Candidate Management**
- **Add Candidates**: Create new candidates for Miss and Master categories
- **Edit Candidates**: Modify candidate information (name, program, department, bio, manifesto)
- **Delete Candidates**: Remove candidates and their associated votes
- **View Candidates**: Display all candidates in a filterable table
- **Filter by Category**: View Miss, Master, or all candidates

### 3. **Dashboard Statistics**
- Total number of candidates
- Total number of votes cast
- Number of Miss candidates
- Number of Master candidates
- Real-time updates

### 4. **Database Management**
- **Backup Database**: Export all election data as JSON file
- **Restore Database**: Import previously backed-up data
- **Reset Database**: Clear all data with safety confirmations

### 5. **Data Export**
- Export candidate information and vote counts as CSV
- Download election results for analysis

## Default Credentials

**Username**: `admin`  
**Password**: `nfonap2025`

⚠️ **Important**: Change the password immediately after first login!

## How to Use

### Logging In
1. Navigate to `admin.html`
2. Enter username: `admin`
3. Enter password: `nfonap2025`
4. Click "Login"

### Adding a Candidate
1. Click "Add Candidate" button
2. Select category (Miss or Master)
3. Fill in required fields:
   - Full Name
   - Program
   - Department
   - Biography
4. Optional fields:
   - Email
   - Manifesto
   - Photo (future feature)
5. Click "Add Candidate"

### Managing Candidates
1. Use filter buttons to view Miss, Master, or all candidates
2. To edit: Click the "Edit" button in the actions column
3. To delete: Click the "Delete" button (requires confirmation)

### Exporting Data
1. Click "Export" button to download candidate data as CSV
2. File will be named: `nfonap-elections-export-YYYY-MM-DD.csv`

### Database Backup & Restore
1. **Backup**: Click "Backup Database" to save all data as JSON
2. **Restore**: Click "Restore Database" to import a backup
3. **Reset**: Click "Reset Database" (requires safety confirmations)

## Data Structure

### Candidate Object
```javascript
{
  id: "candidate-1",
  category: "miss" | "master",
  name: "Full Name",
  program: "Program Name",
  department: "Department Name",
  email: "email@nfonap.edu.cm",
  bio: "Biography text",
  manifesto: "Manifesto text",
  createdAt: "2025-12-07T...",
  updatedAt: "2025-12-07T..." (optional)
}
```

### Vote Object
```javascript
{
  id: "vote-1",
  candidateId: "candidate-1",
  voterEmail: "voter@nfonap.edu.cm",
  timestamp: "2025-12-07T..."
}
```

## Technical Details

### Storage
- All data is stored in browser's localStorage
- Key prefix: `nfonap_` (with version suffix)

### Session Management
- Sessions stored in sessionStorage
- Session timeout: 30 minutes (configurable)
- Session requires re-login

### Browser Compatibility
- Chrome/Edge (Recommended)
- Firefox
- Safari
- Mobile browsers (responsive design)

## File Structure
- `admin.html`: Admin dashboard interface
- `admin-script.js`: Dashboard functionality and logic
- `script.js`: Shared classes (Database, Toast)
- `style.css`: Styling for the entire platform
- `assets/`: Images and logos

## Security Notes
1. Change default password immediately
2. Never share admin credentials
3. Regularly backup important data
4. Use in a secure network environment
5. Clear browser cache after logout if on shared computer

## Troubleshooting

### Issue: "Invalid username or password"
- Verify correct credentials
- Check for CAPS LOCK
- Clear browser cache if password was changed

### Issue: Data not saving
- Check browser's localStorage is enabled
- Verify sufficient storage space
- Try refreshing the page

### Issue: Modal won't close
- Try pressing Escape key
- Click outside the modal
- Refresh the page

### Issue: CSS not loading properly
- Check that style.css is in the same directory
- Clear browser cache (Ctrl+Shift+Del)
- Check browser console for errors (F12)

## Future Enhancements
- [ ] Photo upload functionality
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Multi-admin support
- [ ] Voting analytics dashboard
- [ ] Real-time vote updates
- [ ] SMS notifications

## Support
For issues or feature requests, contact the development team.

---

**Last Updated**: December 7, 2025
**Version**: 1.0
