CREATE TABLE IF NOT EXISTS sell_back_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 card_id uuid REFERENCES cards(id),
 seller_id uuid REFERENCES auth.users(id),
 card_name text,
 amount numeric DEFAULT 0,
 status text DEFAULT 'pending',
 admin_note text,
 created_at timestamptz DEFAULT now(),
 updated_at timestamptz DEFAULT now()
);

ALTER TABLE sell_back_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sell request create own" ON sell_back_requests
FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "sell request read own" ON sell_back_requests
FOR SELECT USING (auth.uid() = seller_id OR EXISTS (SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));

CREATE POLICY "sell request admin manage" ON sell_back_requests
FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));
