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
  
  // Generate display text based on age
  let displayText = '';
  if (years > 0) {
    displayText = `${years} ${years === 1 ? 'rok' : years < 5 ? 'lata' : 'lat'}`;
    if (months % 12 > 0) {
      const remainingMonths = months % 12;
      displayText += ` i ${remainingMonths} ${remainingMonths === 1 ? 'miesiąc' : remainingMonths < 5 ? 'miesiące' : 'miesięcy'}`;
    }
  } else if (months > 0) {
    displayText = `${months} ${months === 1 ? 'miesiąc' : months < 5 ? 'miesiące' : 'miesięcy'}`;
  } else if (weeks > 0) {
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
  
  const parts: string[] = [];
  
  if (age.years > 0) {
    parts.push(`${age.years} ${age.years === 1 ? 'rok' : age.years < 5 ? 'lata' : 'lat'}`);
  }
  if (age.months % 12 > 0) {
    const remainingMonths = age.months % 12;
    parts.push(`${remainingMonths} ${remainingMonths === 1 ? 'miesiąc' : remainingMonths < 5 ? 'miesiące' : 'miesięcy'}`);
  }
  if (age.years === 0 && age.months === 0 && age.weeks > 0) {
    parts.push(`${age.weeks} ${age.weeks === 1 ? 'tydzień' : age.weeks < 5 ? 'tygodnie' : 'tygodni'}`);
  }
  if (age.years === 0 && age.months === 0 && age.weeks === 0) {
    parts.push(`${age.days} ${age.days === 1 ? 'dzień' : 'dni'}`);
  }
  
  return parts.join(', ');
}
