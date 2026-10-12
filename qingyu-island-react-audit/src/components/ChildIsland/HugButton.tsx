import React from 'react';
/** Deprecated compatibility entry. Never infer the recipient from a calendar. */
export const HugButton:React.FC=()=>(
 <button className="qy-button qy-support-button" onClick={()=>window.dispatchEvent(new Event('qingyu:local-help'))}>
  我想找身边的大人
 </button>
);
