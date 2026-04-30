# API Updates Summary - Complete Password Integration

## Changes Made

### 1. **Fixed Route Conflicts in Router.js**

#### Before:
- `/v1/getUser` - conflicted (Register form vs TaskRegisterController)
- `/v1/updateUser` - conflicted (Register form vs TaskRegisterController)
- `/v1/deleteUser` - conflicted (Register form vs TaskRegisterController)

#### After:
```javascript
// Signup/Registration Routes
POST   /v1/signup           → Register new user
GET    /v1/getRegisterUsers → Get registered users
PATCH  /v1/updateRegisterUser/:id → Update registered user
PATCH  /v1/deleteRegisterUser/:id → Delete registered user

// User Management Routes (Task-Input Module)
POST   /v1/addTaskUser        → Add user with password ✅ NOW WITH PASSWORD HASHING
GET    /v1/gettaskUser        → Get users with permissions
PATCH  /v1/updatetaskUser/:id → Update user with password ✅ NOW WITH PASSWORD HASHING
PATCH  /v1/deletetaskUser/:id → Delete user

// User Management Routes (Userr-Input Module)
POST   /v1/addTask            → Add user with password ✅ NOW WITH PASSWORD HASHING
GET    /v1/getTask            → Get users with permissions
PATCH  /v1/updateTask/:id     → Update user with password ✅ NOW WITH PASSWORD HASHING
PATCH  /v1/deleteTask/:id     → Delete user
```

---

## 2. **Backend Changes - Password Hashing Integration**

### A. **UserTaskmodel.js** (task-Input module)
```javascript
// Now accepts registerPassword parameter
const Addmodel = (userName, email, userRole, projects, registerPassword) => {
  // Inserts registerPassword into userList table
}

const Updatemodel = (userName, email, userRole, projects, userId, registerPassword = null) => {
  // Updates registerPassword only if provided
}
```

### B. **UserTaskservice.js** (task-Input module)
```javascript
// Now hashes passwords with bcrypt (10 salt rounds)
const Addservice = async (addData) => {
  let hashedPassword = null
  if (addData.registerPassword) {
    hashedPassword = await bcrypt.hash(addData.registerPassword, 10)
  }
  // Passes hashed password to model
}

const Updateservice = async (updatedatas) => {
  // Same hashing logic for updates
}
```

### C. **Taskmodel.js** (Userr-Input module)
```javascript
// Same password handling as UserTaskmodel
const Addmodel = (userName, email, userRole, projects, registerPassword) => { }
const Updatemodel = (userName, email, userRole, projects, userId, registerPassword = null) => { }
```

### D. **Taskservice.js** (Userr-Input module)
```javascript
// Same bcrypt hashing logic as UserTaskservice
const Addservice = async (addData) => { }
const Updateservice = async (updatedatas) => { }
```

---

## 3. **API Request/Response Format**

### Add User (with password hashing) ✅
```json
// REQUEST: POST /v1/addTaskUser
{
  "userName": "john_doe",
  "email": "john@example.com",
  "userRole": "Admin",
  "projects": "Website UI",
  "registerPassword": "SecurePass123",  // ❌ Plain text - will be hashed
  "permissions": [
    {
      "menu": "View Dashboard",
      "read": true,
      "write": true,
      "fullAccess": true
    }
  ]
}

// RESPONSE: 200 OK
{
  "message": "User added successfully",
  "data": {
    "fieldCount": 0,
    "affectedRows": 1,
    "insertId": 17,
    "serverStatus": 2,
    "warningCount": 0,
    "message": "",
    "protocol41": true,
    "changedRows": 0
  }
}
```

### Update User (with optional password change)
```json
// REQUEST: PATCH /v1/updatetaskUser/:id
{
  "userId": 17,
  "userName": "john_updated",
  "email": "john.updated@example.com",
  "userRole": "Manager",
  "projects": "API Development",
  "registerPassword": "NewSecurePass456",  // ❌ Optional - if provided, will be hashed
  "permissions": [
    {
      "menu": "View Dashboard",
      "read": true,
      "write": false,
      "fullAccess": false
    }
  ]
}

// RESPONSE
{
  "user": { "affectedRows": 1, ... },
  "permissions": { ...permission update result },
  "message": "User and permissions updated successfully"
}
```

### Get Users (with permissions)
```json
// REQUEST: GET /v1/gettaskUser

// RESPONSE: 200 OK
{
  "message": "Users retrieved successfully",
  "value": [
    {
      "userId": 17,
      "userName": "john_doe",
      "email": "john@example.com",
      "userRole": "Admin",
      "projects": "Website UI",
      "permissions": [
        {
          "menuName": "View Dashboard",
          "canRead": 1,
          "canWrite": 1,
          "canDelete": 1
        }
      ]
    }
  ]
}
```

---

## 4. **Database Structure**

### userList Table Requirements
```sql
CREATE TABLE userList (
  userId INT PRIMARY KEY AUTO_INCREMENT,
  userName VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  userRole VARCHAR(50),
  projects VARCHAR(100),
  registerPassword VARCHAR(255),  -- ✅ For hashed passwords
  deletedata INT DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Note:** If your `userList` table doesn't have the `registerPassword` column, add it:
```sql
ALTER TABLE userList ADD COLUMN registerPassword VARCHAR(255);
```

---

## 5. **Frontend Components Need Update**

### UserFormComponent.ts
Currently missing password field. Should add:
```typescript
formUser = {
  name: '',
  email: '',
  role: '',
  projects: '',
  registerPassword: '',      // ❌ ADD THIS
  confirmPassword: ''        // ❌ ADD THIS
}

// Add validation methods
validatePassword() {
  // Check 6-20 chars, uppercase, lowercase, number
}

validateConfirmPassword() {
  // Check matches registerPassword
}
```

### Register.ts (Already has password validation)
✅ Already correctly implemented with:
- Password strength validation
- Uppercase, lowercase, number requirements
- 6-20 character length

No changes needed for registration form.

---

## 6. **Deprecated Routes (Removed)**

```javascript
// ❌ NO LONGER USE THESE:
POST   /v1/addRegsiter
GET    /v1/getUser (from TaskRegisterController)
PATCH  /v1/updateUser (from TaskRegisterController)
PATCH  /v1/deleteUser (from TaskRegisterController)

// ✅ USE THESE INSTEAD:
POST   /v1/signup              (for new user registration)
POST   /v1/addTaskUser         (for user management with password)
GET    /v1/getRegisterUsers    (for listing registered users)
GET    /v1/gettaskUser         (for listing managed users with permissions)
```

---

## 7. **Key Improvements**

✅ **Password Security**: All passwords are hashed with bcrypt (10 rounds) before storage
✅ **No Duplicate Routes**: Fixed conflicting routes in `/v1/getUser`, `/v1/updateUser`, `/v1/deleteUser`
✅ **Consistent Implementation**: Both user management modules (task-Input and Userr-Input) support password hashing
✅ **Permission Integration**: Users can be created with permissions in a single request
✅ **Optional Password Update**: Can update user without changing password if field not provided
✅ **Backend Validation**: Comprehensive logging for debugging

---

## 8. **Testing Checklist**

- [ ] Database: `userList` table has `registerPassword` column
- [ ] Backend: `npm run dev` starts successfully
- [ ] Register: POST /v1/signup works with password hashing
- [ ] Add User: POST /v1/addTaskUser creates user with hashed password
- [ ] Update User: PATCH /v1/updatetaskUser/:id can change password
- [ ] Get Users: GET /v1/gettaskUser returns users with permissions
- [ ] Login: POST /v1/login successfully validates hashed passwords
- [ ] Frontend: UserFormComponent includes password field (needs update)

---

## 9. **Next Steps**

1. **Update Frontend Components** - Add password field to UserFormComponent
2. **Test API Endpoints** - Verify all routes with password hashing work
3. **Update Frontend Service** - Ensure TaskService calls use new route paths
4. **Database Migration** - Add `registerPassword` column if it doesn't exist
5. **User Migration** - Hash existing plaintext passwords in database (optional but recommended)

---

**Last Updated:** April 16, 2026
**Status:** Ready for Testing ✅
