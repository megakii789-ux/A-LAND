import React from 'react';
export class ErrorBoundary extends React.Component<React.PropsWithChildren, {failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){
    if(this.state.failed)return <main className="qy-error" role="alert">
      <h1>这一页暂时没打开</h1><p>可以先放下屏幕，和身边的大人待一会儿。</p>
      <p>重新打开会清除本次尚未保存的内容。</p>
      <button className="qy-button" onClick={()=>location.reload()}>重新打开小岛</button>
    </main>;
    return this.props.children;
  }
}
