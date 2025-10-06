# USOF Backend API
## Description
Usof — a backend API for question and answer platform similar to StackOverflow. It allows users to post questions, provide answers through comments, like/dislike content, follow posts, organize content in collections, and report inappropriate content.
## Technologies Used
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **bcrypt** - Password hashing
- **express-session** - Session management
- **nodemailer** - Email notifications
- **multer** - File upload handling
## Installation and Setup
### Prerequisites
- Node.js
- MySQL server
### Installation Steps
1. **Clone the repository**
```bash
git clone <your-repo-url>
cd usof-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create database**
```bash
mysql -u root -p < usof_db.sql
```

4. **Start the server**
```bash
npm start
```

Server will run on `http://localhost:3000`

## Project Structure

```
usof-backend/
├── controllers/
│   ├── categoryController.js
│   ├── collectionController.js
│   ├── commentController.js
│   ├── followController.js
│   ├── likeController.js
│   ├── notificationController.js
│   ├── postController.js
│   ├── reportController.js
│   └── userController.js
├── models/
│   ├── categoryModel.js
│   ├── collectionModel.js
│   ├── commentModel.js
│   ├── followModel.js
│   ├── likeModel.js
│   ├── notificationModel.js
│   ├── postModel.js
│   ├── reportModel.js
│   └── userModel.js
├── middleware/
│   ├── authentication.js
│   ├── mainChecker.js
│   ├── middleChecker.js
│   └── validation.js
├── routes/
│   └── mainRouter.js
├── uploads/ (Creates automatically when app running)
├── config.json
├── db.js
├── index.js
├── package.json
└── usof_db.sql
```
## API Endpoints
### Authentication Module
#### Register New User
```http
POST /api/auth/register
Content-type: application/json
{
  "login": "test_user",
  "full_name": "Test User",
  "password": "testPassword123",
  "confirm_password": "testPassword123",
  "email": "test@example.com"
}
```
**Response:** 201 Created
```json
{
  "message": "User registered. Please confirm your email."
}
```
**Algorithm:**
1. Validate input data
2. Check if login/email already exists
3. Hash password with bcrypt
4. Generate email confirmation token
5. Save user to database with `email_confirmed: false`
6. Send confirmation email with token
7. Return success message
---
#### Confirm Email
```http
GET /api/auth/confirm-email?token={confirmation_token}
```
**Response:** 200 OK
```json
{
  "message": "Email confirmed successfully."
}
```
**Algorithm:**
1. Check if token given
2. Find user by token
3. Set `email_confirmed: true`
4. Return success message
---
#### Send Email Token Again
```http
POST /auth/send-email-token-again
Content-type: application/json
{
  "email": "test@example.com"
}
```
**Response** 200 OK
```json
{
  "message": "Confirmation send again"
}
```
**Algorithm:**
1. Find user by email
2. Check if user haven't already confirmed this email
3. Generate new email confirmation token
4. Send confirmation email with token
5. Return success message
---
#### Login
```http
POST /api/auth/login
Content-Type: application/json
{
  "login": "test_user",
  "password": "testPassword123"
}
OR
{
  "email": "test@example.com",
  "password": "testPassword123"
}
```
**Response:** 200 OK
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "login": "test_user",
    "full_name": "Test User",
    "role": "user"
  }
}
```
**Algorithm:**
1. Find user by login or email
2. Compare password with hashed password
3. Check if email is confirmed
4. Create session with user data
5. Return user information
---
#### Password Reset Request
```http
POST /api/auth/reset-password-request
Content-Type: application/json
{
  "email": "john@example.com"
}
```
Then go to the link given via email and take token from there:
```
GET /auth/reset-password?token={password_reset_token}
```
**Response** 200 OK
```json
{
  "message": "Put this request: /auth/reset-password and put this token in this request"
  "token": "abc123"
}
```
Then make this request:
```
POST /api/auth/reset-password
Content-Type: application/json
{
  "token": "abc123",
  "password": "newtestPassword123",
  "confirm-password": "newtestPassword123"
}
```
**Response:** 200 OK
```json
{
  "message": "Password has been reset successfully."
}
```
**Algorithm:**
1. Find user by email
2. Generate reset token
3. Set token expiration (10 minutes)
4. Save token to database
5. Send reset link via email
6. Return success message
**Alogithm of next POST**
1. Check if token is not expired
2. Find user by reset token
3. Hash password with bcrypt
4. Save new password to the database
5. Return success message
---
#### Logout
```http
POST /api/auth/logout
Authorization: Session cookie required
```
**Response:** 200 OK
```json
{
  "message": "Logout successful."
}
```
**Algorithm:**
1. Check if user is logged in
2. Destroy session
3. Return success message
---
### User Module
#### Get All Users
```http
GET /api/users
```
**Response:** 200 OK
```json
{
  "users": [
    {
      "id": 1,
      "login": "test_user",
      "full_name": "Test User",
      "email": "test@example.com",
      "profile_picture": "uploads/default_profile.png",
      "rating": 25,
      "role": "user",
      "created_at": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```
**Algorithm:**
1. Return array of users
---
#### Get Specific User
```http
GET /api/users/:user_id
```
**Response:** 200 OK
```json
{
  "user": {
    "id": 1,
    "login": "test_user",
    "full_name": "Test User",
    "email": "test@example.com",
    "profile_picture": "default_avatar.png",
    "rating": 25,
    "role": "user",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}
```
**Algorithm:**
1. Check if user with given id exists
2. Return user
---
#### Create User (Admin only)
```http
POST /api/users
Content-Type: application/json
Authorization: Session cookie required
{
  "login": "newadmin",
  "full_name": "New Admin",
  "password": "Admin123",
  "email": "newadmin@usof.com",
  "role": "admin"
}
```
**Response:** 200 OK
```json
{
  "message": "User created successfully",
  "user": {
    "id": 2,
    "login": "newadmin",
    "full_name": "New Admin",
    "email": "newadmin@usof.com",
    "email_confirmed": true,
    "profile_picture": "uploads/default_profile.png",
    "rating": 0,
    "role": "admin",
    "created_at": "2025-10-07T10:30:00.000Z"
  }
}
```
**Algorithm:**
1. Check if user logged in and has admin privileges
2. Validate input data
3. Check if login/email already exists
4. Hash password with bcrypt
5. Return success message
---
#### Upload Avatar
```http
PATCH /api/users/avatar
Content-Type: multipart/form-data
Authorization: Session cookie required
avatar: [file]
```
**Response:** 200 OK
```json
{
  "message": "Avatar updated successfully",
  "path": "uploads/avatar-123321.jpg"
}
```
**Algorithm:**
1. Check if user is logged in
2. Validate file
3. Save file to uploads directory
4. Update user's profile_picture path in database
5. Return success with file path
---
#### Get User Avatar
```http
GET /api/profile/avatar/:id
```
**Response:** 200 OK
```json
{
  "imagePath": "uploads/avatar-123321.jpg"
}
```
**Algorithm:**
1. Check if user with given id exists
2. Return success with file path
---
#### Update user
```http
PATCH /api/users/:user_id
Content-Type: application/json
Authorization: Session cookie required
{
  "full_name": "Updated Name",
  "email": "updated@example.com"
}
```
**Response:** 200 OK
```json
{
  "message": "User updated successfully. Please confirm your new email address if you changed it."
  "user": {
    "id": 3,
    "login": "test_user",
    "full_name": "Updated Name",
    "email": "updated@example.com",
    "email_confirmed": false,
    "profile_picture": "uploads/avatar-123124.png",
    "rating": 3,
    "role": "user",
    "created_at": "2025-10-07T10:30:00.000Z"
  }
}
```
**Algorithm:**
1. Check if logged in, and if given user exists
2. Check if they owner of account we want to update or if they have admin privileges
3. If `email` is being changed generate email confirmation token and add to updated fields
4. If `email_confirmation_token` in the updated fields: Send email confirmation link with token
5. Save updated fields in the database
6. Return success with updated user
---
#### Update User Role (Admin only)
```http
PATCH /api/users/:user_id/role
Content-Type: application/json
Authorization: Session cookie required
{
  "role": "admin"
}
```
**Response:** 200 OK
```json
{
  "message": "User role updated successfully."
}
```
**Algorithm**
1. Check if user logged in
2. Validate data
3. Check if user with given id exists
4. Update user role
5. Return success message
---
#### Delete User (Admin only)
```http
DELETE /api/users/:user_id
Authorization: Session cookie required
```
**Response:** 200 OK
```json
{
  "message": "User deleted successfully."
}
```
**Algorithm:**
1. Check if user logged in and has admin privileges
2. Check if user with given id exists
3. Delete user from database
4. Return success message
---
