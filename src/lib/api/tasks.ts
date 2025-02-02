// src/lib/api/tasks.ts -->

import { ErrorLogger } from "../errors/logger";
import { TaskFormData } from '../validations/task';
import { supabase } from "../supabase/client";


// Define and export the Task type
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  checklist: { id: string; completed: boolean; text: string }[];
  assigned_to: { name: string; avatar_url: string };
  due_date: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';  
  updated_at: string;  // Add updated_at property
}

// Define and export the TaskStatus type
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'blocked';

// Fetch tasks from the database
export async function fetchTasks(): Promise<Task[]> {
  try {
    const supabaseVar = supabase;
    const { data, error } = await supabaseVar
      .from('tasks')
      .select('*');

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorLogger.error("Failed to fetch tasks", error as Error);
    throw error;
  }
}

export async function fetchTaskById(taskId: string): Promise<Task | null> {
  try {
    const supabaseVar = supabase;
    const { data, error } = await supabaseVar
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single(); // Fetch a single task by ID

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorLogger.error("Failed to fetch task by ID", error as Error);
    throw error;
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
  try {
    const supabaseVar = supabase;
    
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorLogger.error("Failed to update task status", error as Error);
    throw error;
  }
}

export async function createTask(data: TaskFormData): Promise<Task> {
  try {
    const supabaseVar = supabase;
    
    // Transform checklist items to the required format
    const formattedChecklist = data.checklist.map(item => ({
      id: crypto.randomUUID(),
      text: item,  // Assuming each checklist item is a string, use it as the 'text' property
      completed: false
    }));

    const taskData = {
      ...data,
      checklist: formattedChecklist,
      created_at: new Date().toISOString()
    };

    const { data: newTask, error } = await supabaseVar
      .from('tasks')
      .insert(taskData)
      .select('*')
      .single();

    if (error) throw error;
    return newTask;
  } catch (error) {
    ErrorLogger.error("Failed to create task", error as Error);
    throw error;
  }
}

export async function updateTaskChecklist(taskId: string, itemId: string, completed: boolean): Promise<void> {
  try {
    const supabaseVar = supabase;

    // First get the current task
    const { data: task, error: fetchError } = await supabaseVar
      .from('tasks')
      .select('checklist')
      .eq('id', taskId)
      .single();

    if (fetchError) throw fetchError;

    // Update the checklist item
    const updatedChecklist = task.checklist.map((item: any) =>
      item.id === itemId ? { ...item, completed } : item
    );

    // Save the updated checklist
    const { error: updateError } = await supabaseVar
      .from('tasks')
      .update({ checklist: updatedChecklist })
      .eq('id', taskId);

    if (updateError) throw updateError;
  } catch (error) {
    ErrorLogger.error("Failed to update task checklist", error as Error);
    throw error;
  }
}
