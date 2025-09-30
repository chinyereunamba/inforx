"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Pill,
  Plus,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Bell,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  medicationService,
  Medication,
  MedicationFormData,
  DrugInteraction,
} from "@/lib/services/medication-service";
import { useAuthStore } from "@/lib/stores/auth-store";
import { format, isToday, isTomorrow } from "date-fns";

interface MedicationManagerProps {
  className?: string;
}

interface MedicationFormProps {
  medication?: Medication;
  onSave: (medication: Medication) => void;
  onCancel: () => void;
}

function MedicationForm({ medication, onSave, onCancel }: MedicationFormProps) {
  const [formData, setFormData] = useState<MedicationFormData>({
    name: medication?.name || "",
    dosage: medication?.dosage || "",
    frequency: medication?.frequency || "",
    duration: medication?.duration || "",
    instructions: medication?.instructions || "",
    startDate: medication?.startDate || "",
    endDate: medication?.endDate || "",
    reminderTimes: medication?.reminderTimes || [],
    sideEffects: medication?.sideEffects || [],
    interactions: medication?.interactions || [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result: Medication;

      if (medication) {
        result = await medicationService.updateMedication(
          medication.id,
          formData
        );
      } else {
        result = await medicationService.createMedication(formData);
      }

      onSave(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save medication"
      );
    } finally {
      setLoading(false);
    }
  };

  const addReminderTime = () => {
    const newTime = "08:00";
    setFormData((prev) => ({
      ...prev,
      reminderTimes: [...prev.reminderTimes, newTime],
    }));
  };

  const removeReminderTime = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      reminderTimes: prev.reminderTimes.filter((_, i) => i !== index),
    }));
  };

  const updateReminderTime = (index: number, time: string) => {
    setFormData((prev) => ({
      ...prev,
      reminderTimes: prev.reminderTimes.map((t, i) => (i === index ? time : t)),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Medication Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Metformin"
            required
          />
        </div>

        <div>
          <Label htmlFor="dosage">Dosage</Label>
          <Input
            id="dosage"
            value={formData.dosage}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dosage: e.target.value }))
            }
            placeholder="e.g., 500mg"
            required
          />
        </div>

        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, frequency: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Once daily">Once daily</SelectItem>
              <SelectItem value="Twice daily">Twice daily</SelectItem>
              <SelectItem value="Three times daily">
                Three times daily
              </SelectItem>
              <SelectItem value="Four times daily">Four times daily</SelectItem>
              <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
              <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
              <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
              <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
              <SelectItem value="As needed">As needed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, duration: e.target.value }))
            }
            placeholder="e.g., 30 days"
          />
        </div>

        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />
        </div>

        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, endDate: e.target.value }))
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          value={formData.instructions}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, instructions: e.target.value }))
          }
          placeholder="Take with food, avoid alcohol, etc."
          rows={3}
        />
      </div>

      {/* Reminder Times */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Reminder Times</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addReminderTime}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Time
          </Button>
        </div>
        <div className="space-y-2">
          {formData.reminderTimes.map((time, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="time"
                value={time}
                onChange={(e) => updateReminderTime(index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeReminderTime(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : medication ? "Update" : "Add"} Medication
        </Button>
      </div>
    </form>
  );
}

function MedicationCard({
  medication,
  onEdit,
  onDelete,
  interactions,
}: {
  medication: Medication;
  onEdit: () => void;
  onDelete: () => void;
  interactions: DrugInteraction[];
}) {
  const nextDose = medicationService.getNextDoseTime(medication);
  const hasInteractions = interactions.length > 0;

  const getNextDoseText = () => {
    if (!nextDose) return "No reminders set";

    if (isToday(nextDose)) {
      return `Today at ${format(nextDose, "HH:mm")}`;
    } else if (isTomorrow(nextDose)) {
      return `Tomorrow at ${format(nextDose, "HH:mm")}`;
    } else {
      return format(nextDose, "MMM dd at HH:mm");
    }
  };

  return (
    <Card
      className={`${
        hasInteractions ? "border-orange-200 bg-orange-50/50" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{medication.name}</h3>
              {!medication.isActive && (
                <Badge variant="secondary">Inactive</Badge>
              )}
              {hasInteractions && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Interaction
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <strong>Dosage:</strong> {medication.dosage}
              </p>
              <p>
                <strong>Frequency:</strong> {medication.frequency}
              </p>
              {medication.duration && (
                <p>
                  <strong>Duration:</strong> {medication.duration}
                </p>
              )}
              {nextDose && (
                <p className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <strong>Next dose:</strong> {getNextDoseText()}
                </p>
              )}
            </div>

            {medication.instructions && (
              <p className="text-sm mt-2 p-2 bg-blue-50 rounded text-blue-800">
                {medication.instructions}
              </p>
            )}

            {hasInteractions && (
              <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                <p className="text-sm font-medium text-orange-800 mb-1">
                  Drug Interactions:
                </p>
                {interactions.map((interaction, index) => (
                  <p key={index} className="text-xs text-orange-700">
                    • {interaction.description}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 ml-4">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MedicationManager({ className }: MedicationManagerProps) {
  const { user } = useAuthStore();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(
    null
  );

  const fetchMedications = async () => {
    if (!user) return;

    try {
      setError(null);
      const data = await medicationService.getMedications();
      setMedications(data);

      // Check for drug interactions
      const drugInteractions = medicationService.checkDrugInteractions(data);
      setInteractions(drugInteractions);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load medications"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMedication = (medication: Medication) => {
    setMedications((prev) => {
      const existing = prev.find((m) => m.id === medication.id);
      if (existing) {
        return prev.map((m) => (m.id === medication.id ? medication : m));
      } else {
        return [...prev, medication];
      }
    });
    setShowForm(false);
    setEditingMedication(null);
  };

  const handleDeleteMedication = async (medication: Medication) => {
    if (!confirm(`Are you sure you want to delete ${medication.name}?`)) {
      return;
    }

    try {
      await medicationService.deleteMedication(medication.id);
      setMedications((prev) => prev.filter((m) => m.id !== medication.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete medication"
      );
    }
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setShowForm(true);
  };

  useEffect(() => {
    fetchMedications();
  }, [user]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Loading medications...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const activeMedications = medications.filter((m) => m.isActive);
  const inactiveMedications = medications.filter((m) => !m.isActive);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Pill className="h-6 w-6 text-blue-500" />
            Medication Manager
          </h2>
          <p className="text-muted-foreground">
            Track your medications, set reminders, and monitor interactions
          </p>
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMedication(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMedication ? "Edit Medication" : "Add New Medication"}
              </DialogTitle>
            </DialogHeader>
            <MedicationForm
              medication={editingMedication || undefined}
              onSave={handleSaveMedication}
              onCancel={() => {
                setShowForm(false);
                setEditingMedication(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Drug Interactions Alert */}
      {interactions.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Drug Interactions Detected:</strong> {interactions.length}{" "}
            potential interaction(s) found. Please consult your healthcare
            provider.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Medications */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Active Medications ({activeMedications.length})
        </h3>

        {activeMedications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No active medications. Add your current medications to enable
                tracking and reminders.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMedications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onEdit={() => handleEditMedication(medication)}
                onDelete={() => handleDeleteMedication(medication)}
                interactions={interactions.filter(
                  (i) =>
                    i.medication1 === medication.name ||
                    i.medication2 === medication.name
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Inactive Medications */}
      {inactiveMedications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-gray-500" />
            Inactive Medications ({inactiveMedications.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inactiveMedications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onEdit={() => handleEditMedication(medication)}
                onDelete={() => handleDeleteMedication(medication)}
                interactions={[]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
