import { useState } from "react";
import { loginUser, registerUser } from "../api/authApi";
import { saveSession } from "../store/auth";

type Props = { open: boolean; onClose: () => void; onLoggedIn: () => void };
export default function AuthModal({ open, onClose, onLoggedIn }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", country: "India", pincode: "", email: "", phone: "", password: "" });
  const [msg, setMsg] = useState("");
  if (!open) return null;
  const change = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg("");
    try {
      if (mode === "register") {
        await registerUser(form); setMode("login"); setMsg("Registered. Please login."); return;
      }
      const { data } = await loginUser(form.email, form.password);
      saveSession(data.token, "user"); onLoggedIn(); onClose();
    } catch (err: any) { setMsg(err?.response?.data?.message || "Something went wrong"); }
  };
  return <div className="modalBack"><div className="modalCard"><button className="close" onClick={onClose}>×</button><h2>{mode === "login" ? "Login" : "Create account"}</h2><form onSubmit={submit}>
    {mode === "register" && <><input placeholder="Name" value={form.name} onChange={(e)=>change("name",e.target.value)} required/><input placeholder="Country" value={form.country} onChange={(e)=>change("country",e.target.value)} required/><input placeholder="Pincode" value={form.pincode} onChange={(e)=>change("pincode",e.target.value)} required/><input placeholder="Phone" value={form.phone} onChange={(e)=>change("phone",e.target.value)}/></>}
    <input type="email" placeholder="Email" value={form.email} onChange={(e)=>change("email",e.target.value)} required/><input type="password" placeholder="Password" value={form.password} onChange={(e)=>change("password",e.target.value)} required/><button className="primary" type="submit">{mode === "login" ? "Login" : "Register"}</button>
  </form>{msg && <p>{msg}</p>}<button className="linkBtn" onClick={()=>setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "No account? Register" : "Already have account? Login"}</button></div></div>;
}
