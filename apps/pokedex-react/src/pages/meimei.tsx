import {useState} from 'react';

export default function MeiMeiPage() {

  const [age,setAge] = useState(0);

  const names = ['Amy','Mei','Winnie'];
  const ages: Record<string, number> = {
    Amy : 25,
    Mei : 12,
    Winnie : 43,
  };

  return <div>{names.map(name =>{
    return <div>
      <p>{name}</p>
      <input type='number' value={ages[name]} className="border" placeholder="age"/>
      </div>
  })}</div>;
}
