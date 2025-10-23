// utils/dateUtils.ts

// Helper to get the start of a week (Monday)
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

export const getWeekDates = (date: Date): Date[] => {
  const startOfWeek = getStartOfWeek(date);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(startOfWeek);
    nextDate.setDate(startOfWeek.getDate() + i);
    dates.push(nextDate);
  }
  return dates;
};

export const getWeekDisplay = (date: Date): string => {
  const weekDates = getWeekDates(date);
  const start = weekDates[0];
  const end = weekDates[6];
  return `${start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
};

export const getDayDisplay = (date: Date): string => {
  return date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

export const areDatesSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getMonthGrid = (date: Date): Date[][] => {
  const grid: Date[][] = [];
  const currentDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const startDayOfMonth = currentDate.getDay(); // Sunday - 0, Monday - 1, ...
  
  // Adjust to start week on Monday
  const dayOfWeek = (startDayOfMonth === 0) ? 6 : startDayOfMonth - 1;

  // Move to the first day of the first week (which could be in the previous month)
  currentDate.setDate(currentDate.getDate() - dayOfWeek);

  for (let i = 0; i < 6; i++) { // 6 weeks for a full month grid
    const week: Date[] = [];
    for (let j = 0; j < 7; j++) {
      week.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    grid.push(week);
    // Stop if the next week is entirely in the next month
    if (currentDate.getMonth() !== date.getMonth() && i >= 3) {
        break;
    }
  }

  return grid;
};

export const getMonthDisplay = (date: Date): string => {
  return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
};


export const getMonthsForChart = (): { labels: string[], yearMonthKeys: string[] } => {
    const labels: string[] = [];
    const yearMonthKeys: string[] = [];
    const date = new Date();
    date.setMonth(date.getMonth() + 1); // Start from next month to go back 12 months including current

    for (let i = 0; i < 12; i++) {
        date.setMonth(date.getMonth() - 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        labels.push(`T${month}/${year.toString().slice(-2)}`);
        yearMonthKeys.push(`${year}-${month.toString().padStart(2, '0')}`);
    }

    return { labels: labels.reverse(), yearMonthKeys: yearMonthKeys.reverse() };
};
