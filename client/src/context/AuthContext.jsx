import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEMO_USERS = [
  {
    role: "manufacturer",
    name: "ABC Pharma Ltd.",
    email: "manufacturer@abcpharma.com",
    organization: "ABC Pharmaceuticals Global",
    location: "Mumbai, India",
    ethAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    badge: "Manufacturer",
    icon: "👨‍💼",
    headline: "Formulate & Mint Medicine Batches on Blockchain",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
  },
  {
    role: "distributor",
    name: "Apex Logistics & Distribution",
    email: "distributor@apexlogistics.com",
    organization: "Apex Pharma Supply Network",
    location: "Pune, India",
    ethAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    badge: "Distributor",
    icon: "🚚",
    headline: "Cold-Chain Logistics & Transshipment Operations",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/40"
  },
  {
    role: "wholesaler",
    name: "Metro Health Wholesalers",
    email: "wholesaler@metrohealth.com",
    organization: "Metro Wholesale Healthcare Alliance",
    location: "Bangalore, India",
    ethAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    badge: "Wholesaler",
    icon: "🏪",
    headline: "Regional Warehouse Inventory & Retail Allocation",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/40"
  },
  {
    role: "pharmacy",
    name: "HealthPlus Community Pharmacy",
    email: "pharmacy@careplus.com",
    organization: "HealthPlus Retail Pharmacies",
    location: "Hyderabad, India",
    ethAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    badge: "Pharmacy",
    icon: "💊",
    headline: "Retail Dispensing, Prescription Check & Patient Handoff",
    color: "bg-pink-500/20 text-pink-400 border-pink-500/40"
  },
  {
    role: "admin",
    name: "TrueDose Regulatory Admin",
    email: "admin@truedose.org",
    organization: "Central Healthcare Authority & Drug Directorate",
    location: "New Delhi, India",
    ethAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    badge: "Regulator / Admin",
    icon: "👨‍💻",
    headline: "National Drug Safety Enforcement & Counterfeit Investigations",
    color: "bg-red-500/20 text-red-400 border-red-500/40"
  },
  {
    role: "customer",
    name: "Public Customer / Patient",
    organization: "Consumer Verification Portal",
    location: "Global",
    badge: "Public Consumer",
    icon: "👤",
    headline: "Zero-Wallet QR Verification & Provenance Inspection",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/40"
  }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('truedose_demo_role');
    const found = DEMO_USERS.find(u => u.role === saved);
    return found || DEMO_USERS[0]; // Default to ABC Pharma
  });

  const [participants, setParticipants] = useState([]);
  const [investigationCount, setInvestigationCount] = useState(0);

  const fetchStatsAndReports = () => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.investigations) {
          setInvestigationCount(data.investigations.length);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetch('/api/auth/participants')
      .then(res => res.json())
      .then(data => {
        if (data.participants) setParticipants(data.participants);
      })
      .catch(err => console.warn("Failed to fetch participants:", err));

    fetchStatsAndReports();
    const interval = setInterval(fetchStatsAndReports, 5000);
    return () => clearInterval(interval);
  }, []);

  const switchRole = (role) => {
    const user = DEMO_USERS.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('truedose_demo_role', role);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      switchRole,
      demoUsers: DEMO_USERS,
      participants,
      investigationCount,
      refreshStats: fetchStatsAndReports
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
