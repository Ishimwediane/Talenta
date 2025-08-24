# Admin Sidebar - Collapsible Functionality

## Overview
The admin sidebar has been enhanced with a collapsible feature that allows users to minimize the sidebar to show only icons, providing more screen space for content while maintaining easy navigation.

## Features

### 🎯 Collapsible Sidebar
- **Toggle Button**: Three-dot menu (⋮) in the top-left corner of the sidebar
- **Collapsed State**: Shows only icons (64px width) instead of full sidebar (216px width)
- **Smooth Transitions**: Animated collapse/expand with CSS transitions
- **Responsive Layout**: Content area automatically adjusts to sidebar state

### 👤 Profile Management
- **Profile Dropdown**: Click the chevron next to the user avatar to access profile options
- **Profile Page**: `/admin/profile` - Edit personal information, contact details
- **Settings Page**: `/admin/settings` - Configure notifications, security, appearance, and system preferences

### 🔍 Search Functionality
- **Search Bar**: Located in the top-right of the navbar
- **Form Submission**: Handles search queries (currently logs to console)
- **Responsive Design**: Adapts to different screen sizes

### ⚙️ Settings & Configuration
- **Notifications**: Email, push, and SMS notification preferences
- **Security**: Two-factor authentication, session timeout, password expiry
- **Appearance**: Theme, language, and timezone settings
- **System**: Backup, analytics, and debug mode options

## How to Use

### Toggle Sidebar
1. Look for the three-dot menu (⋮) in the top-left corner of the sidebar
2. Click to collapse/expand the sidebar
3. The sidebar will smoothly animate between states

### Access Profile
1. In the expanded sidebar, click the chevron (⌄) next to your avatar
2. Select "Profile" to edit your information
3. Select "Settings" to configure preferences

### Use Search
1. Type your search query in the search bar in the top-right
2. Press Enter or click the search icon
3. Search results will be processed (currently logs to console)

## Technical Implementation

### Components
- `DashboardSidebar`: Main sidebar with collapse functionality
- `DashboardNavbar`: Top navigation bar with search and profile buttons
- `AdminLayout`: Layout wrapper that manages sidebar state
- `ProfilePage`: Editable profile information page
- `SettingsPage`: Comprehensive settings configuration page

### State Management
- Sidebar collapse state is managed in the admin layout
- Profile and settings state is managed locally in each component
- All state changes trigger smooth UI updates

### Styling
- Uses Tailwind CSS for responsive design
- Smooth transitions with CSS animations
- Consistent spacing and typography
- Icon-only mode with proper tooltips

## File Structure
```
src/app/admin/
├── Sidebar.tsx          # Collapsible sidebar component
├── Navbar.tsx           # Top navigation with search
├── layout.tsx           # Admin layout with sidebar state
├── profile/
│   └── page.tsx        # Profile editing page
└── settings/
    └── page.tsx        # Settings configuration page
```

## Dependencies
- `@radix-ui/react-switch`: For toggle switches in settings
- `@radix-ui/react-select`: For dropdown selects in settings
- `lucide-react`: For consistent iconography
- `@/components/ui/*`: Custom UI components

## Future Enhancements
- Persistent sidebar state (localStorage)
- Keyboard shortcuts for sidebar toggle
- Advanced search with filters
- Profile image upload
- Real-time settings sync
- Dark mode support
- Mobile-responsive sidebar behavior
