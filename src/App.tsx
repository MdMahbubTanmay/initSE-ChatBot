import { useState } from 'react'
import { useEffect } from 'react'
import './App.css'
import TopBar from './components/topbar'
import ChatPanel from './components/ChatPanel'



function App() {
      const [uid, setIp] = useState('Loading UID..');
    
    useEffect(()=>{
         fetch('https://api.ipify.org?format=json')
      .then((response) => response.json()) 
      .then((data) => {
        const n = Number.parseInt(data.ip.replaceAll('.',''))
       
        setIp((n*2).toString());
    })
      .catch((error) => {
        console.error('Error fetching IP:', error);
        setIp('UNKNOWN');
      });

    },[])

  return (
    <>
     <TopBar uid={uid}/>
      <main className="main-content">
        <ChatPanel uid={uid} />
      </main>
    </> 
  )
}

export default App
