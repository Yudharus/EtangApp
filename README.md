# 💸 Etang App — Smart Personal Finance & Receipt Tracker

**Etang App** (E-Tang) is a modern, intelligent personal finance web application built to simplify expense tracking, budget management, and financial goal setting. Powered by client-side OCR image processing, Etang App allows users to scan physical receipts, auto-extract purchase metadata, and seamlessly manage transactions in real time.

---

## ✨ Key Features

- **📊 Financial Analytics Dashboard**: Instant overview of net balance, total income, total expenses, monthly budget utilization, and cashflow charts powered by Recharts.
- **🧾 Smart OCR Receipt Scanner**: Built-in client-side Optical Character Recognition (OCR) using Tesseract.js and HTML5 canvas image processing to auto-detect merchant names, itemized lists, dates, and total amounts directly from uploaded or captured receipts.
- **💸 Transaction Management**: Filter, search, and manage income, expense, and deposit transactions effortlessly.
- **🏷️ Category & Budget Management**: Custom categories with monthly budget caps, spending progress indicators, and visual color-coding.
- **🎯 Savings Goals & Deposit Tracking**: Set financial milestones, track deposit progress towards goals, and monitor completion percentages.
- **🎨 Atomic Design System**: Clean, modular UI components built using Atomic Design principles (Atoms, Molecules, Organisms, Templates) featuring smooth Framer Motion animations and responsive styling.

---

## 🛠️ Tech Stack

- **Core Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security & GoTrue Auth)
- **Styling & UI Components**: [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide React Icons](https://lucide.dev/)
- **State Management**: [Zustand v5](https://zustand-demo.pmnd.rs/) (Real-time synchronization with Supabase)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Client-Side OCR & Image Processing**: [Tesseract.js](https://tesseract.projectnaptha.com/) + HTML5 Canvas API

---

## 📁 Project Structure

```text
etang-app/
├── app/                  # Next.js App Router (pages, layout, global styles)
├── components/           # Atomic Design Component Architecture
│   ├── atoms/            # Basic UI elements (buttons, inputs, badges)
│   ├── molecules/        # Combinations of atoms (form fields, stat cards)
│   ├── organisms/        # Complex UI modules (header, transaction tables, scanner modal)
│   └── templates/        # Page layout structures
├── stores/               # Zustand state stores synchronized with Supabase
├── types/                # TypeScript interface and type definitions
├── utils/                # Utility modules (Supabase client, OCR engine, canvas image processor)
└── public/               # Static assets & OCR trained language data
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+ recommended) installed on your machine.

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd etang-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📜 Available Scripts

- `npm run dev` — Starts the Next.js development server.
- `npm run build` — Builds the application for production.
- `npm run start` — Runs the production build server.
- `npm run lint` — Runs ESLint for code quality checks.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
