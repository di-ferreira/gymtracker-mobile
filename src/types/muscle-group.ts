export interface MuscleGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface MuscleGroupCreate {
  name: string;
  slug?: string;
  description?: string;
  order_index?: number;
}

export interface MuscleGroupUpdate {
  name?: string;
  slug?: string;
  description?: string;
  order_index?: number;
}
