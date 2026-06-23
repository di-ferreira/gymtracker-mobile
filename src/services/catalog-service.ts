import { api } from './api';
import type { Exercise, MuscleGroup, MovementGroup, Equipment } from '../types';

export async function fetchExercises(): Promise<Exercise[]> {
  const response = await api.get<Exercise[]>('/catalog/exercises/');
  return response.data;
}

export async function fetchExercise(id: string): Promise<Exercise> {
  const response = await api.get<Exercise>(`/catalog/exercises/${id}`);
  return response.data;
}

export async function fetchMuscleGroups(): Promise<MuscleGroup[]> {
  const response = await api.get<MuscleGroup[]>('/catalog/muscle-groups/');
  return response.data;
}

export async function fetchMovementGroups(): Promise<MovementGroup[]> {
  const response = await api.get<MovementGroup[]>('/catalog/movement-groups/');
  return response.data;
}

export async function fetchEquipment(): Promise<Equipment[]> {
  const response = await api.get<Equipment[]>('/catalog/equipment/');
  return response.data;
}
