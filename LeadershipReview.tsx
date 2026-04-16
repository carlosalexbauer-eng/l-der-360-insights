@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 97%;
    --foreground: 210 11% 15%;

    --card: 0 0% 100%;
    --card-foreground: 210 11% 15%;

    --popover: 0 0% 100%;
    --popover-foreground: 210 11% 15%;

    --primary: 172 82% 33%;
    --primary-foreground: 0 0% 100%;

    --secondary: 0 0% 90%;
    --secondary-foreground: 210 11% 15%;

    --muted: 0 0% 93%;
    --muted-foreground: 210 5% 45%;

    --accent: 172 82% 33%;
    --accent-foreground: 0 0% 100%;

    --destructive: 342 100% 50%;
    --destructive-foreground: 0 0% 100%;

    --border: 0 0% 88%;
    --input: 0 0% 88%;
    --ring: 172 82% 33%;
    --radius: 0.75rem;

    --senior-green: 172 82% 33%;
    --senior-green-light: 172 75% 47%;
    --senior-green-2: 170 75% 37%;
    --senior-green-3: 167 43% 47%;
    --senior-orange: 30 100% 50%;
    --senior-purple: 268 40% 51%;
    --senior-pink: 342 100% 50%;
    --senior-yellow: 45 100% 53%;
    --senior-turquoise: 167 71% 50%;
    --senior-gray: 0 0% 90%;

    --sidebar-background: 222 47% 11%;
    --sidebar-foreground: 213 20% 69%;
    --sidebar-primary: 168 65% 53%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 222 47% 15%;
    --sidebar-accent-foreground: 0 0% 100%;
    --sidebar-border: 222 30% 18%;
    --sidebar-ring: 168 65% 53%;

    --variation-positive: 142 71% 45%;
    --variation-negative: 0 84% 60%;
    --variation-neutral: 215 16% 62%;
  }

  .dark {
    --background: 210 11% 10%;
    --foreground: 0 0% 95%;
    --card: 210 11% 13%;
    --card-foreground: 0 0% 95%;
    --popover: 210 11% 13%;
    --popover-foreground: 0 0% 95%;
    --primary: 172 82% 33%;
    --primary-foreground: 0 0% 100%;
    --secondary: 210 11% 20%;
    --secondary-foreground: 0 0% 95%;
    --muted: 210 11% 18%;
    --muted-foreground: 210 5% 60%;
    --accent: 172 82% 33%;
    --accent-foreground: 0 0% 100%;
    --destructive: 342 100% 50%;
    --destructive-foreground: 0 0% 100%;
    --border: 210 11% 20%;
    --input: 210 11% 20%;
    --ring: 172 82% 33%;
    --sidebar-background: 222 47% 11%;
    --sidebar-foreground: 213 20% 69%;
    --sidebar-primary: 168 65% 53%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 222 47% 15%;
    --sidebar-accent-foreground: 0 0% 100%;
    --sidebar-border: 222 30% 18%;
    --sidebar-ring: 168 65% 53%;

    --variation-positive: 142 71% 45%;
    --variation-negative: 0 84% 60%;
    --variation-neutral: 215 16% 62%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: 'DM Sans', sans-serif;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  /* Tabular nums for data tables and KPIs */
  table td, table th,
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
}
