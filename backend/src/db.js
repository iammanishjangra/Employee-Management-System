import mysql from 'mysql2/promise';

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export const pool = mysql.createPool(config);

function normalizeDate(value) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
}

export function normalizeEmployee(row) {
  return {
    employeeId: Number(row.employee_id),
    name: String(row.name),
    dateOfBirth: normalizeDate(row.date_of_birth),
    gender: String(row.gender),
    phone: String(row.phone),
    email: String(row.email),
    address: String(row.address),
    joiningDate: normalizeDate(row.joining_date)
  };
}
