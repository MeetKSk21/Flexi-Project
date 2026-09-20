/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { NavigationTab, MicrogridMode, TelemetryState, CircuitTelemetry, ApplianceRelay, OptimizationEvent } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LiveGridScreen } from './components/screens/LiveGridScreen';
import { AIAgentsScreen } from './components/screens/AIAgentsScreen';
import { HouseholdIntelligenceScreen } from './components/screens/HouseholdIntelligenceScreen';
import { AppliancesEVScreen } from './components/screens/AppliancesEVScreen';
import { TariffsArbitrageScreen } from './components/screens/TariffsArbitrageScreen';
import { BatteryStorageScreen } from './components/screens/BatteryStorageScreen';
import { EcoImpactScreen } from './components/screens/EcoImpactScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

import { AutonomousModeModal } from './components/modals/AutonomousModeModal';
import { TariffSimulatorModal } from './components/modals/TariffSimulatorModal';
import { ConnectInverterModal } from './components/modals/ConnectInverterModal';
import { NotificationsDrawer } from './components/modals/NotificationsDrawer';
import { AIChatDrawer } from './components/modals/AIChatDrawer';

import {
  INITIAL_CIRCUITS,
  INITIAL_RELAYS,
  INITIAL_OPTIMIZATION_EVENTS,
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('live-grid');
  const [activeMode, setActiveMode] = useState<MicrogridMode>('sentinel');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // Light theme default
  const [currencySymbol, setCurrencySymbol] = useState<string>('₹');

  // Synchronize document theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Core Real-Time Telemetry
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    householdLoad: 3.2,
    solarGeneration: 5.8,
    powerwallSoc: 88,
    powerwallFlow: 1.2, // +1.2 kW exporting
    evSoc: 76,
    evStatus: 'Standby • 02:00 Slot',
    gridFlow: -1.2,
    selfSufficiency: 98.4,
    netMonthlyBill: 162,
    arbitrageYield: 84.20,
    vampireDrain: 0.00,
    carbonIntensity: 84,
    efficiencyScore: 94,
    batteryHealth: 98,
    batteryTemp: 28,
  });

  const [circuits, setCircuits] = useState<CircuitTelemetry[]>(INITIAL_CIRCUITS);
  const [relays, setRelays] = useState<ApplianceRelay[]>(INITIAL_RELAYS);
  const [events, setEvents] = useState<OptimizationEvent[]>(INITIAL_OPTIMIZATION_EVENTS);

  // Modals state
  const [isAutonomousModalOpen, setIsAutonomousModalOpen] = useState(false);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
  const [isInverterModalOpen, setIsInverterModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch initial telemetry from FastAPI backend if online
  useEffect(() => {
    fetch('/api/telemetry')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setTelemetry(prev => ({
            ...prev,
            householdLoad: data.householdLoad ?? prev.householdLoad,
            solarGeneration: data.solarGeneration ?? prev.solarGeneration,
            powerwallSoc: data.powerwallSoc ?? prev.powerwallSoc,
            powerwallFlow: data.powerwallFlow ?? prev.powerwallFlow,
            gridFlow: data.gridFlow ?? prev.gridFlow,
            netMonthlyBill: data.netMonthlyBill ?? prev.netMonthlyBill,
            selfSufficiency: data.selfSufficiency ?? prev.selfSufficiency,
            carbonIntensity: data.carbonIntensity ?? prev.carbonIntensity,
          }));
          if (data.currencySymbol) {
            setCurrencySymbol(data.currencySymbol);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Gentle micro-tick for living telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => {
        // Small realistic micro-fluctuations
        const solarJitter = +(prev.solarGeneration + (Math.random() * 0.04 - 0.02)).toFixed(2);
        const loadJitter = +(prev.householdLoad + (Math.random() * 0.06 - 0.03)).toFixed(2);
        const safeSolar = Math.max(5.4, Math.min(6.2, solarJitter));
        const safeLoad = Math.max(2.8, Math.min(3.8, loadJitter));
        const exportFlow = +(safeSolar - safeLoad).toFixed(2);

        return {
          ...prev,
          solarGeneration: safeSolar,
          householdLoad: safeLoad,
          powerwallFlow: exportFlow > 0 ? exportFlow : 0,
        };
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Handle Relay Toggle
  const handleToggleRelay = (relayId: string) => {
    setRelays((prev) =>
      prev.map((r) => {
        if (r.id === relayId) {
          const nextActive = !r.active;
          const powerDelta = nextActive ? r.powerKw : -r.powerKw;

          // Adjust household load directly
          setTelemetry((prevTel) => {
            const nextLoad = Math.max(0.5, +(prevTel.householdLoad + powerDelta).toFixed(2));
            return {
              ...prevTel,
              householdLoad: nextLoad,
              powerwallFlow: +(prevTel.solarGeneration - nextLoad).toFixed(2),
            };
          });

          // Add optimization ledger event
          const newEvent: OptimizationEvent = {
            id: 'evt_' + Date.now(),
            title: `${r.name} ${nextActive ? 'Relay Engaged' : 'Relay Isolated'}`,
            description: nextActive
              ? `Power demand increased by ${r.powerKw} kW`
              : `Standby disconnect saved ${r.powerKw} kW during peak window`,
            timestamp: new Date().toLocaleTimeString(),
            tag: nextActive ? 'Online' : 'Curtailed',
            tagType: nextActive ? 'primary' : 'emerald',
            icon: r.icon,
            valueSaved: nextActive ? undefined : `-${r.powerKw} kW`,
          };
          setEvents((prevEvts) => [newEvent, ...prevEvts]);

          return { ...r, active: nextActive };
        }
        return r;
      })
    );
  };

  // Handle Mode Change
  const handleModeChange = (mode: MicrogridMode) => {
    setActiveMode(mode);

    if (mode === 'storm') {
      setTelemetry((prev) => ({
        ...prev,
        powerwallSoc: 100,
        selfSufficiency: 100,
        evStatus: 'Backup Reserve Locked',
      }));
      setEvents((prev) => [
        {
          id: 'evt_' + Date.now(),
          title: 'Storm Shield Mode Activated',
          description: 'All residential batteries locked to 100% capacity in preparation for grid contingency',
          timestamp: new Date().toLocaleTimeString(),
          tag: 'Storm Defense',
          tagType: 'cyan',
          icon: 'thunderstorm',
        },
        ...prev,
      ]);
    } else if (mode === 'independence') {
      setTelemetry((prev) => ({
        ...prev,
        selfSufficiency: 99.8,
        gridFlow: 0.0,
      }));
    } else {
      setTelemetry((prev) => ({
        ...prev,
        selfSufficiency: 98.4,
        powerwallSoc: 88,
      }));
    }
  };

  // Neutralize Vampire Drain
  const handleNeutralizeVampireDrain = () => {
    setTelemetry((prev) => ({
      ...prev,
      vampireDrain: 0.00,
      netMonthlyBill: Math.max(120, prev.netMonthlyBill - 18),
    }));

    setCircuits((prev) =>
      prev.map((c) => ({
        ...c,
        phantomLoad: 0,
        status: 'optimized',
      }))
    );

    setEvents((prev) => [
      {
        id: 'evt_' + Date.now(),
        title: 'Neutralized 320W continuous phantom draw',
        description: 'Sub-cycle harmonic filters isolated 14 standby transformers and HVAC dampers',
        timestamp: new Date().toLocaleTimeString(),
        tag: 'Zero Leak',
        tagType: 'cyan',
        icon: 'radar',
        valueSaved: '0.00 W',
      },
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container flex flex-col transition-colors duration-200">
      {/* Fixed Cyber Glassmorphism Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (window.scrollY > 80) window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={events.length}
        carbonIntensity={telemetry.carbonIntensity}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenChatAdvisor={() => setIsChatOpen(true)}
      />

      {/* Main Screen Content View with Motion Fluid Transition */}
      <main className="w-full pt-20 bg-background max-w-[1440px] mx-auto px-margin-mobile lg:px-margin min-h-[calc(100vh-200px)] flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {activeTab === 'live-grid' && (
              <LiveGridScreen
                telemetry={telemetry}
                circuits={circuits}
                relays={relays}
                activeMode={activeMode}
                onModeChange={handleModeChange}
                onToggleRelay={handleToggleRelay}
                onOpenAutonomousModal={() => setIsAutonomousModalOpen(true)}
                onOpenSimulatorModal={() => setIsSimulatorModalOpen(true)}
                onOpenInverterModal={() => setIsInverterModalOpen(true)}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  if (window.scrollY > 80) window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                optimizationEvents={events}
              />
            )}

            {activeTab === 'ai-agents' && (
              <AIAgentsScreen
                currencySymbol={currencySymbol}
                onOpenChatAdvisor={() => setIsChatOpen(true)}
              />
            )}

            {activeTab === 'household-intelligence' && (
              <HouseholdIntelligenceScreen
                circuits={circuits}
                vampireDrain={telemetry.vampireDrain}
                onNeutralizeVampireDrain={handleNeutralizeVampireDrain}
              />
            )}

            {activeTab === 'appliances-ev' && (
              <AppliancesEVScreen
                relays={relays}
                telemetry={telemetry}
                onToggleRelay={handleToggleRelay}
              />
            )}

            {activeTab === 'tariffs-arbitrage' && (
              <TariffsArbitrageScreen
                telemetry={telemetry}
                onOpenSimulatorModal={() => setIsSimulatorModalOpen(true)}
              />
            )}

            {activeTab === 'battery-storage' && (
              <BatteryStorageScreen
                telemetry={telemetry}
              />
            )}

            {activeTab === 'eco-impact' && (
              <EcoImpactScreen
                telemetry={telemetry}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsScreen
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                currencySymbol={currencySymbol}
                onCurrencyChange={setCurrencySymbol}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Sticky/Bottom Footer */}
      <Footer onSelectTab={(tab) => {
        setActiveTab(tab);
        if (window.scrollY > 80) window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      {/* Modals & Overlays */}
      <AutonomousModeModal
        isOpen={isAutonomousModalOpen}
        onClose={() => setIsAutonomousModalOpen(false)}
        currentMode={activeMode}
        onSaveMode={handleModeChange}
      />

      <TariffSimulatorModal
        isOpen={isSimulatorModalOpen}
        onClose={() => setIsSimulatorModalOpen(false)}
      />

      <ConnectInverterModal
        isOpen={isInverterModalOpen}
        onClose={() => setIsInverterModalOpen(false)}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        events={events}
        onClearAll={() => setEvents([])}
      />

      <AIChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
