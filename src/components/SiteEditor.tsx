import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSite, copyFields, videoEmbed } from '@/lib/storefront';
import type { Photo } from '@/lib/storefront';
import { sectionNames } from '../../shared/content';

type Tab='Text'|'Photos'|'Layout'|'Settings';
export default function SiteEditor(){
 const site=useSite();const {content,setContent,editing,selected,select,selection}=site;
 const [tab,setTab]=useState<Tab>('Text'),[group,setGroup]=useState('Home'),[search,setSearch]=useState(''),[uploading,setUploading]=useState(''),[error,setError]=useState('');
 const navigate=useNavigate(),location=useLocation(),fieldRef=useRef<HTMLTextAreaElement>(null);
 useEffect(()=>{if(selected){setTab('Text');setSearch('');setGroup(copyFields[selected as keyof typeof copyFields]?.group||'Home');}},[selected,selection]);
 useEffect(()=>{if(selected&&editing){fieldRef.current?.focus();fieldRef.current?.scrollIntoView({block:'nearest'});}},[selected,selection,editing,tab]);
 if(!site.canEdit)return null;
 if(!editing)return <button className="editor-launch" onClick={()=>site.setEditing(true)}>✎ Edit site</button>;
 const setMedia=(patch:Partial<typeof content.media>)=>setContent(c=>({...c,media:{...c.media,...patch}}));
 const setPhoto=(index:number,patch:Partial<Photo>)=>setContent(c=>({...c,media:{...c.media,photos:c.media.photos.map((p,i)=>i===index?{...p,...patch}:p)}}));
 async function upload(file:File|undefined,target:string){
 if(!file)return;setError('');if(file.size>8*1024*1024){setError('Choose an image smaller than 8 MB.');return;}if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Choose a JPG, PNG, or WebP image.');return;}
 setUploading(target);
 try{const response=await fetch('/api/media',{method:'POST',headers:{'Content-Type':file.type},body:file});const data=await response.json();if(!response.ok)throw Error(data.error||'Upload failed.');
 setContent(c=>{const media={...c.media};if(target==='new')media.photos=[...media.photos,{src:data.src,alt:file.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' '),caption:'',position:50}];else if(/^photo-/.test(target))media.photos=media.photos.map((p,i)=>i===Number(target.slice(6))?{...p,src:data.src}:p);else media[target as 'hero'|'product'|'poster']=data.src;return {...c,media};});
 }catch(e){setError(e instanceof Error?e.message:'Upload failed. Try again.');}finally{setUploading('');}
 }
 const uploadButton=(target:string,label:string)=><label className={`editor-upload ${uploading?'disabled':''}`}>{uploading===target?'Uploading…':label}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={!!uploading||site.saving} onChange={e=>{void upload(e.target.files?.[0],target);e.target.value='';}} /></label>;
 function move(index:number,delta:number){const photos=[...content.media.photos];[photos[index],photos[index+delta]]=[photos[index+delta],photos[index]];setMedia({photos});}
 const groups=[...new Set(Object.values(copyFields).map(f=>f.group))];
 return <aside className="site-editor" aria-label="Site editor">
  <div className="editor-heading"><div><span className="editor-eyebrow">YOUR LITTLE CORNER OF THE INTERNET</span><h2>Edit your site.</h2></div><button aria-label="Close editor" onClick={()=>site.setEditing(false)}>×</button></div>
  <p className="editor-intro">Click text on the page, or change it here. Save when it feels right.</p>
  <label className="editor-page">Preview page<select value={location.pathname==='/checkout'?'checkout':location.pathname==='/success'?'success':'home'} onChange={e=>navigate(e.target.value==='home'?'/':e.target.value==='checkout'?'/checkout':'/success?preview=1',{state:{preview:true,quantity:1}})}><option value="home">Home</option><option value="checkout">Checkout</option><option value="success">Confirmation</option></select></label>
  <div className="editor-tabs" role="tablist" aria-label="Editing controls">{(['Text','Photos','Layout','Settings'] as Tab[]).map(item=><button key={item} role="tab" aria-selected={tab===item} onClick={()=>setTab(item)}>{item}</button>)}</div>
  <div className="editor-body" role="tabpanel">
  {tab==='Text'&&<>
   <label>Find text<input placeholder="Search words on your site" value={search} onChange={e=>setSearch(e.target.value)}/></label>
   <label>Section<select value={group} onChange={e=>{setGroup(e.target.value);select('');}}>{groups.map(g=><option key={g}>{g}</option>)}</select></label>
   {Object.entries(copyFields).filter(([key,f])=>search?`${f.label} ${content.copy[key]}`.toLowerCase().includes(search.toLowerCase()):f.group===group).map(([key,f])=><label className={`editor-text-field ${selected===key?'active':''}`} key={key}><span>{f.label}</span><textarea ref={selected===key?fieldRef:undefined} rows={content.copy[key].length>75?3:2} maxLength={2000} value={content.copy[key]} onFocus={()=>{if(selected!==key)select(key);}} onChange={e=>setContent(c=>({...c,copy:{...c.copy,[key]:e.target.value}}))}/></label>)}
   <p className="editor-tip">Repeated wording, like the product name, changes everywhere. Checkout preview notices stay in place until real payments are ready.</p>
  </>}
  {tab==='Photos'&&<>
   <p className="editor-tip">Upload JPG, PNG, or WebP images up to 8 MB. Your uploads are saved when added; click Save changes to put them on the site.</p>
   {(['hero','product','poster'] as const).map(key=><div className="editor-photo" key={key}><h3>{key==='hero'?'Hero photo':key==='product'?'Product & checkout photo':'Video cover'}</h3><img src={content.media[key]} alt=""/>{uploadButton(key,'Replace photo')}
   {key!=='poster'&&<><label>Image description<input maxLength={300} value={content.media[`${key}Alt`]} onChange={e=>setMedia({[`${key}Alt`]:e.target.value})}/></label><label>Crop position<input type="range" min="0" max="100" value={content.media[`${key}Position`]} onChange={e=>setMedia({[`${key}Position`]:Number(e.target.value)})}/></label></>}
   </div>)}
   <h3>The photo carousel</h3>
   {content.media.photos.map((photo,index)=><div className="editor-photo" key={index}><img src={photo.src} alt="" style={{objectPosition:`50% ${photo.position}%`}}/><div className="editor-photo-actions"><strong>Photo {index+1}</strong><button aria-label={`Move photo ${index+1} left`} disabled={index===0||!!uploading} onClick={()=>move(index,-1)}>←</button><button aria-label={`Move photo ${index+1} right`} disabled={index===content.media.photos.length-1||!!uploading} onClick={()=>move(index,1)}>→</button><button disabled={content.media.photos.length===1||!!uploading} onClick={()=>setMedia({photos:content.media.photos.filter((_,i)=>i!==index)})}>Remove</button></div>{uploadButton(`photo-${index}`,'Replace photo')}<label>Caption<input maxLength={500} value={photo.caption} onChange={e=>setPhoto(index,{caption:e.target.value})}/></label><label>Image description<input maxLength={300} value={photo.alt} onChange={e=>setPhoto(index,{alt:e.target.value})}/></label><label>Crop position<input type="range" min="0" max="100" value={photo.position} onChange={e=>setPhoto(index,{position:Number(e.target.value)})}/></label></div>)}
   {content.media.photos.length<12&&uploadButton('new','+ Add a photo')}
   <label className="editor-video">How-to video (YouTube link)<input type="url" placeholder="https://youtu.be/…" value={content.media.video} onChange={e=>setMedia({video:e.target.value})}/></label>{content.media.video&&!videoEmbed(content.media.video)&&<p role="alert">Paste a complete YouTube video link.</p>}
  </>}
  {tab==='Layout'&&<><h3>Make it your own.</h3><p className="editor-tip">Move sections up or down, or hide one until it’s ready. The hero stays at the top.</p>{content.sections.map((key,index)=><div className="editor-section" key={key}><label><input type="checkbox" checked={!content.hiddenSections.includes(key)} onChange={e=>setContent(c=>({...c,hiddenSections:e.target.checked?c.hiddenSections.filter(k=>k!==key):[...c.hiddenSections,key]}))}/>{sectionNames[key]}</label><button aria-label={`Move ${sectionNames[key]} up`} disabled={index===0} onClick={()=>setContent(c=>{const sections=[...c.sections];[sections[index-1],sections[index]]=[sections[index],sections[index-1]];return {...c,sections};})}>↑</button><button aria-label={`Move ${sectionNames[key]} down`} disabled={index===3} onClick={()=>setContent(c=>{const sections=[...c.sections];[sections[index+1],sections[index]]=[sections[index],sections[index+1]];return {...c,sections};})}>↓</button></div>)}</>}
  {tab==='Settings'&&<><h3>The useful details.</h3><label>Price per sling (USD)<input type="number" min="1" max="1000" step="0.01" value={content.price} onChange={e=>setContent(c=>({...c,price:Number(e.target.value)}))}/></label><label>Contact email<input type="email" value={content.contactEmail} onChange={e=>setContent(c=>({...c,contactEmail:e.target.value}))}/></label><label>Slinging club Instagram<input type="url" value={content.instagram} onChange={e=>setContent(c=>({...c,instagram:e.target.value}))}/></label><p className="editor-tip">The Instagram address is a placeholder until you create the account. Price changes update the storefront and checkout preview together.</p></>}
  </div>
  <div className="editor-save"><p role="status">{error||site.status||(site.dirty?'You have unsaved changes.':'All caught up.')}</p><div><button disabled={!site.dirty||site.saving||!!uploading} onClick={site.reset}>Undo changes</button><button className="editor-save-button" disabled={!site.dirty||site.saving||!!uploading} onClick={()=>{setError('');void site.save();}}>{site.saving?'Saving…':'Save changes'}</button></div></div>
 </aside>;
}
