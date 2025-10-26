-- Add VIBGYOR counter columns to the spaces table if they don't exist

-- Add violet column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='spaces' AND column_name='violet') THEN
        ALTER TABLE spaces ADD COLUMN violet INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Add indigo column  
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='spaces' AND column_name='indigo') THEN
        ALTER TABLE spaces ADD COLUMN indigo INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Add blue column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='spaces' AND column_name='blue') THEN
        ALTER TABLE spaces ADD COLUMN blue INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Add green column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='spaces' AND column_name='green') THEN
        ALTER TABLE spaces ADD COLUMN green INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Add yellow column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='spaces' AND column_name='yellow') THEN
        ALTER TABLE spaces ADD COLUMN yellow INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Add orange column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='spaces' AND column_name='orange') THEN
        ALTER TABLE spaces ADD COLUMN orange INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Add red column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='spaces' AND column_name='red') THEN
        ALTER TABLE spaces ADD COLUMN red INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Add grey column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='spaces' AND column_name='grey') THEN
        ALTER TABLE spaces ADD COLUMN grey INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Add white column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='spaces' AND column_name='white') THEN
        ALTER TABLE spaces ADD COLUMN white INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Add black column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='spaces' AND column_name='black') THEN
        ALTER TABLE spaces ADD COLUMN black INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;
