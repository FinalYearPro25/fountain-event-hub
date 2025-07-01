-- Create certificates table for event participation certificates
CREATE TABLE certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  issued_at timestamp with time zone DEFAULT now(),
  verification_code text UNIQUE NOT NULL,
  pdf_url text,
  status text DEFAULT 'issued'
);

-- Index for quick lookup by verification_code
CREATE INDEX idx_certificates_verification_code ON certificates(verification_code); 