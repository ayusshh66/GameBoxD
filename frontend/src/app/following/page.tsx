import Link from "next/link";
import { FollowingPreview } from "@/components/discover/discover-client";
import "../discover/discover.css";

export default function FollowingPage() {
  return <main className="gd-discover" style={{minHeight:"100vh",paddingTop:55}}>
    <div style={{maxWidth:1450,margin:"auto",padding:"0 25px"}}><Link href="/discover" style={{color:"#FF5724"}}>← Back to Discover</Link></div>
    <FollowingPreview full/>
  </main>;
}
