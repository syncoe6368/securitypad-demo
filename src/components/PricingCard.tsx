"use client";

import { Check, X, Zap } from "lucide-react";

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingCardProps {
  tier: string;
  price: string;
  period?: string;
  description: string;
  features: PricingFeature[];
  highlighted?: boolean;
  cta: string;
  onSelect: () => void;
}

export default function PricingCard({
  tier,
  price,
  period = "/mo",
  description,
  features,
  highlighted = false,
  cta,
  onSelect,
}: PricingCardProps) {
  return (
    <div
      className={`relative bg-card rounded-2xl border p-6 flex flex-col ${
        highlighted
          ? "border-accent shadow-lg shadow-accent/10 scale-105"
          : "border-border"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <Zap size={12} /> Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-text font-bold text-lg">{tier}</h3>
        <p className="text-text-muted text-sm mt-1">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-text text-4xl font-bold">{price}</span>
        {price !== "Custom" && price !== "Free" && (
          <span className="text-text-muted text-sm">{period}</span>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            {feature.included ? (
              <Check size={16} className="text-success mt-0.5 flex-shrink-0" />
            ) : (
              <X size={16} className="text-text-muted mt-0.5 flex-shrink-0" />
            )}
            <span className={feature.included ? "text-text" : "text-text-muted"}>
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
          highlighted
            ? "bg-accent hover:bg-accent-hover text-white"
            : "bg-card border border-border text-text hover:bg-card-hover"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}
