import { CartProvider } from './CartContext';

export default function AppWrapper({ children }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
