// ============================================
// PROJECT DATA — Manas Arora Portfolio
// All projects rebranded (no university references)
// Accurate descriptions based on actual codebase
//
// Demo URLs and credentials live in data/demoAccounts.js, NOT here. Each project's
// `demoCredentials` field is legacy and no longer read — keeping two copies of "is
// this deployed?" is how the live-demo count silently went stale.
// ============================================
// Extension included so this module also loads under plain Node (verification
// scripts), not just through Vite's resolver.
import { demoAccounts } from './demoAccounts.js';

export const projects = [
  {
    id: 'chalkzone-erp',
    title: 'ChalkZone — Unified ERP & LMS Platform',
    subtitle: 'End-to-End Organizational Management Suite',
    description: 'A comprehensive enterprise resource planning system integrated with AI-powered learning management — featuring attendance automation, performance tracking, support tickets, placements, resume building, faculty appraisals, and an AI Knowledge Base with RAG-powered assistant.',
    longDescription: `ChalkZone unifies 8+ operational modules into a single intelligent platform. Built on Next.js 16 with Supabase PostgreSQL and Google Gemini AI, it features RAG-powered search using pgvector embeddings, a kanban-style support ticket system, real-time attendance tracking, performance analytics, and a fully integrated resume builder. Multi-role access control supports students, faculty, HR, managers, admin, and executives — each with tailored dashboards and workflows.`,
    category: 'Enterprise Software',
    tags: ['ERP', 'LMS', 'AI/RAG', 'Automation', 'Multi-Role'],
    techStack: ['Next.js 16', 'React 19', 'TypeScript', 'Supabase', 'Prisma 7', 'Gemini AI', 'pgvector', 'TipTap', 'Framer Motion'],
    color: '#2997ff',
    gradient: 'linear-gradient(135deg, #2997ff, #6c5ce7)',
    icon: '🏢',
    features: [
      '8+ integrated modules — Attendance, Performance, Tickets, Placements, Resume, Appraisals, AI KB',
      'AI Knowledge Base with RAG (pgvector cosine search + Gemini embeddings)',
      'AI Assistant powered by Gemini with contextual RAG retrieval',
      'Kanban-style support ticket management with drag-and-drop',
      'Multi-role access: Student, Faculty, HR, Manager, Admin, Super Admin, Parent, Executive',
      'Real-time analytics dashboards with exportable reports'
    ],
    sop: [
      { step: 1, title: 'Pick a role', description: 'The login screen offers all eight roles as one-click buttons, grouped into Learning, Operations and Leadership. Worth comparing Student against Super Admin — they are effectively different products.' },
      { step: 2, title: 'Explore Attendance', description: 'Navigate to the Attendance module. View attendance records, mark attendance for sessions, and see analytics by date range and section.' },
      { step: 3, title: 'AI Knowledge Base', description: 'Go to the AI KB module. Browse documents, ask questions to the AI Assistant — it uses RAG to search embedded documents and provide accurate answers.' },
      { step: 4, title: 'Support Tickets', description: 'Open the Tickets module. View the kanban board, create a new ticket, drag tickets between columns, and see resolution workflows in action.' },
      { step: 5, title: 'Performance & Reports', description: 'Visit Performance tracking to view marks, trends, and exportable reports. The system auto-calculates metrics across all tracked parameters.' }
    ],
    demoCredentials: { email: 'demo@manasarora.dev', password: 'Demo@2024', url: 'https://chalkzone-ma.vercel.app' },
    metrics: { timeSaved: '50+ hrs/month', costReduction: '40%', efficiency: '4x faster' }
  },
  {
    id: 'placeflow',
    title: 'PlaceFlow — Placement Automation Engine',
    subtitle: 'AI-Powered Campus-to-Career Pipeline',
    description: 'A full-stack placement automation system that replaces manual email/spreadsheet workflows with an intelligent web portal — featuring AI job parsing via Gemini, eligibility engines, kanban job boards, push notifications, and automated email digests.',
    longDescription: `PlaceFlow transforms how organizations manage their placement and hiring pipeline. The student-facing mobile-first portal features a 4-column kanban job board, one-tap apply, and profile data-quality indicators. The admin console provides operational metrics dashboards, AI-powered job email pre-fill (Gemini parses raw job emails into structured listings), SQL-based eligibility engines, and bulk Excel/Google Drive export. Built on Supabase with 22 database migrations and 10 Edge Functions.`,
    category: 'HR Tech / Automation',
    tags: ['AI', 'Placement', 'Gemini', 'Supabase', 'Push Notifications'],
    techStack: ['React 18', 'TypeScript', 'Vite', 'Supabase', 'Edge Functions', 'Gemini AI', 'FCM', 'Apps Script', 'Cloudflare Workers'],
    color: '#6c5ce7',
    gradient: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
    icon: '🚀',
    features: [
      'AI job email parsing — paste raw emails, Gemini structures them into job listings',
      '4-column kanban job board (student-facing, mobile-first)',
      'SQL-based eligibility engine — batch, branch, CGPA, backlogs, skills filtering',
      'FCM push notifications + daily email digests + WhatsApp sharing',
      'Admin dashboard with operational metrics and data-quality cards',
      'Bulk CSV/XLSX import-export with Google Drive sync via Apps Script'
    ],
    sop: [
      { step: 1, title: 'Student Onboarding', description: 'Students log in, complete their profile with academic details, skills, and resume. The data-quality strip shows completion percentage.' },
      { step: 2, title: 'Browse Jobs', description: 'Navigate the kanban board with 4 columns: Open, Applied, In Progress, Completed. One-tap apply to any eligible job.' },
      { step: 3, title: 'Admin: Post a Job', description: 'As admin, create a new job manually OR paste a raw job email — Gemini AI extracts company, role, eligibility, and deadline automatically.' },
      { step: 4, title: 'Eligibility Engine', description: 'Set eligibility criteria (min CGPA, branch, batch, skills). The system shows a live count of eligible candidates before publishing.' },
      { step: 5, title: 'Export & Notify', description: 'Export applicant lists to Excel or Google Drive. Push notifications and digest emails are sent automatically to eligible candidates.' }
    ],
    demoCredentials: { email: 'demo@manasarora.dev', password: 'Demo@2024', url: '' },
    metrics: { timeSaved: '30+ hrs/week', costReduction: '60%', efficiency: '5x faster' }
  },
  {
    id: 'employee-appraisal-portal',
    title: 'Employee Performance & Appraisal Portal',
    subtitle: 'Confidential 360° Evaluation System',
    description: 'A multi-role performance evaluation platform with hidden rubrics, dynamic weighted grading, evaluator scoring panels, student feedback integration, and dean-level moderation — ensuring complete confidentiality throughout the appraisal lifecycle.',
    longDescription: `This portal manages the complete appraisal lifecycle across 4 evaluation categories: Service Contribution, Research Performance, Academic Delivery, and Innovation in Pedagogy. Admins build dynamic weighted rubrics that remain hidden from employees. Evaluators score using generated panels, while deans moderate finalized evaluations. Features include CSV import for feedback data, XLSX export, audit logging, configurable deadlines (global, departmental, and individual extensions), and strict role-based information boundaries.`,
    category: 'HR Tech',
    tags: ['Appraisal', '360° Feedback', 'Rubrics', 'Analytics', 'Confidential'],
    techStack: ['Next.js 16', 'TypeScript', 'Supabase', 'Prisma 5', 'Tailwind', 'shadcn/ui', 'Framer Motion', 'Nodemailer'],
    color: '#e84393',
    gradient: 'linear-gradient(135deg, #e84393, #fd79a8)',
    icon: '📊',
    features: [
      '4-category self-review: Service, Research, Academics, Innovation',
      'Dynamic weighted rubric builder (admin-controlled, hidden from employees)',
      'Evaluator scoring panels with draft/finalize workflow',
      'CSV import for student feedback integration (PapaParse)',
      'Dean moderation dashboard with unified evaluation view',
      'Immutable audit trail and config versioning'
    ],
    sop: [
      { step: 1, title: 'Admin: Configure Cycle', description: 'Set up a new appraisal cycle with deadlines, departments, and evaluation categories. Build rubrics with custom weightages per category.' },
      { step: 2, title: 'Employee Self-Review', description: 'Employees complete self-assessments across 4 categories — adding achievements, publications, courses delivered, and innovations.' },
      { step: 3, title: 'Import Feedback', description: 'Admin imports student feedback CSV. The system matches responses to employees and integrates scores into the evaluation pipeline.' },
      { step: 4, title: 'Evaluator Scoring', description: 'Evaluators access dynamic grading panels, score each category based on rubrics, save drafts, and finalize when ready.' },
      { step: 5, title: 'Dean Moderation', description: 'Deans review all finalized evaluations in a unified view, export comprehensive reports in CSV/XLSX format.' }
    ],
    demoCredentials: { email: 'demo@manasarora.dev', password: 'Demo@2024', url: '' },
    metrics: { timeSaved: '60+ hrs/cycle', costReduction: '50%', efficiency: '4x faster' }
  },
  {
    id: 'internship-tracker',
    title: 'Internship Progress Tracking System',
    subtitle: '5-Role Workflow Automation',
    description: 'A complete internship lifecycle management system — from student registration and faculty verification to periodic manager reports, final submissions, evaluations, sign-offs, and automated certificate generation.',
    longDescription: `This system digitizes the entire internship pipeline across 5 distinct roles (Student, Faculty, Workplace Manager, Admin, Master Admin). Students register with placement/self-sourced paths, faculty verify with field-level rejection capability, managers submit periodic performance reports, and faculty conduct final evaluations with marks and feedback. Features include automated certificate generation, a 300-frame cinematic scroll-driven landing page, 12+ email notification triggers, and comprehensive admin controls.`,
    category: 'Workflow Automation',
    tags: ['Internship', 'Workflow', '5-Role', 'Certificates', 'Email Automation'],
    techStack: ['React 19', 'TypeScript', 'Express', 'PostgreSQL', 'Prisma 7', 'JWT', 'Nodemailer', 'Gemini AI', 'GSAP', 'jsPDF'],
    color: '#00b894',
    gradient: 'linear-gradient(135deg, #00b894, #55efc4)',
    icon: '📋',
    features: [
      '5-role workflow: Student, Faculty, Manager, Admin, Master Admin',
      'Faculty field-level verification with granular rejection reasons',
      'Periodic manager reporting with Core Task Log + Performance Review',
      'Final report submission with up to 3 attempts + faculty evaluation (0-100)',
      'Automated certificate generation with customizable templates',
      '12+ email notification triggers with 300-frame cinematic landing page'
    ],
    sop: [
      { step: 1, title: 'Student Registration', description: 'Students register with Campus Placement or Self-Sourced path. Email verification enforced with password complexity requirements.' },
      { step: 2, title: 'Faculty Verification', description: 'Faculty review student registrations, verify or reject specific fields, and add comments. Students are notified to correct rejected fields.' },
      { step: 3, title: 'Manager Reports', description: 'Workplace managers submit periodic performance reports with core task logs and behavioural assessments at scheduled intervals.' },
      { step: 4, title: 'Final Submission', description: 'Students submit their final internship report (up to 3 attempts). Faculty evaluate with marks (0-100) and detailed feedback.' },
      { step: 5, title: 'Certificate Generation', description: 'After faculty sign-off, the system auto-generates internship certificates in PDF format with all relevant details.' }
    ],
    demoCredentials: { email: 'demo@manasarora.dev', password: 'Demo@2024', url: '' },
    metrics: { timeSaved: '25+ hrs/month', costReduction: '35%', efficiency: '3x faster' }
  },
  {
    id: 'simplyform',
    title: 'SimplyForm — Dynamic Form Builder',
    subtitle: 'Intelligent Form Creation & Analytics',
    description: 'A Google Forms alternative with drag-and-drop form building, public sharing via custom slugs, response dashboards with analytics, and Excel export — built for speed and simplicity.',
    longDescription: `SimplyForm lets anyone create beautiful, functional forms in minutes. The drag-and-drop builder supports multiple field types with validation rules and conditional logic. Published forms are accessible via clean public URLs (/f/:slug). The response dashboard provides real-time analytics, individual response drill-downs, and one-click Excel export. Built with React 19, Firebase Auth, and Firestore for real-time data sync.`,
    category: 'Productivity / No-Code',
    tags: ['Forms', 'No-Code', 'Analytics', 'Drag-Drop', 'Firebase'],
    techStack: ['React 19', 'TypeScript', 'Vite', 'Firebase', 'Firestore', 'Tailwind', 'Radix UI', 'Framer Motion', 'React Hook Form', 'Zod'],
    color: '#e17055',
    gradient: 'linear-gradient(135deg, #e17055, #fdcb6e)',
    icon: '📝',
    features: [
      'Drag-and-drop visual form builder with rich field types',
      'Public form sharing via custom slug URLs (/f/:slug)',
      'Real-time response dashboard with individual drill-down',
      'Form preview mode before publishing',
      'One-click XLSX export with file-saver',
      'Zod-powered validation and conditional field rendering'
    ],
    sop: [
      { step: 1, title: 'Get in without signing up', description: 'Click "Explore without signing up" on the login screen. You land in a private workspace with a sample form already built, so there is something to open straight away.' },
      { step: 2, title: 'Build a Form', description: 'Click "New Form". Use the drag-and-drop builder to add fields — text, email, dropdowns, checkboxes, ratings, and more.' },
      { step: 3, title: 'Preview & Publish', description: 'Use Preview mode to test your form. When satisfied, publish it to generate a shareable public link (/f/your-slug).' },
      { step: 4, title: 'Collect Responses', description: 'Share the link. Responses stream in real-time to your dashboard. View individual submissions or aggregate analytics.' },
      { step: 5, title: 'Export Data', description: 'Click Export to download all responses as a formatted Excel file. Optionally push data to Google Sheets via webhook.' }
    ],
    demoCredentials: { email: 'demo@manasarora.dev', password: 'Demo@2024', url: 'https://simplyform.vercel.app' },
    metrics: { timeSaved: '80% faster creation', costReduction: '100% free', efficiency: '5x faster' }
  },
  {
    id: 'scaleresume',
    title: 'ScaleResume — AI Resume Builder',
    subtitle: 'WYSIWYG A4 Editor with AI Enhancement',
    description: 'A pixel-perfect WYSIWYG resume builder with strict A4 page boundaries, AI-powered bullet point improvement via Google Gemini, dynamic font-scaling, multiple draft management, and one-click PDF/DOCX export.',
    longDescription: `ScaleResume is not just another resume builder — it's a precision instrument. The WYSIWYG editor enforces strict A4 page boundaries with dynamic font-scaling (Times New Roman, 9-10pt) to guarantee single-page resumes. Gemini AI improves bullet points for impact and clarity. Features include multiple draft management with auto-save, custom sections, rich text inline editing, zoom controls, and export to both PDF (html2canvas + jsPDF) and DOCX formats. Sanitized with DOMPurify for security.`,
    category: 'Career Tech / AI',
    tags: ['Resume', 'AI', 'WYSIWYG', 'PDF', 'Gemini'],
    techStack: ['Next.js 15', 'React 19', 'Zustand', 'Firebase', 'Google Gemini', 'jsPDF', 'html2canvas', 'DOMPurify', 'Tailwind'],
    color: '#fd79a8',
    gradient: 'linear-gradient(135deg, #fd79a8, #e84393)',
    icon: '📄',
    features: [
      'WYSIWYG A4 editor with strict single-page enforcement',
      'AI bullet point improvement powered by Google Gemini 2.5 Flash',
      'Dynamic font-scaling (9-10pt) to fit content perfectly',
      'Multiple draft management with Zustand persistent state + auto-save',
      'Export to PDF (pixel-perfect) and DOCX formats',
      'Rich text inline editor with format toolbar and zoom controls'
    ],
    sop: [
      { step: 1, title: 'Sign In', description: 'Log in with Google OAuth. You\'ll see your dashboard with all saved resume drafts.' },
      { step: 2, title: 'Create or Edit Draft', description: 'Start a new resume or edit an existing draft. The A4 canvas opens with section-by-section editing.' },
      { step: 3, title: 'Add Content', description: 'Fill in your details — the editor enforces A4 boundaries. Use the format toolbar for styling. Add custom sections as needed.' },
      { step: 4, title: 'AI Enhancement', description: 'Select any bullet point and click the AI button. Gemini rewrites it for maximum impact and clarity.' },
      { step: 5, title: 'Export', description: 'Click Export to download as a pixel-perfect PDF or editable DOCX. The dynamic font-scaler ensures everything fits on one page.' }
    ],
    demoCredentials: { email: 'Sign in with Google (SSO)', password: 'Not required', url: 'https://scaleresume.vercel.app' },
    metrics: { timeSaved: '90% faster', costReduction: '100% free', efficiency: '5x match rate' }
  },
  {
    id: 'sip-bootcamp-attendance',
    title: 'QR Attendance Tracking System',
    subtitle: 'Geofenced QR-Based Attendance',
    description: 'A QR code-based attendance tracking system with geofencing support, session management, multi-role dashboards, and automated Excel exports — built for high-volume event and bootcamp management.',
    longDescription: `Streamline attendance tracking for events, bootcamps, and training programs. Admins create sessions with details (topic, facilitator, room, time slot), generate QR codes, and students scan to mark attendance. Optional geofencing verifies physical presence by comparing student location against admin coordinates. Features include multi-program support, section-based filtering, audit logging, and one-click XLSX export.`,
    category: 'Event Tech',
    tags: ['QR Code', 'Attendance', 'Geofencing', 'Firebase', 'Events'],
    techStack: ['React 19', 'TypeScript', 'Vite', 'Firebase', 'html5-qrcode', 'otplib', 'Tailwind', 'XLSX'],
    color: '#0984e3',
    gradient: 'linear-gradient(135deg, #0984e3, #74b9ff)',
    icon: '📱',
    features: [
      'QR code generation and scanning for instant attendance',
      'Geofencing — verify physical presence via GPS distance',
      'Multi-program support with section-based filtering',
      'Session management with topic, facilitator, room, and time slots',
      'Admin audit logging for all attendance modifications',
      'One-click XLSX export with offline persistence via Firestore'
    ],
    sop: [
      { step: 1, title: 'Admin: Create Session', description: 'Click "Explore as Admin" on the login screen — no credentials needed. Create a session with date, time slot, topic, facilitator, room and section.' },
      { step: 2, title: 'Generate QR Code', description: 'The system generates a unique QR code for the session. Display it on screen for attendees to scan.' },
      { step: 3, title: 'Student: Scan QR', description: 'Students open the app, navigate to the scanner, and scan the displayed QR code to mark their attendance.' },
      { step: 4, title: 'Geofence Verification', description: 'If enabled, the system checks the student\'s GPS location against the admin\'s position to verify physical presence.' },
      { step: 5, title: 'Export Report', description: 'Admin exports attendance data to XLSX with status tracking (Present, Absent, N/A) for all sessions.' }
    ],
    demoCredentials: { email: 'demo@manasarora.dev', password: 'Demo@2024', url: '' },
    metrics: { timeSaved: '95% faster', accuracy: '100% verified', scalability: '500+ users' }
  }
];

export const services = [
  {
    id: 'process-automation',
    title: 'Process Automation',
    description: 'Eliminate repetitive manual tasks with intelligent automation. We analyze your workflows, identify bottlenecks, and implement custom automation solutions that save time and reduce errors.',
    icon: '⚡',
    color: '#2997ff',
    benefits: ['Reduce manual work by 60-80%', 'Eliminate human errors', 'Free up your team for strategic work']
  },
  {
    id: 'ai-integration',
    title: 'AI Integration',
    description: 'Embed artificial intelligence into your existing processes. From smart document processing to predictive analytics, we make AI accessible and actionable for your business.',
    icon: '🧠',
    color: '#6c5ce7',
    benefits: ['Smart decision support', 'Predictive insights', 'Natural language interfaces']
  },
  {
    id: 'custom-software',
    title: 'Custom Software Development',
    description: 'Purpose-built applications tailored to your unique business needs. We design, develop, and deploy scalable solutions that grow with your business.',
    icon: '💻',
    color: '#a855f7',
    benefits: ['Tailored to your workflow', 'Scalable architecture', 'Ongoing support & updates']
  },
  {
    id: 'data-analytics',
    title: 'Data & Analytics',
    description: 'Transform raw data into actionable insights. We build custom dashboards, reporting tools, and analytics pipelines that help you make data-driven decisions faster.',
    icon: '📈',
    color: '#00b894',
    benefits: ['Real-time dashboards', 'Automated reporting', 'Actionable insights']
  }
];

// Every number here must be independently checkable by a visitor.
// No satisfaction percentages, no cost-reduction averages, no client counts —
// those cannot be verified and a skeptic who catches one stops believing all of them.
//
// The first two are DERIVED, never typed. A visitor can count the cards on the page,
// so a hand-written number silently becomes a lie the moment a project is added or
// pulled — which is exactly what happened when the FTT Signal Engine was removed.
export const stats = [
  { value: projects.length, suffix: '', label: 'Products Shipped' },
  {
    value: Object.values(demoAccounts).filter((d) => d.status === 'live').length,
    suffix: '',
    label: 'Live Demos You Can Try'
  },
  { value: 6, suffix: '', label: 'Garage Automations Mapped' },
  { value: 1, suffix: '', label: 'Free Automation to Start' }
];

// Real testimonials go here once clients give them, with permission and full
// attribution — name, business, city. Until then this stays empty and the
// Proof section shows verifiable evidence instead.
// Do not populate this with illustrative or placeholder quotes.
export const testimonials = [];

// Playbook data moved to data/playbooks/registry.js so the buyer-facing pages do
// not import this whole file just to list two industries.
