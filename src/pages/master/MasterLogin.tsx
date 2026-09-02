import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginMaster } from "../../api/masterApi";
import { saveSession } from "../../store/auth";

export default function MasterLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const { data } = await loginMaster(email, password);
      saveSession(data.token, "master");
      navigate("/master/dashboard");
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Master login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="loginPage masterLoginPage">
      <form className="panel" onSubmit={submit}>
        <div className="masterLoginBrand">
          <span className="logo">M</span>
          <div>
            <h1>Master Login</h1>
            <p>HomeQR Master Panel</p>
          </div>
        </div>

        <input
          type="email"
          placeholder="Master email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {msg && <p className="formMessage">{msg}</p>}
      </form>
    </main>
  );
}
