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
      carrier_integrations: {
        Row: {
          api_key: string | null
          created_at: string | null
          endpoint_url: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          endpoint_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          endpoint_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      esim_activations: {
        Row: {
          activated_at: string | null
          activation_code: string | null
          activation_url: string | null
          created_at: string
          delivered_at: string | null
          expires_at: string | null
          iccid: string | null
          id: string
          order_id: string
          provisioning_log: Json | null
          provisioning_status: string | null
          qr_code_data: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          activation_code?: string | null
          activation_url?: string | null
          created_at?: string
          delivered_at?: string | null
          expires_at?: string | null
          iccid?: string | null
          id?: string
          order_id: string
          provisioning_log?: Json | null
          provisioning_status?: string | null
          qr_code_data?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          activation_code?: string | null
          activation_url?: string | null
          created_at?: string
          delivered_at?: string | null
          expires_at?: string | null
          iccid?: string | null
          id?: string
          order_id?: string
          provisioning_log?: Json | null
          provisioning_status?: string | null
          qr_code_data?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "esim_activations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          available: number
          carrier: string
          country: string
          created_at: string | null
          id: string
          threshold_critical: number
          threshold_low: number
          updated_at: string | null
        }
        Insert: {
          available?: number
          carrier: string
          country: string
          created_at?: string | null
          id?: string
          threshold_critical?: number
          threshold_low?: number
          updated_at?: string | null
        }
        Update: {
          available?: number
          carrier?: string
          country?: string
          created_at?: string | null
          id?: string
          threshold_critical?: number
          threshold_low?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          data_amount: string
          duration_days: number
          id: string
          order_id: string
          plan_id: string
          plan_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          data_amount: string
          duration_days: number
          id?: string
          order_id: string
          plan_id: string
          plan_name: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          data_amount?: string
          duration_days?: number
          id?: string
          order_id?: string
          plan_id?: string
          plan_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string
          currency: string
          data_amount: string
          duration_days: number
          esim_delivered_at: string | null
          id: string
          payment_intent_id: string | null
          payment_status: string | null
          plan_id: string
          plan_name: string
          price: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          currency?: string
          data_amount: string
          duration_days: number
          esim_delivered_at?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_status?: string | null
          plan_id: string
          plan_name: string
          price: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          currency?: string
          data_amount?: string
          duration_days?: number
          esim_delivered_at?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_status?: string | null
          plan_id?: string
          plan_name?: string
          price?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_inventory: {
        Row: {
          available: number
          created_at: string | null
          id: string
          plan_id: string
          plan_name: string
          threshold_critical: number
          threshold_low: number
          updated_at: string | null
        }
        Insert: {
          available?: number
          created_at?: string | null
          id?: string
          plan_id: string
          plan_name: string
          threshold_critical?: number
          threshold_low?: number
          updated_at?: string | null
        }
        Update: {
          available?: number
          created_at?: string | null
          id?: string
          plan_id?: string
          plan_name?: string
          threshold_critical?: number
          threshold_low?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          activation_url: string
          created_at: string | null
          esim_id: string | null
          id: string
          order_id: string | null
          qr_image_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activation_url: string
          created_at?: string | null
          esim_id?: string | null
          id?: string
          order_id?: string | null
          qr_image_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activation_url?: string
          created_at?: string | null
          esim_id?: string | null
          id?: string
          order_id?: string | null
          qr_image_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_esim_id_fkey"
            columns: ["esim_id"]
            isOneToOne: false
            referencedRelation: "esim_activations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          message: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      topup_options: {
        Row: {
          created_at: string
          currency: string
          data_amount: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          price: number
          sort_order: number
          type: string
          updated_at: string
          validity_days: number | null
        }
        Insert: {
          created_at?: string
          currency?: string
          data_amount?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          sort_order?: number
          type: string
          updated_at?: string
          validity_days?: number | null
        }
        Update: {
          created_at?: string
          currency?: string
          data_amount?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
          type?: string
          updated_at?: string
          validity_days?: number | null
        }
        Relationships: []
      }
      topup_orders: {
        Row: {
          applied_at: string | null
          completed_at: string | null
          created_at: string
          currency: string
          data_amount: string | null
          id: string
          parent_order_id: string
          payment_intent_id: string | null
          payment_status: string
          price: number
          status: string
          topup_type: string
          updated_at: string
          user_id: string
          validity_days: number | null
        }
        Insert: {
          applied_at?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          data_amount?: string | null
          id?: string
          parent_order_id: string
          payment_intent_id?: string | null
          payment_status?: string
          price: number
          status?: string
          topup_type: string
          updated_at?: string
          user_id: string
          validity_days?: number | null
        }
        Update: {
          applied_at?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          data_amount?: string | null
          id?: string
          parent_order_id?: string
          payment_intent_id?: string | null
          payment_status?: string
          price?: number
          status?: string
          topup_type?: string
          updated_at?: string
          user_id?: string
          validity_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "topup_orders_parent_order_id_fkey"
            columns: ["parent_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "customer"
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
      app_role: ["admin", "customer"],
    },
  },
} as const
