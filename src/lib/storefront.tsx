import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { defaults, mergeContent, validContent, copyFields } from '../../shared/content';
import type { SiteContent, Media } from '../../shared/content';
export { videoEmbed, validImage, copyFields } from '../../shared/content';
export type { Photo, Media, SiteContent } from '../../shared/content';
export const IS_PREVIEW = import.meta.env.VITE_STOREFRONT_PREVIEW !== 'false';
type Store = { content:SiteContent; media:Media; setContent:React.Dispatch<React.SetStateAction<SiteContent>>; canEdit:boolean; loaded:boolean; editing:boolean; setEditing:(value:boolean)=>void; selection:number; selected:string; select:(key:string)=>void; dirty:boolean; saving:boolean; status:string; save:()=>Promise<void>; reset:()=>void };
const Context=createContext<Store|null>(null);
export function MediaProvider({children}:{children:ReactNode}){
 const [content,updateContent]=useState(defaults),[saved,setSaved]=useState(defaults),[revision,setRevision]=useState(0);
 const [canEdit,setCanEdit]=useState(false),[loaded,setLoaded]=useState(false),[editing,setEditing]=useState(false),[selected,setSelected]=useState('');
 const [selection,setSelection]=useState(0);
 const select=useCallback((key:string)=>{setSelected(key);setSelection(n=>n+1);},[]);
 const [saving,setSaving]=useState(false),[status,setStatus]=useState('');
 const setContent:React.Dispatch<React.SetStateAction<SiteContent>>=useCallback(value=>{updateContent(value);setStatus('');},[]);
 const dirty=JSON.stringify(content)!==JSON.stringify(saved);
 useEffect(()=>{let active=true; Promise.all([fetch('/api/content').then(async r=>{if(!r.ok)throw Error();return r.json();}),fetch('/api/editor').then(r=>r.json())]).then(([data,auth])=>{if(!active)return;const next=mergeContent(data.content);if(!validContent(next))throw Error();setContent(next);setSaved(next);setRevision(data.revision);setCanEdit(auth.canEdit===true);setLoaded(true);}).catch(()=>{if(active)setStatus('The saved site could not be loaded. Reload before editing.');});return()=>{active=false;};},[]);
 useEffect(()=>{if(!dirty)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 useEffect(()=>{document.body.classList.toggle('site-editing',editing);return()=>document.body.classList.remove('site-editing');},[editing]);
 async function save(){
 if(!canEdit||!loaded||saving)return;
 if(!validContent(content)){setStatus('Check your fields: use a valid email, Instagram profile, YouTube link, and a price from $1 to $1,000.');return;}
 setSaving(true);setStatus('Saving…');const snapshot=content;
 try{const response=await fetch('/api/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:snapshot,revision})});const data=await response.json();if(!response.ok)throw Error(data.error||'Save failed. Try again.');setSaved(snapshot);setRevision(data.revision);setStatus('Saved. Your changes are on the site.');}catch(error){setStatus(error instanceof Error?error.message:'Couldn’t save. Try again.');}finally{setSaving(false);}
 }
 return <Context.Provider value={{content,media:content.media,setContent,canEdit,loaded,editing,setEditing:(value)=>{if(canEdit)setEditing(value);},selection,selected,select,dirty,saving,status,save,reset:()=>{setContent(saved);setStatus('Unsaved changes undone.');}}}>{children}</Context.Provider>;
}
export function useSite(){const value=useContext(Context);if(!value)throw Error('Missing site provider');return value;}
export const useMedia=useSite;
export function useCopy(){const {content}=useSite();return useCallback((key:string)=>content.copy[key]??copyFields[key as keyof typeof copyFields]?.defaultValue??'', [content.copy]);}
export function Copy({field}:{field:string}){
 const {editing,select,selected}=useSite();const t=useCopy();
 if(!editing)return <>{t(field)}</>;
 return <span className={editing?`editable-copy${selected===field?' selected':''}`:undefined} title={editing?'Click to edit this text':undefined} tabIndex={editing?0:undefined} role={editing?'button':undefined} onClick={editing?(e)=>{e.preventDefault();e.stopPropagation();select(field);}:undefined} onKeyDown={editing?(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();select(field);}}:undefined}>{t(field)}</span>;
}
export function Section({name,children}:{name:string;children:ReactNode}){const {content}=useSite();if(content.hiddenSections.includes(name))return null;return <div className="storefront-section" style={{order:content.sections.indexOf(name)+1}}>{children}</div>;}
