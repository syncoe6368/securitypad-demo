'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface SecurityScoreProps {
  score: number;
  size?: number;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#fbbf24';
  if (score >= 40) return '#f97316';
  return '#ef4444';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Low Risk';
  if (score >= 60) return 'Moderate';
  if (score >= 40) return 'Elevated';
  return 'High Risk';
};

export default function SecurityScore({ score, size = 120 }: SecurityScoreProps) {
  const color = getScoreColor(score);
  const data = [
    { name: 'score', value: score },
    { name: 'remaining', value: 100 - score },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: size, height: size }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="90%"
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="#161b22" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {score}
          </span>
          <span className="text-[10px] text-muted">/ 100</span>
        </div>
      </div>
      <span
        className="text-xs font-medium px-2 py-0.5 rounded"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {getScoreLabel(score)}
      </span>
    </div>
  );
}
