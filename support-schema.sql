-- Support System Database Schema
-- Add this to your existing schema.sql or run directly in Supabase SQL Editor

-- Create ENUM types for support system
CREATE TYPE public.support_category AS ENUM (
  'technical', 
  'billing', 
  'booking', 
  'space_issue', 
  'account', 
  'general'
);

CREATE TYPE public.support_priority AS ENUM (
  'low', 
  'medium', 
  'high', 
  'urgent'
);

CREATE TYPE public.support_status AS ENUM (
  'open', 
  'in_progress', 
  'waiting_user', 
  'resolved', 
  'closed'
);

-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number VARCHAR(20) NOT NULL UNIQUE, -- Human-readable ticket number like SUP-2025-0001
  user_id UUID NOT NULL,                     -- References users.id (not auth_id)
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category public.support_category NOT NULL DEFAULT 'general',
  priority public.support_priority NOT NULL DEFAULT 'medium',
  status public.support_status NOT NULL DEFAULT 'open',
  
  -- Admin handling
  assigned_admin_id UUID,                    -- References admins.id
  admin_response TEXT,                       -- Admin's response to the ticket
  internal_notes TEXT,                       -- Internal notes for admins
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,                   -- When ticket was resolved
  closed_at TIMESTAMPTZ,                     -- When ticket was closed
  
  -- Metadata
  user_agent TEXT,                           -- Browser/app info
  ip_address INET,                           -- User's IP for security
  attachments JSONB,                         -- Array of file references
  tags VARCHAR(50)[],                        -- Tags for categorization
  
  -- Constraints (updated to match your schema pattern)
  CONSTRAINT support_tickets_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT support_tickets_admin_fk FOREIGN KEY (assigned_admin_id) REFERENCES admins(id) ON DELETE SET NULL,
  CONSTRAINT support_tickets_resolved_check CHECK (
    (status IN ('resolved', 'closed') AND resolved_at IS NOT NULL) OR 
    (status NOT IN ('resolved', 'closed') AND resolved_at IS NULL)
  ),
  CONSTRAINT support_tickets_closed_check CHECK (
    (status = 'closed' AND closed_at IS NOT NULL) OR 
    (status != 'closed' AND closed_at IS NULL)
  )
);

-- Create support_ticket_messages table for conversation threading
CREATE TABLE public.support_ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL,
  sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'admin')),
  sender_id UUID NOT NULL,                   -- user_id or admin_id based on sender_type
  message TEXT NOT NULL,
  attachments JSONB,                         -- Array of file references
  is_internal BOOLEAN NOT NULL DEFAULT false, -- Internal admin notes
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT support_messages_ticket_fk FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

-- Create function to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  ticket_num TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  
  -- Get next number for current year
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(ticket_number FROM 'SUP-' || current_year || '-(\d+)') 
        AS INTEGER
      )
    ), 0
  ) + 1 
  INTO next_number
  FROM support_tickets 
  WHERE ticket_number ~ ('^SUP-' || current_year || '-\d+$');
  
  -- Format as SUP-YYYY-NNNN
  ticket_num := 'SUP-' || current_year || '-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number_trigger
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Create updated_at trigger for support_tickets
CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_timestamp();

-- Create updated_at trigger for support_ticket_messages
CREATE TRIGGER support_messages_updated_at
  BEFORE UPDATE ON support_ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_timestamp();

-- Create indexes for performance
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned_admin ON support_tickets(assigned_admin_id);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_ticket_number ON support_tickets(ticket_number);

CREATE INDEX idx_support_messages_ticket_id ON support_ticket_messages(ticket_id);
CREATE INDEX idx_support_messages_created_at ON support_ticket_messages(created_at DESC);

-- Create RLS (Row Level Security) policies - Optional, remove if you don't use RLS
-- ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tickets (uncomment if using RLS)
-- CREATE POLICY support_tickets_user_policy ON support_tickets
--   FOR ALL
--   USING (
--     user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
--   );

-- Users can only see messages from their own tickets (uncomment if using RLS)  
-- CREATE POLICY support_messages_user_policy ON support_ticket_messages
--   FOR ALL
--   USING (
--     EXISTS (
--       SELECT 1 FROM support_tickets 
--       WHERE id = ticket_id 
--       AND user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
--     )
--   );

-- Sample data for testing (optional - remove in production)
-- INSERT INTO support_tickets (user_id, subject, description, category, priority, status) 
-- VALUES (
--   (SELECT id FROM users LIMIT 1),
--   'Test Support Ticket',
--   'This is a test support ticket to verify the system works.',
--   'technical',
--   'medium',
--   'open'
-- );

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON support_tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON support_ticket_messages TO authenticated;

-- Grant usage on all sequences in the public schema (covers auto-generated sequences)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
