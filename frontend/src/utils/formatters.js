export const formatSalaryRange = (salary) => {
  if (!salary || (!salary.min && !salary.max)) {
    return 'Salary not specified';
  }

  const currency = 'INR';
  const periodMap = {
    hour: 'hour',
    day: 'day',
    week: 'week',
    month: 'month',
    year: 'year',
  };

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  const min = salary.min ? formatter.format(salary.min) : null;
  const max = salary.max ? formatter.format(salary.max) : null;

  let range = '';
  if (min && max) {
    range = `${min} - ${max}`;
  } else if (min) {
    range = `From ${min}`;
  } else if (max) {
    range = `Up to ${max}`;
  }

  const periodLabel = periodMap[salary.period] || 'month';
  return `${range} per ${periodLabel}`;
};

export const formatLocation = (location) => {
  if (!location) return 'Location not specified';
  const parts = [location.city, location.state];
  return parts.filter(Boolean).join(', ');
};

export const formatFullAddress = (location) => {
  if (!location) return 'Location not specified';

  const parts = [location.address, location.city, location.state, location.zipCode];
  return parts.filter(Boolean).join(', ');
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};
