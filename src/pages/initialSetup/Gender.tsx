// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { newUser } from "../../redux/userSlice";
// import { createUser, getUserDetails, updateUserDetails } from "../../services/user";
// const Gender = () => {
//   const [myGender, setMyGender] = useState(null);

//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const handleSubmit = () => {
//     updateUserDetails({ field:'gender',value: myGender }).then((res) => {
//       if (res.status==200){
//          updateUserDetails({ field:'newUser',value: false }).then(()=>{
//           navigate(`/avatar`);
//          })
       
//       }
//     });
//   };
//   useEffect(() => {
//     getUserDetails().then(res=>{
//       if (!res.data.data || !res.data.data.dob)navigate("/birthday"); 
//     })
    
//   }, []);

//   return (
//     <div className="initial-setup">
//       <h2>You Identifies As..</h2>
//       <p>
//         Please share your gender. This helps us tailor your experience and
//         connect you with relevant content.
//       </p>
//       <span
//         className="gspan"
//         style={{ background: "black", color: "white" }}
//         onClick={() => setMyGender("male")}
//       >
//         Male {myGender == "male" ? "✔️" : null}
//       </span>
//       <span className="gspan" onClick={() => setMyGender("female")}>
//         Female {myGender == "female" ? "✔️" : null}
//       </span>
//       <span
//         className="gspan"
//         style={{
//           background:
//             "linear-gradient(to right,#FF0018a3,#FFA52Ca3,#FFFF41a3,#008018a3,#0000F9a3,#86007Da3)",
//         }}
//         onClick={() => setMyGender("other")}
//       >
//         Other {myGender == "other" ? "✔️" : null}
//       </span>
//       {myGender ? <button onClick={handleSubmit}> Continue</button> : null}
//     </div>
//   );
// };

// export default Gender;
