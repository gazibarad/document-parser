const STORAGE_KEY = 'documents';

export const loadDocuments = () => {
  if (typeof localStorage === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse stored documents:', error);
    return [];
  }
};

export const saveDocuments = (documents) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
};
