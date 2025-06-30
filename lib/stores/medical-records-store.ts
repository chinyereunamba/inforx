// lib/stores/medical-records-store.ts
"use client";

import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import { MedicalRecord, MedicalRecordFormData } from '@/lib/types/medical-records';
import { MedicalRecordsStats } from '@/lib/services/medical-records';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect } from 'react';
import { LoggingService } from '../services/logging-service';

interface MedicalRecordsState {
  // State
  records: MedicalRecord[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  stats: MedicalRecordsStats | null;
  loadingStats: boolean;
  statsError: string | null;
  
  // Subscription management
  subscription: RealtimeChannel | null;
  
  // Actions
  initialize: () => Promise<void>;
  fetchRecords: (refresh?: boolean) => Promise<MedicalRecord[]>;
  addRecord: (record: MedicalRecord) => void;
  updateRecord: (updatedRecord: MedicalRecord) => void;
  removeRecord: (recordId: string) => void;
  createRecord: (formData: MedicalRecordFormData, file?: File) => Promise<MedicalRecord>;
  deleteRecord: (recordId: string) => Promise<void>;
  fetchStats: () => Promise<MedicalRecordsStats | null>;
  subscribeToChanges: () => void;
  unsubscribeFromChanges: () => void;
}

export const useMedicalRecordsStore = create<MedicalRecordsState>((set, get) => ({
  records: [],
  loading: false,
  error: null,
  initialized: false,
  subscription: null,
  stats: null,
  loadingStats: false,
  statsError: null,

  // Initialize the store
  initialize: async () => {
  if (get().initialized) return;

  try {
    await get().fetchRecords();
    get().subscribeToChanges();
    set({ initialized: true });
  } catch (error) {
    console.error("Error initializing medical records store:", error);
    set({ error: "Failed to initialize medical records", loading: false });
  }
},

  // Fetch all records for the current user
  fetchRecords: async (refresh = false) => {
    // If we already have records and not refreshing, return them
    if (get().records.length > 0 && !refresh) {
      return get().records;
    }
    
    set({ loading: true, error: null });
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User is not authenticated");
      }
      
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('user_id', user.id)
        .order('visit_date', { ascending: false });
      
      if (error) throw error;
      
      set({ records: data || [], loading: false });
      return data || [];
    } catch (error) {
      console.error("Error fetching medical records:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch records", 
        loading: false 
      });
      return [];
    }
  },

  // Add a new record to the store
  addRecord: (record: MedicalRecord) => {
    set((state) => ({
      records: [record, ...state.records].sort(
        (a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
      ),
    }));
  },

  // Update an existing record
  updateRecord: (updatedRecord: MedicalRecord) => {
    set((state) => ({
      records: state.records.map((record) => 
        record.id === updatedRecord.id ? updatedRecord : record
      ).sort(
        (a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
      ),
    }));
  },

  // Remove a record
  removeRecord: (recordId: string) => {
    set((state) => ({
      records: state.records.filter((record) => record.id !== recordId),
    }));
  },
  
  // Create a new record
  createRecord: async (formData: MedicalRecordFormData, file?: File) => {
    try {
      const data = new FormData();
      
      // Add form fields
      data.append("title", formData.title);
      data.append("type", formData.type);
      data.append("hospital_name", formData.hospital_name);
      data.append("visit_date", formData.visit_date);
      if (formData.notes) {
        data.append("notes", formData.notes);
      }
      
      // Add file if provided
      if (file) {
        data.append("file", file);
      }
      
      // Send the request
      const response = await fetch('/api/medical-records', {
        method: "POST",
        body: data,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create medical record");
      }
      
      const result = await response.json();
      const newRecord = result.record as MedicalRecord;
      
      // Add the new record to the store
      get().addRecord(newRecord);
      
      // Log the action
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        LoggingService.logAction(user, LoggingService.actions.UPLOAD_FILE, {
          record_id: newRecord.id,
          title: formData.title,
          type: formData.type,
          has_file: !!file,
          file_name: file?.name,
        });
      }
      
      return newRecord;
    } catch (error) {
      console.error("Error creating record:", error);
      throw error;
    }
  },
  
  // Delete a record
  deleteRecord: async (recordId: string) => {
    try {
      // Send the request
      const response = await fetch(`/api/medical-records/${recordId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete medical record");
      }
      
      // Remove the record from the store
      get().removeRecord(recordId);
      
      // Log the action
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        LoggingService.logAction(user, LoggingService.actions.DELETE_FILE, {
          record_id: recordId,
        });
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      throw error;
    }
  },
  
  // Fetch statistics
  fetchStats: async () => {
    set({ loadingStats: true, statsError: null });
    
    try {
      // Send the request
      const response = await fetch('/api/medical-records/stats', {
        method: "GET",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch statistics");
      }
      
      const stats = await response.json();
      set({ stats, loadingStats: false });
      return stats;
    } catch (error) {
      console.error("Error fetching stats:", error);
      set({ 
        statsError: error instanceof Error ? error.message : "Failed to fetch statistics", 
        loadingStats: false 
      });
      return null;
    }
  },

  // Subscribe to realtime changes
  subscribeToChanges: () => {
    const { subscription } = get();
    
    // Clean up any existing subscription
    if (subscription) {
      subscription.unsubscribe();
    }
    
    // Create Supabase client
    const supabase = createClient();
    
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        console.warn("Cannot subscribe to changes: No authenticated user");
        return;
      }
      
      // Subscribe to changes on the medical_records table for this user
      const channel = supabase
        .channel('medical_records_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'medical_records',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('New record inserted:', payload.new);
            get().addRecord(payload.new as MedicalRecord);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'medical_records',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Record updated:', payload.new);
            get().updateRecord(payload.new as MedicalRecord);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'medical_records',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Record deleted:', payload.old);
            const oldRecord = payload.old as { id: string };
            get().removeRecord(oldRecord.id);
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });
        
      // Store the subscription
      set({ subscription: channel });
    });
  },

  // Unsubscribe from changes
  unsubscribeFromChanges: () => {
    const { subscription } = get();
    if (subscription) {
      subscription.unsubscribe();
      set({ subscription: null });
    }
  },
}));

// React hook for components to use the store
export function useMedicalRecords() {
  const {
    records,
    loading,
    error,
    initialized,
    initialize,
    fetchRecords,
    addRecord,
    updateRecord,
    removeRecord,
    createRecord,
    deleteRecord,
    stats,
    loadingStats,
    statsError,
    fetchStats
  } = useMedicalRecordsStore();
  
  // Initialize the store when the component mounts
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
    
    // Cleanup on component unmount
    return () => {
      useMedicalRecordsStore.getState().unsubscribeFromChanges();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);
  
  return {
    records,
    loading,
    error,
    refetch: () => fetchRecords(true), // Force refresh
    addRecord,
    updateRecord,
    removeRecord,
    createRecord,
    deleteRecord,
    stats,
    loadingStats,
    statsError,
    fetchStats
  };
}