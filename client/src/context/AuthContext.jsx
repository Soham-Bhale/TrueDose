import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEMO_USERS = [
  {
    role: "manufacturer",
    name: "ABC Pharma Ltd.",
    email: "manufacturer@abcpharma.com",
    organization: "ABC Pharmaceuticals Global",
    location: "Mumbai, India",
    ethAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    badge: "Manufacturer",
    iconKey: "Factory",
    headline: "Formulation, Batch Genesis & Quality Release",
    color: "bg-teal-50 text-teal-700 border-teal-200"
  },
  {
    role: "distributor",
    name: "Apex Logistics & Distribution",
    email: "distributor@apexlogistics.com",
    organization: "Apex Cold-Chain Fleet",
    location: "Pune, India",
    ethAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    badge: "Distributor",
    iconKey: "Truck",
    headline: "Reefer Fleet Logistics & Transshipment Depot",
    color: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    role: "wholesaler",
    name: "Metro Health Wholesalers",
    email: "wholesaler@metrohealth.com",
    organization: "Metro Wholesale Healthcare Alliance",
    location: "Bangalore, India",
    ethAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    badge: "Wholesaler",
    iconKey: "Warehouse",
    headline: "Regional Warehouse Inventory & Allocation",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  {
    role: "pharmacy",
    name: "HealthPlus Community Pharmacy",
    email: "pharmacy@careplus.com",
    organization: "HealthPlus Retail Dispensary",
    location: "Hyderabad, India",
    ethAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    badge: "Pharmacy",
    iconKey: "Store",
    headline: "Retail Dispensary & Patient Prescription Handoff",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    role: "admin",
    name: "TrueDose Regulatory Admin",
    email: "admin@truedose.org",
    organization: "Central Drug Standards Control Directorate",
    location: "New Delhi, India",
    ethAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    badge: "Regulator / Admin",
    iconKey: "ShieldAlert",
    headline: "National Drug Safety Enforcement & Counterfeit Investigations",
    color: "bg-rose-50 text-rose-700 border-rose-200"
  },
  {
    role: "customer",
    name: "Public Citizen / Patient",
    organization: "Public Verification Portal",
    location: "Global",
    badge: "Consumer",
    iconKey: "UserCheck",
    headline: "Zero-Wallet QR Provenance Verification",
    color: "bg-slate-50 text-slate-700 border-slate-200"
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
    const user = DEMO_USERS.find(u => u.role.toLowerCase() === (role || '').toLowerCase());
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem('truedose_demo_role', user.role);
      } catch (e) {}
      fetchStatsAndReports();
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
