import React, {useState } from "react";

interface Props {
  title: string;
  ItemList: any;
  subCategory: boolean;
  handleSubmit:Function ;
}

const Setup: React.FC<Props> = ({ handleSubmit, title, ItemList, subCategory }) => {
  const [list] = useState<any>(ItemList || []);
  const [filteredList, setFilteredList] = useState<any>(list);

  const changeList = (val: any, ind: any) => {
    const arr = [...filteredList];
    const obj = { ...arr[ind] };
    const result = obj.selectedItems.find((item: any) => item === val);
    if (obj.multipleSelection) {
      if (result) {
        obj.selectedItems = obj.selectedItems.filter((element: any) => element !== val);
      } else {
        obj.selectedItems.push(val);
      }
    } else {
      obj.selectedItems = [val];
    }
    arr[ind] = obj;
    setFilteredList(arr);
    console.log(arr)
  };


  const filterList = (e: any) => {
    const arr = [...list];
    const obj = arr[0];
    let fist = obj.items.filter((item: any) =>
      item.includes(e.target.value.toLowerCase())
    );
    const newObj={...obj,items:fist};
    setFilteredList([newObj]);
    console.log(newObj.items);
  };
  const pascle = (string: string) => {
    const arr = string.split("");
    arr[0] = arr[0].toUpperCase();
    return arr.join("");
  };
  return (
    <div className="setuppage">
      <h2>{title ? title : "Tittle"}</h2>

      {!subCategory ? (
        <input type="text" placeholder="Search" onChange={filterList} />
      ) : null}

      <div className="setupContainer">
        {filteredList &&
          filteredList.map((x: any, ind: any) => {
            return (
              <div>
                {subCategory ? <h4>{x.subTitle}</h4> : null}
                {x.items.map((i: any) => {
                      const check = x.selectedItems.find((item: any) => item === i);
                  return (
                    <span
                    className={check ? "selected" : "notselected"}
                      onClick={() => changeList(i, ind)}
                    >
                      {pascle(i)}
                    </span>
                  );
                })}
              </div>
            );
          })}
      </div>
      <button onClick={()=>handleSubmit(subCategory?filteredList:list)}>Continue</button>

    </div>
  );
};

export default Setup;
