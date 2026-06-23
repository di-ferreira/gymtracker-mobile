export interface Workout {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise_order: number;
  created_at: string;
}

export interface WorkoutHistory {
  id: string;
  workout_id: string;
  started_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
  total_volume: number | null;
  notes: string | null;
  created_at: string;
}

export interface ExerciseProgress {
  id: string;
  workout_history_id: string;
  exercise_id: string;
  set_order: number;
  weight: number;
  reps: number;
  rpe: number | null;
  created_at: string;
}
