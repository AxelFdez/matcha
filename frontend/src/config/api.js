
export const fetchData = async (endpoint, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'authorization': "bearer " + localStorage.getItem('accessToken'),
  };

  const config = {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // console.log('api url= ', process.env.VUE_APP_API_URL + endpoint);
  // console.log('config= ', config);
  try {
    const response = await fetch(process.env.VUE_APP_API_URL + endpoint, config);

    // Gérer les erreurs réseau (502, 503, 504, etc.)
    if (!response.ok && (response.status >= 500 || response.status === 502 || response.status === 503 || response.status === 504)) {
      console.error(`Erreur serveur ${response.status}: ${response.statusText}`);
      return {
        response,
        data: {
          message: 'Server Error',
          error: response.statusText,
          status: response.status
        }
      };
    }

    // Tenter de parser la réponse en JSON
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // Si le parsing JSON échoue (ex: erreur 502 qui retourne du HTML)
      console.error('Erreur de parsing JSON:', jsonError);
      return {
        response,
        data: {
          message: 'Server Error',
          error: 'Invalid JSON response',
          status: response.status
        }
      };
    }

    if (!response.ok) {
      // console.log('data= ', data);
      if (data.message === "newAccessTokenDelivered"){
        localStorage.setItem('accessToken', data.accessToken);
        return fetchData(endpoint, options);
      }
      // throw new Error(`Erreur: ${response.statusText}`);
      // console.log('Erreur: ', await response.json());
    }
    // console.log('response= ', await response.json());
    return {response, data};
  } catch (error) {
    console.error('Erreur lors de la requête:', error);
    // Retourner une réponse d'erreur standardisée au lieu de throw
    return {
      response: {
        ok: false,
        status: 503,
        statusText: 'Network Error'
      },
      data: {
        message: 'Network Error',
        error: error.message,
        status: 503
      }
    };
  }
};
