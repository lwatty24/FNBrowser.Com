export async function fetchSetItems(setName: string): Promise<Cosmetic[]> {
  try {
    const response = await fetch(`https://fortnite-api.com/v2/cosmetics/br/search/all?set=${encodeURIComponent(setName)}`);
    if (!response.ok) throw new Error('Failed to fetch set items');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching set items:', error);
    return [];
  }
} 