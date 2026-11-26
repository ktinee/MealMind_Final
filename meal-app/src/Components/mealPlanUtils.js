export function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateInputValue(value) {
  if (typeof value !== 'string') return new Date();
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return new Date();
  }
  return date;
}

export function isDateInputValue(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function getWeekDates(value) {
  const selectedDate = parseDateInputValue(value);
  const mondayOffset = (selectedDate.getDay() + 6) % 7;
  const monday = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate() - mondayOffset,
  );

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + index,
    );

    return {
      date,
      dateKey: toDateInputValue(date),
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
      label: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };
  });
}
