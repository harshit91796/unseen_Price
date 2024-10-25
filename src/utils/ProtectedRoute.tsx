// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// interface Props {
//   to: React.ReactElement; // Typing for the component to render
// }

// const ProtectedRoute: React.FC<Props> = ({ to }) => {
//   const [auth, setAuth] = useState('');
// const navigate=useNavigate()
//   useEffect(() => {
//       const token = localStorage.getItem('authToken');
//       setAuth(token);
//       console.log('authto',token)
//   }, []); // Only run on component mount

//   // return auth && auth !== '' ? to : <Navigate to="/login" />;
//   if(auth&&auth!==''){
//     return to;
//   }else{
//     return to;
//     navigate('/login')
//   }
// };

// export default ProtectedRoute;
