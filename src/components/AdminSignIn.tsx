import {useState} from 'react';
import {Link} from 'react-router-dom';
import BrandLogo from './BrandLogo';
export default function AdminSignIn(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok)throw Error(d.error);setPassword('');window.location.assign('/admin');}catch(e){setError(e instanceof Error?e.message:'Couldn’t sign in.');setBusy(false);}}
 return <main className="ws-login"><div className="ws-login-card"><BrandLogo/><p className="ws-caption">DAVID SLINGS / THE WORKSPACE</p><h1>Good to see you.</h1><p>Sign in to work on the business.</p><form onSubmit={e=>void submit(e)}><label className="ws-field">Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="ws-field">Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p role="alert" className="ws-error">{error}</p>}<button className="ws-primary" disabled={busy}>{busy?'Signing in…':'Open workspace'}</button></form><Link to="/">Back to the store</Link></div></main>;
}
