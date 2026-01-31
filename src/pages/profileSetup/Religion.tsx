// import { useEffect, useState } from "react";
// import Setup from "../../components/Setup";
// import { getPrefrence, updatePrefrence } from "../../services/setUp";
// import { useNavigate } from "react-router-dom";

// const Religion = () => {
//     const [title,setTitle]=useState(null)
//     const [subCategory,setSubcategory]=useState(false)
//     const [totalList, setTotalList] = useState([]);
  
//   const navigate=useNavigate()
    
//     const handleSubmit=async (data:any)=>{
//   console.log(data)
  
//   const promises = data.map((x:any) => updatePrefrence({ field: x.keyWord, value: x.selectedItems }));
//   await Promise.all(promises);
//   navigate('/lifestyle')
//     }
  
  
    
//   const getData=async()=>{
//     await getPrefrence("Religion").then(res=>{
//       console.log(res)
//       setTitle(res.data.data.allOptions[0].title)
//       setSubcategory(res.data.data.allOptions[0].subcategory) 
//       const data=res.data.data.allOptions.map((x:any)=>{
//         return {
//           subTitle: x.subtitle,
//           items: x.options,
//           selectedItems: res.data.data.selected?.[x.keyWord]?res.data.data.selected[x.keyWord]:[],
//           multipleSelection: x.multipleSelection,
//           keyWord:x.keyWord
//         }
//       })
//       console.log(data)
//       setTotalList(data)
//     })
//   }
  
//   useEffect(()=>{
//     getData()
//   },[])
  
  
//     return title?<Setup title={title} ItemList={totalList} subCategory={subCategory} handleSubmit={handleSubmit} />:null;
//   };

// export default Religion
