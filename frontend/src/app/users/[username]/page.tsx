import Link from "next/link";
import {backendGet} from "@/lib/discover-data";

type Profile={username:string;displayName?:string|null;bio?:string|null;avatarUrl?:string|null;stats?:{followersCount:number;followingCount:number;reviewsCount:number}};
export default async function ProfilePage({params}:{params:Promise<{username:string}>}){
 const {username}=await params;let user:Profile|null=null;
 try{user=await backendGet<Profile>(`/api/users/${encodeURIComponent(username)}`)}catch{}
 return <main style={{background:"#011717",color:"#F0F7F6",minHeight:"100vh",padding:"5vw"}}><Link href="/discover" style={{color:"#FF5724"}}>← Discover</Link>{user?<div style={{marginTop:35}}><h1 style={{fontSize:40}}>{user.displayName||user.username}</h1><p style={{color:"#87B683"}}>@{user.username}</p><p style={{marginTop:20}}>{user.bio||"No bio yet."}</p><p style={{marginTop:22,color:"#8EA4A4"}}>Followers: {user.stats?.followersCount??0} · Following: {user.stats?.followingCount??0}</p></div>:<p style={{marginTop:30}}>Profile unavailable.</p>}</main>;
}
