import copyFields from './copy.json';
export { copyFields };
export interface Photo { src: string; alt: string; caption: string; position: number }
export interface Media { logo?: string; hero: string; heroAlt: string; heroPosition: number; product: string; productAlt: string; productPosition: number; poster: string; photos: Photo[]; video: string }
export interface SiteContent { copy: Record<string,string>; media: Media; price: number; contactEmail: string; instagram: string; sections: string[]; hiddenSections: string[] }
export const sectionNames: Record<string,string> = { photos: 'Photo carousel', product: 'The sling', video: 'How to sling', closing: 'Closing message' };
export const defaults: SiteContent = {
 copy: Object.fromEntries(Object.entries(copyFields).map(([key,field])=>[key,field.defaultValue])),
 price:30, contactEmail:'contact@david-slings.com', instagram:'https://www.instagram.com/davidslingsclub/',
 sections:Object.keys(sectionNames),hiddenSections:[],
 media:{logo:'/images/david-slings-logo.png',hero:'/images/sling-long-cords.png',heroAlt:'Generated image of a split leather pouch sling with olive cords and a leather finger loop',heroPosition:50,product:'/images/sling-long-cords.png',productAlt:'Generated product image of The David Sling with a split leather pouch',productPosition:50,poster:'/images/river-stones.jpg',video:'',photos:[
 {src:'/images/river-stones.jpg',alt:'Smooth stones beside a sunny creek',caption:'A good place to spend an afternoon.',position:50},
 {src:'/images/sling-long-cords.png',alt:'Generated split-pouch leather and paracord sling',caption:'A little leather. A little paracord.',position:50},
 {src:'/images/grassy-field.jpg',alt:'Open grassy hills in the afternoon light',caption:'See you out there.',position:50}]
 }
};
export function videoEmbed(value:string):string|null {
 try {const url=new URL(value); if(url.protocol!=='https:')return null;
 const id=['youtube.com','www.youtube.com','m.youtube.com'].includes(url.hostname)?url.searchParams.get('v')||url.pathname.match(/^\/(?:shorts|embed)\/([\w-]{11})$/)?.[1]:url.hostname==='youtu.be'?url.pathname.slice(1):null;
 return id&&/^[\w-]{11}$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}`:null;
 }catch{return null;}
}
export function validImage(value:unknown):value is string {return typeof value==='string'&&/^\/(?:images|media)\/[a-zA-Z0-9_-]+\.(?:png|jpg|jpeg|webp)$/.test(value);}
function text(value:unknown,max=2000):value is string{return typeof value==='string'&&value.length<=max;}
function position(value:unknown){return typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=100;}
export function validContent(value:unknown):value is SiteContent {
 if(!value||typeof value!=='object')return false;const c=value as SiteContent;const m=c.media;
 return !!c.copy&&typeof c.copy==='object'&&!Array.isArray(c.copy)&&Object.keys(c.copy).every(k=>Object.prototype.hasOwnProperty.call(copyFields,k)&&text(c.copy[k]))
 && Object.keys(copyFields).every(k=>text(c.copy[k]))
 &&typeof c.price==='number'&&Number.isFinite(c.price)&&c.price>=1&&c.price<=1000&&Math.abs(c.price*100-Math.round(c.price*100))<0.00001
 &&text(c.contactEmail,254)&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(c.contactEmail)
 &&text(c.instagram,300)&&/^https:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/.test(c.instagram)
 &&Array.isArray(c.sections)&&c.sections.length===4&&new Set(c.sections).size===4&&c.sections.every(k=>Object.keys(sectionNames).includes(k))
 &&Array.isArray(c.hiddenSections)&&c.hiddenSections.every(k=>Object.keys(sectionNames).includes(k))
 &&!!m&&(m.logo===undefined||validImage(m.logo))&&validImage(m.hero)&&text(m.heroAlt,300)&&position(m.heroPosition)&&validImage(m.product)&&text(m.productAlt,300)&&position(m.productPosition)&&validImage(m.poster)
 &&text(m.video,500)&&(!m.video||!!videoEmbed(m.video))&&Array.isArray(m.photos)&&m.photos.length>0&&m.photos.length<=12
 &&m.photos.every(p=>!!p&&validImage(p.src)&&text(p.alt,300)&&text(p.caption,500)&&position(p.position));
}
export function mergeContent(value:Partial<SiteContent>):SiteContent {
 const media={...defaults.media,...value.media};
 // Upgrade earlier generated images; photos the owner uploads stay as saved.
 const earlierImages=new Set(['/images/sling-illustration.png','/images/sling-split-pouch-hero.png','/images/sling-split-pouch-product.png']);
 if(earlierImages.has(media.hero)){media.hero=defaults.media.hero;media.heroAlt=defaults.media.heroAlt;media.heroPosition=50;}
 if(earlierImages.has(media.product)){media.product=defaults.media.product;media.productAlt=defaults.media.productAlt;media.productPosition=50;}
 media.photos=media.photos.map(photo=>earlierImages.has(photo.src)?{...photo,src:defaults.media.product,alt:'Generated split-pouch leather and paracord sling',position:50}:photo);
 return {...defaults,...value,copy:{...defaults.copy,...value.copy},media};
}
