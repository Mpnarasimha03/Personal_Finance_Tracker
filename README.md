# Personal Finance Tracker

A comprehensive web application for managing personal finances, tracking expenses, income, and budgets. Built with Spring Boot backend and vanilla JavaScript frontend.

## Features

### 1. User Authentication
- Secure user registration with email and password
- Login functionality with JWT token-based authentication
- Password hashing using BCrypt
- Session management with localStorage

### 2. Expense Tracking
- Record daily expenses with amount, category, and date
- Categorize expenses (Groceries, Utilities, Entertainment, Transportation, etc.)
- Add optional descriptions for better organization
- View, edit, and delete expenses

### 3. Income Management
- Add income sources (Salary, Bonuses, Freelance earnings)
- Specify income frequency (Daily, Weekly, Monthly, etc.)
- Mark income as recurring or one-time
- Track all income transactions

### 4. Budget Management
- Set monthly budgets for different expense categories
- Visual progress bars showing spending vs budget
- Color-coded indicators (green, yellow, red) for budget status
- Real-time budget tracking

### 5. Transaction History
- Comprehensive view of all expenses and income
- Filter by type (expense/income), category, and date range
- Search functionality for finding specific transactions
- Sort transactions by date
- Edit or delete any transaction

### 6. Dashboard Analytics
- Total income and expenses for current month
- Current balance calculation
- Budget utilization percentage
- Visual statistics and progress tracking

## Technology Stack

### Backend
- **Java 17**
- **Spring Boot 3.2.1**
  - Spring Web
  - Spring Data JPA
  - Spring Security
- **MySQL Database**
- **JWT (JSON Web Tokens)** for authentication
- **Lombok** for reducing boilerplate code

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)** - Vanilla JS with modern features
  - Async/Await for API calls
  - Fetch API for HTTP requests
  - DOM manipulation
  - Event handling
  - LocalStorage for session management

## Project Structure

```
personal-finance-tracker/
├── src/
│   ├── main/
│   │   ├── java/com/finance/
│   │   │   ├── FinanceTrackerApplication.java
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── ExpenseController.java
│   │   │   │   ├── IncomeController.java
│   │   │   │   └── BudgetController.java
│   │   │   ├── model/
│   │   │   │   ├── User.java
│   │   │   │   ├── Expense.java
│   │   │   │   ├── Income.java
│   │   │   │   └── Budget.java
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── ExpenseRepository.java
│   │   │   │   ├── IncomeRepository.java
│   │   │   │   └── BudgetRepository.java
│   │   │   ├── security/
│   │   │   │   ├── JwtUtil.java
│   │   │   │   ├── JwtRequestFilter.java
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── service/
│   │   │   │   └── CustomUserDetailsService.java
│   │   │   └── dto/
│   │   │       ├── AuthRequest.java
│   │   │       ├── AuthResponse.java
│   │   │       └── RegisterRequest.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   │           ├── index.html
│   │           ├── login.html
│   │           ├── register.html
│   │           ├── transactions.html
│   │           ├── css/
│   │           │   └── style.css
│   │           └── js/
│   │               ├── auth.js
│   │               ├── login.js
│   │               ├── register.js
│   │               ├── dashboard.js
│   │               └── transactions.js
└── pom.xml
```

## Setup Instructions

### Prerequisites
- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6+
- Modern web browser

### Database Setup

1. Install MySQL and start the MySQL service

2. Create a database (or let the application create it automatically):
```sql
CREATE DATABASE finance_tracker;
```

3. Update database credentials in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/finance_tracker?createDatabaseIfNotExist=true
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Running the Application

1. Clone or navigate to the project directory:
```bash
cd personal-finance-tracker
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

4. Access the application:
- Open your browser and go to: `http://localhost:8081`
- You will be redirected to the login page
- Register a new account to get started

### Default Configuration

- **Server Port**: 8080
- **Database**: MySQL (localhost:3306)
- **JWT Token Expiration**: 24 hours
- **API Base URL**: http://localhost:8080/api

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense
- `GET /api/expenses/category/{category}` - Get expenses by category
- `GET /api/expenses/date-range` - Get expenses by date range

### Income
- `GET /api/incomes` - Get all incomes
- `POST /api/incomes` - Create new income
- `PUT /api/incomes/{id}` - Update income
- `DELETE /api/incomes/{id}` - Delete income

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget
- `GET /api/budgets/month/{month}/year/{year}` - Get budgets by month and year
- `GET /api/budgets/progress` - Get budget progress with spending

## Usage Guide

### Getting Started

1. **Register an Account**
   - Navigate to the registration page
   - Enter your full name, email, and password
   - Click "Register"

2. **Login**
   - Enter your email and password
   - Click "Login"

3. **Dashboard**
   - View your financial statistics
   - Add new expenses and income
   - Set monthly budgets
   - Monitor budget progress

4. **Transaction History**
   - View all transactions
   - Filter by type, category, or date
   - Search for specific transactions
   - Edit or delete transactions

### Adding an Expense

1. Fill in the expense form on the dashboard:
   - Amount
   - Category
   - Date
   - Description (optional)
2. Click "Add Expense"

### Setting a Budget

1. Fill in the budget form:
   - Select category
   - Enter budget amount
   - Select month and year
2. Click "Set Budget"
3. View budget progress below the form

### Managing Transactions

1. Go to "Transactions" page
2. Use filters to find specific transactions
3. Click "Edit" to modify a transaction
4. Click "Delete" to remove a transaction

## Security Features

- Password hashing with BCrypt
- JWT token-based authentication
- Secure HTTP-only sessions
- CORS configuration for API security
- SQL injection prevention through JPA
- XSS protection with proper output encoding

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

### Key JavaScript Concepts Used
- ES6+ features (arrow functions, template literals, destructuring)
- Async/Await for asynchronous operations
- Fetch API for HTTP requests
- DOM manipulation and event handling
- LocalStorage for session management
- Regular expressions for validation

### CSS Features
- CSS Grid for layouts
- Flexbox for component alignment
- CSS Variables for theming
- Responsive design with media queries
- Transitions and animations

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in application.properties
   - Verify database exists

2. **Port Already in Use**
   - Change the port in application.properties:
   ```properties
   server.port=8081
   ```

3. **JWT Token Expired**
   - Simply login again to get a new token

4. **CORS Errors**
   - Ensure you're accessing the application through localhost:8080
   - Check browser console for specific CORS errors

## Future Enhancements

- Data visualization with charts and graphs
- Export data to CSV/PDF
- Email notifications for budget alerts
- Multiple currency support
- Mobile responsive improvements
- Expense categories customization
- Recurring expense automation
- Financial reports generation

## Learning Resources

The project covers the following web development concepts:

1. **HTML** - Semantic markup, forms, tables
2. **CSS** - Grid, Flexbox, responsive design
3. **JavaScript** - ES6, async/await, DOM manipulation, Fetch API
4. **MySQL** - Database design, relationships, queries
5. **Spring Boot** - REST APIs, JPA, Security
6. **Authentication** - JWT, password hashing

## License

This project is created for educational purposes.

## Author

Personal Finance Tracker - Learning Project

---

## Support

For issues or questions, please check:
- Application logs in the console
- Browser developer tools
- MySQL error logs
- Spring Boot console output
