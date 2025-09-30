"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  Target,
  Plus,
  TrendingUp,
  Calendar,
  CheckCircle,
  Pause,
  X,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { format, differenceInDays } from "date-fns";

interface HealthGoal {
  id: string;
  title: string;
  description?: string;
  category: "weight" | "exercise" | "medication" | "checkup" | "other";
  targetValue?: string;
  currentValue?: string;
  unit?: string;
  targetDate?: string;
  status: "active" | "completed" | "paused" | "cancelled";
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface HealthGoalFormData {
  title: string;
  description?: string;
  category: "weight" | "exercise" | "medication" | "checkup" | "other";
  targetValue?: string;
  currentValue?: string;
  unit?: string;
  targetDate?: string;
}

interface HealthGoalFormProps {
  goal?: HealthGoal;
  onSave: (goal: HealthGoal) => void;
  onCancel: () => void;
}

function HealthGoalForm({ goal, onSave, onCancel }: HealthGoalFormProps) {
  const [formData, setFormData] = useState<HealthGoalFormData>({
    title: goal?.title || "",
    description: goal?.description || "",
    category: goal?.category || "other",
    targetValue: goal?.targetValue || "",
    currentValue: goal?.currentValue || "",
    unit: goal?.unit || "",
    targetDate: goal?.targetDate || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = goal ? `/api/health-goals/${goal.id}` : "/api/health-goals";
      const method = goal ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save health goal");
      }

      const data = await response.json();
      onSave(data.goal);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save health goal"
      );
    } finally {
      setLoading(false);
    }
  };

  const getCategoryUnits = (category: string) => {
    switch (category) {
      case "weight":
        return ["kg", "lbs"];
      case "exercise":
        return ["minutes", "hours", "days/week", "times/week"];
      case "medication":
        return ["days", "weeks", "months"];
      case "checkup":
        return ["visits", "tests"];
      default:
        return [""];
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
        <Label htmlFor="title">Goal Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="e.g., Lose 10kg, Exercise 3x per week"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value: any) =>
            setFormData((prev) => ({ ...prev, category: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weight">Weight Management</SelectItem>
            <SelectItem value="exercise">Exercise & Fitness</SelectItem>
            <SelectItem value="medication">Medication Adherence</SelectItem>
            <SelectItem value="checkup">Regular Checkups</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="currentValue">Current Value</Label>
          <Input
            id="currentValue"
            value={formData.currentValue}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, currentValue: e.target.value }))
            }
            placeholder="e.g., 80"
          />
        </div>

        <div>
          <Label htmlFor="targetValue">Target Value</Label>
          <Input
            id="targetValue"
            value={formData.targetValue}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, targetValue: e.target.value }))
            }
            placeholder="e.g., 70"
          />
        </div>

        <div>
          <Label htmlFor="unit">Unit</Label>
          <Select
            value={formData.unit}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, unit: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {getCategoryUnits(formData.category).map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="targetDate">Target Date</Label>
        <Input
          id="targetDate"
          type="date"
          value={formData.targetDate}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, targetDate: e.target.value }))
          }
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Additional details about your goal"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : goal ? "Update" : "Create"} Goal
        </Button>
      </div>
    </form>
  );
}

function HealthGoalCard({
  goal,
  onEdit,
  onDelete,
  onStatusChange,
  onProgressUpdate,
}: {
  goal: HealthGoal;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: HealthGoal["status"]) => void;
  onProgressUpdate: (progress: number) => void;
}) {
  const [showProgressUpdate, setShowProgressUpdate] = useState(false);
  const [newProgress, setNewProgress] = useState(goal.progress);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "paused":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "weight":
        return "⚖️";
      case "exercise":
        return "🏃‍♂️";
      case "medication":
        return "💊";
      case "checkup":
        return "🩺";
      default:
        return "🎯";
    }
  };

  const getDaysRemaining = () => {
    if (!goal.targetDate) return null;
    const days = differenceInDays(new Date(goal.targetDate), new Date());
    return days;
  };

  const handleProgressSubmit = () => {
    onProgressUpdate(newProgress);
    setShowProgressUpdate(false);
  };

  const daysRemaining = getDaysRemaining();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getCategoryIcon(goal.category)}</span>
              <h3 className="font-semibold text-lg">{goal.title}</h3>
              <Badge className={getStatusColor(goal.status)}>
                {goal.status}
              </Badge>
            </div>

            {goal.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {goal.description}
              </p>
            )}

            <div className="space-y-2">
              {goal.currentValue && goal.targetValue && (
                <div className="flex items-center justify-between text-sm">
                  <span>Progress:</span>
                  <span className="font-medium">
                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Completion:</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>

              {goal.targetDate && (
                <div className="flex items-center justify-between text-sm">
                  <span>Target Date:</span>
                  <span
                    className={`font-medium ${
                      daysRemaining !== null && daysRemaining < 7
                        ? "text-red-600"
                        : ""
                    }`}
                  >
                    {format(new Date(goal.targetDate), "MMM dd, yyyy")}
                    {daysRemaining !== null && (
                      <span className="ml-1">
                        (
                        {daysRemaining > 0
                          ? `${daysRemaining} days left`
                          : "Overdue"}
                        )
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 ml-4">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {goal.status === "active" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowProgressUpdate(!showProgressUpdate)}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Update Progress
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange("paused")}
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
              {goal.progress >= 100 && (
                <Button
                  size="sm"
                  onClick={() => onStatusChange("completed")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
              )}
            </>
          )}

          {goal.status === "paused" && (
            <Button size="sm" onClick={() => onStatusChange("active")}>
              Resume Goal
            </Button>
          )}

          {goal.status !== "completed" && goal.status !== "cancelled" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange("cancelled")}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>

        {/* Progress Update Form */}
        {showProgressUpdate && (
          <div className="mt-4 p-3 bg-gray-50 rounded border">
            <Label htmlFor="progress">Update Progress (%)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={newProgress}
                onChange={(e) => setNewProgress(parseInt(e.target.value) || 0)}
                className="flex-1"
              />
              <Button size="sm" onClick={handleProgressSubmit}>
                Update
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowProgressUpdate(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function HealthGoals({ className }: { className?: string }) {
  const { user } = useAuthStore();
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<HealthGoal | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">(
    "active"
  );

  const fetchGoals = async () => {
    if (!user) return;

    try {
      setError(null);
      const response = await fetch("/api/health-goals");

      if (!response.ok) {
        throw new Error("Failed to fetch health goals");
      }

      const data = await response.json();
      setGoals(data.goals || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load health goals"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = (goal: HealthGoal) => {
    setGoals((prev) => {
      const existing = prev.find((g) => g.id === goal.id);
      if (existing) {
        return prev.map((g) => (g.id === goal.id ? goal : g));
      } else {
        return [...prev, goal];
      }
    });
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleDeleteGoal = async (goal: HealthGoal) => {
    if (!confirm(`Are you sure you want to delete "${goal.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/health-goals/${goal.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete health goal");
      }

      setGoals((prev) => prev.filter((g) => g.id !== goal.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete health goal"
      );
    }
  };

  const handleStatusChange = async (
    goal: HealthGoal,
    status: HealthGoal["status"]
  ) => {
    try {
      const response = await fetch(`/api/health-goals/${goal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update goal status");
      }

      const data = await response.json();
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? data.goal : g)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update goal");
    }
  };

  const handleProgressUpdate = async (goal: HealthGoal, progress: number) => {
    try {
      const response = await fetch(`/api/health-goals/${goal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ progress }),
      });

      if (!response.ok) {
        throw new Error("Failed to update progress");
      }

      const data = await response.json();
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? data.goal : g)));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update progress"
      );
    }
  };

  const handleEditGoal = (goal: HealthGoal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Loading health goals...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const filteredGoals = goals.filter((goal) => {
    switch (filter) {
      case "active":
        return goal.status === "active";
      case "completed":
        return goal.status === "completed";
      default:
        return true;
    }
  });

  const activeGoals = goals.filter((g) => g.status === "active").length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-500" />
            Health Goals
          </h2>
          <p className="text-muted-foreground">
            Set and track your health and wellness objectives
          </p>
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingGoal(null)}>
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? "Edit Health Goal" : "Create New Health Goal"}
              </DialogTitle>
            </DialogHeader>
            <HealthGoalForm
              goal={editingGoal || undefined}
              onSave={handleSaveGoal}
              onCancel={() => {
                setShowForm(false);
                setEditingGoal(null);
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
          variant={filter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("active")}
        >
          Active ({activeGoals})
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Completed ({completedGoals})
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All ({goals.length})
        </Button>
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filter === "active"
                ? "No active health goals. Create your first goal to start tracking your progress."
                : filter === "completed"
                ? "No completed goals yet. Keep working towards your active goals!"
                : "No health goals found. Set your first health goal to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => (
            <HealthGoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => handleEditGoal(goal)}
              onDelete={() => handleDeleteGoal(goal)}
              onStatusChange={(status) => handleStatusChange(goal, status)}
              onProgressUpdate={(progress) =>
                handleProgressUpdate(goal, progress)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
