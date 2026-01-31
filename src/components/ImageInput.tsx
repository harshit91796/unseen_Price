// import React, { useState,useCallback, useEffect } from 'react'
// import Cropper from 'react-easy-crop'
// import ImageCropper from './ImageCropper'


// interface Props {
//     visible: boolean;
//     setpopup:Function;
//     getImageUrl: Function;
//   }

// const ImageInput: React.FC<Props> = ({ visible, getImageUrl,setpopup}) => {
//     const [imgPath,setImgPath]=useState('')
//     const [crop, setCrop] = useState({ x: 0, y: 0 })
//   const [zoom, setZoom] = useState(1)
// const [cropped,setCropped]=useState('')

//   const onCropComplete = (croppedArea, croppedAreaPixels) => {
//     console.log(croppedArea, croppedAreaPixels)
//     setCropped(croppedAreaPixels)
//   }

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         setImgPath(reader.result);
//       };
//     }
//   };

//   const saveCrop=(cropData)=>{
//     const mycanvas=document.createElement('canvas')
//     mycanvas.width=cropData.width
//     mycanvas.height=cropData.height

//     const contxt=mycanvas.getContext('2d')

//     let myImag=new Image()
//     myImag.src=imgPath
// myImag.onload=function(){
//     contxt?.drawImage(
//         myImag,
//         cropData.x,cropData.y,cropData.width,cropData.height,0,0,cropData.width,cropData.height
//     )
//     const imgUrl=mycanvas.toDataURL('image/jpeg')
//     getImageUrl(imgUrl,myImag)
//     setpopup(false)
//     setImgPath(null)
// }
// }

// useEffect(()=>{
//     setImgPath(null)
// },[visible])
    
    
//   return (
//     <div className='cropper'  style={{display:visible?'initial':'none'}}>

//       <div className='grid'>
//         {
//           imgPath?<Cropper
//           image={imgPath}
//           crop={crop}
//           zoom={zoom}
//           aspect={3 / 4}
//           onCropChange={setCrop}
//           onCropComplete={onCropComplete}
//           onZoomChange={setZoom}
  
//   />: <input type="file" accept="image/*" style={{height:'100%',width:'100%',backgroundColor:'grey',opacity:'50%'}}  onChange={handleImageUpload} />
//         }
      

//       </div>
//       <button onClick={()=>setpopup(false)}>cancle</button>
//       <button onClick={()=>saveCrop(cropped)}>Done</button>
//     </div>
//   )
// }

// export default ImageInput
