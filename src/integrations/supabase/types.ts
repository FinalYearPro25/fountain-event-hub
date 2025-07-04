export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      certificates: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          issued_at: string
          status: string
          user_id: string
          verification_code: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          issued_at?: string
          status?: string
          user_id: string
          verification_code?: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          issued_at?: string
          status?: string
          user_id?: string
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      colleges: {
        Row: {
          code: string
          created_at: string | null
          dean_id: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          dean_id?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          dean_id?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      event_approvals: {
        Row: {
          approval_level: Database["public"]["Enums"]["approval_level"]
          approved_at: string | null
          approver_id: string | null
          comments: string | null
          created_at: string | null
          event_id: string | null
          id: string
          status: Database["public"]["Enums"]["approval_status"] | null
        }
        Insert: {
          approval_level: Database["public"]["Enums"]["approval_level"]
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["approval_status"] | null
        }
        Update: {
          approval_level?: Database["public"]["Enums"]["approval_level"]
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["approval_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "event_approvals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          attendance_status:
            | Database["public"]["Enums"]["attendance_status"]
            | null
          certificate_issued: boolean | null
          created_at: string | null
          event_id: string | null
          id: string
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          registration_date: string | null
          user_id: string | null
        }
        Insert: {
          attendance_status?:
            | Database["public"]["Enums"]["attendance_status"]
            | null
          certificate_issued?: boolean | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          registration_date?: string | null
          user_id?: string | null
        }
        Update: {
          attendance_status?:
            | Database["public"]["Enums"]["attendance_status"]
            | null
          certificate_issued?: boolean | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          registration_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_resources: {
        Row: {
          event_id: string | null
          id: string
          quantity_approved: number | null
          quantity_requested: number
          resource_id: string | null
          status: Database["public"]["Enums"]["approval_status"] | null
          total_cost: number
        }
        Insert: {
          event_id?: string | null
          id?: string
          quantity_approved?: number | null
          quantity_requested: number
          resource_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          total_cost: number
        }
        Update: {
          event_id?: string | null
          id?: string
          quantity_approved?: number | null
          quantity_requested?: number
          resource_id?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          total_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_resources_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          approval_notes: string | null
          banner_image_url: string | null
          created_at: string | null
          description: string | null
          end_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          max_participants: number | null
          organizer_id: string
          registration_fee: number | null
          start_date: string
          status: Database["public"]["Enums"]["event_status"] | null
          title: string
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          approval_notes?: string | null
          banner_image_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          max_participants?: number | null
          organizer_id: string
          registration_fee?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["event_status"] | null
          title: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          approval_notes?: string | null
          banner_image_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          max_participants?: number | null
          organizer_id?: string
          registration_fee?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          title?: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          college_id: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone_number: string | null
          profile_image_url: string | null
          staff_id: string | null
          student_id: string | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
          year_of_study: number | null
        }
        Insert: {
          college_id?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          phone_number?: string | null
          profile_image_url?: string | null
          staff_id?: string | null
          student_id?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
          year_of_study?: number | null
        }
        Update: {
          college_id?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone_number?: string | null
          profile_image_url?: string | null
          staff_id?: string | null
          student_id?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
          year_of_study?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          available_quantity: number
          category: Database["public"]["Enums"]["resource_category"]
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price_per_unit: number | null
        }
        Insert: {
          available_quantity?: number
          category: Database["public"]["Enums"]["resource_category"]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_per_unit?: number | null
        }
        Update: {
          available_quantity?: number
          category?: Database["public"]["Enums"]["resource_category"]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_per_unit?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venue_bookings: {
        Row: {
          booked_by: string | null
          booking_type: Database["public"]["Enums"]["booking_type"] | null
          created_at: string | null
          end_time: string
          event_id: string | null
          id: string
          no_show: boolean | null
          penalty_amount: number | null
          penalty_applied: boolean | null
          start_time: string
          status: Database["public"]["Enums"]["booking_status"] | null
          venue_id: string | null
        }
        Insert: {
          booked_by?: string | null
          booking_type?: Database["public"]["Enums"]["booking_type"] | null
          created_at?: string | null
          end_time: string
          event_id?: string | null
          id?: string
          no_show?: boolean | null
          penalty_amount?: number | null
          penalty_applied?: boolean | null
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          venue_id?: string | null
        }
        Update: {
          booked_by?: string | null
          booking_type?: Database["public"]["Enums"]["booking_type"] | null
          created_at?: string | null
          end_time?: string
          event_id?: string | null
          id?: string
          no_show?: boolean | null
          penalty_amount?: number | null
          penalty_applied?: boolean | null
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venue_bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_bookings_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          booking_price_external: number | null
          capacity: number
          code: string
          college_id: string | null
          created_at: string | null
          facilities: Json | null
          id: string
          images: string[] | null
          is_active: boolean | null
          location_description: string | null
          name: string
          venue_type: Database["public"]["Enums"]["venue_type"]
        }
        Insert: {
          booking_price_external?: number | null
          capacity: number
          code: string
          college_id?: string | null
          created_at?: string | null
          facilities?: Json | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          location_description?: string | null
          name: string
          venue_type: Database["public"]["Enums"]["venue_type"]
        }
        Update: {
          booking_price_external?: number | null
          capacity?: number
          code?: string
          college_id?: string | null
          created_at?: string | null
          facilities?: Json | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          location_description?: string | null
          name?: string
          venue_type?: Database["public"]["Enums"]["venue_type"]
        }
        Relationships: [
          {
            foreignKeyName: "venues_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "senate_member"
        | "dean"
        | "department_head"
        | "event_coordinator"
        | "student"
        | "staff"
        | "outsider"
        | "dean_student_affairs"
      approval_level: "college_dean" | "senate" | "final"
      approval_status: "pending" | "approved" | "rejected"
      attendance_status: "registered" | "attended" | "absent"
      booking_status: "active" | "cancelled" | "completed"
      booking_type: "class" | "event" | "maintenance" | "blocked"
      event_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "cancelled"
        | "completed"
        | "pending_student_affairs"
        | "pending_vc"
      event_type:
        | "academic"
        | "cultural"
        | "sports"
        | "conference"
        | "workshop"
        | "seminar"
      payment_status: "pending" | "paid" | "refunded"
      resource_category:
        | "audio_visual"
        | "furniture"
        | "catering"
        | "decoration"
        | "technical"
      user_type: "student" | "staff" | "outsider"
      venue_type:
        | "hall"
        | "auditorium"
        | "classroom"
        | "outdoor"
        | "conference_room"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "senate_member",
        "dean",
        "department_head",
        "event_coordinator",
        "student",
        "staff",
        "outsider",
        "dean_student_affairs",
      ],
      approval_level: ["college_dean", "senate", "final"],
      approval_status: ["pending", "approved", "rejected"],
      attendance_status: ["registered", "attended", "absent"],
      booking_status: ["active", "cancelled", "completed"],
      booking_type: ["class", "event", "maintenance", "blocked"],
      event_status: [
        "draft",
        "pending_approval",
        "approved",
        "rejected",
        "cancelled",
        "completed",
        "pending_student_affairs",
        "pending_vc",
      ],
      event_type: [
        "academic",
        "cultural",
        "sports",
        "conference",
        "workshop",
        "seminar",
      ],
      payment_status: ["pending", "paid", "refunded"],
      resource_category: [
        "audio_visual",
        "furniture",
        "catering",
        "decoration",
        "technical",
      ],
      user_type: ["student", "staff", "outsider"],
      venue_type: [
        "hall",
        "auditorium",
        "classroom",
        "outdoor",
        "conference_room",
      ],
    },
  },
} as const
