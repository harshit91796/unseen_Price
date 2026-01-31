// import React, { useEffect, useRef, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useDispatch, useSelector } from 'react-redux'
// import { newUser } from '../../redux/userSlice'
// import { getUserDetails, updateUserDetails } from '../../services/user'

// const Birthday = () => {
// const [dob,setDob]=useState('')

//   const user={...useSelector((state) => state.user.value)}

// const minAge=new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0];
//    const navigate=useNavigate()
//    const dispatch=useDispatch()
  

//    const handleSubmit = (e) => {
//     e.preventDefault();
//     updateUserDetails({ field:'dob',value: dob }).then((res) => {
//       if (res.status==200)navigate(`/gender`);
//     });
//   };
//    useEffect(()=>{
//     getUserDetails().then(res=>{
//       if(!res.data.data || !res.data.data.username)navigate('/username')
//     })
    
//    },[])

//   return (
//     <form className='initial-setup' onSubmit={handleSubmit}>
//       <h2>
//       What’s your birthday? Just curious!
//       </h2>
//       <p >
//       Tell us your birthday; it will remain private, and only your age will be visible. This helps us connect you with like-minded people.
//       </p>
//       <h2>🥳</h2>
//       <input type="date" placeholder='dd' required max={minAge} value={dob} onChange={(e)=>setDob(e.target.value)} />


// {dob&&dob!=''? <button> Continue</button>:null}
     
//     </form>
//   )
// }

// export default Birthday
