import { api } from './api';
import type { User, AdminUpdateUserRequest } from '../types';
import type { Exercise, ExerciseCreate, ExerciseUpdate } from '../types';
import type { MuscleGroup, MuscleGroupCreate, MuscleGroupUpdate } from '../types';
import type { MovementGroup, MovementGroupCreate, MovementGroupUpdate } from '../types';
import type { Equipment, EquipmentCreate, EquipmentUpdate } from '../types';

export async function listUsers(): Promise<User[]> {
  const response = await api.get<User[]>('/admin/users/');
  return response.data;
}

export async function updateUser(id: string, data: AdminUpdateUserRequest): Promise<User> {
  const response = await api.patch<User>(`/admin/users/${id}`, data);
  return response.data;
}

export async function listExercises(): Promise<Exercise[]> {
  const response = await api.get<Exercise[]>('/admin/catalog/exercises/');
  return response.data;
}

export async function createExercise(data: ExerciseCreate): Promise<Exercise> {
  const response = await api.post<Exercise>('/admin/catalog/exercises/', data);
  return response.data;
}

export async function updateExercise(id: string, data: ExerciseUpdate): Promise<Exercise> {
  const response = await api.patch<Exercise>(`/admin/catalog/exercises/${id}`, data);
  return response.data;
}

export async function deleteExercise(id: string): Promise<void> {
  await api.delete(`/admin/catalog/exercises/${id}`);
}

export async function listMuscleGroups(): Promise<MuscleGroup[]> {
  const response = await api.get<MuscleGroup[]>('/admin/catalog/muscle-groups/');
  return response.data;
}

export async function createMuscleGroup(data: MuscleGroupCreate): Promise<MuscleGroup> {
  const response = await api.post<MuscleGroup>('/admin/catalog/muscle-groups/', data);
  return response.data;
}

export async function updateMuscleGroup(id: string, data: MuscleGroupUpdate): Promise<MuscleGroup> {
  const response = await api.patch<MuscleGroup>(`/admin/catalog/muscle-groups/${id}`, data);
  return response.data;
}

export async function deleteMuscleGroup(id: string): Promise<void> {
  await api.delete(`/admin/catalog/muscle-groups/${id}`);
}

export async function listMovementGroups(): Promise<MovementGroup[]> {
  const response = await api.get<MovementGroup[]>('/admin/catalog/movement-groups/');
  return response.data;
}

export async function createMovementGroup(data: MovementGroupCreate): Promise<MovementGroup> {
  const response = await api.post<MovementGroup>('/admin/catalog/movement-groups/', data);
  return response.data;
}

export async function updateMovementGroup(id: string, data: MovementGroupUpdate): Promise<MovementGroup> {
  const response = await api.patch<MovementGroup>(`/admin/catalog/movement-groups/${id}`, data);
  return response.data;
}

export async function deleteMovementGroup(id: string): Promise<void> {
  await api.delete(`/admin/catalog/movement-groups/${id}`);
}

export async function listEquipment(): Promise<Equipment[]> {
  const response = await api.get<Equipment[]>('/admin/catalog/equipment/');
  return response.data;
}

export async function createEquipment(data: EquipmentCreate): Promise<Equipment> {
  const response = await api.post<Equipment>('/admin/catalog/equipment/', data);
  return response.data;
}

export async function updateEquipment(id: string, data: EquipmentUpdate): Promise<Equipment> {
  const response = await api.patch<Equipment>(`/admin/catalog/equipment/${id}`, data);
  return response.data;
}

export async function deleteEquipment(id: string): Promise<void> {
  await api.delete(`/admin/catalog/equipment/${id}`);
}
