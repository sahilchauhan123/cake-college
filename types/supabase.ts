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
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      custom_cake_requests: {
        Row: {
          cake_type: string
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_slot: string
          estimated_weight_kg: number | null
          event_date: string
          filling_flavor: string
          id: string
          message_on_cake: string | null
          quoted_price: number | null
          reference_image_urls: string[] | null
          request_number: string
          special_instructions: string | null
          sponge_flavor: string
          status: string | null
          tier_count: number | null
          user_id: string | null
        }
        Insert: {
          cake_type: string
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_slot: string
          estimated_weight_kg?: number | null
          event_date: string
          filling_flavor: string
          id?: string
          message_on_cake?: string | null
          quoted_price?: number | null
          reference_image_urls?: string[] | null
          request_number: string
          special_instructions?: string | null
          sponge_flavor: string
          status?: string | null
          tier_count?: number | null
          user_id?: string | null
        }
        Update: {
          cake_type?: string
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_slot?: string
          estimated_weight_kg?: number | null
          event_date?: string
          filling_flavor?: string
          id?: string
          message_on_cake?: string | null
          quoted_price?: number | null
          reference_image_urls?: string[] | null
          request_number?: string
          special_instructions?: string | null
          sponge_flavor?: string
          status?: string | null
          tier_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          cake_message: string | null
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          selected_size: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          cake_message?: string | null
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          selected_size?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          cake_message?: string | null
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          selected_size?: string | null
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
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          delivery_date: string
          delivery_fee: number | null
          delivery_slot: string
          fulfillment_type: string
          grand_total: number
          id: string
          order_notes: string | null
          order_number: string
          order_status: string | null
          payment_method: string | null
          payment_status: string | null
          subtotal: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          delivery_date: string
          delivery_fee?: number | null
          delivery_slot: string
          fulfillment_type: string
          grand_total: number
          id?: string
          order_notes?: string | null
          order_number: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          subtotal: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          delivery_date?: string
          delivery_fee?: number | null
          delivery_slot?: string
          fulfillment_type?: string
          grand_total?: number
          id?: string
          order_notes?: string | null
          order_number?: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          subtotal?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          available_sizes: Json | null
          base_price: number
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_available: boolean | null
          is_eggless: boolean | null
          is_featured: boolean | null
          is_gluten_free: boolean | null
          is_vegan: boolean | null
          name: string
          rating: number | null
          slug: string
        }
        Insert: {
          available_sizes?: Json | null
          base_price: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          is_eggless?: boolean | null
          is_featured?: boolean | null
          is_gluten_free?: boolean | null
          is_vegan?: boolean | null
          name: string
          rating?: number | null
          slug: string
        }
        Update: {
          available_sizes?: Json | null
          base_price?: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          is_eggless?: boolean | null
          is_featured?: boolean | null
          is_gluten_free?: boolean | null
          is_vegan?: boolean | null
          name?: string
          rating?: number | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          phone: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: string | null
        }
        Relationships: []
      }
    }
  }
}

export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type CustomCakeRequest = Database['public']['Tables']['custom_cake_requests']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
