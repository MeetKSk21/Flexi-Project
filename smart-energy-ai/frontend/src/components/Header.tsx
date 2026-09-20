import React, { useState } from 'react';
import { NavigationTab } from '../types';

interface HeaderProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  carbonIntensity: number;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenChatAdvisor?: () => void;
}

export const LOGO_URL = '/assets/voltiq_logo.png';
export const HOLOGRAM_3D_URL = '/assets/smart_home_3d.png';

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenNotifications,
  unreadCount,
  carbonIntensity,
  isDarkMode = false,
  onToggleDarkMode,
  onOpenChatAdvisor,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavigationTab; label: string; badge?: string }[] = [
    { id: 'live-grid', label: 'Live Grid' },
    { id: 'ai-agents', label: 'AI Agents', badge: '6 Active' },
    { id: 'household-intelligence', label: 'Household Intelligence' },
    { id: 'appliances-ev', label: 'Appliances & EV' },
    { id: 'tariffs-arbitrage', label: 'Tariffs & Arbitrage' },
    { id: 'battery-storage', label: 'Battery Storage' },
    { id: 'eco-impact', label: 'Eco Impact' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-glass backdrop-blur-2xl border-b border-outline-variant/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="h-20 max-w-[1440px] mx-auto px-margin-mobile lg:px-margin flex items-center justify-between gap-gutter">
        {/* Left: Brand Logo & Telemetry Status */}
        <div className="flex items-center gap-space-lg flex-shrink-0">
          <button
            onClick={() => onTabChange('live-grid')}
            className="flex items-center gap-space-sm text-left group focus:outline-none cursor-pointer"
          >
            {/* Inline Vector VoltIQ Pulse Logo */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" fill="none" className="h-8 w-auto">
              <defs>
                <linearGradient id="headerEnergyGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#06B6D4"/>
                  <stop offset="50%" stopColor="#10B981"/>
                  <stop offset="100%" stopColor="#3B82F6"/>
                </linearGradient>
                <linearGradient id="headerGlowGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.2"/>
                </linearGradient>
              </defs>
              <g transform="translate(4, 4)">
                <rect width="32" height="32" rx="8" fill="#0F172A" stroke="url(#headerEnergyGrad)" strokeWidth="1.5"/>
                <circle cx="16" cy="16" r="10" fill="url(#headerGlowGrad)" opacity="0.3"/>
                <path d="M17 7L11 18H16L15 25L21 14H16L17 7Z" fill="url(#headerEnergyGrad)"/>
                <circle cx="16" cy="16" r="1.5" fill="#FFFFFF"/>
              </g>
              <text x="44" y="25" fill="currentColor" fontFamily="'Space Grotesk', system-ui, sans-serif" fontSize="19" fontWeight="700" letterSpacing="-0.02em">
                Volt<tspan fill="#06B6D4">IQ</tspan>
              </text>
              <text x="108" y="24" fill="#64748B" fontFamily="'Space Grotesk', system-ui, sans-serif" fontSize="10" fontWeight="600" letterSpacing="0.1em">
                PULSE
              </text>
            </svg>
          </button>

          <div className="hidden 2xl:flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-high border border-border-cyan-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-bright opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-bright"></span>
            </span>
            <span className="font-label-badge text-label-badge uppercase tracking-wider text-cyan-bright font-bold">
              Telemetry Active
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav
          className="hidden xl:flex items-center gap-space-xs p-space-xs rounded-xl bg-surface-container-low/80 border border-outline-variant/30 backdrop-blur-md"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3.5 py-1.5 rounded-lg transition-all font-body-sm text-body-sm font-medium cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(6,182,212,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-cyan-bright/20 text-cyan-bright border border-cyan-bright/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons & Badges */}
        <div className="flex items-center gap-space-sm flex-shrink-0">
          {/* Peak Shaving Pill */}
          <div className="hidden md:flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-high/90 border border-border-cyan-glow shadow-[0_0_12px_rgba(34,211,238,0.15)]">
            <span className="material-symbols-outlined text-primary text-[16px]">bolt</span>
            <span className="font-label-badge text-label-badge text-primary uppercase tracking-wide font-bold">
              Peak Shaving
            </span>
          </div>

          {/* Real-time Carbon Intensity Chip */}
          <div 
            onClick={() => onTabChange('eco-impact')}
            className="hidden lg:flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-secondary-container/20 border border-border-emerald-glow cursor-pointer hover:bg-secondary-container/30 transition-colors"
            title="Click to view Eco Impact breakdown"
          >
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-bright"></span>
            </span>
            <span className="font-label-numeric-md text-body-sm text-secondary font-bold">
              {carbonIntensity}g
            </span>
            <span className="font-label-badge text-label-badge text-on-surface-variant uppercase">
              CO2/kWh
            </span>
          </div>

          {/* Theme Mode Toggle (Light Default / Dark) */}
          {onToggleDarkMode && (
            <button
              aria-label="Toggle Theme Mode"
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              type="button"
              title={isDarkMode ? 'Switch to Default Light Theme' : 'Switch to Dark Mode'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          )}

          {/* AI Advisor Button */}
          {onOpenChatAdvisor && (
            <button
              onClick={onOpenChatAdvisor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-bright/10 text-cyan-bright border border-cyan-bright/30 hover:bg-cyan-bright hover:text-black transition-all cursor-pointer text-xs font-semibold shadow-[0_0_12px_rgba(6,182,212,0.2)]"
              title="Open AI Energy Advisor"
            >
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              <span className="hidden sm:inline">AI Advisor</span>
            </button>
          )}

          {/* Notifications Button */}
          <button
            aria-label="Notifications"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-bright animate-pulse"></span>
            )}
          </button>

          {/* Settings Shortcut Button */}
          <button
            onClick={() => onTabChange('settings')}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-primary-container text-on-primary-container shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
            title="Household Settings & Tariffs"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>

          {/* User Profile avatar */}
          <div className="flex items-center gap-space-xs pl-space-xs">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shadow-[0_0_10px_rgba(76,215,246,0.5)]">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] hidden sm:block">
              expand_more
            </span>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-surface-container border-b border-outline-variant/30 px-margin-mobile py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg font-body-md text-body-md transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(6,182,212,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
