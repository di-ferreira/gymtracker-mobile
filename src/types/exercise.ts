import type { DifficultyLevel } from './common';
import type { MuscleGroup } from './muscle-group';
import type { MovementGroup } from './movement-group';

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  execution_tips: string | null;
  difficulty: DifficultyLevel | null;
  target_muscle_primary: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  gif_url: string | null;
  video_url: string | null;
  movement_group_id: string;
  muscle_group_id: string;
  movement_group: MovementGroup;
  muscle_group: MuscleGroup;
  equipment_relations: ExerciseEquipment[];
  instructions: ExerciseInstruction[];
  alternatives: ExerciseAlternative[];
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseCreate {
  name: string;
  slug?: string;
  description?: string;
  execution_tips?: string;
  difficulty?: DifficultyLevel;
  target_muscle_primary?: string;
  thumbnail_url?: string;
  image_url?: string;
  gif_url?: string;
  video_url?: string;
  movement_group_id: string;
  muscle_group_id: string;
}

export interface ExerciseUpdate {
  name?: string;
  slug?: string;
  description?: string;
  execution_tips?: string;
  difficulty?: DifficultyLevel;
  target_muscle_primary?: string;
  thumbnail_url?: string;
  image_url?: string;
  gif_url?: string;
  video_url?: string;
  movement_group_id?: string;
  muscle_group_id?: string;
}

export interface ExerciseEquipment {
  exercise_id: string;
  equipment_id: string;
  usage_note: string | null;
}

export interface ExerciseInstruction {
  id: string;
  exercise_id: string;
  step_order: number;
  description: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseAlternative {
  id: string;
  exercise_id: string;
  alternative_exercise_id: string;
  reason: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}
