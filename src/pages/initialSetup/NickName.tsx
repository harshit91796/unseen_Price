// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { newUser } from "../../redux/userSlice";
// import { updateUserDetails } from "../../services/user";
// const NickName = () => {
//   const [nam, setnam] = useState("");
//   const dispatch = useDispatch();

//   const navigate = useNavigate();
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     updateUserDetails({ field:'nickName',value: nam }).then((res) => {
//       if (res.status == 200) navigate(`/userName`);
//     });
//   };

//   return (
//     <form onSubmit={handleSubmit} className="initial-setup">
//       <h2 onClick={()=>console.log(sessionStorage.getItem('token'))}>What should we call you..?</h2>
//       <p>
//         Please share your name so we can address you properly and personalize
//         your experience.
//       </p>

//       <input
//         type="text"
//         placeholder="Ex: Jhon Doe"
//         value={nam}
//         name="name"
//         required
//         onChange={(e) => setnam(e.target.value)}
//       />

//       {nam && nam !== "" ? <button> Continue</button> : null}
//     </form>
//   );
// };

// export default NickName;
