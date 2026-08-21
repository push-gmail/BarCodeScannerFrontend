import { useEffect,useState } from "react";import { getAdminDashboard } from "../../api/adminApi";
export default function AdminDashboard(){const [s,setS]=useState<any>({});useEffect(()=>{getAdminDashboard().then(r=>setS(r.data))},[]);return <div><h1>Admin Dashboard</h1><div className="stats">{Object.entries(s).map(([k,v])=><div key={k}><b>{String(v)}</b><span>{k}</span></div>)}</div></div>}
