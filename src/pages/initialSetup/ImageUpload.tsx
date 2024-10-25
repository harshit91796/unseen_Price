// import React, { useState } from 'react'
// import ImageInput from '../../components/ImageInput'

// const ImageUpload = () => {
//     const [imger,setImger]=useState(['','','','','',''])
//     const [indx,setIndx]=useState(null)
//     const [popup,setpopup]=useState(false)
//     const getImageUrl=(img)=>{
//         const arr=[...imger]
//         arr[indx]=img
//         setImger(arr)
//         setIndx(null)
//     }

//     const open=(i)=>{
//         setIndx(i)
// setpopup(true)
//     }
//   return (
//     <div className="initial-setup" style={{position:'relative'}}>
//         <ImageInput getImageUrl={getImageUrl} visible={popup} setpopup={setpopup}/>
//     <h2>Let’s Put a Face to That Awesome Username!</h2>

//     <p>Adding photos makes your profile more complete and personal, improving your visibility to others.</p>
// <div className='uploadContainer'>
// {
//     imger.map((x,i)=>{
//         return(
//             <div onClick={()=>open(i)}>
//                 {x!=""?<img src={x} alt="" />:<h2>+</h2>}
//             </div>
//         )
//     })
// }
// </div>
// <button> Continue</button>

// </div>
      
    
//   )
// }

// export default ImageUpload
