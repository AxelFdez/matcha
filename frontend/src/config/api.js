
export const fetchData = async (endpoint, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    // Autres en-têtes par défaut
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    console.log("api_base_url ", "http://192.168.1.42:8081" + endpoint);
    const response = await fetch("http://192.168.1.42:8081" + endpoint, config);
    // if (!response.ok) {
    //   throw new Error(`Erreur: ${response.statusText}`);
    // }
    return response;
  } catch (error) {
    console.error('Erreur lors de la requête:', error);
    throw error;
  }
};
