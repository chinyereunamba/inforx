"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Folder,
  FolderOpen,
  FileText,
  Calendar,
  Hospital,
  MoreVertical,
  Plus,
  Edit,
  Trash2,
  Move,
  Copy,
  Tag,
  Share,
  Download,
  Eye,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { MedicalRecord } from "@/lib/types/medical-records";
import { format } from "date-fns";

interface MedicalFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  recordIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface MedicalRecordsOrganizerProps {
  records: MedicalRecord[];
  folders: MedicalFolder[];
  onRecordsReorganize: (
    recordIds: string[],
    targetFolderId: string | null
  ) => void;
  onFolderCreate: (
    folder: Omit<MedicalFolder, "id" | "createdAt" | "updatedAt">
  ) => void;
  onFolderUpdate: (folderId: string, updates: Partial<MedicalFolder>) => void;
  onFolderDelete: (folderId: string) => void;
  onRecordAction: (action: string, recordIds: string[]) => void;
  className?: string;
}

const FOLDER_COLORS = [
  {
    value: "blue",
    label: "Blue",
    class: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    value: "green",
    label: "Green",
    class: "bg-green-100 text-green-800 border-green-200",
  },
  {
    value: "yellow",
    label: "Yellow",
    class: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  {
    value: "red",
    label: "Red",
    class: "bg-red-100 text-red-800 border-red-200",
  },
  {
    value: "purple",
    label: "Purple",
    class: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    value: "gray",
    label: "Gray",
    class: "bg-gray-100 text-gray-800 border-gray-200",
  },
];

export default function MedicalRecordsOrganizer({
  records,
  folders,
  onRecordsReorganize,
  onFolderCreate,
  onFolderUpdate,
  onFolderDelete,
  onRecordAction,
  className = "",
}: MedicalRecordsOrganizerProps) {
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set()
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("blue");

  // Organize records by folder
  const organizedRecords = useMemo(() => {
    const folderRecords = new Map<string, MedicalRecord[]>();
    const unorganizedRecords: MedicalRecord[] = [];

    // Initialize folder maps
    folders.forEach((folder) => {
      folderRecords.set(folder.id, []);
    });

    // Categorize records
    records.forEach((record) => {
      const folder = folders.find((f) => f.recordIds.includes(record.id));
      if (folder) {
        folderRecords.get(folder.id)?.push(record);
      } else {
        unorganizedRecords.push(record);
      }
    });

    return { folderRecords, unorganizedRecords };
  }, [records, folders]);

  // Handle drag and drop
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result;

      if (!destination) return;

      // If dropped in the same position, do nothing
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      // Extract record ID from draggableId
      const recordId = draggableId.replace("record-", "");

      // Determine target folder
      const targetFolderId =
        destination.droppableId === "unorganized"
          ? null
          : destination.droppableId.replace("folder-", "");

      onRecordsReorganize([recordId], targetFolderId);
      toast.success("Record moved successfully");
    },
    [onRecordsReorganize]
  );

  // Toggle folder expansion
  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  // Handle record selection
  const toggleRecordSelection = useCallback((recordId: string) => {
    setSelectedRecords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  }, []);

  // Select all records in a folder
  const selectAllInFolder = useCallback(
    (folderId: string | null) => {
      const recordsToSelect = folderId
        ? organizedRecords.folderRecords.get(folderId) || []
        : organizedRecords.unorganizedRecords;

      setSelectedRecords((prev) => {
        const newSet = new Set(prev);
        recordsToSelect.forEach((record) => newSet.add(record.id));
        return newSet;
      });
    },
    [organizedRecords]
  );

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedRecords(new Set());
  }, []);

  // Create new folder
  const handleCreateFolder = useCallback(() => {
    if (!newFolderName.trim()) return;

    onFolderCreate({
      name: newFolderName.trim(),
      description: newFolderDescription.trim() || undefined,
      color: newFolderColor,
      recordIds: [],
    });

    setNewFolderName("");
    setNewFolderDescription("");
    setNewFolderColor("blue");
    setIsCreatingFolder(false);
    toast.success("Folder created successfully");
  }, [newFolderName, newFolderDescription, newFolderColor, onFolderCreate]);

  // Bulk actions
  const handleBulkAction = useCallback(
    (action: string) => {
      if (selectedRecords.size === 0) return;

      onRecordAction(action, Array.from(selectedRecords));

      if (action === "delete") {
        clearSelection();
      }
    },
    [selectedRecords, onRecordAction, clearSelection]
  );

  // Get folder color class
  const getFolderColorClass = useCallback((color: string) => {
    return (
      FOLDER_COLORS.find((c) => c.value === color)?.class ||
      FOLDER_COLORS[0].class
    );
  }, []);

  // Render record item
  const renderRecord = useCallback(
    (record: MedicalRecord, index: number) => (
      <Draggable
        key={record.id}
        draggableId={`record-${record.id}`}
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`
            p-3 bg-white border border-slate-200 rounded-lg shadow-sm
            hover:shadow-md transition-shadow cursor-move
            ${snapshot.isDragging ? "shadow-lg rotate-2" : ""}
            ${selectedRecords.has(record.id) ? "ring-2 ring-blue-500" : ""}
          `}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedRecords.has(record.id)}
                onCheckedChange={() => toggleRecordSelection(record.id)}
                onClick={(e) => e.stopPropagation()}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-slate-500 flex-shrink-0" />
                  <h4 className="text-sm font-medium text-slate-900 truncate">
                    {record.title}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {record.type.replace("_", " ")}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Hospital className="h-3 w-3" />
                    <span className="truncate">{record.hospital_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(record.visit_date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onRecordAction("view", [record.id])}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onRecordAction("edit", [record.id])}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onRecordAction("download", [record.id])}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onRecordAction("share", [record.id])}
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onRecordAction("delete", [record.id])}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </Draggable>
    ),
    [selectedRecords, toggleRecordSelection, onRecordAction]
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Bulk Actions Bar */}
      {selectedRecords.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedRecords.size} record
                  {selectedRecords.size !== 1 ? "s" : ""} selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("move")}
                >
                  <Move className="h-4 w-4 mr-2" />
                  Move
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("copy")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("tag")}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Tag
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("download")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("delete")}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          {/* Folders */}
          {folders.map((folder) => {
            const folderRecords =
              organizedRecords.folderRecords.get(folder.id) || [];
            const isExpanded = expandedFolders.has(folder.id);

            return (
              <Card key={folder.id} className="overflow-hidden">
                <CardHeader
                  className={`cursor-pointer ${getFolderColorClass(
                    folder.color || "blue"
                  )}`}
                  onClick={() => toggleFolder(folder.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <FolderOpen className="h-5 w-5" />
                      ) : (
                        <Folder className="h-5 w-5" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{folder.name}</CardTitle>
                        {folder.description && (
                          <p className="text-sm opacity-80 mt-1">
                            {folder.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {folderRecords.length}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllInFolder(folder.id);
                        }}
                      >
                        <CheckSquare className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingFolder(folder.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Folder
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onFolderDelete(folder.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Folder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="p-4">
                    <Droppable droppableId={`folder-${folder.id}`}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`
                            space-y-3 min-h-[100px] p-3 rounded-lg border-2 border-dashed
                            ${
                              snapshot.isDraggingOver
                                ? "border-blue-400 bg-blue-50"
                                : "border-slate-200 bg-slate-50"
                            }
                          `}
                        >
                          {folderRecords.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                              <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Drop records here to organize them</p>
                            </div>
                          ) : (
                            folderRecords.map((record, index) =>
                              renderRecord(record, index)
                            )
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                )}
              </Card>
            );
          })}

          {/* Unorganized Records */}
          <Card>
            <CardHeader
              className="cursor-pointer bg-slate-100"
              onClick={() => toggleFolder("unorganized")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedFolders.has("unorganized") ? (
                    <FolderOpen className="h-5 w-5 text-slate-600" />
                  ) : (
                    <Folder className="h-5 w-5 text-slate-600" />
                  )}
                  <div>
                    <CardTitle className="text-lg text-slate-900">
                      Unorganized Records
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Records not yet organized into folders
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {organizedRecords.unorganizedRecords.length}
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAllInFolder(null);
                  }}
                >
                  <CheckSquare className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {expandedFolders.has("unorganized") && (
              <CardContent className="p-4">
                <Droppable droppableId="unorganized">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        space-y-3 min-h-[100px] p-3 rounded-lg border-2 border-dashed
                        ${
                          snapshot.isDraggingOver
                            ? "border-blue-400 bg-blue-50"
                            : "border-slate-200 bg-slate-50"
                        }
                      `}
                    >
                      {organizedRecords.unorganizedRecords.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>All records are organized!</p>
                        </div>
                      ) : (
                        organizedRecords.unorganizedRecords.map(
                          (record, index) => renderRecord(record, index)
                        )
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            )}
          </Card>

          {/* Create New Folder Button */}
          <Card className="border-dashed border-2 border-slate-300 hover:border-slate-400 transition-colors">
            <CardContent className="p-6">
              <Dialog
                open={isCreatingFolder}
                onOpenChange={setIsCreatingFolder}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full h-full min-h-[60px]"
                  >
                    <div className="text-center">
                      <Plus className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-slate-600">Create New Folder</p>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Folder Name
                      </label>
                      <Input
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter folder name..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Description (Optional)
                      </label>
                      <Input
                        value={newFolderDescription}
                        onChange={(e) =>
                          setNewFolderDescription(e.target.value)
                        }
                        placeholder="Enter folder description..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Color
                      </label>
                      <div className="flex gap-2">
                        {FOLDER_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setNewFolderColor(color.value)}
                            className={`
                              w-8 h-8 rounded-full border-2 transition-all
                              ${color.class}
                              ${
                                newFolderColor === color.value
                                  ? "ring-2 ring-offset-2 ring-blue-500"
                                  : "hover:scale-110"
                              }
                            `}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleCreateFolder} className="flex-1">
                        Create Folder
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreatingFolder(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </DragDropContext>
    </div>
  );
}
