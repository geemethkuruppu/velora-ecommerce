import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Womenswear from './pages/Womenswear';
import Menswear from './pages/Menswear';
import Kidswear from './pages/Kidswear';
import Login from './pages/Login';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import MyCart from './pages/MyCart';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import Footer from './components/Footer';
import Loading from './components/Loading';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/womenswear" element={<Womenswear />} />
            <Route path="/menswear" element={<Menswear />} />
            <Route path="/kidswear" element={<Kidswear />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/my-cart" element={<MyCart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
