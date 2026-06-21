-- SQL สำหรับสร้างตาราง reservations ใน Supabase (PostgreSQL)

CREATE TABLE public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_code TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    guests_count INTEGER NOT NULL,
    special_note TEXT,
    status TEXT NOT NULL DEFAULT 'Booked',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- เพิ่ม Comment เพื่ออธิบาย Table และ Columns (ทำให้จัดการใน Supabase UI ได้ง่ายขึ้น)
COMMENT ON TABLE public.reservations IS 'ตารางเก็บข้อมูลการจองโต๊ะของลูกค้าร้านกาแฟ';
COMMENT ON COLUMN public.reservations.id IS 'รหัส Primary Key';
COMMENT ON COLUMN public.reservations.booking_code IS 'รหัสการจองสำหรับลูกค้าใช้อ้างอิง (เช่น BB-1045)';
COMMENT ON COLUMN public.reservations.customer_name IS 'ชื่อลูกค้าที่ทำการจอง';
COMMENT ON COLUMN public.reservations.phone_number IS 'เบอร์โทรศัพท์สำหรับติดต่อ';
COMMENT ON COLUMN public.reservations.booking_date IS 'วันที่ต้องการเข้ามาใช้บริการ';
COMMENT ON COLUMN public.reservations.time_slot IS 'รอบเวลาที่จอง (เช่น 10:00 - 11:30 น.)';
COMMENT ON COLUMN public.reservations.guests_count IS 'จำนวนคนทั้งหมด';
COMMENT ON COLUMN public.reservations.special_note IS 'ความต้องการพิเศษ เช่น เก้าอี้เด็ก';
COMMENT ON COLUMN public.reservations.status IS 'สถานะคิว: Booked, Arrived, No-show, Cancelled';
COMMENT ON COLUMN public.reservations.created_at IS 'วันและเวลาที่ทำรายการจองโต๊ะ';
