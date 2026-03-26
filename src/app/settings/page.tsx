'use client';

import { useState } from 'react';
import { Key, Github, Users, CreditCard, Bell, Shield } from 'lucide-react';

const sections = [
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'integrations', label: 'Integrations', icon: Github },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('api');

  return (
    <div className="max-w-[1000px] mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <nav className="w-48 shrink-0 space-y-1">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-left transition-colors ${
                activeSection === id
                  ? 'bg-info/10 text-info border border-info/20'
                  : 'text-muted hover:text-text hover:bg-card'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 card p-6 space-y-6">
          {activeSection === 'api' && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="text-lg font-semibold">Bring Your Own Key (BYOK)</h2>
              <p className="text-sm text-muted">Bypass subscription rate limits by plugging in your own LLM provider API keys.</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-background rounded border border-border">
                  <div>
                    <div className="text-sm font-medium">Anthropic API Key</div>
                    <div className="text-xs font-mono text-muted mt-1">sk-ant-••••••••••••4a8f</div>
                    <p className="text-xs text-muted mt-2">Key is transmitted once over TLS and not stored on client</p>
                  </div>
                  <button className="text-xs text-critical hover:underline">Remove</button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-background rounded border border-border border-dashed">
                  <div>
                    <div className="text-sm font-medium">OpenRouter API Key</div>
                    <div className="text-xs text-muted mt-1">Connect OpenRouter for access to multiple models</div>
                  </div>
                  <button className="btn-primary text-xs">Configure</button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-background rounded border border-border border-dashed">
                  <div>
                    <div className="text-sm font-medium">OpenAI API Key</div>
                    <div className="text-xs text-muted mt-1">Connect OpenAI for GPT-4 analysis capabilities</div>
                  </div>
                  <button className="btn-primary text-xs">Configure</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'integrations' && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="text-lg font-semibold">Integrations</h2>
              <p className="text-sm text-muted">Connect external services</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background rounded border border-border">
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5" />
                    <div>
                      <div className="text-sm font-medium">GitHub</div>
                      <div className="text-xs text-muted">GitHub Actions for auto-scanning PRs and commits</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-xs rounded border border-border text-muted hover:text-text transition-colors">
                      View Setup Guide
                    </button>
                    <button className="btn-primary text-xs">Install App</button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔗</span>
                    <div>
                      <div className="text-sm font-medium">Foundry</div>
                      <div className="text-xs text-muted">Auto-generate PoC tests</div>
                    </div>
                  </div>
                  <button className="btn-primary text-xs">Connect</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'team' && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="text-lg font-semibold">Team Members</h2>
              <p className="text-sm text-muted">Manage team access</p>
              <div className="space-y-3">
                {['Alice (Owner)', 'Bob (Auditor)', 'Charlie (Viewer)'].map((member) => (
                  <div key={member} className="flex items-center justify-between p-3 bg-background rounded border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center text-info text-sm font-medium">
                        {member[0]}
                      </div>
                      <span className="text-sm">{member}</span>
                    </div>
                    <button className="text-xs text-muted hover:text-text">Edit</button>
                  </div>
                ))}
                <button className="btn-primary text-sm">Invite Member</button>
              </div>
            </div>
          )}

          {activeSection === 'billing' && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="text-lg font-semibold">Billing</h2>
              <p className="text-sm text-muted">Manage your subscription</p>
              <div className="p-4 bg-background rounded border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Pro Plan</span>
                  <span className="text-info font-bold">$29/mo</span>
                </div>
                <div className="text-xs text-muted space-y-1">
                  <p>✓ Unlimited scans</p>
                  <p>✓ PoC generation</p>
                  <p>✓ GitHub integration</p>
                  <p>✓ Priority support</p>
                </div>
              </div>
              <button className="px-3 py-1.5 text-sm rounded border border-border text-muted hover:text-text transition-colors">
                Manage Subscription (Stripe)
              </button>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-sm text-muted">Configure alert preferences</p>
              {['Critical findings found', 'Scan completed', 'Weekly security report', 'Team activity'].map((item) => (
                <label key={item} className="flex items-center justify-between p-3 bg-background rounded border border-border cursor-pointer">
                  <span className="text-sm">{item}</span>
                  <input type="checkbox" defaultChecked className="accent-info w-4 h-4" />
                </label>
              ))}
            </div>
          )}

          {activeSection === 'security' && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="text-lg font-semibold">Security Settings</h2>
              <p className="text-sm text-muted">Account security configuration</p>
              <div className="space-y-3">
                <div className="p-3 bg-background rounded border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Two-Factor Authentication</div>
                      <div className="text-xs text-muted">Add an extra layer of security</div>
                    </div>
                    <button className="btn-primary text-xs">Enable</button>
                  </div>
                </div>
                <div className="p-3 bg-background rounded border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Session Management</div>
                      <div className="text-xs text-muted">2 active sessions</div>
                    </div>
                    <button className="text-xs text-muted hover:text-text">View All</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
