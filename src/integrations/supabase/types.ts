export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      account_approvals: {
        Row: {
          created_at: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          clock_in: string
          clock_out: string | null
          created_at: string | null
          id: string
          notes: string | null
          status: string | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          clock_in?: string
          clock_out?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          clock_in?: string
          clock_out?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_table: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string | null
          changed_by: string | null
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
        }
        Insert: {
          action?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
        }
        Update: {
          action?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
        }
        Relationships: []
      }
      bank_details: {
        Row: {
          account_name: string | null
          account_number: string | null
          bank_name: string | null
          branch: string | null
          bsb_code: string | null
          created_at: string | null
          id: string
          swift_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          branch?: string | null
          bsb_code?: string | null
          created_at?: string | null
          id?: string
          swift_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          branch?: string | null
          bsb_code?: string | null
          created_at?: string | null
          id?: string
          swift_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          approved_by: string | null
          created_at: string | null
          daily_rate: number | null
          description: string | null
          end_date: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          start_date: string
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          daily_rate?: number | null
          description?: string | null
          end_date: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          start_date: string
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          daily_rate?: number | null
          description?: string | null
          end_date?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          start_date?: string
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          bank_details: Json | null
          base_salary: number
          created_at: string | null
          department: string | null
          email: string | null
          employee_number: string
          full_name: string
          id: string
          is_resident: boolean | null
          join_date: string
          position: string | null
          status: string | null
          super_fund: string | null
          super_member_id: string | null
          tin: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bank_details?: Json | null
          base_salary: number
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_number: string
          full_name: string
          id?: string
          is_resident?: boolean | null
          join_date?: string
          position?: string | null
          status?: string | null
          super_fund?: string | null
          super_member_id?: string | null
          tin?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bank_details?: Json | null
          base_salary?: number
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_number?: string
          full_name?: string
          id?: string
          is_resident?: boolean | null
          join_date?: string
          position?: string | null
          status?: string | null
          super_fund?: string | null
          super_member_id?: string | null
          tin?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          recorded_by: string | null
          reference_number: string | null
          related_payslip_id: string | null
          related_worker_id: string | null
          transaction_date: string | null
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          recorded_by?: string | null
          reference_number?: string | null
          related_payslip_id?: string | null
          related_worker_id?: string | null
          transaction_date?: string | null
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          recorded_by?: string | null
          reference_number?: string | null
          related_payslip_id?: string | null
          related_worker_id?: string | null
          transaction_date?: string | null
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      payroll_cycles: {
        Row: {
          approved_by: string | null
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          run_by: string | null
          status: string | null
          total_gross: number | null
          total_net: number | null
          total_paye: number | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          run_by?: string | null
          status?: string | null
          total_gross?: number | null
          total_net?: number | null
          total_paye?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          run_by?: string | null
          status?: string | null
          total_gross?: number | null
          total_net?: number | null
          total_paye?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payroll_entries: {
        Row: {
          allowances: Json | null
          base_pay: number | null
          calculation_log: Json | null
          created_at: string | null
          cycle_id: string | null
          deductions: number | null
          employee_id: string | null
          employee_super: number | null
          employer_super: number | null
          gross_earnings: number | null
          gross_pay: number | null
          id: string
          net_pay: number | null
          other_deductions: number | null
          overtime_hours: number | null
          overtime_pay: number | null
          paye_tax: number | null
          payslip_url: string | null
          period_end: string | null
          period_start: string | null
          status: string | null
          super: number | null
          tax: number | null
          updated_at: string | null
          worker_id: string | null
        }
        Insert: {
          allowances?: Json | null
          base_pay?: number | null
          calculation_log?: Json | null
          created_at?: string | null
          cycle_id?: string | null
          deductions?: number | null
          employee_id?: string | null
          employee_super?: number | null
          employer_super?: number | null
          gross_earnings?: number | null
          gross_pay?: number | null
          id?: string
          net_pay?: number | null
          other_deductions?: number | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          paye_tax?: number | null
          payslip_url?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          super?: number | null
          tax?: number | null
          updated_at?: string | null
          worker_id?: string | null
        }
        Update: {
          allowances?: Json | null
          base_pay?: number | null
          calculation_log?: Json | null
          created_at?: string | null
          cycle_id?: string | null
          deductions?: number | null
          employee_id?: string | null
          employee_super?: number | null
          employer_super?: number | null
          gross_earnings?: number | null
          gross_pay?: number | null
          id?: string
          net_pay?: number | null
          other_deductions?: number | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          paye_tax?: number | null
          payslip_url?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          super?: number | null
          tax?: number | null
          updated_at?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_entries_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "payroll_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          avatar_url: string | null
          base_salary: number | null
          created_at: string | null
          department: string | null
          email: string | null
          employee_id: string | null
          employment_type: string | null
          full_name: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          location: string | null
          phone: string | null
          position: string | null
          super_enabled: boolean | null
          supervisor_id: string | null
          updated_at: string | null
          worker_type: string | null
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          base_salary?: number | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_id?: string | null
          employment_type?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          is_active?: boolean | null
          location?: string | null
          phone?: string | null
          position?: string | null
          super_enabled?: boolean | null
          supervisor_id?: string | null
          updated_at?: string | null
          worker_type?: string | null
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          base_salary?: number | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_id?: string | null
          employment_type?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          phone?: string | null
          position?: string | null
          super_enabled?: boolean | null
          supervisor_id?: string | null
          updated_at?: string | null
          worker_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_brackets: {
        Row: {
          brackets: Json
          created_at: string | null
          id: number
          version: string
        }
        Insert: {
          brackets: Json
          created_at?: string | null
          id?: number
          version: string
        }
        Update: {
          brackets?: Json
          created_at?: string | null
          id?: number
          version?: string
        }
        Relationships: []
      }
      timesheets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          clock_in: string | null
          clock_out: string | null
          created_at: string | null
          date: string
          id: string
          status: string | null
          supervisor_id: string | null
          task_description: string | null
          total_hours: number | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          date: string
          id?: string
          status?: string | null
          supervisor_id?: string | null
          task_description?: string | null
          total_hours?: number | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          date?: string
          id?: string
          status?: string | null
          supervisor_id?: string | null
          task_description?: string | null
          total_hours?: number | null
          updated_at?: string | null
          worker_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      work_summaries: {
        Row: {
          challenges: string | null
          created_at: string | null
          id: string
          next_period_goals: string | null
          period_end: string
          period_start: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          summary: string | null
          tasks_completed: string | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          challenges?: string | null
          created_at?: string | null
          id?: string
          next_period_goals?: string | null
          period_end: string
          period_start: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          summary?: string | null
          tasks_completed?: string | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          challenges?: string | null
          created_at?: string | null
          id?: string
          next_period_goals?: string | null
          period_end?: string
          period_start?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          summary?: string | null
          tasks_completed?: string | null
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_employee_id_for_user: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "hr" | "finance" | "employee"
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
      app_role: ["admin", "hr", "finance", "employee"],
    },
  },
} as const
