# Employee 3-Tier Project

Yeh project ab Next.js based nahi hai. Isko clean Node.js 3-tier architecture me split kiya gaya hai:

1. **Frontend:** React + Vite app in `frontend/`
2. **Backend:** Node.js + Express API in `backend/`
3. **Database:** MySQL SQL setup in `database/`
4. **Nginx:** Reverse proxy config in `nginx/`

## Project Structure

```text
frontend/                 React + Vite employee UI
backend/                  Node.js + Express CRUD API
database/init.sql         MySQL database and employees table
nginx/default.conf        Nginx reverse proxy config
docker-compose.yml        Frontend, backend, MySQL and Nginx services
RUN_COMMANDS.md           All run/build commands in one place
scripts/security-scan.sh  Trivy and OWASP ZAP scan helper
terraform/                AWS starter infrastructure files
```

## Architecture

```text
Browser
  -> Nginx
  -> React Frontend
  -> Express Backend API
  -> MySQL Database
```

## Docker Run

```bash
docker compose up --build
```

Open:

```text
http://localhost
```

## Local Run

Install dependencies:

```bash
npm install
```

Create database:

```bash
mysql -u root -p < database/init.sql
```

Run backend:

```bash
npm run dev --workspace backend
```

Run frontend in another terminal:

```bash
npm run dev --workspace frontend
```

Open:

```text
http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Work |
| --- | --- | --- |
| `GET` | `/api/employees` | Fetch all employees |
| `POST` | `/api/employees` | Add employee |
| `PUT` | `/api/employees/:employeeId` | Update employee |
| `DELETE` | `/api/employees/:employeeId` | Delete employee |

## Database Table

Main table `employees` hai. Primary key `employee_id` auto-increment hai.

Fields:

- `name`
- `date_of_birth`
- `gender`
- `phone`
- `email`
- `address`
- `joining_date`

## More Commands

Saari run commands alag file me hain:

```text
RUN_COMMANDS.md
```
