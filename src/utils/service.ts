// import axios from 'axios';
// import Cookies from 'js-cookie';

// const url="http://192.168.29.105:4000/api";
// // const url="http://192.168.29.105:4000";



// const token = sessionStorage.getItem('token');
// console.log('Token:', token); // Debugging step

// const config = {
//   headers: {
//     'Authorization': `Bearer ${token}`,
//   },
//   withCredentials: true
// };





// export const postRequest= (endpoint, data) => {
//     return axios.post(`${url}${endpoint}`, data,config)
//       .then(response => response)
//       .catch(error => {
//         console.error('Error making POST request:', error);
//         throw error;
//       });
//   };

//   export const getRequest= (endpoint) => {
//     return axios.get(`${url}${endpoint}`, config)
//     .then(response => response)
//     .catch(error => {
//       console.error('Error making GET request:', error);
//       throw error;
//     });
//   };
