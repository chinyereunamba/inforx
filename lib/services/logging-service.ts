import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * Logging service for tracking user actions
 */
export class LoggingService {
  /**
   * Log a user action
   * @param user The user performing the action
   * @param action The action being performed
   * @param metadata Additional context about the action
   */
  static async logAction(
    user: User | null, 
    action: string, 
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!user) {
      console.debug('No user provided for logging action:', action);
      return;
    }
    
    try {
      const supabase = createClient();
      
      // Sanitize metadata to prevent circular references
      const safeMetadata = metadata ? JSON.parse(JSON.stringify(metadata)) : {};
      
      const { error } = await supabase.from('logs').insert([
        {
          user_id: user.id,
          action,
          metadata: safeMetadata,
        },
      ]);
      
      if (error) {
        console.error('Error logging action:', error);
      }
    } catch (error) {
      // Don't let logging errors disrupt the user experience
      console.error('Failed to log action:', action, error);
    }
  }
  
  /**
   * Standard action names for consistency
   */
  static actions = {
    // Authentication
    LOGIN: 'user_login',
    LOGOUT: 'user_logout',
    SIGN_UP: 'user_signup',
    PASSWORD_RESET: 'password_reset',
    
    // Medical records
    UPLOAD_FILE: 'uploaded_file',
    DELETE_FILE: 'deleted_file',
    VIEW_RECORD: 'viewed_record',
    UPDATE_RECORD: 'updated_record',
    
    // AI features
    GENERATE_SUMMARY: 'generated_summary',
    VIEW_SUMMARY: 'viewed_summary',
    AI_INTERPRET: 'used_ai_interpreter',
    
    // User profile
    UPDATE_PROFILE: 'updated_profile',
    
    // Navigation
    PAGE_VIEW: 'page_view',
  };
}