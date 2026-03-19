export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      esim_packages: {
        Row: {
          created_at: string
          esim_access_package_id: string
          id: string
          plan_id: string
          plan_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          esim_access_package_id: string
          id?: string
          plan_id: string
          plan_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          esim_access_package_id?: string
          id?: string
          plan_id?: string
          plan_name?: string
          updated_at?: string
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
          customer_email: string | null
          data_amount: string
          duration_days: number
          esim_delivered_at: string | null
          esim_order_id: string | null
          esim_package_id: string | null
          esim_status: string | null
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
          customer_email?: string | null
          data_amount: string
          duration_days: number
          esim_delivered_at?: string | null
          esim_order_id?: string | null
          esim_package_id?: string | null
          esim_status?: string | null
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
          customer_email?: string | null
          data_amount?: string
          duration_days?: number
          esim_delivered_at?: string | null
          esim_order_id?: string | null
          esim_package_id?: string | null
          esim_status?: string | null
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
      plans: {
        Row: {
          coverage: string[] | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          retail_price: number
          status: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          coverage?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          retail_price: number
          status?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          coverage?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          retail_price?: number
          status?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          created_at: string | null
          exceptions: Json | null
          global_markup: number | null
          id: string
          margin_alert_threshold: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          exceptions?: Json | null
          global_markup?: number | null
          id?: string
          margin_alert_threshold?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          exceptions?: Json | null
          global_markup?: number | null
          id?: string
          margin_alert_threshold?: number | null
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
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
          uses_count?: number
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          created_at: string
          id: string
          referee_id: string
          referral_code: string
          referrer_id: string
          reward_amount: number
          reward_type: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          referee_id: string
          referral_code: string
          referrer_id: string
          reward_amount?: number
          reward_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          referee_id?: string
          referral_code?: string
          referrer_id?: string
          reward_amount?: number
          reward_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      supplier_rates: {
        Row: {
          created_at: string | null
          id: string
          last_checked: string | null
          plan_id: string | null
          supplier_link: string | null
          supplier_name: string
          supplier_plan_id: string | null
          updated_at: string | null
          wholesale_cost: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_checked?: string | null
          plan_id?: string | null
          supplier_link?: string | null
          supplier_name: string
          supplier_plan_id?: string | null
          updated_at?: string | null
          wholesale_cost: number
        }
        Update: {
          created_at?: string | null
          id?: string
          last_checked?: string | null
          plan_id?: string | null
          supplier_link?: string | null
          supplier_name?: string
          supplier_plan_id?: string | null
          updated_at?: string | null
          wholesale_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "supplier_rates_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string | null
          created_at: string
          email: string | null
          id: string
          message: string
          name: string | null
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
