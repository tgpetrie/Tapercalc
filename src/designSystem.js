export const PRODUCT_NAME = 'COMPASS';

export const WORKSPACES = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home' },
  { id: 'journey', label: 'Journey', shortLabel: 'Journey' },
  { id: 'calendar', label: 'Calendar', shortLabel: 'Calendar' },
  { id: 'guide', label: 'Guide', shortLabel: 'Guide' },
  { id: 'insights', label: 'Insights', shortLabel: 'Insights' },
  { id: 'settings', label: 'Settings', shortLabel: 'Settings' },
];

export const THEMES = [
  { id: 'forest', label: 'Forest' },
  { id: 'night', label: 'Night Sky' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'alpine', label: 'Alpine' },
  { id: 'paper', label: 'Paper' },
];

export const REFLECTION_SEEDS = [
  'Progress is not measured only by today\'s dose.',
  'A planned rest point is still part of the journey.',
  'Small steps accumulate.',
  'Every taper follows its own course.',
  'The next clear action is enough for today.',
  'A slower route can still be a steady route.',
  'Clear numbers make room for calmer choices.',
  'The plan can adapt without losing direction.',
  'Today only needs today-sized attention.',
  'Confidence grows when the path is visible.',
  'Careful tracking turns uncertainty into information.',
  'The goal is not speed; the goal is staying oriented.',
];

export const REFLECTIONS = Array.from({ length: 300 }, (_, index) => {
  const seed = REFLECTION_SEEDS[index % REFLECTION_SEEDS.length];
  return `${seed} Day ${index + 1}.`;
});

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}
