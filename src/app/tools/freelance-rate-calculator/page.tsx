"use client";

import { useState } from "react";
import Link from "next/link";

function formatPKR(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString()}`;
}

function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export default function FreelanceRateCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState<string>("6");
  const [workingDaysPerMonth, setWorkingDaysPerMonth] = useState<string>("22");
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>("20000");
  const [profitMargin, setProfitMargin] = useState<string>("20");
  const [usdRate, setUsdRate] = useState<string>("280");

  const [result, setResult] = useState<{
    hourlyRatePKR: number;
    hourlyRateUSD: number;
    dailyRatePKR: number;
    weeklyRatePKR: number;
    projectRate5Days: number;
    projectRate10Days: number;
    totalMonthlyNeeded: number;
  } | null>(null);

  const handleCalculate = () => {
    const income = parseFloat(monthlyIncome);
    const hoursPerDay = parseFloat(workingHoursPerDay);
    const daysPerMonth = parseFloat(workingDaysPerMonth);
    const expenses = parseFloat(monthlyExpenses);
    const margin = parseFloat(profitMargin);
    const usd = parseFloat(usdRate);

    if ([income, hoursPerDay, daysPerMonth, expenses, margin, usd].some(isNaN)) return;
    if (income <= 0 || hoursPerDay <= 0 || daysPerMonth <= 0) return;

    const totalMonthlyNeeded = (income + expenses) * (1 + margin / 100);
    const totalHoursPerMonth = hoursPerDay * daysPerMonth;
    const hourlyRatePKR = totalMonthlyNeeded / totalHoursPerMonth;
    const hourlyRateUSD = hourlyRatePKR / usd;
    const dailyRatePKR = hourlyRatePKR * hoursPerDay;
    const weeklyRatePKR = dailyRatePKR * 5;
    const projectRate5Days = dailyRatePKR * 5;
    const projectRate10Days = dailyRatePKR * 10;

    setResult({
      hourlyRatePKR,
      hourlyRateUSD,
      dailyRatePKR,
      weeklyRatePKR,
      projectRate5Days,
      projectRate10Days,
      totalMonthlyNeeded,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <nav className="mb-8 text-sm text-muted">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-primary transition-colors">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Freelance Rate Calculator</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold mb-4">
        Freelance Rate <span className="gradient-text">Calculator</span>
      </h1>
      <p className="text-muted text-lg mb-8">
        Calculate your ideal freelance hourly and project rates based on your desired income, expenses, and working hours.
      </p>

      <div className="p-6 sm:p-8 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Desired Monthly Income (PKR)
            </label>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              placeholder="e.g. 200000"
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Monthly Expenses (PKR)
            </label>
            <input
              type="number"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(e.target.value)}
              placeholder="e.g. 20000"
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Working Hours Per Day
            </label>
            <input
              type="number"
              value={workingHoursPerDay}
              onChange={(e) => setWorkingHoursPerDay(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Working Days Per Month
            </label>
            <input
              type="number"
              value={workingDaysPerMonth}
              onChange={(e) => setWorkingDaysPerMonth(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Profit Margin (%)
            </label>
            <input
              type="number"
              value={profitMargin}
              onChange={(e) => setProfitMargin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              USD to PKR Rate
            </label>
            <input
              type="number"
              value={usdRate}
              onChange={(e) => setUsdRate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-primary/40"
        >
          Calculate My Rates
        </button>

        {result && (
          <div className="mt-8 animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-sm text-muted block mb-1">Hourly Rate</span>
                <span className="text-2xl font-bold text-emerald-500 block">{formatPKR(result.hourlyRatePKR)}</span>
                <span className="text-sm text-muted">{formatUSD(result.hourlyRateUSD)}/hr</span>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                <span className="text-sm text-muted block mb-1">Daily Rate</span>
                <span className="text-2xl font-bold text-blue-500">{formatPKR(result.dailyRatePKR)}</span>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                <span className="text-sm text-muted block mb-1">Weekly Rate</span>
                <span className="text-2xl font-bold text-purple-500">{formatPKR(result.weeklyRatePKR)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                <span className="text-sm text-muted block mb-1">5-Day Project Rate</span>
                <span className="text-xl font-bold text-cyan-500">{formatPKR(result.projectRate5Days)}</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-sm text-muted block mb-1">10-Day Project Rate</span>
                <span className="text-xl font-bold text-amber-500">{formatPKR(result.projectRate10Days)}</span>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <span className="text-sm text-muted">Total monthly revenue needed: </span>
              <span className="font-bold text-primary">{formatPKR(result.totalMonthlyNeeded)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-xl font-bold mb-3">About This Calculator</h2>
        <p className="text-muted leading-relaxed">
          Setting the right freelance rate is crucial for Pakistani developers working on platforms like Upwork, Fiverr, and Toptal. Our freelance rate calculator helps you determine competitive hourly and project-based rates by factoring in your desired monthly income, business expenses, taxes, and profit margins. Stop undervaluing your work — calculate rates that sustain your freelance career.
        </p>
      </div>
    </div>
  );
}
