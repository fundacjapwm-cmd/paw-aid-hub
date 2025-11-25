import { differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';

export interface AnimalAge {
  days: number;
  weeks: number;
  months: number;
  years: number;
  displayText: string;
}

export function calculateAnimalAge(birthDate: Date | string | null): AnimalAge | null {
  if (!birthDate) return null;
  
  const birth = new Date(birthDate);
  const now = new Date();
  
  const days = differenceInDays(now, birth);
  const weeks = differenceInWeeks(now, birth);
  const months = differenceInMonths(now, birth);
  const years = differenceInYears(now, birth);
  
  // Generate display text based on age - show only one unit
  let displayText = '';
  if (years >= 1) {
    displayText = `${years} ${years === 1 ? 'rok' : years < 5 ? 'lata' : 'lat'}`;
  } else if (months >= 1) {
    displayText = `${months} ${months === 1 ? 'miesiąc' : months < 5 ? 'miesiące' : 'miesięcy'}`;
  } else if (weeks >= 1) {
    displayText = `${weeks} ${weeks === 1 ? 'tydzień' : weeks < 5 ? 'tygodnie' : 'tygodni'}`;
  } else {
    displayText = `${days} ${days === 1 ? 'dzień' : 'dni'}`;
  }
  
  return {
    days,
    weeks,
    months,
    years,
    displayText
  };
}

export function formatDetailedAge(birthDate: Date | string | null): string {
  const age = calculateAnimalAge(birthDate);
  if (!age) return 'Wiek nieznany';
  
  return age.displayText;
}
