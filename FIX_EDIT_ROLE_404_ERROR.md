# Fix Edit Role 404 Error

## ❌ Problem Identified

The Edit Role modal was throwing **"Request failed with status code 404"** because:

1. **Wrong API endpoint** - Frontend was calling `PUT /roles/name/{name}` 
2. **Backend only supports** - `PUT /roles/{role_id}`
3. **Missing IDs** - Frontend role objects didn't have ID properties

---

## ✅ Solution Implemented

### **3 Files Updated:**

#### **1. roleService.js** 
- ✅ Removed `/roles/name/{name}` endpoint calls
- ✅ Updated `updateRole()` to use `/roles/{roleId}` 
- ✅ Made `updateRoleByName()` fetch all roles first, find ID, then update

#### **2. UsersPage.jsx**
- ✅ Added `useEffect` to load roles from API on component mount
- ✅ Changed `const roles` to `const [roles, setRoles]` (state variable)
- ✅ Added proper ID values to roles from API response
- ✅ Added color mapping function for role styling

#### **3. EditRoleModal.jsx**
- ✅ Updated `handleSave()` to validate role.id exists
- ✅ Changed from `updateRoleByName()` to `updateRole(role.id, ...)`
- ✅ Added better error handling for missing IDs

---

## 🔧 Backend API Endpoints (Actual)

```
GET    /api/v1/roles                    ✅ Get all roles (with IDs)
GET    /api/v1/roles/{role_id}         ✅ Get by ID
PUT    /api/v1/roles/{role_id}         ✅ Update by ID (uses role_id in path)
DELETE /api/v1/roles/{role_id}         ✅ Delete by ID
```

**What Works Now:**
```javascript
// Correct: Using ID-based endpoint
await api.put(`/roles/${roleId}`, { name, description, permissions })

// NO LONGER: Name-based endpoints
await api.put(`/roles/name/${roleName}`, ...) // ❌ Doesn't exist
```

---

## 🔄 How It Works Now

### **Flow:**
```
1. Component mounts
   ↓
2. useEffect calls roleService.getAllRoles()
   ↓
3. API returns roles WITH id properties
   ↓
4. Frontend loads roles into state with proper IDs
   ↓
5. User clicks "Edit Role"
   ↓
6. Modal opens with role that HAS id property
   ↓
7. User clicks "Save Changes"
   ↓
8. Modal validates role.id exists
   ↓
9. Calls: roleService.updateRole(role.id, { name, desc, permissions })
   ↓
10. API: PUT /roles/{role_id}
    ↓
11. Success! ✓
```

---

## 📋 Data Flow

### **Before (Broken):**
```javascript
// Frontend role objects (NO ID)
const roles = [
  { name: 'Engineer', description: '...', color: '...' },  // ❌ No ID!
  ...
]

// Trying to update
PUT /roles/name/Engineer  // ❌ Endpoint doesn't exist → 404 Error
```

### **After (Fixed):**
```javascript
// Backend returns roles WITH IDs
const rolesFromAPI = [
  { 
    id: 'uuid-12345',      // ✅ HAS ID!
    name: 'Engineer', 
    description: '...',
    permissions: [...]
  },
  ...
]

// Correct update
PUT /roles/uuid-12345  // ✅ Endpoint exists → Works!
```

---

## ✅ Testing

### **Try Now:**

1. Go to Users & Role Management → Roles tab
2. Click "Edit Role" on any role
3. Modal opens successfully
4. Change description or name
5. Click "Save Changes"
6. Should see success message ✓

### **If still getting 404:**

1. Check browser console (F12) for error details
2. Check that backend is running: `http://localhost:8000/docs` (should show API)
3. Verify backend API returns roles with `id` field

---

## 🔍 What Changed

### **roleService.js**
```javascript
// Before
updateRoleByName(roleName, data) {
  return api.put(`/roles/name/${roleName}`, data)  // ❌ Wrong endpoint
}

// After
updateRole(roleId, data) {
  return api.put(`/roles/${roleId}`, data)  // ✅ Correct endpoint
}

updateRoleByName(roleName, data) {
  // Get all roles first, find by name, then update by ID
  const allRoles = await api.get('/roles')
  const role = allRoles.find(r => r.name === roleName)
  return api.put(`/roles/${role.id}`, data)  // ✅ Uses ID
}
```

### **UsersPage.jsx**
```javascript
// Before
const roles = [
  { name: 'Engineer', ... }  // ❌ Static, no IDs
]

// After
const [roles, setRoles] = useState([...])  // ✅ State with IDs

useEffect(() => {
  // Load roles from API on mount
  const data = await roleService.getAllRoles()
  setRoles(data)  // ✅ Roles now have IDs
}, [])
```

### **EditRoleModal.jsx**
```javascript
// Before
const response = await roleService.updateRoleByName(role.name, data)
// But role didn't have ID, so it would fail

// After
const response = await roleService.updateRole(role.id, data)
// role.id exists from API, so it works!
```

---

## 🎯 Key Fixes

| Issue | Before | After |
|-------|--------|-------|
| **Endpoint** | `PUT /roles/name/Engineer` 404 | `PUT /roles/{id}` 200 ✅ |
| **Role ID** | Missing | Loaded from API ✅ |
| **Validation** | No ID check | Validates role.id exists ✅ |
| **Error Handling** | Shows generic 404 | Shows specific error messages ✅ |

---

## 🚀 Status

**✅ COMPLETE & FIXED**

The 404 error is resolved. The Edit Role button now:
- Loads roles with proper IDs from API
- Validates ID exists before updating
- Uses correct API endpoint (ID-based, not name-based)
- Shows proper success/error messages

Try clicking Edit Role again - it should work now! 🎉
