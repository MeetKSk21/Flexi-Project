import React, { useState } from 'react';

interface ConnectInverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectInverterModal: React.FC<ConnectInverterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('tesla');
  const [localIp, setLocalIp] = useState<string>('192.168.1.184');
  const [authToken, setAuthToken] = useState<string>('vtiq_gw_99812_sec');
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);

  if (!isOpen) return null;

  const brands = [
    { id: 'tesla', name: 'Tesla Gateway 2/3', protocol: 'Local REST API / LAN', icon: 'battery_charging_full' },
    { id: 'enphase', name: 'Enphase Envoy / IQ Gateway', protocol: 'Enlighten JSON Local', icon: 'solar_power' },
    { id: 'solaredge', name: 'SolarEdge Energy Hub', protocol: 'Modbus TCP / SunSpec', icon: 'bolt' },
    { id: 'givenergy', name: 'GivEnergy All-in-One', protocol: 'Cloud REST v1 API', icon: 'power' },
    { id: 'emporia', name: 'Emporia Vue / Sense CT', protocol: 'Split-Core CT Clamps', icon: 'sensors' },
    { id: 'matter', name: 'Matter / Thread Energy Node', protocol: 'CSA Matter 1.3 Standard', icon: 'hub' },
  ];

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      setTimeout(() => {
        setConnected(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-base/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface-container-low border border-border-cyan-glow w-full max-w-xl rounded-2xl p-space-lg shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-space-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">power</span>
            <h2 className="font-headline-md text-headline-md text-text-primary font-bold">
              Connect Smart Inverter / Gateway
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-text-primary hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
          Connect your residential energy hardware over local LAN or non-invasive split-core CT sensors. Zero cloud latency required for microsecond breaker protection.
        </p>

        {/* Brand Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-space-md">
          {brands.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBrand(b.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                selectedBrand === b.id
                  ? 'bg-surface-container border-primary shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'bg-surface-container-lowest border-outline-variant/20 hover:border-outline-variant/40'
              }`}
            >
              <div className={`p-2 rounded-lg ${selectedBrand === b.id ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-[18px]">{b.icon}</span>
              </div>
              <div className="overflow-hidden">
                <span className="font-headline-md text-xs font-bold text-text-primary block truncate">
                  {b.name}
                </span>
                <span className="text-[10px] font-mono text-on-surface-variant block truncate">
                  {b.protocol}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Connection Form */}
        <div className="space-y-3 mb-space-lg pt-2 border-t border-outline-variant/20">
          <div>
            <label className="block text-xs font-mono text-on-surface-variant uppercase mb-1">
              Gateway Local IP Address
            </label>
            <input
              type="text"
              value={localIp}
              onChange={(e) => setLocalIp(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-bright"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-on-surface-variant uppercase mb-1">
              Local Commissioning Token / API Key
            </label>
            <input
              type="password"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-bright"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-on-surface-variant hover:text-text-primary text-xs font-mono transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={connecting || connected}
            className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-headline-md text-sm font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-cyan-bright transition-all cursor-pointer flex items-center gap-2"
          >
            {connecting ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-on-primary-container border-t-transparent animate-spin"></span>
                Handshaking Gateway...
              </>
            ) : connected ? (
              <>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Gateway Connected!
              </>
            ) : (
              'Verify & Link Inverter'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
