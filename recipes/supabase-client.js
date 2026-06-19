// Supabase client helper for demo pages
// Replace SUPABASE_URL and SUPABASE_ANON_KEY with your project values
const SUPABASE_URL = 'https://birzjhrysrjjvbyzsfoc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DhkuAdHHV658d0mNkSWhuQ_jB5dxbgd';
const supabase = window.supabase && window.supabase.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

async function fetchRecipes() {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function addRecipe(recipe, file) {
  if (!supabase) throw new Error('Supabase client not initialized');
  let image_path = null;
  if (file) {
    const path = `recipes/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('dashboard').upload(path, file);
    if (uploadError) throw uploadError;
    image_path = uploadData.path;
  }
  const { data, error } = await supabase.from('recipes').insert([{ title: recipe.title, ingredients: recipe.ingredients, instructions: recipe.instructions, image_path }]);
  if (error) throw error;
  return data;
}

function getPublicUrl(path) {
  if (!supabase) return null;
  const { data } = supabase.storage.from('dashboard').getPublicUrl(path);
  return data?.publicUrl || null;
}

async function fetchTasks() {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase.from('tasks').select('*').order('due_date', { ascending: true });
  if (error) throw error;
  return data;
}

async function addTask(title, due_date) {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase.from('tasks').insert([{ title, due_date }]);
  if (error) throw error;
  return data;
}

async function updateTaskCompletion(id, completed) {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase.from('tasks').update({ completed }).eq('id', id);
  if (error) throw error;
  return data;
}

window.SUPA = { fetchRecipes, addRecipe, getPublicUrl, fetchTasks, addTask, updateTaskCompletion };
