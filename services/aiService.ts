
// URL do seu script que retorna as chaves
const KEYS_URL = 'https://script.google.com/macros/s/AKfycbw6UADQLjjaGAhJrEt66EpFAK-dmKmET38GIXwRw9R9iuYUUnAQudHuKV8Tbzu7dBRV/exec';

export async function getGeminiKey(): Promise<string | null> {
  try {
    const response = await fetch(KEYS_URL);
    if (!response.ok) throw new Error('Falha ao buscar chaves');
    
    const data = await response.json();
    // Pega uma chave aleatória da lista para balancear carga, se houver mais de uma
    if (data.keys && Array.isArray(data.keys) && data.keys.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.keys.length);
      return data.keys[randomIndex];
    }
    return null;
  } catch (error) {
    console.error("Erro ao obter API Key:", error);
    return null;
  }
}
