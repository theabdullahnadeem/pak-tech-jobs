"use client";

import { useState } from "react";
import Link from "next/link";

const taxSlabs = [
  { min: 0, max: 600000, rate: 0, fixed: 0 },
  { min: 600001, max: 1200000, rate: 2.5, fixed: 0 },
  { min: 1200001, max: 2400000, rate: 12.5, fixed: 15000 },
  { min: 2400001, max: 3600000, rate: 22.5, fixed: 165000 },
  { min: 3600001, max: 6000000, rate: 27.5, fixed: 435000 },
  { min: 6000001, max: Infinity, rate: 35, fixed: 1095000 },
];

function calculateTax(annualSalary: number): number {
  if (annualSalary <= 0) return 0;

  for (const slab of taxSlabs) {
    if (annualSalary >= slab.min && annualSalary <= slab.max) {
      const taxableAboveSlab = annualSalary - slab.min + 1;
      return slab.fixed + (taxableAboveSlab * slab.rate) / 100;
    }
  }
  return 0;
}

function formatPKR(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString()}`;
}

export default function SalaryAfterTaxCalculator() {
  const [monthlySalary, setMonthlySalary] = useState<string>("");
  const [result, setResult] = useState<{
    annualGross: number;
    annualTax: number;
    monthlyTax: number;
    monthlyNet: number;
    effectiveRate: number;
  } | null>(null);

  const handleCalculate = () => {
    const monthly = parseFloat(monthlySalary);
    if (isNaN(monthly) || monthly <= 0) return;

    const annualGross = monthly * 12;
    const annualTax = calculateTax(annualGross);
    const monthlyTax = annualTax / 12;
    const monthlyNet = monthly - monthlyTax;
    const effectiveRate = annualGross > 0 ? (annualTax / annualGross) * 100 : 0;

    setResult({
      annualGross,
      annualTax,
      monthlyTax,
      monthlyNet,
      effectiveRate,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tools" className="hover:text-primary transition-colors">Tools</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Salary After Tax Calculator</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold mb-4">
        Salary After Tax <span className="gradient-text">Calculator</span>
      </h1>
      <p className="text-muted text-lg mb-8">
        Calculate your take-home salary after Pakistani income tax deductions using FBR tax slabs 2024-25.
      </p>

      {/* Calculator */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark mb-8">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Monthly Gross Salary (PKR)
          </label>
          <input
            type="number"
            value={monthlySalary}
            onChange={(e) => setMonthlySalary(e.target.value)}
            placeholder="e.g. 150000"
            className="w-full px-4 py-3 rounded-xl border border-border dark:border-border-dark bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        <button
          onClick={handleCalculate}
          className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-primary/40"
        >
          Calculate Take-Home Salary
        </button>

        {result && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-sm text-muted block mb-1">Monthly Take-Home</span>
              <span className="text-2xl font-bold text-emerald-500">{formatPKR(result.monthlyNet)}</span>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <span className="text-sm text-muted block mb-1">Monthly Tax</span>
              <span className="text-2xl font-bold text-red-500">{formatPKR(result.monthlyTax)}</span>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-sm text-muted block mb-1">Annual Tax</span>
              <span className="text-2xl font-bold text-blue-500">{formatPKR(result.annualTax)}</span>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-sm text-muted block mb-1">Effective Tax Rate</span>
              <span className="text-2xl font-bold text-purple-500">{result.effectiveRate.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Tax Slabs Reference */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark mb-8">
        <h2 className="text-xl font-bold mb-4">Pakistan Income Tax Slabs 2024-25</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border dark:border-border-dark">
                <th className="text-left py-2 px-3 font-semibold text-muted">Annual Income</th>
                <th className="text-right py-2 px-3 font-semibold text-muted">Tax Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50 dark:border-border-dark/50">
                <td className="py-2 px-3">Up to PKR 600,000</td>
                <td className="py-2 px-3 text-right text-emerald-500">0%</td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50">
                <td className="py-2 px-3">PKR 600,001 — 1,200,000</td>
                <td className="py-2 px-3 text-right">2.5% of amount exceeding 600K</td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50">
                <td className="py-2 px-3">PKR 1,200,001 — 2,400,000</td>
                <td className="py-2 px-3 text-right">15K + 12.5% exceeding 1.2M</td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50">
                <td className="py-2 px-3">PKR 2,400,001 — 3,600,000</td>
                <td className="py-2 px-3 text-right">165K + 22.5% exceeding 2.4M</td>
              </tr>
              <tr className="border-b border-border/50 dark:border-border-dark/50">
                <td className="py-2 px-3">PKR 3,600,001 — 6,000,000</td>
                <td className="py-2 px-3 text-right">435K + 27.5% exceeding 3.6M</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Above PKR 6,000,000</td>
                <td className="py-2 px-3 text-right">1.095M + 35% exceeding 6M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SEO Content */}
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-xl font-bold mb-3">About This Calculator</h2>
        <p className="text-muted leading-relaxed">
          Understanding your net salary after tax deductions is essential for financial planning in Pakistan. Our salary after tax calculator uses the latest Federal Board of Revenue (FBR) tax slabs for the fiscal year 2024-25 to give you an accurate breakdown of your take-home pay. Whether you&apos;re a salaried employee, freelancer, or contractor, knowing your effective tax rate helps you budget better and plan for the future.
        </p>
      </div>
    </div>
  );
}
