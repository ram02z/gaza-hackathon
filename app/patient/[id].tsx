import MedicalHeader from "@/components/MedicalHeader";
import PageScrollView from "@/components/ScrollView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/useToast";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Clock, Download, FileText, Share2, User } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

const MedicalReport = () => {
  const router = useRouter();
  const { patientId } = useLocalSearchParams();
  const { showToast } = useToast();

  // Mock patient data - in real app would fetch from storage/database
  const patientData = {
    id: patientId,
    name: "Ahmed Hassan",
    age: 45,
    gender: "Male",
    admissionDate: "2024-01-19",
    lastUpdated: "2024-01-19 14:30",
    notes: [
      {
        timestamp: "14:30",
        author: "Dr. Sarah Ahmed",
        content: "Patient showing improvement. Fever reduced. Breathing easier.",
      },
      {
        timestamp: "10:15",
        author: "Dr. Sarah Ahmed",
        content: "Started on antibiotic therapy. Patient advised on medication compliance.",
      },
    ],
  };

  const handleExport = () => {
    showToast({
      title: "Report Generated",
      description: "Medical report ready for offline storage.",
    });
  };

  const handleShare = () => {
    showToast({
      title: "Report Shared",
      description: "Report prepared for peer-to-peer sync.",
    });
  };

  return (
    <View style={styles.fullScreen}>
    <PageScrollView>
      <MedicalHeader />

      <View className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <View className="flex-row items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <Text className="text-xl font-semibold text-foreground">Medical Report</Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <Button variant="outline" size="sm" onPress={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onPress={handleExport}>
              <Download className="w-4 h-4" />
            </Button>
          </View>
        </View>

        <Card>
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <CardTitle className="flex-row items-center gap-2">
                <User className="w-5 h-5" />
                <Text>Patient Information</Text>
              </CardTitle>
              <Badge variant="secondary" className="flex-row items-center gap-1">
                <Clock className="w-3 h-3" />
                <Text>{patientData.lastUpdated}</Text>
              </Badge>
            </View>
          </CardHeader>
          <CardContent className="space-y-4">
            <View className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <View>
                <Text className="text-sm text-muted-foreground">Name</Text>
                <Text className="font-medium">{patientData.name}</Text>
              </View>
              <View>
                <Text className="text-sm text-muted-foreground">Age</Text>
                <Text className="font-medium">{patientData.age} years</Text>
              </View>
              <View>
                <Text className="text-sm text-muted-foreground">Gender</Text>
                <Text className="font-medium">{patientData.gender}</Text>
              </View>
              <View>
                <Text className="text-sm text-muted-foreground">Admission</Text>
                <Text className="font-medium">{patientData.admissionDate}</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><Text>Clinical Notes</Text></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patientData.notes.map((note, index) => (
              <View key={index}>
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-sm font-medium">{note.author}</Text>
                  <Text className="text-sm text-muted-foreground">{note.timestamp}</Text>
                </View>
                <Text className="text-sm bg-muted/50 p-3 rounded-lg">{note.content}</Text>
                {index < patientData.notes.length - 1 && <Separator className="mt-4" />}
              </View>
            ))}
          </CardContent>
        </Card>

        <View className="pb-8">
          <Button
            onPress={() => router.push("/dashboard")}
            className="w-full h-10 sm:h-12"
          >
            <Text>Return to Dashboard</Text>
          </Button>
        </View>
      </View>
    </PageScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
});

export default MedicalReport;
