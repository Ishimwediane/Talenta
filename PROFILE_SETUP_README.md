# Profile Integration Setup

## Overview
The admin panel now has full profile integration with the backend API. User data is fetched from the backend and displayed in both the sidebar and profile page.

## Features

### 🔐 **Real User Data**
- **Sidebar**: Displays actual user name, role, and avatar from backend
- **Profile Page**: Shows real user information with editing capabilities
- **Dynamic Updates**: Profile changes are saved to backend and reflected immediately

### 🔄 **Backend Integration**
- **API Endpoint**: `/api/auth/me` for fetching current user
- **Profile Updates**: `/api/users/profile` for updating user information
- **Authentication**: JWT token-based authentication
- **Error Handling**: Graceful fallback when backend is unavailable

### 🎯 **User Context**
- **Centralized State**: All user data managed in UserContext
- **Real-time Updates**: Profile changes update across all components
- **Loading States**: Proper loading indicators during API calls
- **Error Handling**: User-friendly error messages

## Setup Instructions

### 1. Environment Configuration
Create a `.env.local` file in the `talenta` directory:

```bash
# Frontend Environment Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### 2. Backend Requirements
Ensure your backend server is running with:
- **Port**: 5000 (or update the environment variable)
- **API Endpoints**: 
  - `GET /api/auth/me` - Get current user
  - `PUT /api/users/profile` - Update user profile
- **Authentication**: JWT middleware enabled

### 3. Database Schema
The backend should have a User model with these fields:
```sql
- id (String, Primary Key)
- firstName (String)
- lastName (String)
- email (String, Unique)
- phone (String)
- location (String)
- bio (String)
- role (Enum: USER, ADMIN)
- isVerified (Boolean)
- profilePicture (String, URL)
- createdAt (DateTime)
- updatedAt (DateTime)
```

## How It Works

### 1. **User Authentication Flow**
```
User visits admin page → UserContext loads → API call to /auth/me → User data stored → Components render with real data
```

### 2. **Profile Update Flow**
```
User edits profile → Form validation → API call to /users/profile → Backend updates database → UserContext updates → UI reflects changes
```

### 3. **Fallback Mode**
```
Backend unavailable → UserContext detects error → Demo user data created → App continues working → User can edit profile locally
```

## Testing the Integration

### 1. **With Backend Running**
1. Start your backend server on port 5000
2. Ensure you have a valid JWT token in localStorage
3. Visit `/admin/profile` - should show real user data
4. Edit profile fields and save - changes should persist

### 2. **Without Backend (Demo Mode)**
1. Don't start backend server
2. Visit `/admin/profile` - should show demo user data
3. Edit profile fields and save - changes stored locally
4. Sidebar shows demo user name and role

### 3. **Profile Data Display**
- **Sidebar**: Shows user initials, full name, and role
- **Profile Page**: Displays all user fields with edit capability
- **Real-time Updates**: Changes reflect immediately across components

## API Response Format

### Get Current User (`/api/auth/me`)
```json
{
  "status": "success",
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "user123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "location": "New York, NY",
      "bio": "Software Developer",
      "role": "ADMIN",
      "isVerified": true,
      "profilePicture": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Profile (`/api/users/profile`)
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": {
      // Updated user object
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **"Backend not available" message**
   - Check if backend server is running
   - Verify port 5000 is correct
   - Check network connectivity

2. **Profile not loading**
   - Check browser console for errors
   - Verify JWT token exists in localStorage
   - Check backend API endpoints

3. **Profile updates not saving**
   - Check backend validation rules
   - Verify user has permission to update
   - Check API response format

### Debug Mode
Enable console logging by checking the browser console for:
- API request/response logs
- UserContext state changes
- Error messages and stack traces

## Future Enhancements

- **Profile Picture Upload**: Cloudinary integration
- **Real-time Sync**: WebSocket updates across sessions
- **Advanced Validation**: Frontend form validation
- **Profile History**: Track profile change history
- **Multi-language Support**: Internationalization
- **Dark Mode**: Theme preferences in profile

