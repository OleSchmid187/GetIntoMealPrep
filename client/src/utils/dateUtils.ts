export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  export const getWeekRange = (offset: number): { start: Date; end: Date; label: string } => {
    const now = new Date();
  
    // Montag dieser Woche berechnen
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + offset * 7);
  
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
  
    return {
      start: monday,
      end: sunday,
      label: `${formatDate(monday)} – ${formatDate(sunday)}`
    };
  };
  