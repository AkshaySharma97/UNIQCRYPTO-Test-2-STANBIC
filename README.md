 Stanbic Authentication System (SAS)

 Overview
This project is an authentication system for Stanbic Bank that supports user registration, OTP verification, Multi-Factor Authentication (MFA), and role-based access control (RBAC).

 Features
- User registration via Telegram & WhatsApp
- OTP-based authentication
- Role-based access control (RBAC)
- Secure session management with JWT tokens
- Logging & request rate limiting
- API documentation with Swagger

 Setup Instructions

 1. Clone the Repository & Setup Database (from file stanbic_auth.sql)

    git clone https://github.com/AkshaySharma97/UNIQCRYPTO-Test-2-STANBIC.git

 2. Install Dependencies for mock ui and backend
npm install

 3. Set Up Environment Variables
Create a `.env` or xopy from example env file in the root directory and add the following:

PORT=5000
DATABASE_URL=mysql://username:password@localhost:3306/db_name
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h

 4. Start the Server
npm start

The API will run on `http://localhost:5000`
The Mock UI will run on `http://localhost:3000`

 API Documentation (Swagger)
After starting the server, visit:
http://localhost:5000/api-docs
to view the API documentation.


 API Endpoints

 Authentication
| Method | Endpoint                | Description |
|--------|-------------------------|-------------|
| POST   | `/api/auth/register`    | Register a new user |
| POST   | `/api/auth/verify-otp`  | Verify OTP for registration |
| POST   | `/api/auth/login`       | Login with passcode |
| POST   | `/api/auth/send-mfa-otp` | Send MFA OTP |
| POST   | `/api/auth/verify-mfa-otp` | Verify MFA OTP |
| POST   | `/api/auth/refresh-token` | Refresh authentication token |
| POST   | `/api/auth/logout` | Logout user |
| GET    | `/api/auth/me` | Get logged-in user details |

 Admin
| Method | Endpoint                | Description |
|--------|-------------------------|-------------|
| GET    | `/api/auth/dashboard` | Fetch admin dashboard (Admin only) |


 Contributing
Feel free to submit issues or feature requests. Contributions are welcome!
