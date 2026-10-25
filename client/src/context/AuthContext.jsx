import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEMO_USERS = [
  {
    role: "admin",
    name: "National Organ & Tissue Regulatory Authority (NOTTO / UNOS)",
    email: "admin@lifeledger.org",
    organization: "Central Health Ministry & NOTTO Directorate",
    location: "Central Healthcare Complex, New Delhi",
    ethAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    badge: "Regulatory Admin",
    iconKey: "ShieldAlert",
    headline: "National Allocation Oversight, Anti-Trafficking Registry & Compliance Enforcement",
    color: "bg-rose-50 text-rose-700 border-rose-300"
  },
  {
    role: "opo",
    name: "National Organ Procurement Network (Unit 4 Mumbai)",
    email: "opo@lifeledger.org",
    organization: "Lilavati Trauma Surgical Center & OPO",
    location: "Bandra Reclamation, Mumbai, India",
    ethAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    badge: "Organ Procurement Org (OPO)",
    iconKey: "HeartHandshake",
    headline: "Donor Consent Verification, Organ Retrieval & Cryo-Genesis Release",
    color: "bg-teal-50 text-teal-700 border-teal-300"
  },
  {
    role: "logistics",
    name: "AeroMed Specialized Organ Logistics",
    email: "logistics@aeromed.org",
    organization: "AeroMed Specialized Medical Air & Ground Logistics",
    location: "Air Ambulance Terminal 1D, Mumbai / Pune",
    ethAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    badge: "Medical Transit Logistics",
    iconKey: "Truck",
    headline: "Refrigerated Cryo-Carrier Fleet, Real-Time Cold Ischemia Telemetry & Transport",
    color: "bg-blue-50 text-blue-700 border-blue-300"
  },
  {
    role: "authority",
    name: "Regional Organ Allocation Directorate (NOTTO)",
    email: "allocation@notto.gov.in",
    organization: "Regional Healthcare Depot 9, Bangalore",
    location: "Bangalore, India",
    ethAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    badge: "Allocation Authority",
    iconKey: "FileCheck",
    headline: "Recipient Queue Prioritization, HLA Compatibility Clearance & Custody Audit",
    color: "bg-indigo-50 text-indigo-700 border-indigo-300"
  },
  {
    role: "hospital",
    name: "Apollo Multi-Specialty Transplant Surgical Center",
    email: "transplant@apollo.org",
    organization: "Apollo Institute of Renal & Cardiac Transplantation",
    location: "Jubilee Hills OR Complex, Hyderabad, India",
    ethAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    badge: "Transplant Hospital",
    iconKey: "Building2",
    headline: "Recipient Crossmatch Verification, Pre-Op Inspection & Surgical Implantation",
    color: "bg-purple-50 text-purple-700 border-purple-300"
  },
  {
    role: "customer",
    name: "Transplant Recipient / Family Verifier",
    email: "public@lifeledger.org",
    organization: "National Organ Authenticity Portal",
    location: "Global",
    ethAddress: "Public View (Zero-Wallet Required)",
    badge: "Recipient Verifier",
    iconKey: "UserCheck",
    headline: "Zero-Wallet Public Organ Verification & Donor Authorization Audit",
    color: "bg-slate-100 text-slate-700 border-slate-300"
  }
];

// Mapping helper for legacy role strings
const ROLE_ALIASES = {
  manufacturer: "opo",
  distributor: "logistics",
  wholesaler: "authority",
  pharmacy: "hospital"
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('lifeledger_demo_role') || localStorage.getItem('truedose_demo_role');
    const mapped = ROLE_ALIASES[saved] || saved;
    const found = DEMO_USERS.find(u => u.role === mapped);
    return found || DEMO_USERS[1]; // Default to OPO
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
      .catch(() => {});

    fetchStatsAndReports();
    const interval = setInterval(fetchStatsAndReports, 5000);
    return () => clearInterval(interval);
  }, []);

  const switchRole = (role) => {
    const mapped = ROLE_ALIASES[(role || '').toLowerCase()] || (role || '').toLowerCase();
    const user = DEMO_USERS.find(u => u.role.toLowerCase() === mapped);
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem('lifeledger_demo_role', user.role);
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
