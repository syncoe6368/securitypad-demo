"use client";

import { useState } from "react";
import { Shield, Zap, Search, Bug, Code2, FileWarning, ArrowRight, Play } from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import ShowcaseCard from "@/components/ShowcaseCard";
import ComparisonTable from "@/components/ComparisonTable";

const SAMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableVault {
    mapping(address => uint256) public balances;
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    // ⚠️ Reentrancy vulnerability
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount);
        
        // BUG: State update AFTER external call
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= amount;
    }
    
    // ⚠️ Missing access control
    function emergencyWithdraw(address to, uint256 amount) public {
        payable(to).transfer(amount);
    }
}`;

export default function Home() {
  const [code, setCode] = useState(SAMPLE_CONTRACT);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<string | null>(null);

  const handleScan = async () => {
    setScanning(true);
    // Simulate scan
    setTimeout(() => {
      setResults("Found 3 vulnerabilities: 1 Critical, 1 High, 1 Low");
      setScanning(false);
    }, 2000);
  };

  const features = [
    {
      icon: Search,
      title: "AI-Powered Analysis",
      desc: "Deep semantic analysis powered by LLMs. Catches logic bugs that pattern-matchers miss.",
    },
    {
      icon: Bug,
      title: "PoC Generation",
      desc: "One-click Foundry test case generation. See the exploit before the attacker does.",
    },
    {
      icon: Code2,
      title: "Smart Remediation",
      desc: "Step-by-step fix guidance with code examples. Not just 'what's wrong' — 'how to fix it.'",
    },
    {
      icon: Zap,
      title: "Real-time Scanning",
      desc: "Sub-second analysis. Paste code, get results. No waiting for CI/CD pipelines.",
    },
    {
      icon: Shield,
      title: "Exploit Detection",
      desc: "Detects reentrancy, overflow, access control, flash loan attacks, and 50+ more patterns.",
    },
    {
      icon: FileWarning,
      title: "Slither Compatible",
      desc: "Runs Slither under the hood, then adds AI explanations on top. Best of both worlds.",
    },
    {
      icon: Code2,
      title: "VS Code Extension",
      desc: "Scan directly in your IDE. Inline warnings as you type, just like Copilot.",
    },
    {
      icon: Shield,
      title: "CI/CD Integration",
      desc: "GitHub Actions, GitLab CI, CircleCI. Block merges with critical findings.",
    },
    {
      icon: FileWarning,
      title: "Audit Reports",
      desc: "Export professional PDF audit reports. Share with stakeholders or submit to auditors.",
    },
  ];

  const showcases = [
    {
      title: "Parity Multi-Sig Wallet",
      amount: "$31M",
      date: "July 2017",
      description:
        "Attacker exploited a vulnerability in the Parity multi-sig wallet library, draining $31M in ETH from three wallets.",
      vulnerability: "Unprotected selfdestruct / delegatecall",
      howWeCatch:
        "SecurityPad's delegatecall analyzer detects unprotected library initialization and flags the selfdestruct in a library context as critical.",
    },
    {
      title: "The DAO Hack",
      amount: "$60M",
      date: "June 2016",
      description:
        "The most famous smart contract hack. Attacker exploited a reentrancy vulnerability to drain 3.6M ETH.",
      vulnerability: "Reentrancy (call.value before state update)",
      howWeCatch:
        "SecurityPad's call-graph analysis immediately flags external calls before state changes. The AI explains the attack vector and generates a PoC.",
    },
    {
      title: "BeamFi Protocol",
      amount: "$2.6M",
      date: "2024",
      description:
        "Flash loan attack exploiting incorrect price oracle usage and missing slippage protection.",
      vulnerability: "Oracle manipulation / Missing slippage checks",
      howWeCatch:
        "SecurityPad's DeFi-specific detectors flag unprotected price reads and missing slippage bounds. AI explains the flash loan attack sequence.",
    },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-success pulse-dot" />
            <span className="text-text-muted text-sm">AI-Powered Smart Contract Security</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-text mb-6 leading-tight">
            Copilot helps you code faster.{" "}
            <br className="hidden sm:block" />
            <span className="gradient-text">SecurityPad helps you code safer.</span>
          </h1>
          <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-4">
            You need both.
          </p>
          <p className="text-text-muted text-sm md:text-base max-w-xl mx-auto mb-8">
            AI-powered smart contract auditing that catches logic bugs Slither misses,
            explains them in plain English, and generates exploit PoCs.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/scan"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all"
            >
              <Shield size={18} />
              Analyze Your Code
            </a>
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border text-text hover:bg-card-hover font-semibold rounded-xl transition-all">
              <Play size={18} />
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Code Editor Section */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">
              Paste. Scan. Fix.
            </h2>
            <p className="text-text-muted">
              Drop your Solidity code below and let SecurityPad find the bugs
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-critical" />
                <div className="w-3 h-3 rounded-full bg-low" />
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-text-muted text-sm ml-2 font-mono">contract.sol</span>
              </div>
              <button
                onClick={handleScan}
                disabled={scanning}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all"
              >
                {scanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Analyze Code
                  </>
                )}
              </button>
            </div>

            <CodeEditor code={code} onCodeChange={setCode} language="solidity" />

            {results && (
              <div className="p-4 border-t border-border bg-critical/5">
                <div className="flex items-center gap-2 text-critical font-semibold text-sm">
                  <Bug size={16} />
                  {results}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* "Caught This Bug" Showcase */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">
              Bugs That Cost Millions.
            </h2>
            <p className="text-text-muted">
              SecurityPad would have caught these before they happened.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {showcases.map((s, i) => (
              <ShowcaseCard key={i} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Live Comparison */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">
              SecurityPad vs. The Rest
            </h2>
            <p className="text-text-muted">
              Slither gives you a list. SecurityPad gives you a tutorial.
            </p>
          </div>

          <ComparisonTable />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">
              Everything You Need to Ship Secure Code
            </h2>
            <p className="text-text-muted">
              From analysis to remediation, one platform handles it all.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-5 card-hover"
              >
                <f.icon className="text-accent mb-3" size={24} />
                <h3 className="text-text font-semibold mb-1">{f.title}</h3>
                <p className="text-text-muted text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-text mb-4">
            Ready to Ship Safer Smart Contracts?
          </h2>
          <p className="text-text-muted text-lg mb-8">
            Join hundreds of developers who trust SecurityPad to catch bugs before mainnet.
          </p>
          <a
            href="/scan"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl text-lg transition-all"
          >
            Start Free Scan
            <ArrowRight size={20} />
          </a>
        </div>
      </section>
    </div>
  );
}
