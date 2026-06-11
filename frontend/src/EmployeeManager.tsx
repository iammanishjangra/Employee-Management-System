'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  Database,
  Edit3,
  Layers3,
  RefreshCcw,
  Save,
  Search,
  Server,
  ShieldCheck,
  Trash2,
  UserPlus,
  UsersRound,
  X
} from 'lucide-react';

type Employee = {
  employeeId: number;
  name: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  joiningDate: string;
};

type EmployeeForm = Omit<Employee, 'employeeId'>;
type GenderFilter = 'All' | 'Male' | 'Female' | 'Other';
type ConnectionStatus = 'checking' | 'connected' | 'error';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const HEALTH_URL = `${API_BASE_URL.replace(/\/$/, '')}/health`;

const emptyForm: EmployeeForm = {
  name: '',
  dateOfBirth: '2000-01-01',
  gender: 'Male',
  phone: '',
  email: '',
  address: '',
  joiningDate: new Date().toISOString().slice(0, 10)
};

const genderFilters: GenderFilter[] = ['All', 'Male', 'Female', 'Other'];

export function EmployeeManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('All');
  const [backendStatus, setBackendStatus] = useState<ConnectionStatus>('checking');
  const [databaseStatus, setDatabaseStatus] = useState<ConnectionStatus>('checking');
  const [lastCheckedAt, setLastCheckedAt] = useState('');

  const stats = useMemo(() => {
    const genderCount = new Set(employees.map((employee) => employee.gender)).size;
    const latestJoiningDate = employees
      .map((employee) => employee.joiningDate)
      .sort()
      .at(-1) || '-';

    return { genderCount, latestJoiningDate };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesName = normalizedSearch ? employee.name.toLowerCase().includes(normalizedSearch) : true;
      const matchesGender = genderFilter === 'All' ? true : employee.gender === genderFilter;

      return matchesName && matchesGender;
    });
  }, [employees, genderFilter, searchQuery]);

  async function checkBackend() {
    setBackendStatus('checking');

    try {
      const response = await fetch(HEALTH_URL, { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok || data.status !== 'ok') {
        throw new Error('Backend health check failed');
      }

      setBackendStatus('connected');
    } catch {
      setBackendStatus('error');
    }
  }

  async function loadEmployees({ quiet = false } = {}) {
    setLoading(true);
    setDatabaseStatus('checking');

    if (!quiet) {
      setMessage('');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/employees`, { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load employees');
      }

      setEmployees(data.employees);
      setDatabaseStatus('connected');
    } catch (error) {
      setDatabaseStatus('error');

      if (!quiet) {
        setMessage(error instanceof Error ? error.message : 'Unable to load employees');
      }
    } finally {
      setLoading(false);
      setLastCheckedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }

  async function refreshSystem() {
    await Promise.all([checkBackend(), loadEmployees()]);
  }

  useEffect(() => {
    void refreshSystem();
  }, []);

  function updateField(field: keyof EmployeeForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function applySearch() {
    setSearchQuery(searchInput);
  }

  async function submitEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const url = editingId ? `${API_BASE_URL}/employees/${editingId}` : `${API_BASE_URL}/employees`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Save failed');
      }

      setMessage(editingId ? 'Employee updated successfully.' : 'Employee added successfully.');
      resetForm();
      await loadEmployees({ quiet: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(employee: Employee) {
    setEditingId(employee.employeeId);
    setForm({
      name: employee.name,
      dateOfBirth: employee.dateOfBirth,
      gender: employee.gender,
      phone: employee.phone,
      email: employee.email,
      address: employee.address,
      joiningDate: employee.joiningDate
    });
  }

  async function deleteEmployee(employeeId: number) {
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, { method: 'DELETE' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Delete failed');
      }

      setMessage('Employee deleted successfully.');
      await loadEmployees({ quiet: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Delete failed');
    }
  }

  const connectionCards = [
    {
      icon: <Server size={18} />,
      label: 'Backend API',
      value: backendStatus === 'connected' ? 'Connected' : backendStatus === 'checking' ? 'Checking' : 'Disconnected',
      status: backendStatus,
      detail: backendStatus === 'connected' ? 'Express service is responding' : 'Health endpoint needs attention'
    },
    {
      icon: <Database size={18} />,
      label: 'Database',
      value: databaseStatus === 'connected' ? 'Connected' : databaseStatus === 'checking' ? 'Checking' : 'Disconnected',
      status: databaseStatus,
      detail: databaseStatus === 'connected' ? 'Employee records are loading' : 'Employee query could not complete'
    }
  ];

  return (
    <main className="shell">
      <section className="topbar">
        <div className="heroCopy">
          <span className="eyebrow">3-Tier Project Showcase</span>
          <h1>Premium Employee Management System</h1>
          <p>
            React frontend, Express backend and MySQL database presented as one polished operations workspace.
          </p>
          <div className="heroPills" aria-label="Project layers">
            <span><Layers3 size={15} /> Frontend</span>
            <span><Server size={15} /> Backend</span>
            <span><Database size={15} /> Database</span>
          </div>
        </div>
        <div className="heroPanel" aria-label="Live project status">
          <div className="panelHeader">
            <span>Live Stack Status</span>
            <strong>{lastCheckedAt || '--:--'}</strong>
          </div>
          {connectionCards.map((card) => (
            <div className="connectionRow" key={card.label}>
              <div className={`connectionIcon ${card.status}`}>{card.icon}</div>
              <div>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.detail}</small>
              </div>
              <span className={`statusDot ${card.status}`} aria-label={`${card.label} ${card.value}`} />
            </div>
          ))}
        </div>
        <button className="iconButton refresh" type="button" onClick={() => void refreshSystem()} title="Refresh">
          <RefreshCcw size={18} />
        </button>
      </section>

      <section className="statsGrid" aria-label="Employee summary">
        <div className="stat">
          <div className="statIcon"><UsersRound size={18} /></div>
          <span>Total Employees</span>
          <strong>{employees.length}</strong>
        </div>
        <div className="stat">
          <div className="statIcon gold"><ShieldCheck size={18} /></div>
          <span>Profile Groups</span>
          <strong>{stats.genderCount}</strong>
        </div>
        <div className="stat">
          <div className="statIcon green"><CalendarDays size={18} /></div>
          <span>Latest Joining</span>
          <strong>{stats.latestJoiningDate}</strong>
        </div>
        <div className="stat">
          <div className="statIcon blue"><Activity size={18} /></div>
          <span>System Health</span>
          <strong>{backendStatus === 'connected' && databaseStatus === 'connected' ? 'Live' : 'Check'}</strong>
        </div>
      </section>

      <section className="workspace">
        <form className="employeeForm" onSubmit={(event) => void submitEmployee(event)}>
          <div className="formHeader">
            <h2>{editingId ? `Edit ID ${editingId}` : 'Add Employee'}</h2>
            {editingId && (
              <button className="iconButton ghost" type="button" onClick={resetForm} title="Cancel edit">
                <X size={18} />
              </button>
            )}
          </div>

          <label>
            Name
            <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
          </label>

          <div className="twoColumn">
            <label>
              Date of Birth
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) => updateField('dateOfBirth', event.target.value)}
                required
              />
            </label>
            <label>
              Gender
              <select value={form.gender} onChange={(event) => updateField('gender', event.target.value)} required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          <div className="twoColumn">
            <label>
              Phone
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                required
              />
            </label>
          </div>

          <label>
            Address
            <textarea value={form.address} onChange={(event) => updateField('address', event.target.value)} required />
          </label>

          <label>
            Joining Date
            <input
              type="date"
              value={form.joiningDate}
              onChange={(event) => updateField('joiningDate', event.target.value)}
              required
            />
          </label>

          <button className="primaryButton" type="submit" disabled={saving}>
            {editingId ? <Save size={18} /> : <UserPlus size={18} />}
            {saving ? 'Saving...' : editingId ? 'Update Employee' : 'Add Employee'}
          </button>

          {message && <p className="message">{message}</p>}
        </form>

        <div className="tablePanel">
          <div className="tableHeader">
            <div>
              <span className="sectionKicker">Directory</span>
              <h2>Employee Records</h2>
            </div>
            <div className="tableHeaderMeta">
              <span className="recordBadge">Unique Employee ID</span>
              <span className="resultCount">{filteredEmployees.length} shown</span>
            </div>
          </div>

          <div className="tableControls" aria-label="Employee filters">
            <div className="searchBox">
              <Search size={17} />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    applySearch();
                  }
                }}
                placeholder="Search by employee name"
                aria-label="Search by employee name"
              />
              <button className="searchButton" type="button" onClick={applySearch}>
                Search
              </button>
            </div>

            <div className="genderFilters" aria-label="Filter employees by gender">
              {genderFilters.map((gender) => (
                <button
                  className={genderFilter === gender ? 'filterButton active' : 'filterButton'}
                  key={gender}
                  type="button"
                  onClick={() => setGenderFilter(gender)}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Joining</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="empty">Loading employees...</td>
                  </tr>
                )}
                {!loading && employees.length === 0 && (
                  <tr>
                    <td colSpan={9} className="empty">No employees added yet.</td>
                  </tr>
                )}
                {!loading && employees.length > 0 && filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={9} className="empty">No employee matches this search.</td>
                  </tr>
                )}
                {!loading && filteredEmployees.map((employee) => (
                  <tr key={employee.employeeId}>
                    <td className="eid">#{employee.employeeId}</td>
                    <td>{employee.name}</td>
                    <td>{employee.dateOfBirth}</td>
                    <td>{employee.gender}</td>
                    <td>{employee.phone}</td>
                    <td>{employee.email}</td>
                    <td className="addressCell">{employee.address}</td>
                    <td>{employee.joiningDate}</td>
                    <td>
                      <div className="actions">
                        <button className="iconButton" type="button" onClick={() => startEdit(employee)} title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="iconButton danger"
                          type="button"
                          onClick={() => void deleteEmployee(employee.employeeId)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
