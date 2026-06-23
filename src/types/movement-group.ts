export interface MovementGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface MovementGroupCreate {
  name: string;
  slug?: string;
  description?: string;
  order_index?: number;
}

export interface MovementGroupUpdate {
  name?: string;
  slug?: string;
  description?: string;
  order_index?: number;
}
