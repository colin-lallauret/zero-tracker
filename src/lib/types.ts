export type WorkoutType = 'Gym' | 'Cardio' | 'Repos' | 'Gym + Cardio'

export interface Entry {
  id: string
  user_id: string
  date: string
  weight: number | null
  calories: number | null
  steps: number | null
  workout_type: WorkoutType | null
  photo_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type EntryInsert = Omit<Entry, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type EntryUpdate = Partial<EntryInsert>
