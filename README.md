<h1 align="center">💰 Expensia - Personal Finance Manager</h1>

<p align="center">
  <strong>A modern full-stack expense tracking application for managing your personal finances</strong>
</p>

<p align="center">
  <img alt="Spring Boot" src="https://img.shields.io/badge/Spring%20Boot%203.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
  <img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">
</p>

---

## 📑 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Screenshots](#screenshots)

---

## 📖 About

Expensia is a comprehensive expense tracking web application designed to help users manage their day-to-day finances efficiently. Built with modern technologies, it offers a seamless experience for tracking income, expenses, budgets, and financial insights through intuitive dashboards and visualizations.

### Key Highlights

- **Multi-role System**: Separate interfaces for regular users and administrators
- **Secure Authentication**: JWT-based authentication with email verification
- **Real-time Insights**: Interactive charts and statistics for financial tracking
- **Budget Management**: Set and track category-wise budgets with alerts
- **Account Tracking**: Manage multiple accounts (bank, cash, credit card)
- **Responsive Design**: Modern UI built with Shadcn/UI and TailwindCSS

---

## ✨ Features

### For Users
- 📊 **Dashboard**: Visual overview of income, expenses, and financial health
- 💳 **Transaction Management**: Add, edit, delete transactions with search and filters
- 💰 **Budget Tracking**: Set monthly budgets per category with progress tracking
- 📈 **Statistics**: Monthly trends and category-wise expense breakdowns
- 🏦 **Multiple Accounts**: Track balances across different accounts
- 🔄 **Saved Transactions**: Create recurring transaction templates
- ⚙️ **User Settings**: Customize currency, timezone, and profile

### For Administrators
- 👥 **User Management**: View and manage all registered users
- 📁 **Category Management**: Create and manage expense/income categories
- 📊 **System Overview**: Monitor platform usage and statistics
- 🔧 **System Settings**: Configure application-wide settings

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.2
- **Security**: Spring Security + JWT
- **Database**: MySQL 8.0
- **ORM**: Hibernate/JPA
- **Build Tool**: Maven
- **Java Version**: 21

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn/UI
- **Charts**: Recharts
- **HTTP Client**: Axios
- **State Management**: React Hooks + Context API

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK) 21** or higher
  - [Download JDK](https://www.oracle.com/java/technologies/downloads/)
  - Verify: `java -version`

- **Node.js 18+** and **npm**
  - [Download Node.js](https://nodejs.org/)
  - Verify: `node -v` and `npm -v`

- **MySQL 8.0+**
  - [Download MySQL](https://dev.mysql.com/downloads/)
  - Verify: `mysql --version`

- **Maven** (or use included wrapper)
  - Verify: `mvn -version`

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/Fullstack-Expense-Tracker.git
cd Fullstack-Expense-Tracker
```

### 2️⃣ Database Setup

Create a MySQL database for the application:

```sql
CREATE DATABASE expensia_db;
```

### 3️⃣ Backend Configuration

Navigate to the backend directory and configure the application:

```bash
cd backend
```

Create or edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/expensia_db
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.jpa.hibernate.ddl-auto=update

# Email Configuration (for verification emails)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_APP_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# JWT Configuration
app.jwtSecret=YOUR_SECRET_KEY_MINIMUM_256_BITS
app.jwtExpirationMs=86400000

# Application Settings
server.port=8080
app.frontend.url=http://localhost:3000
```

> **Note**: For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

### 4️⃣ Run the Backend

Using Maven wrapper (recommended):

```bash
./mvnw spring-boot:run
```

Or using Maven:

```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

**Database tables will be created automatically** on first run. The application will seed:
- Default transaction types (INCOME, EXPENSE)
- Default admin role
- Sample expense/income categories

### 5️⃣ Frontend Configuration

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/expensia
```

### 6️⃣ Run the Frontend

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

---

## ⚙️ Configuration

### Creating an Admin Account

After the first run, you can create an admin account in two ways:

**Option 1: Through Sign Up (Recommended)**
1. Sign up as a regular user through the UI
2. Verify your email
3. Manually update the user's role in the database:

```sql
INSERT INTO user_roles (user_id, role_id) 
VALUES (
  (SELECT user_id FROM users WHERE email = 'admin@example.com'),
  (SELECT role_id FROM roles WHERE role_name = 'ROLE_ADMIN')
);
```

**Option 2: Direct Database Insert**
Insert directly into the database with an encoded password:

```sql
INSERT INTO users (username, email, password, enabled) 
VALUES ('admin', 'admin@example.com', '$2a$10$encodedPasswordHash', true);
```

### Adding Categories

The application comes with default categories, but you can add custom ones:

1. Log in as admin
2. Navigate to Admin Dashboard → Categories
3. Add income/expense categories as needed

---

## 📸 Screenshots

> **Note**: Screenshots will be added soon.

<!-- 
### Landing Page
![Landing Page](YOUR_LANDING_PAGE_SCREENSHOT_URL_HERE)

### Authentication
![Login Page](YOUR_LOGIN_PAGE_SCREENSHOT_URL_HERE)
![Signup Page](YOUR_SIGNUP_PAGE_SCREENSHOT_URL_HERE)
![Email Verification](YOUR_EMAIL_VERIFICATION_SCREENSHOT_URL_HERE)

### User Dashboard & Features
![Dashboard Overview](YOUR_DASHBOARD_SCREENSHOT_URL_HERE)
![Transactions Page](YOUR_TRANSACTIONS_PAGE_SCREENSHOT_URL_HERE)
![Accounts Management](YOUR_ACCOUNTS_PAGE_SCREENSHOT_URL_HERE)
![Budget Tracking](YOUR_BUDGETS_PAGE_SCREENSHOT_URL_HERE)
![Statistics & Analytics](YOUR_STATISTICS_PAGE_SCREENSHOT_URL_HERE)
![Saved Transactions](YOUR_SAVED_TRANSACTIONS_SCREENSHOT_URL_HERE)
![User Settings](YOUR_SETTINGS_PAGE_SCREENSHOT_URL_HERE)

### Admin Panel
![Admin Dashboard](YOUR_ADMIN_DASHBOARD_SCREENSHOT_URL_HERE)
![User Management](YOUR_USER_MANAGEMENT_SCREENSHOT_URL_HERE)
![Category Management](YOUR_CATEGORY_MANAGEMENT_SCREENSHOT_URL_HERE)
![Admin Settings](YOUR_ADMIN_SETTINGS_SCREENSHOT_URL_HERE)
-->

---

## 🔧 Troubleshooting

### Backend Issues

**Port 8080 already in use:**
```bash
# Change port in application.properties
server.port=8081
```

**Database connection failed:**
- Verify MySQL is running: `sudo systemctl status mysql` (Linux) or check Services (Windows)
- Confirm credentials in `application.properties`
- Ensure database exists: `CREATE DATABASE expensia_db;`

### Frontend Issues

**Port 3000 already in use:**
```bash
# Next.js will automatically suggest port 3001
# Or specify manually: npm run dev -- -p 3001
```

**API connection errors:**
- Verify backend is running on `http://localhost:8080`
- Check `.env.local` has correct API URL
- Verify CORS settings in backend

---

## 📝 Additional Commands

### Backend

```bash
# Build the application
./mvnw clean package

# Run tests
./mvnw test

# Build without tests
./mvnw clean package -DskipTests
```

### Frontend

```bash
# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Type check
npm run type-check
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built with ❤️ by developers for better financial management
