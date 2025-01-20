
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
    // console.log("api_base_url ", process.env.VUE_APP_API_URL + endpoint);
    const response = await fetch(process.env.VUE_APP_API_URL + endpoint, config);
    // if (!response.ok) {
    //   throw new Error(`Erreur: ${response.statusText}`);
    // }
    return response;
  } catch (error) {
    console.error('Erreur lors de la requête:', error);
    throw error;
  }
};
