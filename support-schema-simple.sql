-- Essential Support System Schema for Clubicles
-- Run this in your Supabase SQL Editor

-- Create ENUM types for support system (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_category') THEN
        CREATE TYPE public.support_category AS ENUM (
          'technical', 
          'billing', 
          'booking', 
          'space_issue', 
          'account', 
          'general'
        );
    END IF;
END
$$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_priority') THEN
        CREATE TYPE public.support_priority AS ENUM (
          'low', 
          'medium', 
          'high', 
          'urgent'
        );
    END IF;
END
$$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_status') THEN
        CREATE TYPE public.support_status AS ENUM (
          'open', 
          'in_progress', 
          'waiting_user', 
          'resolved', 
          'closed'
        );
    END IF;
END
$$;

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number VARCHAR(20) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category public.support_category NOT NULL DEFAULT 'general',
  priority public.support_priority NOT NULL DEFAULT 'medium',
  status public.support_status NOT NULL DEFAULT 'open',
  assigned_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  admin_response TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  user_agent TEXT,
  ip_address INET,
  attachments JSONB,
  tags VARCHAR(50)[]
);

-- Create support_ticket_messages table
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'admin')),
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  attachments JSONB,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to generate ticket numbers
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

-- Trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS set_ticket_number_trigger ON support_tickets;
CREATE TRIGGER set_ticket_number_trigger
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Updated timestamp triggers
CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Auto-set resolved_at when status changes to resolved/closed
  IF NEW.status IN ('resolved', 'closed') AND OLD.status NOT IN ('resolved', 'closed') THEN
    NEW.resolved_at = now();
  END IF;
  
  -- Auto-set closed_at when status changes to closed
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.closed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate triggers
DROP TRIGGER IF EXISTS support_tickets_updated_at ON support_tickets;
CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_timestamp();

DROP TRIGGER IF EXISTS support_messages_updated_at ON support_ticket_messages;
CREATE TRIGGER support_messages_updated_at
  BEFORE UPDATE ON support_ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_timestamp();

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_ticket_messages(created_at DESC);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON support_tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON support_ticket_messages TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert a test ticket to verify everything works (optional)
-- Uncomment these lines after running the schema to test
/*
INSERT INTO support_tickets (user_id, subject, description, category, priority) 
SELECT 
  users.id,
  'Test Support System',
  'This is a test ticket to verify the support system is working correctly.',
  'technical',
  'medium'
FROM users 
LIMIT 1;
*/

-- Success message
SELECT 'Support system schema created successfully! ✅' as result;
