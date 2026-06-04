-- TrustDelivery Seed Data (Fixed)
-- Run this after the initial schema to populate with sample data

-- Insert Sample Merchants
INSERT INTO merchants (id, business_name, owner_name, email, phone_number, address, status, total_deliveries, total_revenue, active_deliveries) VALUES
(uuid_generate_v4(), 'Arthur Electronics', 'Arthur Mbah', 'arthur@electronics.cm', '+237 699 123 456', 'Bastos, Yaoundé', 'active', 245, 450000, 12),
(uuid_generate_v4(), 'Bastos Fashion', 'Marie Atangana', 'marie@fashion.cm', '+237 677 234 567', 'Bastos Centre, Yaoundé', 'active', 189, 320000, 8),
(uuid_generate_v4(), 'Mvog-Mbi Market', 'Jean Nkongo', 'jean@market.cm', '+237 655 345 678', 'Mvog-Mbi, Yaoundé', 'active', 312, 580000, 15),
(uuid_generate_v4(), 'Centreville Pharmacy', 'Paul Essama', 'paul@pharmacy.cm', '+237 688 456 789', 'Centre-ville, Yaoundé', 'active', 156, 290000, 6),
(uuid_generate_v4(), 'Mvan Food Store', 'Grace Fouda', 'grace@food.cm', '+237 644 567 890', 'Mvan, Yaoundé', 'active', 278, 420000, 9),
(uuid_generate_v4(), 'Nlongkak Supermarket', 'Thomas Nguema', 'thomas@super.cm', '+237 622 678 901', 'Nlongkak, Yaoundé', 'active', 198, 380000, 5),
(uuid_generate_v4(), 'Oyomabang Auto Parts', 'Serge Ondo', 'serge@auto.cm', '+237 611 789 012', 'Oyomabang, Yaoundé', 'suspended', 89, 145000, 0),
(uuid_generate_v4(), 'Mendza Electronics', 'Claire Ngono', 'claire@electro.cm', '+237 699 890 123', 'Nkomkana, Yaoundé', 'active', 145, 265000, 7);

-- Insert Sample Riders
INSERT INTO riders (id, full_name, phone_number, national_id, address, motorbike_registration, status, total_deliveries, completed_deliveries, failed_deliveries, performance_score, total_revenue) VALUES
(uuid_generate_v4(), 'Jean-Baptiste Mba', '+237 699 111 222', 'ID123456789', 'Mvog-Mbi, Yaoundé', 'YV 1234 AB', 'active', 456, 425, 12, 93.20, 850000),
(uuid_generate_v4(), 'Pierre Nkongo', '+237 677 222 333', 'ID234567890', 'Bastos, Yaoundé', 'YV 2345 BC', 'active', 389, 365, 8, 93.83, 725000),
(uuid_generate_v4(), 'Marie Atangana', '+237 655 333 444', 'ID345678901', 'Centre-ville, Yaoundé', 'YV 3456 CD', 'active', 298, 275, 5, 92.28, 580000),
(uuid_generate_v4(), 'Paul Essama', '+237 688 444 555', 'ID456789012', 'Mvan, Yaoundé', 'YV 4567 DE', 'busy', 234, 215, 7, 91.88, 430000),
(uuid_generate_v4(), 'Grace Fouda', '+237 644 555 666', 'ID567890123', 'Nlongkak, Yaoundé', 'YV 5678 EF', 'active', 312, 295, 10, 94.55, 620000),
(uuid_generate_v4(), 'Thomas Nguema', '+237 622 666 777', 'ID678901234', 'Mendza, Yaoundé', 'YV 6789 FG', 'offline', 178, 165, 6, 92.70, 340000),
(uuid_generate_v4(), 'Serge Ondo', '+237 611 777 888', 'ID789012345', 'Oyomabang, Yaoundé', 'YV 7890 GH', 'active', 267, 248, 11, 92.88, 490000),
(uuid_generate_v4(), 'Claire Ngono', '+237 699 888 999', 'ID890123456', 'Nkomkana, Yaoundé', 'YV 8901 HI', 'suspended', 45, 38, 4, 84.44, 75000);

-- Insert Sample Deliveries
INSERT INTO deliveries (id, product_description, product_value, delivery_cost, distance_km, customer_name, customer_phone, delivery_address, merchant_id, assigned_rider_id, status, otp_code, created_at, paid_at, assigned_at) VALUES
(uuid_generate_v4(), 'Samsung Galaxy A54 Smartphone', 180000, 1500, 4.5, 'Martin Tsanga', '+237 699 000 111', 'Quartier Grec, Bastos', (SELECT id FROM merchants LIMIT 1), NULL, 'awaiting_assignment', '123456', NOW(), NOW(), NULL),
(uuid_generate_v4(), 'Women''s Fashion Dress Collection', 45000, 1000, 2.8, 'Sylvie Mengue', '+237 677 000 222', 'Mvolyé, Yaoundé', (SELECT id FROM merchants LIMIT 1 OFFSET 1), NULL, 'awaiting_assignment', '234567', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes', NULL),
(uuid_generate_v4(), 'Fresh Vegetables Basket', 15000, 1000, 3.2, 'Chantal Ngo', '+237 655 000 333', 'Ekoumdoum, Yaoundé', (SELECT id FROM merchants LIMIT 1 OFFSET 2), (SELECT id FROM riders LIMIT 1), 'assigned', '345678', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '45 minutes'),
(uuid_generate_v4(), 'Pharmacy Medications', 25000, 1500, 4.0, 'Robert Onana', '+237 688 000 444', 'Etoudi, Yaoundé', (SELECT id FROM merchants LIMIT 1 OFFSET 3), (SELECT id FROM riders LIMIT 1 OFFSET 1), 'in_transit', '456789', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1.5 hours'),
(uuid_generate_v4(), 'Laptop Computer Bag', 35000, 2000, 6.5, 'Fabrice Mbah', '+237 644 000 555', 'Obili, Yaoundé', (SELECT id FROM merchants LIMIT 1 OFFSET 4), (SELECT id FROM riders LIMIT 1 OFFSET 2), 'delivered', '567890', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours'),
(uuid_generate_v4(), 'ACER Laptop', 350000, 2500, 8.2, 'Junior Nguema', '+237 622 000 666', 'Messa, Yaoundé', (SELECT id FROM merchants LIMIT 1 OFFSET 5), NULL, 'awaiting_assignment', '678901', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes', NULL),
(uuid_generate_v4(), 'Groceries Pack', 28000, 1000, 2.5, 'Evelyne Atangana', '+237 611 000 777', 'Ngoa-Ekellé, Yaoundé', (SELECT id FROM merchants LIMIT 1 OFFSET 6), (SELECT id FROM riders LIMIT 1 OFFSET 3), 'failed', '789012', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2.5 hours'),
(uuid_generate_v4(), 'Bluetooth Speakers', 45000, 1500, 3.8, 'David Fofe', '+237 699 000 888', 'Mvan, Yaoundé', (SELECT id FROM merchants LIMIT 1 OFFSET 7), (SELECT id FROM riders LIMIT 1 OFFSET 4), 'delivered', '890123', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours');

-- Insert payments after deliveries exist
DO $$
DECLARE
    d_id UUID;
    m_id UUID;
BEGIN
    -- Payment 1
    SELECT id INTO d_id FROM deliveries LIMIT 1 OFFSET 4;
    SELECT id INTO m_id FROM merchants LIMIT 1;
    IF d_id IS NOT NULL AND m_id IS NOT NULL THEN
        INSERT INTO payments (transaction_id, delivery_id, merchant_id, amount, payment_method, status, created_at)
        VALUES ('TXN-' || substr(md5(random()::text), 1, 12), d_id, m_id, 2000, 'orange_money', 'completed', NOW());
    END IF;

    -- Payment 2
    SELECT id INTO d_id FROM deliveries LIMIT 1 OFFSET 5;
    SELECT id INTO m_id FROM merchants LIMIT 1 OFFSET 1;
    IF d_id IS NOT NULL AND m_id IS NOT NULL THEN
        INSERT INTO payments (transaction_id, delivery_id, merchant_id, amount, payment_method, status, created_at)
        VALUES ('TXN-' || substr(md5(random()::text), 1, 12), d_id, m_id, 1500, 'mtn_mobile_money', 'completed', NOW());
    END IF;

    -- Payment 3
    SELECT id INTO d_id FROM deliveries LIMIT 1 OFFSET 6;
    SELECT id INTO m_id FROM merchants LIMIT 1 OFFSET 2;
    IF d_id IS NOT NULL AND m_id IS NOT NULL THEN
        INSERT INTO payments (transaction_id, delivery_id, merchant_id, amount, payment_method, status, created_at)
        VALUES ('TXN-' || substr(md5(random()::text), 1, 12), d_id, m_id, 2500, 'orange_money', 'pending', NOW());
    END IF;

    -- Payment 4
    SELECT id INTO d_id FROM deliveries LIMIT 1 OFFSET 7;
    SELECT id INTO m_id FROM merchants LIMIT 1 OFFSET 3;
    IF d_id IS NOT NULL AND m_id IS NOT NULL THEN
        INSERT INTO payments (transaction_id, delivery_id, merchant_id, amount, payment_method, status, created_at)
        VALUES ('TXN-' || substr(md5(random()::text), 1, 12), d_id, m_id, 1000, 'bank_transfer', 'completed', NOW());
    END IF;
END $$;

-- Insert Sample Rider Expenses
INSERT INTO rider_expenses (rider_id, category, amount, description, status, created_at) VALUES
((SELECT id FROM riders LIMIT 1), 'fuel', 15000, 'Fuel refill for the week', 'approved', NOW() - INTERVAL '2 days'),
((SELECT id FROM riders LIMIT 1), 'maintenance', 25000, 'Tire replacement', 'approved', NOW() - INTERVAL '5 days'),
((SELECT id FROM riders LIMIT 1 OFFSET 1), 'fuel', 12000, 'Fuel expense', 'pending', NOW() - INTERVAL '1 day'),
((SELECT id FROM riders LIMIT 1 OFFSET 2), 'parking', 2000, 'Parking fee at central market', 'approved', NOW() - INTERVAL '3 days'),
((SELECT id FROM riders LIMIT 1 OFFSET 3), 'other', 5000, 'Rain gear purchase', 'pending', NOW());

-- Insert Sample Notifications
INSERT INTO notifications (notification_type, title, message, reference_id, is_read, created_at) VALUES
('new_paid_delivery', 'New Paid Delivery', 'A new delivery has been paid and is awaiting assignment.', (SELECT id FROM deliveries LIMIT 1), false, NOW() - INTERVAL '10 minutes'),
('failed_delivery', 'Delivery Failed', 'Delivery #89 failed: Customer was unavailable.', (SELECT id FROM deliveries LIMIT 1 OFFSET 6), false, NOW() - INTERVAL '1 hour'),
('expense_submission', 'Expense Submitted', 'Jean-Baptiste Mba submitted a fuel expense of 15,000 FCFA.', (SELECT id FROM rider_expenses LIMIT 1), true, NOW() - INTERVAL '2 hours'),
('new_merchant_registration', 'New Merchant', 'A new merchant "Bastos Fashion" has registered.', NULL, true, NOW() - INTERVAL '1 day'),
('delivery_assigned', 'Delivery Assigned', 'Delivery #123 has been assigned to Pierre Nkongo.', (SELECT id FROM deliveries LIMIT 1 OFFSET 2), true, NOW() - INTERVAL '3 hours');