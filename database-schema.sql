-- Personal Finance Tracker Database Schema
-- MySQL Database

-- Create Database
CREATE DATABASE IF NOT EXISTS finance_tracker;
USE finance_tracker;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_transaction_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Incomes Table
CREATE TABLE IF NOT EXISTS incomes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    source VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    frequency VARCHAR(50) NOT NULL,
    transaction_date DATE NOT NULL,
    recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    budget_amount DECIMAL(10, 2) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_month_year (month, year),
    UNIQUE KEY unique_user_category_month_year (user_id, category, month, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;





-- Monthly expense summary view
CREATE OR REPLACE VIEW monthly_expense_summary AS
SELECT
    u.id as user_id,
    u.full_name,
    YEAR(e.transaction_date) as year,
    MONTH(e.transaction_date) as month,
    e.category,
    SUM(e.amount) as total_amount,
    COUNT(*) as transaction_count
FROM users u
JOIN expenses e ON u.id = e.user_id
GROUP BY u.id, u.full_name, YEAR(e.transaction_date), MONTH(e.transaction_date), e.category;

-- Monthly income summary view
CREATE OR REPLACE VIEW monthly_income_summary AS
SELECT
    u.id as user_id,
    u.full_name,
    YEAR(i.transaction_date) as year,
    MONTH(i.transaction_date) as month,
    i.source,
    SUM(i.amount) as total_amount,
    COUNT(*) as transaction_count
FROM users u
JOIN incomes i ON u.id = i.user_id
GROUP BY u.id, u.full_name, YEAR(i.transaction_date), MONTH(i.transaction_date), i.source;

-- Budget vs Actual spending view
CREATE OR REPLACE VIEW budget_vs_actual AS
SELECT
    b.user_id,
    b.month,
    b.year,
    b.category,
    b.budget_amount,
    COALESCE(SUM(e.amount), 0) as actual_spending,
    (b.budget_amount - COALESCE(SUM(e.amount), 0)) as remaining,
    CASE
        WHEN b.budget_amount > 0 THEN (COALESCE(SUM(e.amount), 0) / b.budget_amount * 100)
        ELSE 0
    END as percentage_used
FROM budgets b
LEFT JOIN expenses e ON
    b.user_id = e.user_id
    AND b.category = e.category
    AND MONTH(e.transaction_date) = b.month
    AND YEAR(e.transaction_date) = b.year
GROUP BY b.id, b.user_id, b.month, b.year, b.category, b.budget_amount;

-- Stored Procedures (Optional)

DELIMITER //

-- Procedure to get user's financial summary for a specific month
CREATE PROCEDURE GetMonthlyFinancialSummary(
    IN p_user_id BIGINT,
    IN p_month INT,
    IN p_year INT
)
BEGIN
    SELECT
        'Income' as type,
        SUM(amount) as total
    FROM incomes
    WHERE user_id = p_user_id
        AND MONTH(transaction_date) = p_month
        AND YEAR(transaction_date) = p_year

    UNION ALL

    SELECT
        'Expense' as type,
        SUM(amount) as total
    FROM expenses
    WHERE user_id = p_user_id
        AND MONTH(transaction_date) = p_month
        AND YEAR(transaction_date) = p_year;
END //

DELIMITER ;

