import { useEffect, useState } from 'react';
import { getCheckoutConfig } from '@/lib/stripe';
export default function TestModeNotice() {
  const [test,setTest] = useState(false);
  useEffect(()=>{const controller=new AbortController();getCheckoutConfig(controller.signal).then(c=>setTest(c.mode==='test')).catch(()=>{});return()=>controller.abort();},[]);
  return test?<div className="test-mode-banner" role="status">Test store · No real payments. Nothing will be shipped.</div>:null;
}
