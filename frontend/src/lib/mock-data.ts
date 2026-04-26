export type NavItem = {
  label: string;
  href: string;
  badge?: string;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Candidates", href: "/candidates" },
  { label: "Email Pipeline", href: "/email-pipeline" },
  { label: "Analytics", href: "/analytics" },
  { label: "Jobs", href: "/jobs" },
  { label: "Templates", href: "/templates" },
];

export const kpiCards = [
  {
    title: "Total Candidates",
    value: 128,
    delta: "+12%",
    tone: "text-violet-300",
  },
  { title: "Qualified", value: 42, delta: "+8%", tone: "text-emerald-300" },
  { title: "Rejected", value: 63, delta: "-5%", tone: "text-rose-300" },
  { title: "Needs Info", value: 23, delta: "+3%", tone: "text-amber-300" },
  { title: "Avg. Score", value: 78, delta: "+6%", tone: "text-indigo-300" },
];

export const funnelStages = [
  { stage: "Emails Received", value: 128 },
  { stage: "Applications Identified", value: 96 },
  { stage: "Screened", value: 72 },
  { stage: "Qualified", value: 42 },
  { stage: "Hired", value: 8 },
];

export const skillData = [
  { skill: "React", value: 56 },
  { skill: "Python", value: 48 },
  { skill: "Node.js", value: 42 },
  { skill: "SQL", value: 40 },
  { skill: "AWS", value: 33 },
];

export const chartData = [
  { day: "May 1", received: 24, qualified: 9, rejected: 12 },
  { day: "May 8", received: 44, qualified: 19, rejected: 23 },
  { day: "May 15", received: 56, qualified: 28, rejected: 31 },
  { day: "May 22", received: 49, qualified: 24, rejected: 27 },
  { day: "May 31", received: 65, qualified: 37, rejected: 33 },
];

export const recentCandidates = [
  {
    name: "Alex Thompson",
    role: "Frontend Developer",
    score: 92,
    status: "Qualified",
    source: "Email",
    received: "2 min ago",
  },
  {
    name: "Priya Sharma",
    role: "Backend Engineer",
    score: 87,
    status: "Qualified",
    source: "Website",
    received: "15 min ago",
  },
  {
    name: "John Doe",
    role: "Full Stack Developer",
    score: 65,
    status: "Needs Info",
    source: "Email",
    received: "1 hr ago",
  },
  {
    name: "Maria Garcia",
    role: "UI/UX Designer",
    score: 78,
    status: "Qualified",
    source: "LinkedIn",
    received: "2 hrs ago",
  },
];

export const activityFeed = [
  "New application from Alex Thompson",
  "Priya Sharma marked as Qualified",
  "John Doe moved to Needs Info",
  "Follow-up email sent to Maria Garcia",
];
