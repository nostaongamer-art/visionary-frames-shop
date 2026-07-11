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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      spreadsheet_backups: {
        Row: {
          created_at: string
          id: string
          label: string | null
          snapshot: Json
          spreadsheet_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          snapshot: Json
          spreadsheet_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          snapshot?: Json
          spreadsheet_id?: string
          user_id?: string
        }
        Relationships: []
      }
      spreadsheet_cells: {
        Row: {
          alignment: string
          background_color: string | null
          col_index: number
          created_at: string
          font_size: number | null
          id: string
          is_merge_parent: boolean | null
          merge_colspan: number | null
          merge_rowspan: number | null
          merged_with: string | null
          row_index: number
          spreadsheet_id: string
          text_color: string | null
          user_id: string
          value: string
        }
        Insert: {
          alignment?: string
          background_color?: string | null
          col_index: number
          created_at?: string
          font_size?: number | null
          id?: string
          is_merge_parent?: boolean | null
          merge_colspan?: number | null
          merge_rowspan?: number | null
          merged_with?: string | null
          row_index: number
          spreadsheet_id: string
          text_color?: string | null
          user_id: string
          value: string
        }
        Update: {
          alignment?: string
          background_color?: string | null
          col_index?: number
          created_at?: string
          font_size?: number | null
          id?: string
          is_merge_parent?: boolean | null
          merge_colspan?: number | null
          merge_rowspan?: number | null
          merged_with?: string | null
          row_index?: number
          spreadsheet_id?: string
          text_color?: string | null
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "spreadsheet_cells_spreadsheet_id_fkey"
            columns: ["spreadsheet_id"]
            isOneToOne: false
            referencedRelation: "spreadsheets"
            referencedColumns: ["id"]
          },
        ]
      }
      spreadsheet_headers: {
        Row: {
          background_color: string | null
          col_index: number
          created_at: string
          font_size: number | null
          id: string
          spreadsheet_id: string
          text_color: string | null
          user_id: string
          value: string
        }
        Insert: {
          background_color?: string | null
          col_index: number
          created_at?: string
          font_size?: number | null
          id?: string
          spreadsheet_id: string
          text_color?: string | null
          user_id: string
          value: string
        }
        Update: {
          background_color?: string | null
          col_index?: number
          created_at?: string
          font_size?: number | null
          id?: string
          spreadsheet_id?: string
          text_color?: string | null
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "spreadsheet_headers_spreadsheet_id_fkey"
            columns: ["spreadsheet_id"]
            isOneToOne: false
            referencedRelation: "spreadsheets"
            referencedColumns: ["id"]
          },
        ]
      }
      spreadsheets: {
        Row: {
          column_currencies: Json | null
          column_widths: Json
          created_at: string
          header_alignments: Json
          header_row_height: number
          id: string
          row_heights: Json
          subtitle: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          column_currencies?: Json | null
          column_widths?: Json
          created_at?: string
          header_alignments?: Json
          header_row_height?: number
          id?: string
          row_heights?: Json
          subtitle?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          column_currencies?: Json | null
          column_widths?: Json
          created_at?: string
          header_alignments?: Json
          header_row_height?: number
          id?: string
          row_heights?: Json
          subtitle?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
