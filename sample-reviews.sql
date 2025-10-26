-- Sample reviews for space testing
-- Note: Make sure users and bookings exist before running this

-- First, let's create some sample bookings if they don't exist
-- (These will be used to create reviews since reviews require booking_id)

-- Insert sample reviews for the space
INSERT INTO reviews (user_id, space_id, booking_id, rating, comment, created_at) VALUES 
-- Review 1: Excellent rating
((SELECT id FROM users WHERE professional_role = 'violet' LIMIT 1), 
 '42f0aa87-790c-4234-9931-90049f701649',
 (SELECT id FROM bookings WHERE space_id = '42f0aa87-790c-4234-9931-90049f701649' AND status = 'confirmed' LIMIT 1),
 5,
 'Excellent workspace! Perfect for venture capital meetings and strategic planning. The ambiance is professional and the facilities are top-notch.',
 NOW() - INTERVAL '2 days'),

-- Review 2: Good rating
((SELECT id FROM users WHERE professional_role = 'indigo' LIMIT 1), 
 '42f0aa87-790c-4234-9931-90049f701649',
 (SELECT id FROM bookings WHERE space_id = '42f0aa87-790c-4234-9931-90049f701649' AND status = 'confirmed' OFFSET 1 LIMIT 1),
 4,
 'Great space for industrial consultations. Good internet connectivity and professional environment. Parking could be better during peak hours.',
 NOW() - INTERVAL '5 days'),

-- Review 3: Another excellent rating
((SELECT id FROM users WHERE professional_role = 'blue' LIMIT 1), 
 '42f0aa87-790c-4234-9931-90049f701649',
 (SELECT id FROM bookings WHERE space_id = '42f0aa87-790c-4234-9931-90049f701649' AND status = 'confirmed' OFFSET 2 LIMIT 1),
 5,
 'Perfect for creative brainstorming sessions. The space design is inspiring and the technical infrastructure is excellent for presentations.',
 NOW() - INTERVAL '1 week'),

-- Review 4: Good rating
((SELECT id FROM users WHERE professional_role = 'green' LIMIT 1), 
 '42f0aa87-790c-4234-9931-90049f701649',
 (SELECT id FROM bookings WHERE space_id = '42f0aa87-790c-4234-9931-90049f701649' AND status = 'confirmed' OFFSET 3 LIMIT 1),
 4,
 'Ideal for green technology discussions and sustainable business planning. Clean environment and good natural lighting.',
 NOW() - INTERVAL '10 days');

-- Check if reviews were inserted successfully
SELECT r.id, u.professional_role, r.rating, r.comment, r.created_at 
FROM reviews r 
JOIN users u ON r.user_id = u.id 
WHERE r.space_id = '42f0aa87-790c-4234-9931-90049f701649' 
ORDER BY r.created_at DESC;
