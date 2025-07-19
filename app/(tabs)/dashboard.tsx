import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  useColorScheme,
} from "react-native";
import {
  Users,
  UserPlus,
  Activity,
  FileText,
  Search,
  Bell,
  Plus,
} from "lucide-react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Colors } from "@/constants/Colors";
import MedicalHeader from "@/components/MedicalHeader";
import QuickActionCard from "@/components/QuickActionCard";
import PatientCard from "@/components/PatientCard";
import StatCard from "@/components/StatCard";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const colorScheme = useColorScheme() ?? "light";

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

  const handleSearch = () => {
    // Handle search - would filter patients from offline storage
    console.log("Searching for:", searchQuery);
  };

  return (
    <View style={styles.fullScreen}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={
          <Activity size={310} color="#808080" style={styles.headerImage} />
        }
      >
        <View style={styles.container}>
          <MedicalHeader
            isOnline={false}
            bluetoothConnected={true}
            connectedDevices={2}
          />

          <View
            style={styles.searchContainer}
          >
            <Search
              style={styles.searchIcon}
              color={Colors[colorScheme].icon}
              size={20}
            />
            <TextInput
              placeholder="Search patients by name or ID..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              style={[styles.searchInput, { color: Colors[colorScheme].text }]}
              placeholderTextColor={Colors[colorScheme].icon}
            />
          </View>

          <View style={styles.statsContainer}>
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
          </View>

          <View style={styles.section}>
            <Text>Quick Actions</Text>
            <View style={styles.actionsContainer}>
              <QuickActionCard
                title="New Patient"
                description="Register a new patient and create medical profile"
                icon={UserPlus}
                variant="primary"
                onClick={noop}
              />
              <QuickActionCard
                title="Medical Reports"
                description="View and create patient medical reports"
                icon={FileText}
                onClick={noop}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.recentPatientsHeader}>
              <Text>Recent Patients</Text>
              <TouchableOpacity>
                <Text>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionsContainer}>
              {recentPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  {...patient}
                  onClick={() => console.log("View patient:", patient.id)}
                />
              ))}
            </View>
          </View>
        </View>
      </ParallaxScrollView>
      <TouchableOpacity
        onPress={noop}
        style={[styles.fab, { backgroundColor: Colors.light.tint }]}
      >
        <Plus color="white" size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  container: { padding: 16, gap: 24 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  statsContainer: { flexDirection: "row", gap: 16 },
  section: { gap: 16 },
  recentPatientsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionsContainer: { gap: 12 },
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default Dashboard;

