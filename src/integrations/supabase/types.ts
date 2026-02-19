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
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      animal_images: {
        Row: {
          animal_id: string
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
        }
        Insert: {
          animal_id: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
        }
        Update: {
          animal_id?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "animal_images_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      animal_wishlists: {
        Row: {
          animal_id: string | null
          created_at: string | null
          id: string
          priority: number | null
          product_id: string | null
          quantity: number | null
        }
        Insert: {
          animal_id?: string | null
          created_at?: string | null
          id?: string
          priority?: number | null
          product_id?: string | null
          quantity?: number | null
        }
        Update: {
          animal_id?: string | null
          created_at?: string | null
          id?: string
          priority?: number | null
          product_id?: string | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "animal_wishlists_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      animals: {
        Row: {
          active: boolean | null
          adoption_status: Database["public"]["Enums"]["adoption_status"] | null
          age: number | null
          birth_date: string | null
          breed: string | null
          created_at: string | null
          description: string | null
          gender: string | null
          id: string
          image_url: string | null
          name: string
          organization_id: string | null
          species: Database["public"]["Enums"]["animal_species"]
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          adoption_status?:
            | Database["public"]["Enums"]["adoption_status"]
            | null
          age?: number | null
          birth_date?: string | null
          breed?: string | null
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          name: string
          organization_id?: string | null
          species: Database["public"]["Enums"]["animal_species"]
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          adoption_status?:
            | Database["public"]["Enums"]["adoption_status"]
            | null
          age?: number | null
          birth_date?: string | null
          breed?: string | null
          created_at?: string | null
          description?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          name?: string
          organization_id?: string | null
          species?: Database["public"]["Enums"]["animal_species"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          created_at: string
          error_message: string
          error_stack: string | null
          error_type: string | null
          id: string
          metadata: Json | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message: string
          error_stack?: string | null
          error_type?: string | null
          id?: string
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string
          error_stack?: string | null
          error_type?: string | null
          id?: string
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      login_history: {
        Row: {
          browser: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: string | null
          os: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          os?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          os?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          animal_id: string | null
          created_at: string | null
          fulfillment_status: string | null
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          shipment_id: string | null
          unit_price: number
        }
        Insert: {
          animal_id?: string | null
          created_at?: string | null
          fulfillment_status?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          shipment_id?: string | null
          unit_price: number
        }
        Update: {
          animal_id?: string | null
          created_at?: string | null
          fulfillment_status?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          shipment_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "order_items_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          batch_order_id: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          id: string
          payment_method: string | null
          payment_status: string | null
          status: string | null
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          batch_order_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          batch_order_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_batch_order_id_fkey"
            columns: ["batch_order_id"]
            isOneToOne: false
            referencedRelation: "organization_batch_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_batch_orders: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string
          processed_at: string | null
          status: string
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          processed_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          processed_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_batch_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          organization_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          organization_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_images_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_leads: {
        Row: {
          accepted_terms: boolean
          created_at: string | null
          email: string
          id: string
          marketing_consent: boolean
          nip: string
          organization_name: string
          phone: string
          processed_at: string | null
          status: string | null
        }
        Insert: {
          accepted_terms?: boolean
          created_at?: string | null
          email: string
          id?: string
          marketing_consent?: boolean
          nip: string
          organization_name: string
          phone: string
          processed_at?: string | null
          status?: string | null
        }
        Update: {
          accepted_terms?: boolean
          created_at?: string | null
          email?: string
          id?: string
          marketing_consent?: boolean
          nip?: string
          organization_name?: string
          phone?: string
          processed_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      organization_users: {
        Row: {
          created_at: string | null
          id: string
          is_owner: boolean | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_owner?: boolean | null
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_owner?: boolean | null
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_wishlists: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          priority: number | null
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          priority?: number | null
          product_id: string
          quantity?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          priority?: number | null
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "organization_wishlists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          active: boolean | null
          address: string | null
          city: string | null
          contact_email: string
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          nip: string | null
          postal_code: string | null
          province: string | null
          slug: string
          terms_accepted_at: string | null
          terms_accepted_by: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          nip?: string | null
          postal_code?: string | null
          province?: string | null
          slug: string
          terms_accepted_at?: string | null
          terms_accepted_by?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          nip?: string | null
          postal_code?: string | null
          province?: string | null
          slug?: string
          terms_accepted_at?: string | null
          terms_accepted_by?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          active: boolean | null
          created_at: string | null
          display_order: number | null
          id: string
          logo_url: string | null
          name: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      producer_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          producer_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          producer_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          producer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "producer_images_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      producers: {
        Row: {
          active: boolean | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          nip: string | null
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          nip?: string | null
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          nip?: string | null
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      product_requests: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string | null
          producer_name: string | null
          product_link: string | null
          product_name: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          producer_name?: string | null
          product_link?: string | null
          product_name: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          producer_name?: string | null
          product_link?: string | null
          product_name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          category_id: string | null
          created_at: string | null
          description: string | null
          ean: string | null
          for_cats: boolean | null
          for_dogs: boolean | null
          id: string
          image_url: string | null
          is_portion_sale: boolean | null
          name: string
          net_price: number | null
          portion_net_price: number | null
          portion_price: number | null
          portion_purchase_net_price: number | null
          portion_purchase_price: number | null
          portion_size_kg: number | null
          price: number
          producer_id: string | null
          product_code: string | null
          purchase_net_price: number | null
          purchase_price: number | null
          total_weight_kg: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          ean?: string | null
          for_cats?: boolean | null
          for_dogs?: boolean | null
          id?: string
          image_url?: string | null
          is_portion_sale?: boolean | null
          name: string
          net_price?: number | null
          portion_net_price?: number | null
          portion_price?: number | null
          portion_purchase_net_price?: number | null
          portion_purchase_price?: number | null
          portion_size_kg?: number | null
          price: number
          producer_id?: string | null
          product_code?: string | null
          purchase_net_price?: number | null
          purchase_price?: number | null
          total_weight_kg?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          ean?: string | null
          for_cats?: boolean | null
          for_dogs?: boolean | null
          id?: string
          image_url?: string | null
          is_portion_sale?: boolean | null
          name?: string
          net_price?: number | null
          portion_net_price?: number | null
          portion_price?: number | null
          portion_purchase_net_price?: number | null
          portion_purchase_price?: number | null
          portion_size_kg?: number | null
          price?: number
          producer_id?: string | null
          product_code?: string | null
          purchase_net_price?: number | null
          purchase_price?: number | null
          total_weight_kg?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          billing_address: string | null
          billing_city: string | null
          billing_postal_code: string | null
          created_at: string | null
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          must_change_password: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_postal_code?: string | null
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          must_change_password?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_postal_code?: string | null
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          must_change_password?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      shipments: {
        Row: {
          confirmed_at: string | null
          created_at: string
          id: string
          ordered_at: string | null
          organization_id: string
          producer_id: string | null
          shipped_at: string
          status: string
          total_value: number | null
          tracking_number: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          ordered_at?: string | null
          organization_id: string
          producer_id?: string | null
          shipped_at?: string
          status?: string
          total_value?: number | null
          tracking_number?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          ordered_at?: string | null
          organization_id?: string
          producer_id?: string | null
          shipped_at?: string
          status?: string
          total_value?: number | null
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_carts: {
        Row: {
          animal_id: string | null
          animal_name: string | null
          created_at: string
          id: string
          max_quantity: number | null
          price: number
          product_id: string
          product_name: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          animal_id?: string | null
          animal_name?: string | null
          created_at?: string
          id?: string
          max_quantity?: number | null
          price: number
          product_id: string
          product_name: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          animal_id?: string | null
          animal_name?: string | null
          created_at?: string
          id?: string
          max_quantity?: number | null
          price?: number
          product_id?: string
          product_name?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_carts_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_carts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_order_stats: {
        Args: never
        Returns: {
          total_amount: number
          total_items: number
          total_orders: number
        }[]
      }
      get_public_organization: {
        Args: { org_slug: string }
        Returns: {
          active: boolean
          city: string
          description: string
          id: string
          logo_url: string
          name: string
          province: string
          slug: string
          website: string
        }[]
      }
      get_public_organizations: {
        Args: never
        Returns: {
          active: boolean
          address: string
          city: string
          description: string
          id: string
          logo_url: string
          name: string
          postal_code: string
          province: string
          slug: string
          website: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_owner: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      user_can_view_order: {
        Args: { _order_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      adoption_status: "Dostępny" | "Zarezerwowany" | "Adoptowany"
      animal_species: "Pies" | "Kot" | "Inne"
      app_role: "ADMIN" | "ORG" | "USER"
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
      adoption_status: ["Dostępny", "Zarezerwowany", "Adoptowany"],
      animal_species: ["Pies", "Kot", "Inne"],
      app_role: ["ADMIN", "ORG", "USER"],
    },
  },
} as const
