-- Add a test review for the space with proper user relationship

-- First check what profiles exist
SELECT user_id, first_name, last_name FROM profiles LIMIT 5;

-- Insert a test review using a valid profile user_id
INSERT INTO reviews (space_id, user_id, booking_id, rating, comment)
VALUES (
  '42f0aa87-790c-4234-9931-90049f701649',
  'df39576f-df7b-4350-8a6b-3c74a7246ae7', -- Replace with actual user_id from profiles
  '00000000-0000-0000-0000-000000000000',
  5,
  'Amazing space! Perfect for our team meeting. Clean, modern, and well-equipped with all necessary amenities.'
);

-- Verify the review was added
SELECT r.*, p.first_name, p.last_name 
FROM reviews r
LEFT JOIN profiles p ON r.user_id = p.user_id
WHERE r.space_id = '42f0aa87-790c-4234-9931-90049f701649';
