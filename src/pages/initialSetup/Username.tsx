// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { checkIfUserNameAvailable, getUserDetails, updateUserDetails } from "../../services/user";
// import { useDispatch, useSelector } from "react-redux";
// // import { newUser } from "../../redux/userSlice";

// const Username = () => {
//   const [usernameAvailable, setUsernameAvailable] = useState(false);
//   const [usernameValue, setUsernameValue] = useState("");

//   // const user = { ...useSelector((state) => state.user.value) };

//   const timeoutRef = useRef(null);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const checkUserName = async (e) => {
//     e.preventDefault();
//     setUsernameValue(e.target.value.trim().toLowerCase());

//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }

//     if (usernameValue.length > 7) {
//       timeoutRef.current = setTimeout(() => {
//         checkIfUserNameAvailable({ username: e.target.value.toLowerCase() })
//           .then((res) => setUsernameAvailable(res.data.data))
//           .catch((e) => console.log(e));
//       }, 2000);
//     }
//   };
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     updateUserDetails({ field:'username',value: usernameValue }).then((res) => {
//       if (res.status==200)navigate(`/birthday`);
//     });
//   };

//   useEffect(() => {
//     getUserDetails().then(res=>{
//       if(!res.data.data || !res.data.data.nickName) navigate('/name')
//     })
//   }, []);
//   return (
//     <form  className="initial-setup">
//       <h2>Celebrate your uniqueness with a username as special as you are.</h2>
//       <p>
//         Choose a unique username so people can find you easily and connect with
//         you effortlessly. It’s your personal touch in our community.
//       </p>
//       <input
//         type="text"
//         placeholder="Username"
//         value={usernameValue}
//         required
//         // onChange={checkUserName}
//         style={{ background: usernameAvailable ? "#31ff314d" : "" }}
//       />
//       {usernameValue && usernameValue.length > 7 ? (
//         usernameAvailable ? (
//           <span style={{ color: "#18d818" }}>Available</span>
//         ) : (
//           <span style={{ color: "#d81818" }}>Not Available</span>
//         )
//       ) : (
//         <span style={{ color: "grey" }}>Minimum 8 charactors</span>
//       )}

//       {usernameAvailable && usernameValue && usernameValue.length > 7 ? (
//         <button> Continue</button>
//       ) : null}
//     </form>
//   );
// };

// export default Username;
