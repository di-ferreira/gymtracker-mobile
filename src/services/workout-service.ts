import { api } from './api';

export interface ApiWorkout {
  id: string;
  name: string;
  description: string | null;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export async function fetchWorkouts(): Promise<ApiWorkout[]> {
  const response = await api.get<ApiWorkout[]>('/workouts/');
  return response.data;
}

export async function fetchWorkout(id: string): Promise<ApiWorkout> {
  const response = await api.get<ApiWorkout>(`/workouts/${id}`);
  return response.data;
}

export async function createWorkoutOnApi(data: { name: string; description?: string }): Promise<ApiWorkout> {
  const response = await api.post<ApiWorkout>('/workouts/', data);
  return response.data;
}

export async function updateWorkoutOnApi(id: string, data: { name?: string; description?: string }): Promise<ApiWorkout> {
  const response = await api.patch<ApiWorkout>(`/workouts/${id}`, data);
  return response.data;
}

export async function deleteWorkoutOnApi(id: string): Promise<void> {
  await api.delete(`/workouts/${id}`);
}

export interface AddExercisePayload {
  exercise_id: string;
  sort_order: number;
  sets?: number;
  reps?: number;
  weight?: number;
  notes?: string;
}

export async function addExerciseToWorkoutApi(workoutId: string, payload: AddExercisePayload): Promise<void> {
  await api.post(`/workouts/${workoutId}/exercises/`, payload);
}

export async function removeExerciseFromWorkoutApi(workoutId: string, exerciseId: string): Promise<void> {
  await api.delete(`/workouts/${workoutId}/exercises/${exerciseId}`);
}

export async function reorderWorkoutExercisesApi(workoutId: string, exerciseIds: string[]): Promise<void> {
  await api.put(`/workouts/${workoutId}/exercises/reorder`, { exercise_ids: exerciseIds });
}
