import { useState } from "react";
import {
  Users,
  UserPlus,
  Activity,
  FileText,
  Search,
  Bell,
  Plus,
} from "lucide-react";
import MedicalHeader from "@/components/MedicalHeader";
import QuickActionCard from "@/components/QuickActionCard";
import PatientCard from "@/components/PatientCard";
import StatCard from "@/components/StatCard";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  function noop() {}

  // Mock data - in real app this would come from offline storage
  const recentPatients = [
    {
      id: "PAT-001-2024",
      name: "Ahmed Hassan",
      age: 34,
      gender: "M" as const,
      lastVisit: "2024-01-15",
      urgentFlags: 1,
      condition: "Hypertension",
    },
    {
      id: "PAT-002-2024",
      name: "Fatima Al-Zahra",
      age: 28,
      gender: "F" as const,
      lastVisit: "2024-01-14",
      condition: "Diabetes",
    },
    {
      id: "PAT-003-2024",
      name: "Omar Khalil",
      age: 45,
      gender: "M" as const,
      lastVisit: "2024-01-13",
      urgentFlags: 2,
      condition: "Asthma",
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search - would filter patients from offline storage
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <MedicalHeader
          isOnline={false}
          bluetoothConnected={true}
          connectedDevices={2}
        />

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </form>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard
            title="Total Patients"
            value="127"
            subtitle="Active records"
            icon={Users}
            variant="default"
          />
          <StatCard
            title="Urgent Cases"
            value="3"
            subtitle="Require attention"
            icon={Bell}
            variant="warning"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <QuickActionCard
              title="New Patient"
              description="Register a new patient and create medical profile"
              icon={UserPlus}
              variant="primary"
              onClick={() => noop()}
            />
            <QuickActionCard
              title="Medical Reports"
              description="View and create patient medical reports"
              icon={FileText}
              onClick={() => noop()}
            />
          </div>
        </div>

        {/* Recent Patients */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Patients
            </h2>
            <button className="text-primary text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                {...patient}
                onClick={() => console.log("View patient:", patient.id)}
              />
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => noop()}
            className="medical-button-primary rounded-full w-14 h-14 shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
