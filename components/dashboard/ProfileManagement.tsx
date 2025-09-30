"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  User,
  Phone,
  Calendar,
  Heart,
  Shield,
  AlertTriangle,
  Save,
  Edit,
  Plus,
  X,
  CheckCircle,
  Mail,
  UserCheck,
  Settings,
  Download,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert } from "@/components/ui/alert";

interface ProfileFormData {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other" | "";
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
    email: string;
  };
  medicalHistory: {
    allergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
    bloodType: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      shareWithEmergencyContacts: boolean;
      allowDataExport: boolean;
    };
  };
}

export default function ProfileManagement() {
  const {
    profile,
    isLoading,
    error,
    updateProfile,
    changePassword,
    exportData,
    deleteAccount,
    clearError,
  } = useUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phoneNumber: "",
      email: "",
    },
    medicalHistory: {
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      bloodType: "",
    },
    preferences: {
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      privacy: {
        shareWithEmergencyContacts: false,
        allowDataExport: true,
      },
    },
  });

  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        emergencyContact: profile.emergencyContact || {
          name: "",
          relationship: "",
          phoneNumber: "",
          email: "",
        },
        medicalHistory: profile.medicalHistory || {
          allergies: [],
          chronicConditions: [],
          currentMedications: [],
          bloodType: "",
        },
        preferences: profile.preferences || {
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          privacy: {
            shareWithEmergencyContacts: false,
            allowDataExport: true,
          },
        },
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (
    section: string,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof ProfileFormData],
        [field]: value,
      },
    }));
  };

  const handleArrayAdd = (
    section: "allergies" | "chronicConditions" | "currentMedications",
    value: string
  ) => {
    if (!value.trim()) return;

    setFormData((prev) => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        [section]: [...prev.medicalHistory[section], value.trim()],
      },
    }));

    // Clear the input
    if (section === "allergies") setNewAllergy("");
    if (section === "chronicConditions") setNewCondition("");
    if (section === "currentMedications") setNewMedication("");
  };

  const handleArrayRemove = (
    section: "allergies" | "chronicConditions" | "currentMedications",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        [section]: prev.medicalHistory[section].filter((_, i) => i !== index),
      },
    }));
  };

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }

    const result = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    );
    if (result.success) {
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage("Password changed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleExportData = async () => {
    const result = await exportData();
    if (result.success) {
      setSuccessMessage("Data exported successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;

    const result = await deleteAccount(deletePassword);
    if (result.success) {
      // User will be redirected after account deletion
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <div className="text-emerald-800">{successMessage}</div>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <div className="text-red-800">{error}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="ml-auto text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {/* Basic Information */}
      <Card className="border border-slate-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-sky-600" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Your personal details and contact information
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email (read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="text-slate-900">{profile?.email}</span>
                {profile?.isEmailVerified && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg">
                  {formData.fullName || "Not provided"}
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg">
                  {formData.phoneNumber || "Not provided"}
                </div>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg">
                  {formData.dateOfBirth
                    ? new Date(formData.dateOfBirth).toLocaleDateString()
                    : "Not provided"}
                </div>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Gender
              </label>
              {isEditing ? (
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg capitalize">
                  {formData.gender || "Not provided"}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-red-600" />
            Emergency Contact
          </CardTitle>
          <CardDescription>Contact information for emergencies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "emergencyContact",
                      "name",
                      e.target.value
                    )
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Emergency contact name"
                />
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg">
                  {formData.emergencyContact.name || "Not provided"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Relationship
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "emergencyContact",
                      "relationship",
                      e.target.value
                    )
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg">
                  {formData.emergencyContact.relationship || "Not provided"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.emergencyContact.phoneNumber}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "emergencyContact",
                      "phoneNumber",
                      e.target.value
                    )
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Emergency contact phone"
                />
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg">
                  {formData.emergencyContact.phoneNumber || "Not provided"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Email (Optional)
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.emergencyContact.email}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "emergencyContact",
                      "email",
                      e.target.value
                    )
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Emergency contact email"
                />
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg">
                  {formData.emergencyContact.email || "Not provided"}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical History */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            Medical History
          </CardTitle>
          <CardDescription>
            Important medical information for healthcare providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Blood Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Blood Type
            </label>
            {isEditing ? (
              <select
                value={formData.medicalHistory.bloodType}
                onChange={(e) =>
                  handleNestedInputChange(
                    "medicalHistory",
                    "bloodType",
                    e.target.value
                  )
                }
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg">
                {formData.medicalHistory.bloodType || "Not provided"}
              </div>
            )}
          </div>

          {/* Allergies */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Allergies
            </label>
            <div className="space-y-2">
              {formData.medicalHistory.allergies.map((allergy, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg"
                >
                  <span className="text-red-800">{allergy}</span>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArrayRemove("allergies", index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Add new allergy"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      handleArrayAdd("allergies", newAllergy)
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleArrayAdd("allergies", newAllergy)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {formData.medicalHistory.allergies.length === 0 && !isEditing && (
                <div className="p-3 bg-slate-50 rounded-lg text-slate-500">
                  No allergies recorded
                </div>
              )}
            </div>
          </div>

          {/* Chronic Conditions */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Chronic Conditions
            </label>
            <div className="space-y-2">
              {formData.medicalHistory.chronicConditions.map(
                (condition, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <span className="text-amber-800">{condition}</span>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleArrayRemove("chronicConditions", index)
                        }
                        className="text-amber-600 hover:text-amber-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )
              )}
              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Add chronic condition"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      handleArrayAdd("chronicConditions", newCondition)
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleArrayAdd("chronicConditions", newCondition)
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {formData.medicalHistory.chronicConditions.length === 0 &&
                !isEditing && (
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-500">
                    No chronic conditions recorded
                  </div>
                )}
            </div>
          </div>

          {/* Current Medications */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Current Medications
            </label>
            <div className="space-y-2">
              {formData.medicalHistory.currentMedications.map(
                (medication, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <span className="text-blue-800">{medication}</span>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleArrayRemove("currentMedications", index)
                        }
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )
              )}
              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Add current medication"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      handleArrayAdd("currentMedications", newMedication)
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleArrayAdd("currentMedications", newMedication)
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {formData.medicalHistory.currentMedications.length === 0 &&
                !isEditing && (
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-500">
                    No current medications recorded
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Preferences */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-600" />
            Privacy & Preferences
          </CardTitle>
          <CardDescription>
            Control how your data is used and shared
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">
              Notification Preferences
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900">
                  Email Notifications
                </div>
                <div className="text-sm text-slate-600">
                  Receive updates via email
                </div>
              </div>
              <Switch
                checked={formData.preferences.notifications.email}
                onCheckedChange={(checked) =>
                  handleNestedInputChange("preferences", "notifications", {
                    ...formData.preferences.notifications,
                    email: checked,
                  })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900">
                  SMS Notifications
                </div>
                <div className="text-sm text-slate-600">
                  Receive critical alerts via SMS
                </div>
              </div>
              <Switch
                checked={formData.preferences.notifications.sms}
                onCheckedChange={(checked) =>
                  handleNestedInputChange("preferences", "notifications", {
                    ...formData.preferences.notifications,
                    sms: checked,
                  })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900">
                  Push Notifications
                </div>
                <div className="text-sm text-slate-600">
                  Receive in-app notifications
                </div>
              </div>
              <Switch
                checked={formData.preferences.notifications.push}
                onCheckedChange={(checked) =>
                  handleNestedInputChange("preferences", "notifications", {
                    ...formData.preferences.notifications,
                    push: checked,
                  })
                }
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">
              Privacy Settings
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900">
                  Share with Emergency Contacts
                </div>
                <div className="text-sm text-slate-600">
                  Allow emergency contacts to access your medical information
                </div>
              </div>
              <Switch
                checked={
                  formData.preferences.privacy.shareWithEmergencyContacts
                }
                onCheckedChange={(checked) =>
                  handleNestedInputChange("preferences", "privacy", {
                    ...formData.preferences.privacy,
                    shareWithEmergencyContacts: checked,
                  })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900">
                  Allow Data Export
                </div>
                <div className="text-sm text-slate-600">
                  Enable data export functionality
                </div>
              </div>
              <Switch
                checked={formData.preferences.privacy.allowDataExport}
                onCheckedChange={(checked) =>
                  handleNestedInputChange("preferences", "privacy", {
                    ...formData.preferences.privacy,
                    allowDataExport: checked,
                  })
                }
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-slate-600" />
            Security & Account Actions
          </CardTitle>
          <CardDescription>
            Manage your account security and data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Change Password */}
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
            <div>
              <div className="font-medium text-slate-900">Change Password</div>
              <div className="text-sm text-slate-600">
                Update your account password
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              Change Password
            </Button>
          </div>

          {showPasswordForm && (
            <div className="p-4 bg-slate-50 rounded-lg space-y-4">
              <input
                type="password"
                placeholder="Current password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="New password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <div className="flex gap-2">
                <Button onClick={handlePasswordChange}>Update Password</Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Export Data */}
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
            <div>
              <div className="font-medium text-slate-900">Export Your Data</div>
              <div className="text-sm text-slate-600">
                Download all your data in JSON format
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleExportData}
              className="flex items-center gap-2"
              disabled={!formData.preferences.privacy.allowDataExport}
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
            <div>
              <div className="font-medium text-red-900">Delete Account</div>
              <div className="text-sm text-red-600">
                Permanently delete your account and all data
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowDeleteForm(!showDeleteForm)}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>

          {showDeleteForm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-4">
              <Alert className="border-red-300 bg-red-100">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div className="text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. All
                  your data will be permanently deleted.
                </div>
              </Alert>
              <input
                type="password"
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Type 'DELETE' to confirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteConfirmation !== "DELETE" || !deletePassword}
                >
                  Delete Account
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
