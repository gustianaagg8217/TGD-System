import api from './api'

const userService = {
  /**
   * Get all users with pagination
   */
  async getAllUsers(skip = 0, limit = 100) {
    try {
      const response = await api.get('/users', {
        params: { skip, limit },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const response = await api.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  },

  /**
   * Create new user
   */
  async createUser(userdata) {
    try {
      const response = await api.post('/users', {
        username: userdata.username || userdata.email.split('@')[0],
        email: userdata.email,
        full_name: userdata.name,
        password: 'Temp123456!', // Temporary password, user should change it
        role_id: userdata.roleId,
        is_active: userdata.status === 'active',
      })
      return response.data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  /**
   * Update user
   */
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/users/${userId}`, {
        email: userData.email,
        full_name: userData.name || userData.full_name,
        role_id: userData.roleId || userData.role_id,
        is_active: userData.status === 'active',
      })
      return response.data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      await api.delete(`/users/${userId}`)
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },

  /**
   * Get users by role
   */
  async getUsersByRole(roleId, skip = 0, limit = 100) {
    try {
      const response = await api.get(`/users/role/${roleId}`, {
        params: { skip, limit },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching users by role:', error)
      throw error
    }
  },

  /**
   * Get active users
   */
  async getActiveUsers(skip = 0, limit = 100) {
    try {
      const response = await api.get('/users/status/active', {
        params: { skip, limit },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching active users:', error)
      throw error
    }
  },
}

export default userService
