/**
 * Body measurements as the gym app records them. Masses are stored in pounds and
 * shown in kilograms, the same as in the gym app.
 */
export type MeasureField =
  | 'weight'
  | 'bmi'
  | 'bodyFatPercent'
  | 'muscleMass'
  | 'heartRate'
  | 'leanBodyMass'
  | 'boneMass'
  | 'skeletalMuscleMass'
  | 'visceralFat'
  | 'subcutaneousFatPercent'
  | 'proteinPercent'
  | 'bmr'
  | 'bodyAge';

export interface MeasureDef {
  field: MeasureField;
  /** The gym app's name for it, used by healthy ranges and goals */
  key: string;
  label: string;
  unit: string;
  mass?: boolean;
  decimals: number;
}

const LB_PER_KG = 2.20462;

export const MEASURES: MeasureDef[] = [
  { field: 'weight', key: 'weight', label: 'Weight', unit: 'kg', mass: true, decimals: 1 },
  { field: 'bodyFatPercent', key: 'body_fat_percent', label: 'Body fat', unit: '%', decimals: 1 },
  { field: 'muscleMass', key: 'muscle_mass', label: 'Muscle mass', unit: 'kg', mass: true, decimals: 1 },
  { field: 'bmi', key: 'bmi', label: 'BMI', unit: '', decimals: 1 },
  { field: 'skeletalMuscleMass', key: 'skeletal_muscle_mass', label: 'Skeletal muscle', unit: 'kg', mass: true, decimals: 1 },
  { field: 'leanBodyMass', key: 'lean_body_mass', label: 'Lean body mass', unit: 'kg', mass: true, decimals: 1 },
  { field: 'boneMass', key: 'bone_mass', label: 'Bone mass', unit: 'kg', mass: true, decimals: 1 },
  { field: 'visceralFat', key: 'visceral_fat', label: 'Visceral fat', unit: '', decimals: 0 },
  { field: 'subcutaneousFatPercent', key: 'subcutaneous_fat_percent', label: 'Subcutaneous fat', unit: '%', decimals: 1 },
  { field: 'proteinPercent', key: 'protein_percent', label: 'Protein', unit: '%', decimals: 1 },
  { field: 'heartRate', key: 'heart_rate', label: 'Resting heart rate', unit: 'bpm', decimals: 0 },
  { field: 'bmr', key: 'bmr', label: 'BMR', unit: 'kcal', decimals: 0 },
  { field: 'bodyAge', key: 'body_age', label: 'Body age', unit: 'yrs', decimals: 0 },
];

/** The headline cards, from those the member has values for. */
export const HEADLINE_FIELDS: MeasureField[] = ['weight', 'bodyFatPercent', 'muscleMass', 'bmi'];

/** Goals can be set for these. */
export const GOAL_KEYS = ['weight', 'body_fat_percent', 'muscle_mass', 'bmi'];

export function shown(def: MeasureDef, stored: number | null | undefined): number | null {
  if (stored == null || !Number.isFinite(Number(stored))) return null;
  const v = def.mass ? Number(stored) / LB_PER_KG : Number(stored);
  const f = 10 ** def.decimals;
  return Math.round(v * f) / f;
}

export function formatMeasure(def: MeasureDef, value: number | null): string {
  if (value == null) return '—';
  return `${value.toFixed(def.decimals)}${def.unit === '%' ? '%' : def.unit ? ` ${def.unit}` : ''}`;
}

/** A healthy range the gym set in its app, as synced. */
export interface Standard {
  metric_name: string;
  gender?: string | null;
  age_min?: number | null;
  age_max?: number | null;
  low_max?: number | null;
  standard_min?: number | null;
  standard_max?: number | null;
  high_min?: number | null;
  excellent_min?: number | null;
}

export type RangeStatus = 'Low' | 'Healthy' | 'High' | 'Excellent';

/**
 * Where a stored value sits in the gym's healthy ranges, as the gym app judges it:
 * the range for the member's gender and age when there is one, else a general one.
 */
export function rangeStatus(
  standards: Standard[],
  key: string,
  stored: number | null,
  gender: string | null,
  age: number | null,
): RangeStatus | null {
  if (stored == null) return null;
  const fits = (s: Standard) =>
    s.metric_name === key &&
    (!s.gender || !gender || s.gender.toUpperCase() === gender.toUpperCase().charAt(0)) &&
    (s.age_min == null || age == null || age >= s.age_min) &&
    (s.age_max == null || age == null || age <= s.age_max);
  const s = standards.filter(fits).sort((a, b) => Number(!!b.gender) - Number(!!a.gender))[0];
  if (!s) return null;
  if (s.excellent_min != null && stored >= s.excellent_min) return 'Excellent';
  if (s.high_min != null && stored >= s.high_min) return 'High';
  if (s.standard_min != null && s.standard_max != null && stored >= s.standard_min && stored <= s.standard_max) {
    return 'Healthy';
  }
  if (s.low_max != null && stored <= s.low_max) return 'Low';
  return null;
}

/**
 * Shrinks a photo in the browser before upload: the longest side to `max` pixels, as
 * JPEG. Drawing it again also leaves out hidden data such as where it was taken.
 */
export async function compressImage(file: File, max: number, quality = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot prepare the photo');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', quality);
}
