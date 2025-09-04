# SQL Interview Guide - 40+ Essential Questions for SDE Roles (IBM, Google, Microsoft, Amazon)

## 🔥 MOST IMPORTANT TOPICS FOR SDE INTERVIEWS
- **Basic SQL Operations** (Questions 1-10)
- **Joins & Relationships** (Questions 11-18)
- **Aggregate Functions & GROUP BY** (Questions 19-25)
- **Advanced Queries & Optimization** (Questions 26-35)
- **Database Design & Normalization** (Questions 36-40)
- **Real Interview Scenarios** (10 Advanced Scenarios)

---

## Basic SQL Operations

### 1. What is SQL? Types of SQL Commands? ⭐⭐⭐
- **SQL:** Structured Query Language for managing databases
- **DDL:** CREATE, ALTER, DROP (Data Definition)
- **DML:** INSERT, UPDATE, DELETE (Data Manipulation)
- **DQL:** SELECT (Data Query)
- **DCL:** GRANT, REVOKE (Data Control)

### 2. Primary Key vs Foreign Key? ⭐⭐⭐
- **Primary Key:** Unique identifier, cannot be NULL
- **Foreign Key:** References primary key of another table
- **Primary Key:** One per table, ensures entity integrity
- **Foreign Key:** Multiple allowed, ensures referential integrity

### 3. SELECT Statement Syntax? ⭐⭐⭐
```sql
SELECT column1, column2
FROM table_name
WHERE condition
GROUP BY column
HAVING condition
ORDER BY column ASC/DESC
LIMIT number;
```

### 4. WHERE vs HAVING Clause? ⭐⭐⭐
- **WHERE:** Filters rows before grouping
- **HAVING:** Filters groups after GROUP BY
- **WHERE:** Cannot use aggregate functions
- **HAVING:** Can use aggregate functions

```sql
-- WHERE example
SELECT * FROM employees WHERE salary > 50000;

-- HAVING example
SELECT department, AVG(salary)
FROM employees
GROUP BY department
HAVING AVG(salary) > 60000;
```

### 5. DISTINCT Keyword? ⭐⭐⭐
```sql
-- Remove duplicate values
SELECT DISTINCT department FROM employees;

-- Count unique values
SELECT COUNT(DISTINCT department) FROM employees;
```

### 6. ORDER BY Clause? ⭐⭐⭐
```sql
-- Single column
SELECT * FROM employees ORDER BY salary DESC;

-- Multiple columns
SELECT * FROM employees 
ORDER BY department ASC, salary DESC;

-- Using column position
SELECT name, salary FROM employees ORDER BY 2 DESC;
```

### 7. LIMIT vs TOP? ⭐⭐
```sql
-- MySQL/PostgreSQL
SELECT * FROM employees ORDER BY salary DESC LIMIT 5;

-- SQL Server
SELECT TOP 5 * FROM employees ORDER BY salary DESC;

-- Oracle
SELECT * FROM employees WHERE ROWNUM <= 5;
```

### 8. NULL Values? IS NULL vs IS NOT NULL? ⭐⭐⭐
```sql
-- Check for NULL values
SELECT * FROM employees WHERE phone IS NULL;

-- Check for non-NULL values
SELECT * FROM employees WHERE phone IS NOT NULL;

-- NULL in calculations
SELECT name, salary, salary * 12 AS annual_salary
FROM employees;
-- If salary is NULL, annual_salary will be NULL
```

### 9. LIKE Operator & Wildcards? ⭐⭐⭐
```sql
-- % matches any sequence of characters
SELECT * FROM employees WHERE name LIKE 'John%';

-- _ matches single character
SELECT * FROM employees WHERE name LIKE 'J_hn';

-- Case insensitive search
SELECT * FROM employees WHERE LOWER(name) LIKE '%smith%';
```

### 10. IN vs EXISTS? ⭐⭐⭐
```sql
-- IN operator
SELECT * FROM employees 
WHERE department_id IN (1, 2, 3);

-- EXISTS operator
SELECT * FROM employees e
WHERE EXISTS (
    SELECT 1 FROM departments d 
    WHERE d.id = e.department_id
);
```

---

## Joins & Relationships

### 11. Types of JOINs? ⭐⭐⭐
- **INNER JOIN:** Returns matching records from both tables
- **LEFT JOIN:** All records from left table + matching from right
- **RIGHT JOIN:** All records from right table + matching from left
- **FULL OUTER JOIN:** All records from both tables

### 12. INNER JOIN Example? ⭐⭐⭐
```sql
SELECT e.name, d.department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.id;

-- Only returns employees who have a department
```

### 13. LEFT JOIN vs RIGHT JOIN? ⭐⭐⭐
```sql
-- LEFT JOIN - All employees, even without department
SELECT e.name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id;

-- RIGHT JOIN - All departments, even without employees
SELECT e.name, d.department_name
FROM employees e
RIGHT JOIN departments d ON e.department_id = d.id;
```

### 14. FULL OUTER JOIN? ⭐⭐
```sql
-- All employees and all departments
SELECT e.name, d.department_name
FROM employees e
FULL OUTER JOIN departments d ON e.department_id = d.id;
```

### 15. Self JOIN? ⭐⭐⭐
```sql
-- Find employees and their managers
SELECT e1.name AS employee, e2.name AS manager
FROM employees e1
LEFT JOIN employees e2 ON e1.manager_id = e2.id;
```

### 16. Cross JOIN? ⭐⭐
```sql
-- Cartesian product of two tables
SELECT e.name, d.department_name
FROM employees e
CROSS JOIN departments d;
-- Returns every combination of employee and department
```

### 17. Multiple JOINs? ⭐⭐⭐
```sql
SELECT e.name, d.department_name, p.project_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.id
INNER JOIN employee_projects ep ON e.id = ep.employee_id
INNER JOIN projects p ON ep.project_id = p.id;
```

### 18. JOIN vs Subquery Performance? ⭐⭐⭐
```sql
-- JOIN (usually faster)
SELECT e.name, d.department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.id
WHERE d.location = 'New York';

-- Subquery
SELECT name FROM employees
WHERE department_id IN (
    SELECT id FROM departments WHERE location = 'New York'
);
```

---

## Aggregate Functions & GROUP BY

### 19. Aggregate Functions? ⭐⭐⭐
```sql
-- COUNT, SUM, AVG, MIN, MAX
SELECT 
    COUNT(*) AS total_employees,
    COUNT(phone) AS employees_with_phone,
    SUM(salary) AS total_salary,
    AVG(salary) AS average_salary,
    MIN(salary) AS min_salary,
    MAX(salary) AS max_salary
FROM employees;
```

### 20. GROUP BY Clause? ⭐⭐⭐
```sql
-- Group by single column
SELECT department_id, COUNT(*) AS employee_count
FROM employees
GROUP BY department_id;

-- Group by multiple columns
SELECT department_id, job_title, AVG(salary)
FROM employees
GROUP BY department_id, job_title;
```

### 21. HAVING vs WHERE with GROUP BY? ⭐⭐⭐
```sql
SELECT department_id, AVG(salary) AS avg_salary
FROM employees
WHERE hire_date > '2020-01-01'  -- Filter before grouping
GROUP BY department_id
HAVING AVG(salary) > 60000;     -- Filter after grouping
```

### 22. COUNT(*) vs COUNT(column)? ⭐⭐⭐
```sql
-- COUNT(*) counts all rows including NULLs
SELECT COUNT(*) FROM employees;

-- COUNT(column) counts non-NULL values only
SELECT COUNT(phone) FROM employees;

-- COUNT(DISTINCT column) counts unique non-NULL values
SELECT COUNT(DISTINCT department_id) FROM employees;
```

### 23. Window Functions? ⭐⭐⭐
```sql
-- ROW_NUMBER, RANK, DENSE_RANK
SELECT 
    name,
    salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num,
    RANK() OVER (ORDER BY salary DESC) AS rank_num,
    DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank
FROM employees;

-- Partition by department
SELECT 
    name,
    department_id,
    salary,
    ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dept_rank
FROM employees;
```

### 24. LEAD and LAG Functions? ⭐⭐
```sql
-- Compare with next/previous row
SELECT 
    name,
    salary,
    LAG(salary) OVER (ORDER BY hire_date) AS prev_salary,
    LEAD(salary) OVER (ORDER BY hire_date) AS next_salary
FROM employees;
```

### 25. Running Totals? ⭐⭐⭐
```sql
-- Cumulative sum
SELECT 
    name,
    salary,
    SUM(salary) OVER (ORDER BY hire_date) AS running_total
FROM employees;
```

---

## Advanced Queries & Optimization

### 26. Subqueries Types? ⭐⭐⭐
```sql
-- Scalar subquery (returns single value)
SELECT name FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- Correlated subquery
SELECT name FROM employees e1
WHERE salary > (
    SELECT AVG(salary) FROM employees e2
    WHERE e2.department_id = e1.department_id
);

-- Table subquery
SELECT * FROM (
    SELECT name, salary, RANK() OVER (ORDER BY salary DESC) as rank
    FROM employees
) ranked_employees
WHERE rank <= 5;
```

### 27. Common Table Expressions (CTE)? ⭐⭐⭐
```sql
-- Simple CTE
WITH high_earners AS (
    SELECT * FROM employees WHERE salary > 80000
)
SELECT department_id, COUNT(*) 
FROM high_earners
GROUP BY department_id;

-- Recursive CTE (Employee hierarchy)
WITH RECURSIVE employee_hierarchy AS (
    -- Base case: Top-level managers
    SELECT id, name, manager_id, 1 as level
    FROM employees WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive case
    SELECT e.id, e.name, e.manager_id, eh.level + 1
    FROM employees e
    JOIN employee_hierarchy eh ON e.manager_id = eh.id
)
SELECT * FROM employee_hierarchy;
```

### 28. UNION vs UNION ALL? ⭐⭐⭐
```sql
-- UNION removes duplicates
SELECT name FROM employees WHERE department_id = 1
UNION
SELECT name FROM employees WHERE salary > 70000;

-- UNION ALL keeps duplicates (faster)
SELECT name FROM employees WHERE department_id = 1
UNION ALL
SELECT name FROM employees WHERE salary > 70000;
```

### 29. CASE Statement? ⭐⭐⭐
```sql
-- Simple CASE
SELECT 
    name,
    salary,
    CASE 
        WHEN salary > 80000 THEN 'High'
        WHEN salary > 50000 THEN 'Medium'
        ELSE 'Low'
    END AS salary_category
FROM employees;

-- CASE in WHERE clause
SELECT * FROM employees
WHERE 
    CASE 
        WHEN department_id = 1 THEN salary > 60000
        WHEN department_id = 2 THEN salary > 70000
        ELSE salary > 50000
    END;
```

### 30. Index Optimization? ⭐⭐⭐
```sql
-- Create index for faster queries
CREATE INDEX idx_employee_department ON employees(department_id);
CREATE INDEX idx_employee_salary ON employees(salary);

-- Composite index
CREATE INDEX idx_dept_salary ON employees(department_id, salary);

-- Query that uses index
SELECT * FROM employees WHERE department_id = 1;
-- Query that doesn't use index efficiently
SELECT * FROM employees WHERE UPPER(name) = 'JOHN';
```

### 31. Query Execution Plan? ⭐⭐⭐
```sql
-- PostgreSQL
EXPLAIN ANALYZE SELECT * FROM employees WHERE salary > 50000;

-- SQL Server
SET STATISTICS IO ON;
SELECT * FROM employees WHERE salary > 50000;

-- MySQL
EXPLAIN SELECT * FROM employees WHERE salary > 50000;
```

### 32. N+1 Query Problem? ⭐⭐⭐
```sql
-- Bad: N+1 queries (1 + N individual queries)
-- First query
SELECT id, name FROM employees;
-- Then for each employee (N queries)
SELECT department_name FROM departments WHERE id = ?;

-- Good: Single JOIN query
SELECT e.name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id;
```

### 33. Pagination Techniques? ⭐⭐⭐
```sql
-- OFFSET/LIMIT (can be slow for large offsets)
SELECT * FROM employees
ORDER BY id
LIMIT 20 OFFSET 100;

-- Cursor-based pagination (better performance)
SELECT * FROM employees
WHERE id > 100
ORDER BY id
LIMIT 20;
```

### 34. Database Transactions? ⭐⭐⭐
```sql
-- ACID Properties: Atomicity, Consistency, Isolation, Durability
BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- If both succeed
COMMIT;

-- If any fails
ROLLBACK;
```

### 35. Stored Procedures vs Functions? ⭐⭐
```sql
-- Stored Procedure
CREATE PROCEDURE GetEmployeesByDept(@dept_id INT)
AS
BEGIN
    SELECT * FROM employees WHERE department_id = @dept_id;
END;

-- Function
CREATE FUNCTION GetEmployeeCount(@dept_id INT)
RETURNS INT
AS
BEGIN
    DECLARE @count INT;
    SELECT @count = COUNT(*) FROM employees WHERE department_id = @dept_id;
    RETURN @count;
END;
```

---

## Database Design & Normalization

### 36. Database Normalization? ⭐⭐⭐
- **1NF:** Atomic values, no repeating groups
- **2NF:** 1NF + no partial dependencies
- **3NF:** 2NF + no transitive dependencies
- **BCNF:** 3NF + every determinant is a candidate key

### 37. Normalization Example? ⭐⭐⭐
```sql
-- Unnormalized table
CREATE TABLE orders_bad (
    order_id INT,
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    product_names VARCHAR(500),  -- Multiple products in one field
    product_prices VARCHAR(200)  -- Multiple prices in one field
);

-- Normalized tables
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10,2),
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
```

### 38. Denormalization? When to Use? ⭐⭐⭐
- **Purpose:** Improve query performance
- **Trade-off:** Storage space vs query speed
- **Use cases:** Read-heavy applications, reporting systems
- **Example:** Storing calculated totals instead of computing

```sql
-- Denormalized for performance
CREATE TABLE order_summary (
    order_id INT PRIMARY KEY,
    customer_name VARCHAR(100),  -- Denormalized from customers table
    total_amount DECIMAL(10,2),  -- Calculated field stored
    item_count INT               -- Calculated field stored
);
```

### 39. Entity-Relationship (ER) Model? ⭐⭐⭐
- **Entity:** Real-world object (Customer, Order, Product)
- **Attribute:** Properties of entity (name, price, date)
- **Relationship:** Association between entities
- **Cardinality:** One-to-One, One-to-Many, Many-to-Many

### 40. Database Constraints? ⭐⭐⭐
```sql
CREATE TABLE employees (
    id INT PRIMARY KEY,                    -- Primary key constraint
    name VARCHAR(100) NOT NULL,           -- Not null constraint
    email VARCHAR(100) UNIQUE,            -- Unique constraint
    age INT CHECK (age >= 18),            -- Check constraint
    department_id INT,
    salary DECIMAL(10,2) DEFAULT 50000,   -- Default constraint
    FOREIGN KEY (department_id) REFERENCES departments(id)  -- Foreign key
);

-- Add constraint after table creation
ALTER TABLE employees 
ADD CONSTRAINT chk_salary CHECK (salary > 0);
```

---

## 🚀 REAL INTERVIEW SCENARIOS (IBM, Google, Microsoft, Amazon)

### **Scenario 1: Find Nth Highest Salary** ⭐⭐⭐
```sql
-- Method 1: Using LIMIT and OFFSET (PostgreSQL/MySQL)
SELECT DISTINCT salary
FROM employees
ORDER BY salary DESC
LIMIT 1 OFFSET 2;  -- 3rd highest

-- Method 2: Using Window Functions (Most Popular)
SELECT salary
FROM (
    SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rank
    FROM employees
) ranked
WHERE rank = 3;

-- Method 3: Using Correlated Subquery
SELECT DISTINCT salary
FROM employees e1
WHERE 2 = (
    SELECT COUNT(DISTINCT salary)
    FROM employees e2
    WHERE e2.salary > e1.salary
);
```

### **Scenario 2: Find Duplicate Records** ⭐⭐⭐
```sql
-- Find duplicate emails
SELECT email, COUNT(*) as duplicate_count
FROM employees
GROUP BY email
HAVING COUNT(*) > 1;

-- Delete duplicates keeping only one record
DELETE e1 FROM employees e1
INNER JOIN employees e2
WHERE e1.id > e2.id AND e1.email = e2.email;

-- Find employees with same name and department
SELECT name, department_id, COUNT(*)
FROM employees
GROUP BY name, department_id
HAVING COUNT(*) > 1;
```

### **Scenario 3: Department with Highest Average Salary** ⭐⭐⭐
```sql
-- Single department with highest average
SELECT d.department_name, AVG(e.salary) as avg_salary
FROM employees e
JOIN departments d ON e.department_id = d.id
GROUP BY d.id, d.department_name
ORDER BY avg_salary DESC
LIMIT 1;

-- All departments with average above company average
SELECT d.department_name, AVG(e.salary) as avg_salary
FROM employees e
JOIN departments d ON e.department_id = d.id
GROUP BY d.id, d.department_name
HAVING AVG(e.salary) > (SELECT AVG(salary) FROM employees);
```

### **Scenario 4: Employee Hierarchy & Manager Chain** ⭐⭐⭐
```sql
-- Employees without manager (top-level)
SELECT * FROM employees WHERE manager_id IS NULL;

-- Employees who are not managers
SELECT * FROM employees
WHERE id NOT IN (
    SELECT DISTINCT manager_id 
    FROM employees 
    WHERE manager_id IS NOT NULL
);

-- Manager with most direct reports
SELECT m.name as manager_name, COUNT(e.id) as direct_reports
FROM employees m
JOIN employees e ON m.id = e.manager_id
GROUP BY m.id, m.name
ORDER BY direct_reports DESC
LIMIT 1;

-- Complete hierarchy path
WITH RECURSIVE hierarchy AS (
    SELECT id, name, manager_id, name as path, 0 as level
    FROM employees WHERE manager_id IS NULL
    
    UNION ALL
    
    SELECT e.id, e.name, e.manager_id, 
           CONCAT(h.path, ' -> ', e.name) as path,
           h.level + 1
    FROM employees e
    JOIN hierarchy h ON e.manager_id = h.id
)
SELECT * FROM hierarchy ORDER BY level, path;
```

### **Scenario 5: Sales & Revenue Analysis** ⭐⭐⭐
```sql
-- Monthly sales trend
SELECT 
    DATE_FORMAT(order_date, '%Y-%m') as month,
    COUNT(*) as total_orders,
    SUM(total_amount) as revenue,
    AVG(total_amount) as avg_order_value,
    SUM(total_amount) - LAG(SUM(total_amount)) OVER (ORDER BY DATE_FORMAT(order_date, '%Y-%m')) as revenue_growth
FROM orders
WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY month;

-- Top 5 customers by revenue
SELECT c.name, SUM(o.total_amount) as total_spent,
       COUNT(o.id) as total_orders
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_spent DESC
LIMIT 5;
```

### **Scenario 6: Product Performance Analysis** ⭐⭐⭐
```sql
-- Best selling products
SELECT p.name, SUM(oi.quantity) as total_sold,
       SUM(oi.quantity * oi.price) as total_revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
GROUP BY p.id, p.name
ORDER BY total_sold DESC
LIMIT 10;

-- Products never ordered
SELECT p.* FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE oi.product_id IS NULL;

-- Category-wise performance
SELECT 
    p.category,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT oi.product_id) as products_sold,
    SUM(oi.quantity * oi.price) as category_revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.category
ORDER BY category_revenue DESC;
```

### **Scenario 7: Date & Time Analysis** ⭐⭐⭐
```sql
-- Orders by day of week
SELECT 
    DAYNAME(order_date) as day_name,
    COUNT(*) as order_count,
    AVG(total_amount) as avg_amount
FROM orders
GROUP BY DAYOFWEEK(order_date), DAYNAME(order_date)
ORDER BY DAYOFWEEK(order_date);

-- Peak hours analysis
SELECT 
    HOUR(created_at) as hour,
    COUNT(*) as order_count
FROM orders
GROUP BY HOUR(created_at)
ORDER BY order_count DESC;

-- Year-over-year growth
SELECT 
    YEAR(order_date) as year,
    SUM(total_amount) as yearly_revenue,
    LAG(SUM(total_amount)) OVER (ORDER BY YEAR(order_date)) as prev_year_revenue,
    ROUND(((SUM(total_amount) - LAG(SUM(total_amount)) OVER (ORDER BY YEAR(order_date))) / 
           LAG(SUM(total_amount)) OVER (ORDER BY YEAR(order_date))) * 100, 2) as growth_percentage
FROM orders
GROUP BY YEAR(order_date)
ORDER BY year;
```

### **Scenario 8: Advanced Aggregations** ⭐⭐⭐
```sql
-- Running totals and moving averages
SELECT 
    order_date,
    total_amount,
    SUM(total_amount) OVER (ORDER BY order_date) as running_total,
    AVG(total_amount) OVER (ORDER BY order_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as moving_avg_7_days
FROM orders
ORDER BY order_date;

-- Percentile analysis
SELECT 
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary) as q1,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary) as median,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary) as q3,
    PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY salary) as p90
FROM employees;

-- Cohort analysis (customer retention)
WITH first_orders AS (
    SELECT customer_id, MIN(order_date) as first_order_date
    FROM orders GROUP BY customer_id
),
cohort_data AS (
    SELECT 
        fo.first_order_date,
        o.order_date,
        o.customer_id,
        DATEDIFF(o.order_date, fo.first_order_date) as days_since_first_order
    FROM first_orders fo
    JOIN orders o ON fo.customer_id = o.customer_id
)
SELECT 
    first_order_date,
    COUNT(DISTINCT CASE WHEN days_since_first_order = 0 THEN customer_id END) as month_0,
    COUNT(DISTINCT CASE WHEN days_since_first_order BETWEEN 1 AND 30 THEN customer_id END) as month_1,
    COUNT(DISTINCT CASE WHEN days_since_first_order BETWEEN 31 AND 60 THEN customer_id END) as month_2
FROM cohort_data
GROUP BY first_order_date
ORDER BY first_order_date;
```

### **Scenario 9: Complex Business Logic** ⭐⭐⭐
```sql
-- Customer segmentation (RFM Analysis)
WITH customer_metrics AS (
    SELECT 
        customer_id,
        MAX(order_date) as last_order_date,
        COUNT(*) as frequency,
        SUM(total_amount) as monetary
    FROM orders
    GROUP BY customer_id
),
rfm_scores AS (
    SELECT 
        customer_id,
        DATEDIFF(CURDATE(), last_order_date) as recency,
        frequency,
        monetary,
        NTILE(5) OVER (ORDER BY DATEDIFF(CURDATE(), last_order_date) DESC) as r_score,
        NTILE(5) OVER (ORDER BY frequency) as f_score,
        NTILE(5) OVER (ORDER BY monetary) as m_score
    FROM customer_metrics
)
SELECT 
    customer_id,
    CASE 
        WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Champions'
        WHEN r_score >= 3 AND f_score >= 3 AND m_score >= 3 THEN 'Loyal Customers'
        WHEN r_score >= 3 AND f_score <= 2 THEN 'Potential Loyalists'
        WHEN r_score <= 2 AND f_score >= 3 THEN 'At Risk'
        ELSE 'Others'
    END as customer_segment
FROM rfm_scores;

-- Inventory management
SELECT 
    p.name,
    p.stock_quantity,
    COALESCE(SUM(oi.quantity), 0) as total_sold_last_30_days,
    CASE 
        WHEN p.stock_quantity = 0 THEN 'Out of Stock'
        WHEN p.stock_quantity < (COALESCE(SUM(oi.quantity), 0) / 30 * 7) THEN 'Low Stock'
        ELSE 'In Stock'
    END as stock_status
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY p.id, p.name, p.stock_quantity;
```

### **Scenario 10: Performance Optimization Challenges** ⭐⭐⭐
```sql
-- Slow query optimization example
-- BAD: This will be slow for large tables
SELECT * FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE YEAR(o.order_date) = 2023
AND UPPER(c.name) LIKE '%JOHN%';

-- GOOD: Optimized version
SELECT o.id, o.order_date, o.total_amount, c.name
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.order_date >= '2023-01-01' 
AND o.order_date < '2024-01-01'
AND c.name LIKE '%John%';

-- Index suggestions for above query
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_customers_name ON customers(name);

-- Pagination with performance
-- BAD: OFFSET becomes slow with large offsets
SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 10000;

-- GOOD: Cursor-based pagination
SELECT * FROM orders 
WHERE id > 10000 
ORDER BY id 
LIMIT 20;
```

---

## 🎯 IBM & TOP COMPANIES SPECIFIC SCENARIOS

### **IBM Favorite: Data Migration & ETL** ⭐⭐⭐
```sql
-- Data quality check before migration
SELECT 
    'customers' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(*) - COUNT(email) as null_emails,
    COUNT(*) - COUNT(DISTINCT email) as duplicate_emails
FROM customers

UNION ALL

SELECT 
    'orders' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT id) as unique_ids,
    COUNT(*) - COUNT(customer_id) as null_customer_refs,
    0 as duplicate_emails
FROM orders;

-- Incremental data load
INSERT INTO target_table
SELECT * FROM source_table
WHERE last_modified > (
    SELECT COALESCE(MAX(last_processed), '1900-01-01') 
    FROM etl_log 
    WHERE table_name = 'source_table'
);
```

### **Google/Microsoft Favorite: User Behavior Analysis** ⭐⭐⭐
```sql
-- User session analysis
WITH user_sessions AS (
    SELECT 
        user_id,
        DATE(event_time) as session_date,
        MIN(event_time) as session_start,
        MAX(event_time) as session_end,
        COUNT(*) as events_count,
        COUNT(DISTINCT page_url) as unique_pages
    FROM user_events
    GROUP BY user_id, DATE(event_time)
)
SELECT 
    session_date,
    COUNT(DISTINCT user_id) as daily_active_users,
    AVG(events_count) as avg_events_per_session,
    AVG(TIMESTAMPDIFF(MINUTE, session_start, session_end)) as avg_session_duration
FROM user_sessions
GROUP BY session_date
ORDER BY session_date;

-- Funnel analysis
SELECT 
    step,
    COUNT(DISTINCT user_id) as users,
    LAG(COUNT(DISTINCT user_id)) OVER (ORDER BY step) as prev_step_users,
    ROUND(COUNT(DISTINCT user_id) * 100.0 / LAG(COUNT(DISTINCT user_id)) OVER (ORDER BY step), 2) as conversion_rate
FROM (
    SELECT user_id, 1 as step FROM user_events WHERE event_type = 'page_view'
    UNION ALL
    SELECT user_id, 2 as step FROM user_events WHERE event_type = 'add_to_cart'
    UNION ALL
    SELECT user_id, 3 as step FROM user_events WHERE event_type = 'checkout'
    UNION ALL
    SELECT user_id, 4 as step FROM user_events WHERE event_type = 'purchase'
) funnel_steps
GROUP BY step
ORDER BY step;
```

### **Amazon Favorite: Recommendation Engine Data** ⭐⭐⭐
```sql
-- Product recommendation based on user behavior
WITH user_product_matrix AS (
    SELECT 
        o.customer_id,
        oi.product_id,
        SUM(oi.quantity) as purchase_count,
        COUNT(DISTINCT o.order_date) as purchase_frequency
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.customer_id, oi.product_id
),
similar_customers AS (
    SELECT 
        u1.customer_id as customer_a,
        u2.customer_id as customer_b,
        COUNT(*) as common_products,
        SQRT(SUM(u1.purchase_count * u2.purchase_count)) as similarity_score
    FROM user_product_matrix u1
    JOIN user_product_matrix u2 ON u1.product_id = u2.product_id
    WHERE u1.customer_id < u2.customer_id
    GROUP BY u1.customer_id, u2.customer_id
    HAVING COUNT(*) >= 3
)
SELECT 
    sc.customer_a,
    p.name as recommended_product,
    upm.purchase_count * sc.similarity_score as recommendation_score
FROM similar_customers sc
JOIN user_product_matrix upm ON sc.customer_b = upm.customer_id
JOIN products p ON upm.product_id = p.id
WHERE NOT EXISTS (
    SELECT 1 FROM user_product_matrix upm2 
    WHERE upm2.customer_id = sc.customer_a 
    AND upm2.product_id = upm.product_id
)
ORDER BY sc.customer_a, recommendation_score DESC;
```

---

## 🚀 QUICK REVISION CHECKLIST

### **Must Know for SDE Interviews:**
- [ ] Basic SELECT, WHERE, ORDER BY, LIMIT
- [ ] All types of JOINs (INNER, LEFT, RIGHT, FULL)
- [ ] Aggregate functions (COUNT, SUM, AVG, MIN, MAX)
- [ ] GROUP BY and HAVING clauses
- [ ] Subqueries and CTEs
- [ ] Window functions (ROW_NUMBER, RANK, DENSE_RANK)
- [ ] Index optimization and query performance
- [ ] Database normalization concepts
- [ ] Common interview scenarios (Nth highest, duplicates)

### **Company-Specific Focus:**
- **IBM:** Data migration, ETL processes, data quality
- **Google/Microsoft:** User analytics, funnel analysis
- **Amazon:** Recommendation systems, customer segmentation
- **All:** Performance optimization, complex business logic

### **SQL Patterns to Practice:**
1. **Find Nth highest/lowest value**
2. **Identify duplicate records**
3. **Self-joins for hierarchical data**
4. **Running totals and moving averages**
5. **Customer segmentation (RFM analysis)**
6. **Date/time calculations and trends**

### **Performance Tips:**
- Use indexes on frequently queried columns
- Avoid SELECT * in production queries
- Use LIMIT for large result sets
- Prefer JOINs over subqueries when possible
- Use EXPLAIN to analyze query execution plans

---

*⭐⭐⭐ = Most Important | ⭐⭐ = Important | ⭐ = Good to Know*