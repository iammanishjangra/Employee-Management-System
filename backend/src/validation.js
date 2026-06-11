const requiredEmployeeFields = [
  'name',
  'dateOfBirth',
  'gender',
  'phone',
  'email',
  'address',
  'joiningDate'
];

export function validateEmployee(payload) {
  for (const field of requiredEmployeeFields) {
    if (payload[field] === undefined || payload[field] === '') {
      return `${field} is required`;
    }
  }

  if (!String(payload.email).includes('@')) {
    return 'Valid email is required';
  }

  if (!/^[0-9+\-\s]{10,15}$/.test(String(payload.phone))) {
    return 'Valid phone number is required';
  }

  return null;
}

export function getEmployeeId(employeeIdParam) {
  const employeeId = Number(employeeIdParam);

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return null;
  }

  return employeeId;
}
