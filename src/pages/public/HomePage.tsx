import { useState } from "react";
import Header from "../../components/Header";
import AuthModal from "../../components/AuthModal";

export default function HomePage() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <Header onLogin={() => setLoginOpen(true)}/>
      <main>
        <section className="hero">
          <div>
            <span className="eyebrow">QR RECOVERY PRODUCTS</span>
            <h1>Choose a category, select a QR product and add your details.</h1>
            <p>
              Categories, product images, prices and specification fields are managed from the Master panel and shown dynamically on the user side.
            </p>
          </div>
          <div className="heroCard">
            <div className="fakeQr">▦</div>
            <strong>HOME QR RECOVERY</strong>
            <small>Select a category from the bar above</small>
          </div>
        </section>

        <section className="how">
          <div><b>1</b><h3>Select Category</h3><p>Open HOME, VEHICLE, PET or any active Master category.</p></div>
          <div><b>2</b><h3>Select Product Image</h3><p>See the Master-uploaded QR image, price and dynamic specification form.</p></div>
          <div><b>3</b><h3>Add to Cart</h3><p>Save to MongoDB, update the header badge instantly and place a pending order.</p></div>
        </section>
      </main>
      <AuthModal open={loginOpen} onClose={() => setLoginOpen(false)} onLoggedIn={() => setLoginOpen(false)}/>
    </>
  );
}
