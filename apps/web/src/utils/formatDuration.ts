export const formatDuration = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const diffInMs = endDate.getTime() - startDate.getTime();
  
  // Converter milissegundos para segundos totais
  const totalSeconds = Math.floor(diffInMs / 1000);
  
  // Calcular horas, minutos e segundos
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // Formatar para exibição
  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  
  if (seconds > 0 && hours === 0) {
    parts.push(`${seconds}s`);
  }
  
  return parts.join(' ') || '0s';
};