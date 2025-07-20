import MedicalHeader from "@/components/MedicalHeader";
import PageScrollView from '@/components/ScrollView';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { useRouter } from 'expo-router';
import { Save, User } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const NewPatient = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    age: "",
    gender: "",
    notes: ""
  });

  const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.age || !formData.gender) {
      showToast({
        title: "Missing Information",
        description: "Please fill in name, age, and gender at minimum.",
      });
      return;
    }

    // TODO: update with db access
    console.log("Saving patient:", formData);
    showToast({
      title: "Patient Saved",
      description: `${formData.name} has been added to the system.`,
    });
    router.push("/dashboard");
  };

  return (
    <View style={styles.fullScreen}>
      <PageScrollView>
      <MedicalHeader />

      <View className="p-3 sm:p-4 space-y-4 sm:space-y-6 max-w-2xl mx-auto">
        <View className="flex items-center gap-3">
          <View className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <Text className="text-xl font-semibold text-foreground">New Patient</Text>
          </View>
        </View>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <View className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <View className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChangeText={(text) => handleInputChange("name", text)}
                  placeholder="Patient full name"
                  className="h-10 sm:h-12"
                />
              </View>
              <View className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  value={formData.age}
                  onChangeText={(text) => handleInputChange("age", text)}
                  placeholder="Years"
                  className="h-10 sm:h-12"
                />
              </View>
            </View>

            <View className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select onValueChange={(value) => handleInputChange("gender", ""+value)}>
                <SelectTrigger className="h-10 sm:h-12">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem label="Male" value="male">Male</SelectItem>
                  <SelectItem label="Female" value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </View>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clinical Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChangeText={(text) => handleInputChange("notes", text)}
                placeholder="Patient history, symptoms, observations..."
                className="min-h-24 resize-none"
              />
            </View>
          </CardContent>
        </Card>

        <View className="flex-col gap-3 pb-8">
          <Button
            variant="outline"
            onPress={() => router.back()}
            className="h-10 sm:h-12"
          >
            <Text>Cancel</Text>
          </Button>
          <Button
            onPress={handleSave}
            className="h-10 sm:h-12"
          >
            <View className="flex-row items-center">
              <Save className="w-4 h-4 mr-2" />
              <Text>Save Patient</Text>
            </View>
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

export default NewPatient;
