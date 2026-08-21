import { Home, ShoppingCart, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { isUserSession } from "../store/auth";

type Props = { cartCount: number; onLogin: () => void };

export default function Header({ cartCount, onLogin }: Props) {
  const nav = useNavigate();
  const affiliateUrl = import.meta.env.VITE_AFFILIATE_WEB_URL || "";

  const openAffiliate = () => {
    if (affiliateUrl) {
      window.location.href = affiliateUrl;
      return;
    }
    nav(isUserSession() ? "/affiliate/dashboard" : "/affiliate/login");
  };

  return (
    <>
      <header className="top">
        <Link className="brand" to="/"><span className="logo">H</span><span>HomeQR</span></Link>
        <div className="search">Search Home QR products</div>
        <div className="headActions">
          <button onClick={() => isUserSession() ? nav("/") : onLogin()}>
            <UserRound size={18}/> {isUserSession() ? "Account" : "Login"}
          </button>
          <button onClick={openAffiliate}>Affiliate</button>
          <button className="cartBtn" onClick={() => nav("/cart")}>
            <ShoppingCart size={20}/><span>{cartCount}</span>
          </button>
        </div>
      </header>
      <nav className="categoryBar"><button onClick={() => nav("/")}><Home size={17}/> Home</button></nav>
    </>
  );
}
