export const MINUTES = 60;

export function convertToHourFormat(hours = 0, minutes = 0) {
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
}

export function convertMinutesToTimeString(minutes: number) {
  const timeHours = Math.floor(Math.abs(minutes) / MINUTES);
  const timeMinutes = Math.abs(minutes) - timeHours * MINUTES;
  return convertToHourFormat(timeHours, timeMinutes);
}

export function convertMinutesToTimeWithSign(minutes: number) {
  return `${minutes >= 0 ? '+' : '-'}${convertMinutesToTimeString(minutes)}`;
}

export function getMinutesFromTimeString(hoursFormat: string | null) {
  if (hoursFormat == null || hoursFormat === '') {
    return 0;
  }
  const [hours, minutes] = hoursFormat?.split(':') ?? ['0', '0'];
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }
  return Number(hours) * MINUTES + Number(minutes);
}