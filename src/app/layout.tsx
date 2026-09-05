import '@/styles/main.css';

export const metadata = {
  title: 'PROJECT 90 — Build Your Life, One Day at a Time',
  description: 'PROJECT 90 is your personal life operating system combining 5 core life categories, routines, Clockify-style time tracking, daily scores, 90-day calendar, analytics, and reflection with MongoDB Atlas and Better Auth.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎯</text></svg>" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
