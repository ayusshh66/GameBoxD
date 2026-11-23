"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { socialRequest, isUnauthenticated } from "@/lib/social-client";
import "./social.css";
type Profile = {id:string; username:string; displayName:string | null; bio:string | null; avatarUrl:string | null};
export default function ProfileSettings() {
  const [user, setUser] = useState<Profile | null>(null);
  const [displayName,setDisplayName] = useState("");
  const [bio,setBio] = useState("");
  const [avatarUrl,setAvatarUrl] = useState("");
  const [error,setError] = useState("");
  const [success,setSuccess] = useState("");
  const [guest,setGuest] = useState(false);
  const [loading,setLoading] = useState(false);
  useEffect(() => { socialRequest<Profile>("/api/users/me").then(data => {setUser(data);setDisplayName(data.displayName??"");setBio(data.bio??"");setAvatarUrl(data.avatarUrl??"");}).catch(e => {setGuest(isUnauthenticated(e));setError(e instanceof Error ? e.message : "Could not load profile");}); }, []);
  async function save(e: FormEvent) {
    e.preventDefault();setError("");setSuccess("");setLoading(true);
    try {
      const result = await socialRequest<Profile>("/api/users/me",{method:"PATCH",body:{displayName:displayName.trim()||null,bio:bio.trim()||null,avatarUrl:avatarUrl.trim()||null}});
      setUser(result);setSuccess("Profile updated");
    } catch(e){setError(e instanceof Error ? e.message : "Could not update profile");}
    finally {setLoading(false);}
  }
  return <main className="gbs-social"><div className="gbs-social-inner" style={{maxWidth:760}}><p className="gbs-social-eyebrow">Your account</p><h1>Profile Settings</h1><p className="gbs-social-intro">Edit the public profile information shown to other gamers. Email and login credentials aren't editable here.</p>
    {guest ? <div className="gbs-social-panel">Please <Link style={{color:"#fc521e"}} href="/login">log in</Link>.</div> : <>
      {error && <p className="gbs-social-error" role="alert">{error}</p>}{success && <p role="status" style={{color:"#87b683"}}>{success}</p>}
      {!user && !error && <p>Loading profile…</p>}
      {user && <form className="gbs-social-panel" onSubmit={save}>
        <p className="gbs-social-muted">@{user.username} · <Link href={`/users/${encodeURIComponent(user.username)}`} style={{color:"#fc521e"}}>View public profile</Link></p>
        <label className="gbs-social-field" htmlFor="gbd-display-name">Display name</label><input id="gbd-display-name" className="gbs-social-input" value={displayName} maxLength={100} onChange={e=>setDisplayName(e.target.value)}/>
        <label className="gbs-social-field" htmlFor="gbd-bio">Bio</label><textarea id="gbd-bio" className="gbs-social-input gbs-social-textarea" value={bio} maxLength={500} onChange={e=>setBio(e.target.value)}/>
        <label className="gbs-social-field" htmlFor="gbd-avatar">Avatar URL</label><input id="gbd-avatar" className="gbs-social-input" type="url" value={avatarUrl} onChange={e=>setAvatarUrl(e.target.value)} placeholder="https://…"/>
        <p className="gbs-social-muted" style={{fontSize:12}}>Use a public HTTPS image URL for your avatar.</p>
        <button type="submit" className="gbs-social-button gbs-social-button-primary" disabled={loading}>{loading?"Saving…":"Save changes"}</button>
      </form>}
    </>}
  </div></main>;
}
