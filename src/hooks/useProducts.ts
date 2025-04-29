
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductCategory = Database["public"]["Enums"]["product_category"]; 
export type AnimalType = Database["public"]["Enums"]["animal_type"];

export const useProducts = (category?: string) => {
  return useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*");

      if (category && category !== "all") {
        // Handle both animal types and product categories
        if (["cat", "dog", "fish"].includes(category)) {
          query = query.eq("animal_type", category as AnimalType);
        } else if (["dry", "wet", "treats", "subscription"].includes(category)) {
          query = query.eq("category", category as ProductCategory);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }

      return data || [];
    },
  });
};
