import React, { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const GUEST_CART_KEY = 'velora_guest_cart';

export const CartProvider = ({ children }) => {
    const { user, token, isAuthenticated } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [itemCount, setItemCount] = useState(0);

    // Load cart on mount or when authentication changes
    useEffect(() => {
        loadCart();
    }, [isAuthenticated, token]);

    /**
     * Load cart from backend (authenticated) or localStorage (guest)
     */
    const loadCart = async () => {
        console.log('[CartContext] loadCart called - isAuthenticated:', isAuthenticated, 'token:', !!token);
        if (isAuthenticated && token) {
            // Load from backend
            try {
                setLoading(true);
                console.log('[CartContext] Fetching cart from backend...');
                const cartData = await cartService.getCart(token);
                console.log('[CartContext] Cart data received:', cartData);
                setCart(cartData);
                setItemCount(cartData.total_items || 0);
            } catch (error) {
                console.error('[CartContext] Failed to load cart:', error);
            } finally {
                setLoading(false);
            }
        } else {
            // Load from localStorage
            console.log('[CartContext] Loading guest cart from localStorage');
            const guestCart = getGuestCart();
            console.log('[CartContext] Guest cart items:', guestCart);
            setCart({ items: guestCart, total_items: guestCart.length });
            setItemCount(guestCart.reduce((sum, item) => sum + item.quantity, 0));
        }
    };

    /**
     * Get guest cart from localStorage
     */
    const getGuestCart = () => {
        try {
            const stored = localStorage.getItem(GUEST_CART_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    };

    /**
     * Save guest cart to localStorage
     */
    const saveGuestCart = (items) => {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    };

    /**
     * Clear guest cart from localStorage
     */
    const clearGuestCart = () => {
        localStorage.removeItem(GUEST_CART_KEY);
    };

    /**
     * Add item to cart
     */
    const addToCart = async (productId, quantity = 1, variantId = null, productInfo = null) => {
        console.log('[CartContext] addToCart called - productId:', productId, 'isAuthenticated:', isAuthenticated);
        try {
            setLoading(true);

            if (isAuthenticated && token) {
                // Add to backend
                console.log('[CartContext] Adding to backend cart...');
                await cartService.addToCart(token, productId, quantity, variantId);
                console.log('[CartContext] Successfully added to backend, reloading cart...');
                await loadCart(); // Reload cart
            } else {
                // Add to localStorage
                console.log('[CartContext] Adding to guest cart (localStorage)');
                const guestCart = getGuestCart();
                const existingIndex = guestCart.findIndex(
                    item => item.product_id === productId && item.variant_id === variantId
                );

                if (existingIndex >= 0) {
                    guestCart[existingIndex].quantity += quantity;
                } else {
                    guestCart.push({
                        product_id: productId,
                        variant_id: variantId,
                        quantity,
                        product: productInfo // Store product info for display
                    });
                }

                saveGuestCart(guestCart);
                setCart({ items: guestCart, total_items: guestCart.length });
                setItemCount(guestCart.reduce((sum, item) => sum + item.quantity, 0));
                console.log('[CartContext] Guest cart updated, new count:', guestCart.length);
            }

            return true;
        } catch (error) {
            console.error('[CartContext] Failed to add to cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Remove item from cart
     */
    const removeFromCart = async (itemId) => {
        try {
            setLoading(true);

            if (isAuthenticated && token) {
                await cartService.removeFromCart(token, itemId);
                await loadCart();
            } else {
                const guestCart = getGuestCart();
                const filtered = guestCart.filter((_, index) => index !== itemId);
                saveGuestCart(filtered);
                setCart({ items: filtered, total_items: filtered.length });
                setItemCount(filtered.reduce((sum, item) => sum + item.quantity, 0));
            }
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Update item quantity
     */
    const updateQuantity = async (itemId, quantity) => {
        try {
            setLoading(true);

            if (isAuthenticated && token) {
                await cartService.updateCartItem(token, itemId, quantity);
                await loadCart();
            } else {
                const guestCart = getGuestCart();
                if (guestCart[itemId]) {
                    guestCart[itemId].quantity = quantity;
                    saveGuestCart(guestCart);
                    setCart({ items: guestCart, total_items: guestCart.length });
                    setItemCount(guestCart.reduce((sum, item) => sum + item.quantity, 0));
                }
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Clear entire cart
     */
    const clearCart = async () => {
        try {
            setLoading(true);

            if (isAuthenticated && token) {
                await cartService.clearCart(token);
                await loadCart();
            } else {
                clearGuestCart();
                setCart({ items: [], total_items: 0 });
                setItemCount(0);
            }
        } catch (error) {
            console.error('Failed to clear cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Merge guest cart with backend cart on login
     */
    const mergeCart = async () => {
        if (!isAuthenticated || !token) return;

        const guestCart = getGuestCart();
        if (guestCart.length === 0) return;

        try {
            setLoading(true);
            const guestItems = guestCart.map(item => ({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity
            }));

            await cartService.mergeGuestCart(token, guestItems);
            clearGuestCart();
            await loadCart();
        } catch (error) {
            console.error('Failed to merge cart:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate subtotal from cart
    const subtotal = cart?.subtotal || 0;

    const value = {
        cart,
        loading,
        itemCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        mergeCart,
        refreshCart: loadCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
