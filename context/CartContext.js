import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Fungsi addToCart tetap sama
  const addToCart = (productToAdd) => {
    const existingProduct = cart.find((item) => item._id === productToAdd._id);
    if (existingProduct) {
      setCart(cart.map((item) =>
        item._id === productToAdd._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...productToAdd, quantity: 1 }]);
    }
  };

  // --- FUNGSI BARU UNTUK MENGURANGI ITEM ---
  const removeFromCart = (productToRemove) => {
    const existingProduct = cart.find((item) => item._id === productToRemove._id);
    if (existingProduct.quantity === 1) {
      // Jika sisa 1, hapus dari keranjang
      setCart(cart.filter((item) => item._id !== productToRemove._id));
    } else {
      // Jika lebih dari 1, kurangi kuantitasnya
      setCart(cart.map((item) =>
        item._id === productToRemove._id ? { ...item, quantity: item.quantity - 1 } : item
      ));
    }
  };
  
  // --- FUNGSI BARU UNTUK CEK KUANTITAS ---
  const getItemQuantity = (productId) => {
    const item = cart.find((item) => item._id === productId);
    return item ? item.quantity : 0;
  };

  // Kirim semua fungsi baru ini ke seluruh aplikasi
  const value = { cart, addToCart, removeFromCart, getItemQuantity };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
