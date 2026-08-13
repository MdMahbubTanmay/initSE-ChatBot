import '../components/topbar.css';

type pros = {
    uid : string
}

export default function TopBar ({uid} :pros){

    return (
        <div className="topbar">
        <p className='IpText'>UID : {uid}</p>
        </div>
    );
}