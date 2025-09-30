import { Resend } from "resend";
import { Twilio } from "twilio";

// Types for notification system
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  medicationReminders: boolean;
  appointmentReminders: boolean;
  criticalAlerts: boolean;
  healthCheckups: boolean;
}

export interface NotificationChannel {
  type: "email" | "sms" | "push";
  enabled: boolean;
  address?: string; // email address or phone number
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type:
    | "medication_reminder"
    | "appointment_reminder"
    | "critical_alert"
    | "health_checkup";
  channels: ("email" | "sms" | "push")[];
  subject?: string;
  emailTemplate?: string;
  smsTemplate?: string;
  pushTemplate?: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
  };
}

export interface NotificationPayload {
  userId: string;
  type: NotificationTemplate["type"];
  priority: "low" | "medium" | "high" | "critical";
  data: Record<string, any>;
  scheduledFor?: Date;
  channels?: ("email" | "sms" | "push")[];
}

// Initialize services
const resend = new Resend(process.env.RESEND_API_KEY);
const twilio = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send email notification using Resend
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    from: string = "InfoRx <noreply@inforx.com>"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY not configured");
      }

      const result = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      return {
        success: true,
        messageId: result.data?.id,
      };
    } catch (error) {
      console.error("Email sending failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send SMS notification using Twilio
   */
  async sendSMS(
    to: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        throw new Error("Twilio credentials not configured");
      }

      const result = await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });

      return {
        success: true,
        messageId: result.sid,
      };
    } catch (error) {
      console.error("SMS sending failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send push notification (placeholder for web-push implementation)
   */
  async sendPushNotification(
    subscription: any,
    payload: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      data?: any;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Implement web-push when package is installed
      console.log("Push notification would be sent:", {
        subscription,
        payload,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("Push notification failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send notification through multiple channels based on user preferences
   */
  async sendMultiChannelNotification(
    payload: NotificationPayload,
    userChannels: NotificationChannel[],
    template: NotificationTemplate
  ): Promise<{
    success: boolean;
    results: Array<{
      channel: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }>;
  }> {
    const results: Array<{
      channel: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }> = [];

    // Filter channels based on user preferences and template configuration
    const enabledChannels = userChannels.filter(
      (channel) =>
        channel.enabled &&
        template.channels.includes(channel.type) &&
        (payload.channels ? payload.channels.includes(channel.type) : true)
    );

    // Send through each enabled channel
    for (const channel of enabledChannels) {
      try {
        let result: { success: boolean; messageId?: string; error?: string };

        switch (channel.type) {
          case "email":
            if (channel.address && template.emailTemplate) {
              const renderedTemplate = this.renderTemplate(
                template.emailTemplate,
                payload.data
              );
              result = await this.sendEmail(
                channel.address,
                template.subject || "InfoRx Notification",
                renderedTemplate
              );
            } else {
              result = {
                success: false,
                error: "Email address or template missing",
              };
            }
            break;

          case "sms":
            if (channel.address && template.smsTemplate) {
              const renderedTemplate = this.renderTemplate(
                template.smsTemplate,
                payload.data
              );
              result = await this.sendSMS(channel.address, renderedTemplate);
            } else {
              result = {
                success: false,
                error: "Phone number or template missing",
              };
            }
            break;

          case "push":
            if (template.pushTemplate) {
              // TODO: Get user's push subscription from database
              result = await this.sendPushNotification(
                {},
                {
                  title: this.renderTemplate(
                    template.pushTemplate.title,
                    payload.data
                  ),
                  body: this.renderTemplate(
                    template.pushTemplate.body,
                    payload.data
                  ),
                  icon: template.pushTemplate.icon,
                  badge: template.pushTemplate.badge,
                  data: payload.data,
                }
              );
            } else {
              result = { success: false, error: "Push template missing" };
            }
            break;

          default:
            result = { success: false, error: "Unknown channel type" };
        }

        results.push({
          channel: channel.type,
          ...result,
        });
      } catch (error) {
        results.push({
          channel: channel.type,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const overallSuccess = results.some((r) => r.success);

    return {
      success: overallSuccess,
      results,
    };
  }

  /**
   * Render template with data substitution
   */
  private renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template;

    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      rendered = rendered.replace(placeholder, String(value));
    });

    return rendered;
  }

  /**
   * Validate notification preferences
   */
  validatePreferences(
    preferences: Partial<NotificationPreferences>
  ): NotificationPreferences {
    return {
      email: preferences.email ?? true,
      sms: preferences.sms ?? false,
      push: preferences.push ?? true,
      medicationReminders: preferences.medicationReminders ?? true,
      appointmentReminders: preferences.appointmentReminders ?? true,
      criticalAlerts: preferences.criticalAlerts ?? true,
      healthCheckups: preferences.healthCheckups ?? true,
    };
  }

  /**
   * Get default notification templates
   */
  getDefaultTemplates(): NotificationTemplate[] {
    return [
      {
        id: "medication_reminder",
        name: "Medication Reminder",
        type: "medication_reminder",
        channels: ["email", "sms", "push"],
        subject: "Time to take your medication",
        emailTemplate: `
          <h2>Medication Reminder</h2>
          <p>Hi {{ patientName }},</p>
          <p>It's time to take your medication: <strong>{{ medicationName }}</strong></p>
          <p><strong>Dosage:</strong> {{ dosage }}</p>
          <p><strong>Instructions:</strong> {{ instructions }}</p>
          <p>Stay healthy!</p>
          <p>- InfoRx Team</p>
        `,
        smsTemplate:
          "InfoRx: Time to take {{ medicationName }} ({{ dosage }}). {{ instructions }}",
        pushTemplate: {
          title: "Medication Reminder",
          body: "Time to take {{ medicationName }} ({{ dosage }})",
          icon: "/icons/medication.png",
        },
      },
      {
        id: "appointment_reminder",
        name: "Appointment Reminder",
        type: "appointment_reminder",
        channels: ["email", "sms", "push"],
        subject: "Upcoming appointment reminder",
        emailTemplate: `
          <h2>Appointment Reminder</h2>
          <p>Hi {{ patientName }},</p>
          <p>You have an upcoming appointment:</p>
          <p><strong>Doctor:</strong> {{ doctorName }}</p>
          <p><strong>Date:</strong> {{ appointmentDate }}</p>
          <p><strong>Time:</strong> {{ appointmentTime }}</p>
          <p><strong>Location:</strong> {{ location }}</p>
          <p>Please arrive 15 minutes early.</p>
          <p>- InfoRx Team</p>
        `,
        smsTemplate:
          "InfoRx: Appointment reminder - {{ doctorName }} on {{ appointmentDate }} at {{ appointmentTime }}. Location: {{ location }}",
        pushTemplate: {
          title: "Appointment Reminder",
          body: "{{ doctorName }} on {{ appointmentDate }} at {{ appointmentTime }}",
          icon: "/icons/appointment.png",
        },
      },
      {
        id: "critical_alert",
        name: "Critical Health Alert",
        type: "critical_alert",
        channels: ["email", "sms", "push"],
        subject: "URGENT: Critical Health Alert",
        emailTemplate: `
          <h2 style="color: red;">URGENT: Critical Health Alert</h2>
          <p>Hi {{ patientName }},</p>
          <p><strong>Critical Finding:</strong> {{ finding }}</p>
          <p><strong>Recommendation:</strong> {{ recommendation }}</p>
          <p style="color: red; font-weight: bold;">Please seek immediate medical attention.</p>
          <p>Emergency contacts have been notified.</p>
          <p>- InfoRx Team</p>
        `,
        smsTemplate:
          "URGENT InfoRx Alert: {{ finding }}. {{ recommendation }}. Seek immediate medical attention.",
        pushTemplate: {
          title: "URGENT: Critical Health Alert",
          body: "{{ finding }}. Seek immediate medical attention.",
          icon: "/icons/emergency.png",
          badge: "/icons/urgent-badge.png",
        },
      },
      {
        id: "health_checkup",
        name: "Health Checkup Reminder",
        type: "health_checkup",
        channels: ["email", "push"],
        subject: "Time for your health checkup",
        emailTemplate: `
          <h2>Health Checkup Reminder</h2>
          <p>Hi {{ patientName }},</p>
          <p>It's time for your {{ checkupType }} checkup.</p>
          <p><strong>Recommended by:</strong> {{ recommendedDate }}</p>
          <p><strong>Reason:</strong> {{ reason }}</p>
          <p>Please schedule an appointment with your healthcare provider.</p>
          <p>- InfoRx Team</p>
        `,
        smsTemplate:
          "InfoRx: Time for your {{ checkupType }} checkup. Recommended by {{ recommendedDate }}.",
        pushTemplate: {
          title: "Health Checkup Reminder",
          body: "Time for your {{ checkupType }} checkup",
          icon: "/icons/checkup.png",
        },
      },
    ];
  }
}

export const notificationService = NotificationService.getInstance();
