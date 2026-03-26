"use client";

import { Check, X, Minus } from "lucide-react";

interface ComparisonFeature {
  feature: string;
  securitypad: boolean | string;
  slither: boolean | string;
  copilot: boolean | string;
}

const features: ComparisonFeature[] = [
  { feature: "Static Analysis", securitypad: true, slither: true, copilot: "Limited" },
  { feature: "AI-Powered Explanations", securitypad: true, slither: false, copilot: false },
  { feature: "PoC Generation", securitypad: true, slither: false, copilot: false },
  { feature: "Auto Remediation", securitypad: true, slither: false, copilot: "Partial" },
  { feature: "Solidity Focus", securitypad: true, slither: true, copilot: false },
  { feature: "CI/CD Integration", securitypad: true, slither: true, copilot: "GitHub only" },
  { feature: "Real-time Analysis", securitypad: true, slither: false, copilot: true },
  { feature: "Exploit Detection", securitypad: true, slither: "Patterns", copilot: false },
  { feature: "Code Completion", securitypad: false, slither: false, copilot: true },
  { feature: "Learning Curve", securitypad: "Low", slither: "Medium", copilot: "Low" },
  { feature: "Price", securitypad: "$99/mo", slither: "Free", copilot: "$10-39/mo" },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check size={16} className="text-success" />;
  if (value === false) return <X size={16} className="text-text-muted opacity-40" />;
  if (value === "Partial" || value === "Limited" || value === "Patterns")
    return <Minus size={16} className="text-low" />;
  return <span className="text-text-muted text-xs">{value}</span>;
}

export default function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-card border-b border-border">
            <th className="text-left py-3 px-4 text-text-muted font-medium">Feature</th>
            <th className="text-center py-3 px-4 text-accent font-semibold">SecurityPad</th>
            <th className="text-center py-3 px-4 text-text-muted font-medium">Slither</th>
            <th className="text-center py-3 px-4 text-text-muted font-medium">Copilot</th>
          </tr>
        </thead>
        <tbody>
          {features.map((f, i) => (
            <tr key={i} className="border-b border-border last:border-b-0 hover:bg-card/50">
              <td className="py-3 px-4 text-text">{f.feature}</td>
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center"><CellValue value={f.securitypad} /></div>
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center"><CellValue value={f.slither} /></div>
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center"><CellValue value={f.copilot} /></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
