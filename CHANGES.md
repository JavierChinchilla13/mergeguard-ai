# MergeGuard Implementation Details

This document outlines the architectural choices, tech stack, and features implemented for the MergeGuard landing page.

## 🚀 Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (Alpha)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Utilities:** clsx, tailwind-merge, class-variance-authority

## 📂 Project Structure

```text
merge-guard/
├── app/
│   ├── globals.css      # Custom Tailwind v4 config & global utilities
│   ├── layout.tsx       # Root layout with Geist font & metadata
│   └── page.tsx         # Main Landing Page (State orchestration)
├── components/
│   ├── layout/          # Navbar and Footer components
│   ├── sections/        # Hero, PR Input, and Results sections
│   └── ui/              # Reusable atomic UI components (Button, Card, etc.)
├── lib/
│   ├── mock-data.ts     # Sample PR review results for demonstration
│   └── utils.ts         # Tailwind merging utility (cn)
└── CHANGES.md           # This file
```

## ✨ Key Features Implemented

### 1. Developer Tooling Aesthetic
- **Dark Mode First:** Deep `#0a0a0a` background with subtle contrast.
- **Glassmorphism:** Used `backdrop-blur` and translucent borders for cards and navigation.
- **Typography:** Leveraging Next.js Geist font for a clean, modern look.
- **Gradients:** Subtle mesh gradients in the background to add depth.

### 2. Interactive Analysis Flow
- **PR Input:** A high-fidelity search bar with URL validation for GitHub Pull Requests.
- **Loading Progress:** A multi-step animated progress bar that simulates:
  1. Fetching pull request data.
  2. Analyzing code patterns.
  3. Generating recommendations.
- **Smooth Transitions:** Used `AnimatePresence` for seamless transitions between the Hero/Input state and the Results view.

### 3. Review Results UI
- **Categorization:** Issues are grouped into Bugs, Security, Performance, Code Smells, and Suggestions.
- **Severity Badges:** Color-coded badges (Critical, High, Medium, Low) for quick triage.
- **Expandable Cards:** Issues are collapsible to keep the UI clean while allowing deep-dives.
- **Code Snippets:** A custom `CodeBlock` component that mimics GitHub's code view for familiarity.
- **AI Recommendations:** Targeted advice for every issue detected.

### 4. Technical Quality
- **Responsive Design:** Mobile-first approach with custom container widths for larger screens.
- **Build Verified:** Successfully passed `npm run build` with full TypeScript type checking.
- **Performance:** Optimized for CLS (Cumulative Layout Shift) using Framer Motion's layout animations.

## 🛠️ Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run development server:**
    ```bash
    npm run dev
    ```

3.  **Build for production:**
    ```bash
    npm run build
    ```

## 🐞 Fixes & Refinements During Development
- **Icon Compatibility:** Replaced brand-specific icons (GitHub, Twitter) with standard Lucide icons (`Globe`, `MessageSquare`) to ensure broad compatibility across Lucide versions.
- **Type Safety:** Ensured all mock data and component props are strictly typed.
- **Scroll UX:** Added automatic smooth-scrolling to results once analysis completes.
