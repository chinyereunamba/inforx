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
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { format, isToday, isTomorrow, isPast, addDays } from "date-fns";

interface Appointment {
  id: string;
  title: string;
  description?: string;
  doctorName?: string;
  hospitalName?: string;
  appointmentDate: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled" | "missed";
  type: "consultation" | "follow_up" | "checkup" | "procedure";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentFormData {
  title: string;
  description?: string;
  doctorName?: string;
  hospitalName?: string;
  appointmentDate: string;
  duration: number;
  type: "consultation" | "follow_up" | "checkup" | "procedure";
  notes?: string;
}

interface AppointmentFormProps {
  appointment?: Appointment;
  onSave: (appointment: Appointment) => void;
  onCancel: () => void;
}

function AppointmentForm({
  appointment,
  onSave,
  onCancel,
}: AppointmentFormProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    title: appointment?.title || "",
    description: appointment?.description || "",
    doctorName: appointment?.doctorName || "",
    hospitalName: appointment?.hospitalName || "",
    appointmentDate: appointment?.appointmentDate
      ? new Date(appointment.appointmentDate).toISOString().slice(0, 16)
      : "",
    duration: appointment?.duration || 30,
    type: appointment?.type || "consultation",
    notes: appointment?.notes || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = appointment
        ? `/api/appointments/${appointment.id}`
        : "/api/appointments";
      const method = appointment ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save appointment");
      }

      const data = await response.json();
      onSave(data.appointment);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="title">Appointment Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="e.g., Cardiology Consultation"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="doctorName">Doctor Name</Label>
          <Input
            id="doctorName"
            value={formData.doctorName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, doctorName: e.target.value }))
            }
            placeholder="Dr. Smith"
          />
        </div>

        <div>
          <Label htmlFor="hospitalName">Hospital/Clinic</Label>
          <Input
            id="hospitalName"
            value={formData.hospitalName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, hospitalName: e.target.value }))
            }
            placeholder="General Hospital"
          />
        </div>

        <div>
          <Label htmlFor="appointmentDate">Date & Time</Label>
          <Input
            id="appointmentDate"
            type="datetime-local"
            value={formData.appointmentDate}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                appointmentDate: e.target.value,
              }))
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Select
            value={formData.duration.toString()}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, duration: parseInt(value) }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="type">Appointment Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: any) =>
              setFormData((prev) => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="follow_up">Follow-up</SelectItem>
              <SelectItem value="checkup">Regular Checkup</SelectItem>
              <SelectItem value="procedure">Medical Procedure</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Additional details about the appointment"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Preparation instructions, questions to ask, etc."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : appointment ? "Update" : "Schedule"}{" "}
          Appointment
        </Button>
      </div>
    </form>
  );
}

function AppointmentCard({
  appointment,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  appointment: Appointment;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Appointment["status"]) => void;
}) {
  const appointmentDate = new Date(appointment.appointmentDate);
  const isOverdue =
    isPast(appointmentDate) && appointment.status === "scheduled";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return isOverdue
          ? "bg-red-100 text-red-700"
          : "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-gray-100 text-gray-700";
      case "missed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "consultation":
        return User;
      case "follow_up":
        return Calendar;
      case "checkup":
        return CheckCircle;
      case "procedure":
        return AlertTriangle;
      default:
        return Calendar;
    }
  };

  const TypeIcon = getTypeIcon(appointment.type);

  const getDateText = () => {
    if (isToday(appointmentDate)) {
      return `Today at ${format(appointmentDate, "HH:mm")}`;
    } else if (isTomorrow(appointmentDate)) {
      return `Tomorrow at ${format(appointmentDate, "HH:mm")}`;
    } else {
      return format(appointmentDate, "MMM dd, yyyy at HH:mm");
    }
  };

  return (
    <Card className={`${isOverdue ? "border-red-200 bg-red-50/50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TypeIcon className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-lg">{appointment.title}</h3>
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getDateText()} ({appointment.duration} min)
              </p>
              {appointment.doctorName && (
                <p className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Dr. {appointment.doctorName}
                </p>
              )}
              {appointment.hospitalName && (
                <p className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {appointment.hospitalName}
                </p>
              )}
            </div>

            {appointment.description && (
              <p className="text-sm mt-2 p-2 bg-blue-50 rounded text-blue-800">
                {appointment.description}
              </p>
            )}

            {appointment.notes && (
              <p className="text-sm mt-2 p-2 bg-gray-50 rounded text-gray-700">
                <strong>Notes:</strong> {appointment.notes}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1 ml-4">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>

            {appointment.status === "scheduled" && (
              <div className="flex flex-col gap-1 mt-2">
                <Button
                  size="sm"
                  onClick={() => onStatusChange("completed")}
                  className="bg-green-600 hover:bg-green-700 text-xs"
                >
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange("cancelled")}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AppointmentTracker({ className }: { className?: string }) {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      setError(null);
      const response = await fetch("/api/appointments");

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      setAppointments(data.appointments);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppointment = (appointment: Appointment) => {
    setAppointments((prev) => {
      const existing = prev.find((a) => a.id === appointment.id);
      if (existing) {
        return prev.map((a) => (a.id === appointment.id ? appointment : a));
      } else {
        return [...prev, appointment];
      }
    });
    setShowForm(false);
    setEditingAppointment(null);
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (!confirm(`Are you sure you want to delete "${appointment.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete appointment");
      }

      setAppointments((prev) => prev.filter((a) => a.id !== appointment.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete appointment"
      );
    }
  };

  const handleStatusChange = async (
    appointment: Appointment,
    status: Appointment["status"]
  ) => {
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update appointment status");
      }

      const data = await response.json();
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointment.id ? data.appointment : a))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update appointment"
      );
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Loading appointments...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const now = new Date();
  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);

    switch (filter) {
      case "upcoming":
        return appointmentDate >= now || appointment.status === "scheduled";
      case "past":
        return appointmentDate < now && appointment.status !== "scheduled";
      default:
        return true;
    }
  });

  const upcomingCount = appointments.filter(
    (a) => new Date(a.appointmentDate) >= now || a.status === "scheduled"
  ).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-500" />
            Appointment Tracker
          </h2>
          <p className="text-muted-foreground">
            Manage your medical appointments and stay on schedule
          </p>
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAppointment(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment
                  ? "Edit Appointment"
                  : "Schedule New Appointment"}
              </DialogTitle>
            </DialogHeader>
            <AppointmentForm
              appointment={editingAppointment || undefined}
              onSave={handleSaveAppointment}
              onCancel={() => {
                setShowForm(false);
                setEditingAppointment(null);
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === "upcoming" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("upcoming")}
        >
          Upcoming ({upcomingCount})
        </Button>
        <Button
          variant={filter === "past" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("past")}
        >
          Past
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All ({appointments.length})
        </Button>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filter === "upcoming"
                ? "No upcoming appointments. Schedule your next medical visit."
                : filter === "past"
                ? "No past appointments found."
                : "No appointments found. Schedule your first appointment."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onEdit={() => handleEditAppointment(appointment)}
              onDelete={() => handleDeleteAppointment(appointment)}
              onStatusChange={(status) =>
                handleStatusChange(appointment, status)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
