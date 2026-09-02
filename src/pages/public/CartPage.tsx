import { useEffect, useState } from "react";
import Header from "../../components/Header";
import AuthModal from "../../components/AuthModal";
import { getCart, placeOrder, removeCartItem, updateCartItem } from "../../api/userApi";
import { isUserSession } from "../../store/auth";

export default function CartPage() {
  const [data, setData] = useState<any>({ cart: { items: [] }, count: 0, total: 0 });
  const [method, setMethod] = useState("upi");
  const [msg, setMsg] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!isUserSession()) {
      setData({ cart: { items: [] }, count: 0, total: 0 });
      setLoading(false);
      return;
    }
    try {
      const response = await getCart();
      setData(response.data);
      window.dispatchEvent(new CustomEvent("cart:changed", { detail: { count: response.data.count || 0 } }));
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Could not load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeQuantity = async (id: string, quantity: number) => {
    await updateCartItem(id, quantity);
    await load();
  };

  const remove = async (id: string) => {
    await removeCartItem(id);
    await load();
  };

  const place = async () => {
    if (!isUserSession()) {
      setLoginOpen(true);
      return;
    }
    try {
      const response = await placeOrder(method);
      setMsg(response.data.message || "Order successfully placed");
      await load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Could not place order");
    }
  };

  return (
    <>
      <Header cartCount={data.count} onLogin={() => setLoginOpen(true)}/>
      <main className="twoCol cartPart4Page">
        <section className="panel">
          <h2>Your Cart</h2>
          {loading ? <p>Loading...</p> : data.cart.items.length === 0 ? <p>Cart is empty.</p> : data.cart.items.map((item: any) => (
            <article className="cartProductCard" key={item._id}>
              <img src={item.selectedImage?.url} alt={item.categoryName || "QR product"}/>
              <div className="cartProductInfo">
                <div className="cartProductTitle"><strong>{item.categoryName}</strong><b>₹{Number(item.unitPrice * item.quantity).toFixed(2)}</b></div>
                <div className="cartSpecs">
                  {(item.specificationValues || []).map((spec: any) => (
                    <div key={spec.key}><span>{spec.label}</span><strong>{String(spec.value || "-")}</strong></div>
                  ))}
                </div>
                <div className="cartItemActions">
                  <label>Qty
                    <select value={item.quantity} onChange={(e) => changeQuantity(item._id, Number(e.target.value))}>
                      {[1,2,3,4,5].map((q) => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </label>
                  <button type="button" className="deleteAction" onClick={() => remove(item._id)}>Remove</button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="panel cartSummaryPanel">
          <h2>Order Summary</h2>
          <div className="summary"><span>Items</span><b>{data.count}</b><span>Total</span><b>₹{Number(data.total || 0).toFixed(2)}</b></div>
          <h3>Payment Method</h3>
          <label><input type="radio" checked={method === "upi"} onChange={() => setMethod("upi")}/> UPI</label>
          <label><input type="radio" checked={method === "debit_card"} onChange={() => setMethod("debit_card")}/> Debit Card</label>
          <label><input type="radio" checked={method === "credit_card"} onChange={() => setMethod("credit_card")}/> Credit Card</label>
          <button className="primary full" type="button" onClick={place} disabled={data.cart.items.length === 0}>Place Order</button>
          {msg && <p className="success">{msg}</p>}
        </aside>
      </main>
      <AuthModal open={loginOpen} onClose={() => setLoginOpen(false)} onLoggedIn={() => { setLoginOpen(false); load(); }}/>
    </>
  );
}
