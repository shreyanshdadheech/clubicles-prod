-- Create subscription tables for space owners

-- Space Owner Subscriptions Table
CREATE TABLE IF NOT EXISTS space_owner_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    space_owner_id UUID NOT NULL REFERENCES space_owners(id) ON DELETE CASCADE,
    plan_name VARCHAR(50) NOT NULL CHECK (plan_name IN ('Basic', 'Premium')),
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one active subscription per space owner
    CONSTRAINT unique_active_subscription 
    UNIQUE (space_owner_id) DEFERRABLE INITIALLY DEFERRED
);

-- Space Owner Payment History Table
CREATE TABLE IF NOT EXISTS space_owner_payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    space_owner_id UUID NOT NULL REFERENCES space_owners(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES space_owner_subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'razorpay',
    transaction_id VARCHAR(255) NOT NULL,
    razorpay_order_id VARCHAR(255),
    razorpay_signature VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique transaction IDs
    CONSTRAINT unique_transaction_id UNIQUE (transaction_id)
);

-- Update Space Owners table to include subscription info
ALTER TABLE space_owners 
ADD COLUMN IF NOT EXISTS current_plan VARCHAR(20) DEFAULT 'basic' CHECK (current_plan IN ('basic', 'premium')),
ADD COLUMN IF NOT EXISTS plan_expiry_date TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_space_owner_subscriptions_owner_id ON space_owner_subscriptions(space_owner_id);
CREATE INDEX IF NOT EXISTS idx_space_owner_subscriptions_status ON space_owner_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_space_owner_subscriptions_expiry ON space_owner_subscriptions(expiry_date);

CREATE INDEX IF NOT EXISTS idx_space_owner_payment_history_owner_id ON space_owner_payment_history(space_owner_id);
CREATE INDEX IF NOT EXISTS idx_space_owner_payment_history_date ON space_owner_payment_history(payment_date);
CREATE INDEX IF NOT EXISTS idx_space_owner_payment_history_status ON space_owner_payment_history(status);

-- Create a function to automatically expire subscriptions
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
    UPDATE space_owner_subscriptions 
    SET status = 'expired', updated_at = NOW()
    WHERE expiry_date < NOW() AND status = 'active';
    
    -- Update space_owners table to reflect expired plans
    UPDATE space_owners 
    SET current_plan = 'basic', updated_at = NOW()
    WHERE plan_expiry_date < NOW() AND current_plan = 'premium';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_space_owner_subscriptions_updated_at
    BEFORE UPDATE ON space_owner_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (adjust based on your RLS policies)
ALTER TABLE space_owner_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_owner_payment_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for space_owner_subscriptions
CREATE POLICY "Space owners can view their own subscriptions" ON space_owner_subscriptions
    FOR SELECT USING (
        space_owner_id IN (
            SELECT id FROM space_owners WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Space owners can insert their own subscriptions" ON space_owner_subscriptions
    FOR INSERT WITH CHECK (
        space_owner_id IN (
            SELECT id FROM space_owners WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Space owners can update their own subscriptions" ON space_owner_subscriptions
    FOR UPDATE USING (
        space_owner_id IN (
            SELECT id FROM space_owners WHERE auth_id = auth.uid()
        )
    );

-- Create RLS policies for space_owner_payment_history
CREATE POLICY "Space owners can view their own payment history" ON space_owner_payment_history
    FOR SELECT USING (
        space_owner_id IN (
            SELECT id FROM space_owners WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Space owners can insert their own payment records" ON space_owner_payment_history
    FOR INSERT WITH CHECK (
        space_owner_id IN (
            SELECT id FROM space_owners WHERE auth_id = auth.uid()
        )
    );

-- Admin access policies (adjust admin emails as needed)
CREATE POLICY "Admins can manage all subscriptions" ON space_owner_subscriptions
    FOR ALL USING (
        auth.jwt() ->> 'email' IN ('shreyanshdadheech@gmail.com', 'admin@clubicles.com', 'yogesh.dubey.0804@gmail.com')
    );

CREATE POLICY "Admins can manage all payment history" ON space_owner_payment_history
    FOR ALL USING (
        auth.jwt() ->> 'email' IN ('shreyanshdadheech@gmail.com', 'admin@clubicles.com', 'yogesh.dubey.0804@gmail.com')
    );

-- Insert some sample data for testing (optional)
-- This would typically be done by the application
INSERT INTO space_owner_subscriptions (space_owner_id, plan_name, billing_cycle, status, start_date, expiry_date)
SELECT 
    id,
    'Basic',
    'monthly',
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
FROM space_owners 
WHERE NOT EXISTS (
    SELECT 1 FROM space_owner_subscriptions 
    WHERE space_owner_subscriptions.space_owner_id = space_owners.id
)
LIMIT 5;

COMMENT ON TABLE space_owner_subscriptions IS 'Stores subscription plans for space owners';
COMMENT ON TABLE space_owner_payment_history IS 'Tracks all payment transactions for space owner subscriptions';
COMMENT ON FUNCTION expire_subscriptions() IS 'Function to automatically expire subscriptions that are past their expiry date';
