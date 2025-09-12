
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

  console.log('api url= ', process.env.VUE_APP_API_URL + endpoint);
  // console.log('config= ', config);
  try {
    const response = await fetch(process.env.VUE_APP_API_URL + endpoint, config);
    const data = await response.json();
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
    throw error;
  }
};
