import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSite } from '@/lib/storefront';
export default function MediaStudio(){const site=useSite(),navigate=useNavigate();useEffect(()=>{if(site.canEdit){site.setEditing(true);navigate('/',{replace:true});}},[site.canEdit,navigate]);return <main className="editor-signin"><h1>Edit your site.</h1><p>{site.status||(!site.loaded?'Opening your editor…':'Sign in to the workspace to make changes.')}</p>{site.loaded&&!site.canEdit&&<a className="button" href="/admin">Sign in to edit</a>}<Link to="/">Back to the site</Link></main>;}
