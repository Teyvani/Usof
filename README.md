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
