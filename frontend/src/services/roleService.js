/**
 * Role Service
 * Handles API calls for role management
 */

import api from './api'

class RoleService {
  /**
   * Get all roles
   */
  async getAllRoles() {
    try {
      const response = await api.get('/roles')
      return response.data
    } catch (error) {
      console.error('Error fetching roles:', error)
      throw error
    }
  }

  /**
   * Get single role by ID
   */
  async getRoleById(roleId) {
    try {
      const response = await api.get(`/roles/${roleId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching role:', error)
      throw error
    }
  }

  /**
   * Get role by name
   */
  async getRoleByName(roleName) {
    try {
      // Get all roles and find by name since backend doesn't have name-based endpoint
      const response = await api.get('/roles')
      const roles = response.data.data || response.data
      return roles.find(r => r.name === roleName)
    } catch (error) {
      console.error('Error fetching role by name:', error)
      throw error
    }
  }

  /**
   * Create new role
   */
  async createRole(roleData) {
    try {
      const response = await api.post('/roles', roleData)
      return response.data
    } catch (error) {
      console.error('Error creating role:', error)
      throw error
    }
  }

  /**
   * Update role
   */
  async updateRole(roleId, roleData) {
    try {
      const response = await api.put(`/roles/${roleId}`, roleData)
      return response.data
    } catch (error) {
      console.error('Error updating role:', error)
      throw error
    }
  }

  /**
   * Update role by name (finds ID first, then updates)
   */
  async updateRoleByName(roleName, roleData) {
    try {
      // First, get all roles to find the ID
      const allRolesResponse = await api.get('/roles')
      const roles = allRolesResponse.data.data || allRolesResponse.data
      const role = roles.find(r => r.name === roleName)
      
      if (!role || !role.id) {
        throw new Error(`Role with name "${roleName}" not found or missing ID`)
      }
      
      // Then update using the ID
      const response = await api.put(`/roles/${role.id}`, roleData)
      return response.data
    } catch (error) {
      console.error('Error updating role by name:', error)
      throw error
    }
  }

  /**
   * Delete role
   */
  async deleteRole(roleId) {
    try {
      const response = await api.delete(`/roles/${roleId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting role:', error)
      throw error
    }
  }

  /**
   * Get users in role
   */
  async getRoleUsers(roleId) {
    try {
      const response = await api.get(`/roles/${roleId}/users`)
      return response.data
    } catch (error) {
      console.error('Error fetching role users:', error)
      throw error
    }
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(roleId) {
    try {
      const response = await api.get(`/roles/${roleId}/permissions`)
      return response.data
    } catch (error) {
      console.error('Error fetching role permissions:', error)
      throw error
    }
  }

  /**
   * Update role permissions
   */
  async updateRolePermissions(roleId, permissions) {
    try {
      const response = await api.put(`/roles/${roleId}/permissions`, { permissions })
      return response.data
    } catch (error) {
      console.error('Error updating role permissions:', error)
      throw error
    }
  }
}

export default new RoleService()
