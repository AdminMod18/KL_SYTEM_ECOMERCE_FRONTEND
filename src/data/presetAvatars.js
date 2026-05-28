/** Avatares predefinidos (emoji + gradiente; sin assets externos). */
export const PRESET_AVATARS = [
  { id: 'ocean', emoji: '🌊', gradient: 'from-blue-600 to-cyan-500', label: 'Océano' },
  { id: 'sunset', emoji: '🌅', gradient: 'from-orange-500 to-rose-500', label: 'Atardecer' },
  { id: 'forest', emoji: '🌿', gradient: 'from-emerald-600 to-teal-500', label: 'Bosque' },
  { id: 'galaxy', emoji: '✨', gradient: 'from-violet-600 to-indigo-600', label: 'Galaxia' },
  { id: 'fire', emoji: '🔥', gradient: 'from-amber-500 to-red-600', label: 'Fuego' },
  { id: 'cool', emoji: '😎', gradient: 'from-sky-500 to-blue-700', label: 'Cool' },
  { id: 'star', emoji: '⭐', gradient: 'from-yellow-500 to-amber-600', label: 'Estrella' },
  { id: 'heart', emoji: '💜', gradient: 'from-fuchsia-500 to-purple-700', label: 'Corazón' },
  { id: 'rocket', emoji: '🚀', gradient: 'from-indigo-600 to-blue-800', label: 'Cohete' },
  { id: 'cat', emoji: '🐱', gradient: 'from-pink-500 to-rose-600', label: 'Gato' },
  { id: 'dog', emoji: '🐶', gradient: 'from-amber-600 to-orange-700', label: 'Perro' },
  { id: 'tech', emoji: '💻', gradient: 'from-slate-600 to-slate-900', label: 'Tech' },
];

/**
 * @param {string | null | undefined} id
 */
export function findPresetAvatar(id) {
  return PRESET_AVATARS.find((a) => a.id === id) ?? null;
}
