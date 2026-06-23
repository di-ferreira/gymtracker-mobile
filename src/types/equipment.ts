export interface Equipment {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  order_index: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EquipmentCreate {
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  order_index?: number;
}

export interface EquipmentUpdate {
  name?: string;
  slug?: string;
  description?: string;
  category?: string;
  order_index?: number;
}
