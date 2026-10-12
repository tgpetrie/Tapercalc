/** Add to home screen, and a daily reminder as a calendar file. */

let deferred = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
}

export const canPromptInstall = () => !!deferred;

export async function promptInstall() {
  if (!deferred) return;
  deferred.prompt();
  try { await deferred.userChoice; } catch { /* ignore */ }
  deferred = null;
}

export const isStandalone = () =>
  (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
  window.navigator.standalone === true;

export const isIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

/** A repeating daily event the phone's own calendar will remind from. */
export function downloadReminder(hour) {
  const pad = (n) => String(n).padStart(2, '0');
  const now = new Date();
  const day = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Compass//Daily mark//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:compass-daily-${day}@tapercalc`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${day}T${pad(hour)}0000`,
    `DTEND:${day}T${pad(hour)}1500`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:Compass — an invitation to mark the day',
    'DESCRIPTION:Open Compass and mark today. No pressure — the route waits.',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Compass', 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'compass-daily-reminder.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
