interface Timerange {
    startHour: string;
    startMinute: string;
    endHour: string;
    endMinute: string;
}

export function createCollectTimeRange(hourMin: Timerange, daySelection: "today" | "tomorrow") {
  // Extract start and end time inputs
  const { startHour, startMinute, endHour, endMinute } = hourMin;
  // Day selection ("today" or "tomorrow")
  const isToday = daySelection === "today";
  
  // Get current date in user's local timezone
  const now = new Date();
  
  // Create a new date for the collection day (today or tomorrow)
  const collectDate = new Date(now);
  if (!isToday) {
    // Add one day for tomorrow
    collectDate.setDate(collectDate.getDate() + 1);
  }
  
  // Create start and end time Date objects
  const startTime = new Date(collectDate);
  startTime.setHours(parseInt(startHour, 10));
  startTime.setMinutes(parseInt(startMinute, 10));
  startTime.setSeconds(0);
  startTime.setMilliseconds(0);
  
  const endTime = new Date(collectDate);
  endTime.setHours(parseInt(endHour, 10));
  endTime.setMinutes(parseInt(endMinute, 10));
  endTime.setSeconds(0);
  endTime.setMilliseconds(0);
  
  // If end time is earlier than start time, assume it's for the next day
  if (endTime < startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }
  
  // Convert to UTC ISO strings
  const utcStartTime = startTime.toISOString();
  const utcEndTime = endTime.toISOString();
  
  // Create PostgreSQL tsrange format
  const collecttimerange = `[${utcStartTime}, ${utcEndTime}]`;
  
  return {
    utcStartTime,
    utcEndTime,
    collecttimerange
  };
}