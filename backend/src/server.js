import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { normalizeEmployee, pool } from './db.js';
import { getEmployeeId, validateEmployee } from './validation.js';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

function sendHealth(_request, response) {
  response.json({ status: 'ok' });
}

app.get('/health', sendHealth);
app.get('/api/health', sendHealth);

app.get('/api/employees', async (_request, response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees ORDER BY employee_id DESC');
    const employees = rows.map(normalizeEmployee);

    response.json({ employees });
  } catch (error) {
    console.error('Failed to fetch employees', error);
    response.status(500).json({ message: 'Database fetch failed' });
  }
});

app.post('/api/employees', async (request, response) => {
  try {
    const validationError = validateEmployee(request.body);

    if (validationError) {
      response.status(400).json({ message: validationError });
      return;
    }

    const body = request.body;
    const [result] = await pool.execute(
      `INSERT INTO employees
        (name, date_of_birth, gender, phone, email, address, joining_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name.trim(),
        body.dateOfBirth,
        body.gender.trim(),
        body.phone.trim(),
        body.email.trim().toLowerCase(),
        body.address.trim(),
        body.joiningDate
      ]
    );

    response.status(201).json({ message: 'Employee created', employeeId: result.insertId });
  } catch (error) {
    console.error('Failed to create employee', error);
    response.status(500).json({ message: 'Employee create failed' });
  }
});

app.put('/api/employees/:employeeId', async (request, response) => {
  const employeeId = getEmployeeId(request.params.employeeId);

  if (!employeeId) {
    response.status(400).json({ message: 'Invalid employee id' });
    return;
  }

  try {
    const validationError = validateEmployee(request.body);

    if (validationError) {
      response.status(400).json({ message: validationError });
      return;
    }

    const body = request.body;
    const [result] = await pool.execute(
      `UPDATE employees
       SET name = ?, date_of_birth = ?, gender = ?, phone = ?, email = ?, address = ?, joining_date = ?
       WHERE employee_id = ?`,
      [
        body.name.trim(),
        body.dateOfBirth,
        body.gender.trim(),
        body.phone.trim(),
        body.email.trim().toLowerCase(),
        body.address.trim(),
        body.joiningDate,
        employeeId
      ]
    );

    if (result.affectedRows === 0) {
      response.status(404).json({ message: 'Employee not found' });
      return;
    }

    response.json({ message: 'Employee updated' });
  } catch (error) {
    console.error('Failed to update employee', error);
    response.status(500).json({ message: 'Employee update failed' });
  }
});

app.delete('/api/employees/:employeeId', async (request, response) => {
  const employeeId = getEmployeeId(request.params.employeeId);

  if (!employeeId) {
    response.status(400).json({ message: 'Invalid employee id' });
    return;
  }

  try {
    const [result] = await pool.execute('DELETE FROM employees WHERE employee_id = ?', [employeeId]);

    if (result.affectedRows === 0) {
      response.status(404).json({ message: 'Employee not found' });
      return;
    }

    response.json({ message: 'Employee deleted' });
  } catch (error) {
    console.error('Failed to delete employee', error);
    response.status(500).json({ message: 'Employee delete failed' });
  }
});

app.listen(port, () => {
  console.log(`Employee backend running on port ${port}`);
});
