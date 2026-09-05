// Islamic Salah Prayer Times calculation utility (Riyadh / Standard Calculation)

export const getPrayerTimes = (date = new Date()) => {
  // Approximate standard times for display and countdown
  const baseTimes = [
    { id: 'fajr', name: 'Fajr', time: '04:35 AM', hours: 4, minutes: 35, icon: '🌅' },
    { id: 'sunrise', name: 'Sunrise', time: '05:52 AM', hours: 5, minutes: 52, icon: '☀️' },
    { id: 'dhuhr', name: 'Dhuhr', time: '11:58 AM', hours: 11, minutes: 58, icon: '☀️' },
    { id: 'asr', name: 'Asr', time: '03:26 PM', hours: 15, minutes: 26, icon: '🌤️' },
    { id: 'maghrib', name: 'Maghrib', time: '06:05 PM', hours: 18, minutes: 5, icon: '🌇' },
    { id: 'isha', name: 'Isha', time: '07:35 PM', hours: 19, minutes: 35, icon: '🌙' }
  ];

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let nextPrayer = null;
  let minutesUntilNext = 0;

  for (let i = 0; i < baseTimes.length; i++) {
    const prayerMin = baseTimes[i].hours * 60 + baseTimes[i].minutes;
    if (prayerMin > currentMinutes) {
      nextPrayer = baseTimes[i];
      minutesUntilNext = prayerMin - currentMinutes;
      break;
    }
  }

  // If after Isha, next is tomorrow's Fajr
  if (!nextPrayer) {
    nextPrayer = baseTimes[0];
    minutesUntilNext = (24 * 60 - currentMinutes) + (baseTimes[0].hours * 60 + baseTimes[0].minutes);
  }

  const hoursUntil = Math.floor(minutesUntilNext / 60);
  const minsUntil = minutesUntilNext % 60;
  const countdownFormatted = hoursUntil > 0 ? `${hoursUntil}h ${minsUntil}m` : `${minsUntil}m`;

  return {
    prayers: baseTimes,
    nextPrayer,
    countdownFormatted
  };
};
