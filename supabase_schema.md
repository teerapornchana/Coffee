# Database Schema Design (Supabase)

อ้างอิงจากเอกสาร SRS สำหรับระบบรับจองโต๊ะร้านกาแฟ (Coffee Shop Table Reservation System) นี่คือการออกแบบโครงสร้างฐานข้อมูลเบื้องต้นที่เหมาะสมสำหรับใช้งานร่วมกับ **Supabase** ครับ

## 1. ชื่อตาราง (Table Name)
`bookings` (เก็บข้อมูลการจองโต๊ะทั้งหมด)

## 2. โครงสร้างคอลัมน์ (Columns)

| Column Name | Type (Supabase/PostgreSQL) | Constraints / Default | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, Default: `gen_random_uuid()` | รหัสอ้างอิง ID ของ record ในระบบ |
| `created_at` | `timestamptz` | Default: `now()` | วันเวลาที่ทำการกดจองโต๊ะเข้าระบบ |
| `booking_code` | `text` | Unique, Not Null | รหัสการจองสำหรับลูกค้า (เช่น BB-1045) |
| `customer_name` | `text` | Not Null | ชื่อผู้ที่ทำการจอง |
| `phone_number` | `text` | Not Null | เบอร์โทรศัพท์ลูกค้า (ใช้ยืนยันตัวตน/ติดต่อ) |
| `booking_date` | `date` | Not Null | วันที่ต้องการมาที่ร้าน (YYYY-MM-DD) |
| `time_slot` | `text` | Not Null | รอบเวลาที่เลือก (เช่น "10:00 - 11:30 น.") |
| `guests_count` | `integer` | Not Null | จำนวนคน |
| `special_note` | `text` | Nullable | ความต้องการพิเศษ เช่น เอาเก้าอี้เด็ก (ถ้ามี) |
| `status` | `text` | Not Null, Default: `'Booked'` | สถานะ: `Booked`, `Arrived`, `No-show`, `Cancelled` |

> *หมายเหตุ: การแยก `booking_date` และ `time_slot` ออกจากกัน จะช่วยให้การ Query ตรวจสอบรอบเวลา (Availability Check) ว่าคิวเต็มแล้วหรือยัง ทำได้ง่ายกว่าการรวมเป็น Datetime ฟิลด์เดียว*

---

## 3. ข้อมูลตัวอย่าง 5 แถว (Sample Data)

| id | booking_code | customer_name | phone_number | booking_date | time_slot | guests_count | special_note | status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `(uuid-1)` | BB-1045 | สมชาย ใจดี | 0812345678 | 2026-06-22 | 10:00 - 11:30 น. | 2 | ขอโต๊ะริมหน้าต่าง | Booked |
| `(uuid-2)` | BB-9012 | สมหญิง รักเรียน | 0898765432 | 2026-06-22 | 13:00 - 14:30 น. | 4 | เอาเก้าอี้เด็ก 1 ตัว | Booked |
| `(uuid-3)` | BB-3341 | นาดา พาเพลิน | 0823334455 | 2026-06-22 | 16:00 - 17:30 น. | 1 | - | Arrived |
| `(uuid-4)` | BB-5521 | ธนาธิป กาแฟ | 0845556677 | 2026-06-23 | 11:30 - 13:00 น. | 5 | - | Cancelled |
| `(uuid-5)` | BB-8899 | วีณา อารมณ์ดี | 0867778899 | 2026-06-24 | 14:30 - 16:00 น. | 2 | แพ้นมวัว (ขอเมนูนมโอ๊ต) | No-show |

---

## 4. คำแนะนำ: หน้าเว็บควรอ่าน/เขียนข้อมูลอย่างไร (Frontend Integration)

การเชื่อมต่อ Supabase Javascript Client กับระบบหน้าบ้านและหลังบ้าน มีข้อควรระวังและวิธีปฏิบัติ ดังนี้:

### 🌟 ฝั่งลูกค้า (Customer Landing Page)
*   **การเขียนข้อมูล (Insert):**
    *   ฟังก์ชันลูกค้าเปิดให้เข้าใช้งานแบบไม่ต้อง Login (Guest Checkout) 
    *   **RLS (Row Level Security):** ใน Supabase ต้องตั้งค่า RLS Policy ให้ `anon` (Anonymous Users) สามารถทำได้แค่ **`INSERT`** เท่านั้น
    *   **ห้าม**เปิด Policy ให้ `anon` สามารถ `SELECT`, `UPDATE` หรือ `DELETE` เด็ดขาด เพื่อป้องกันข้อมูลส่วนตัว (เบอร์โทร, ชื่อ) ของลูกค้าหลุดออกไป
*   **การเช็คคิวว่าง (Availability Check):**
    *   เพื่อหลีกเลี่ยงการเปิด `SELECT` สู่สาธารณะ แนะนำให้สร้าง **Database Function (RPC)** ใน Supabase ชื่อ `check_slot_availability(target_date, target_slot)` ที่จะคืนค่ามาแค่ว่า "ว่าง/ไม่ว่าง" (Boolean หรือ Integer จำนวนที่ว่าง) แล้วให้หน้าเว็บเรียกใช้ผ่าน `supabase.rpc()`
*   **Flow เมื่อกดปุ่ม "ยืนยันการจอง":**
    1. ตรวจสอบข้อมูลในฟอร์มให้ครบ
    2. เรียกใช้ `rpc` เช็คคิวว่าง หากเต็มให้แจ้งเตือน Alert
    3. หากว่าง สั่ง `supabase.from('bookings').insert([...])`
    4. โชว์หน้า Success พร้อม Booking Code 

### 💼 ฝั่งพนักงาน (Staff Back-office Dashboard)
*   **Authentication:** 
    *   พนักงานต้อง Login ผ่าน Supabase Auth ก่อนเข้าถึง Dashboard เสมอ
    *   **RLS (Row Level Security):** ตั้งค่า Policy ให้ `authenticated` role สามารถทำได้ทั้ง `SELECT` และ `UPDATE`
*   **การอ่านข้อมูล (Read/Select):**
    *   ดึงข้อมูลคิวของ "วันนี้" เป็นค่าเริ่มต้น: 
        `supabase.from('bookings').select('*').eq('booking_date', '2026-06-22').order('time_slot', { ascending: true })`
    *   ทำตัวกรอง (Filter) ให้พนักงานเลือกดูคิวย้อนหลังหรือล่วงหน้าได้
*   **การอัปเดตข้อมูล (Update):**
    *   เมื่อลูกค้ามาถึง พนักงานกดปุ่มเช็คอิน ระบบจะยิง API:
        `supabase.from('bookings').update({ status: 'Arrived' }).eq('id', current_booking_id)`
    *   ปุ่มสำหรับจัดการคิวจะมี: ✅ เช็คอิน (Arrived), ❌ ไม่มา (No-show), 🗑️ ยกเลิก (Cancelled)
