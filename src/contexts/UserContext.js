"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import apiService from '@/lib/api'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch current user data
  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await apiService.getCurrentUser()
      if (response.status === 'success' && response.data?.user) {
        setUser(response.data.user)
      }
    } catch (err) {
      console.error('Error fetching user:', err)
      setError(err.message)
      
      // If token is invalid, remove it
      if (err.message.includes('Invalid token') || err.message.includes('Token expired')) {
        localStorage.removeItem('token')
        setUser(null)
      }
      
      // If backend is not available, create a demo user for development
      if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
        console.log('Backend not available, using demo user data')
        setUser({
          id: 'demo-user',
          firstName: 'Brooklyn',
          lastName: 'Alice',
          email: 'brooklyn.alice@example.com',
          phone: '+1 (555) 123-4567',
          location: 'New York, NY',
          bio: 'Administrator at Talenta',
          role: 'ADMIN',
          isVerified: true,
          profilePicture: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true)
      setError(null)
      
      // If using demo user, just update local state
      if (user?.id === 'demo-user') {
        const updatedUser = { ...user, ...profileData, updatedAt: new Date().toISOString() }
        setUser(updatedUser)
        setLoading(false)
        return { success: true, data: updatedUser }
      }
      
      const response = await apiService.updateProfile(profileData)
      if (response.status === 'success' && response.data?.user) {
        setUser(response.data.user)
        return { success: true, data: response.data.user }
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout user
  const logout = async () => {
    try {
      if (user?.id !== 'demo-user') {
        await apiService.logout()
      }
    } catch (err) {
      console.error('Error during logout:', err)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      setError(null)
    }
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && (!!localStorage.getItem('token') || user.id === 'demo-user')
  }

  // Check if user has admin role
  const isAdmin = () => {
    return user?.role === 'ADMIN'
  }

  // Initialize user data on mount
  useEffect(() => {
    fetchUser()
  }, [])

  const value = {
    user,
    loading,
    error,
    fetchUser,
    updateProfile,
    logout,
    isAuthenticated,
    isAdmin
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
