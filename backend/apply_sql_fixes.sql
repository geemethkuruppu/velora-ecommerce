-- Fix for Order Service: Allow PENDING_INVENTORY status
ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_order_status;
ALTER TABLE orders ADD CONSTRAINT check_order_status CHECK (status IN ('PENDING', 'PENDING_INVENTORY', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'));

-- Fix for Inventory Service: Allow additional event types in inventory_events
ALTER TABLE inventory_events DROP CONSTRAINT IF EXISTS check_event_type;
ALTER TABLE inventory_events ADD CONSTRAINT check_event_type CHECK (event_type IN ('RESERVED', 'RELEASED', 'CONFIRMED', 'STOCK_ADDED', 'STOCK_REMOVED', 'STOCK_UPDATED'));

-- Fix for Inventory Service: Allow additional reservation statuses
ALTER TABLE inventory_reservations DROP CONSTRAINT IF EXISTS check_reservation_status;
ALTER TABLE inventory_reservations ADD CONSTRAINT check_reservation_status CHECK (status IN ('ACTIVE', 'RELEASED', 'CONFIRMED'));
