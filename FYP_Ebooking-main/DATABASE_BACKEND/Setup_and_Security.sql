-- ====================================================================
-- FAIL 1: PEMBINAAN JADUAL DATABASE & SISTEM KESELAMATAN RLS (DENGAN PAGE URL) [35, 40]
-- ====================================================================

-- 1. PADAM JADUAL LAMA JIKA WUJUD (Bagi membina semula dari kosong secara bersih!) [1.1.2]
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.classrooms CASCADE;

-- 2. Bina jadual classrooms beserta ruangan page_url [35, 40]
CREATE TABLE public.classrooms (
    id SERIAL PRIMARY KEY,
    room_name VARCHAR(255) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Available',
    page_url TEXT NOT NULL -- Menolak ke halaman bilik yang betul secara dinamik [35]
);

-- 3. Bina jadual bookings [40]
CREATE TABLE public.bookings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    room_name VARCHAR(255) REFERENCES public.classrooms(room_name),
    booked_by VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    booking_day VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject VARCHAR(255) NOT NULL,
    lecturer VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Memasukkan senarai bilik DFK, Library, & Sports beserta laluan halaman yang betul [35, 40]
INSERT INTO public.classrooms (room_name, capacity, status, page_url) VALUES
('DFK 1', 20, 'Available', 'USER_PAGE/Dfk/Dfk1.html'),
('DFK 2', 20, 'Available', 'USER_PAGE/Dfk/Dfk2.html'),
('DFK 3', 20, 'Available', 'USER_PAGE/Dfk/Dfk3.html'),
('DFK 4', 20, 'Available', 'USER_PAGE/Dfk/Dfk4.html'),
('DFK 5', 20, 'Available', 'USER_PAGE/Dfk/Dfk5.html'),
('DFK 6', 20, 'Available', 'USER_PAGE/Dfk/Dfk6.html'),
('DFK 7', 20, 'Available', 'USER_PAGE/Dfk/Dfk7.html'),
('DFK 8', 20, 'Available', 'USER_PAGE/Dfk/Dfk8.html'),
('DFK 9', 20, 'Available', 'USER_PAGE/Dfk/Dfk9.html'),
('DFK 10', 20, 'Available', 'USER_PAGE/Dfk/Dfk10.html'),
('CENTURY 21ST', 20, 'Available', 'Library/century21st.html'),
('LITERASI 1', 20, 'Available', 'Library/literasi1.html'),
('LITERASI 2', 20, 'Available', 'Library/literasi2.html'),
('BADMINTON COURT', 2, 'Available', 'SportFacility/badminton.html'),
('FIELD', 22, 'Available', 'SportFacility/field.html'),
('PINPONG', 4, 'Available', 'SportFacility/pinpong.html'),
('TAKRAW', 6, 'Available', 'SportFacility/takraw.html'),
('VOLLEYBALL', 12, 'Available', 'SportFacility/volleyball.html')
ON CONFLICT (room_name) DO UPDATE 
SET page_url = EXCLUDED.page_url;

-- 5. Hidupkan sistem Row Level Security (RLS) untuk keselamatan [1.1.2]
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

-- 6. Padam polisi lama jika wujud untuk mengelak ralat bertindih [1.1.2]
DROP POLICY IF EXISTS "Allow all to read bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow all to insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow all to update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow all to read classrooms" ON public.classrooms;

-- 7. Bina semula polisi keselamatan yang bersih [1.1.2, 1.1.5]
CREATE POLICY "Allow all to read bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow all to insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all to update bookings" ON public.bookings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to read classrooms" ON public.classrooms FOR SELECT USING (true);
ALTER TABLE public.bookings ALTER COLUMN subject DROP NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN lecturer DROP NOT NULL;