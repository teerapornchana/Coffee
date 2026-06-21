const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emgnwgdigxlhxzuemlss.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZ253Z2RpZ3hsaHh6dWVtbHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMDQ5NDYsImV4cCI6MjA5NzU4MDk0Nn0.brBwl9t_7mAOnCC3GDhgE3JErF6zDa713TiqV6BisK4';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log("Starting test: Inserting a mock reservation...");
    const bookingCode = 'BB-TEST-' + Math.floor(1000 + Math.random() * 9000);
    
    try {
        const { data, error } = await supabaseClient
            .from('reservations')
            .insert([
                { 
                    booking_code: bookingCode,
                    customer_name: 'NodeJS Test User',
                    phone_number: '0999999999',
                    booking_date: '2026-06-25',
                    time_slot: '10:00 - 11:30 น.',
                    guests_count: 2,
                    special_note: 'Testing from Node JS',
                    status: 'Booked'
                }
            ])
            .select(); // .select() เพื่อให้ Supabase ส่งข้อมูลที่เพิ่ง insert กลับมาแสดงผล
        
        if (error) {
            console.error("❌ Insert Failed:");
            console.error(error.message || error);
            if (error.code === '42P01') {
                console.error("-> สาเหตุ: ยังไม่ได้สร้างตาราง 'reservations' ใน Supabase");
            } else if (error.code === '42501') {
                console.error("-> สาเหตุ: ติด RLS (Row Level Security) กรุณาเข้าไปตั้งค่า Policy ตามคำแนะนำก่อนหน้า");
            }
        } else {
            console.log("✅ Insert Success! ข้อมูลถูกบันทึกสำเร็จ");
            console.log("Data inserted:", data);
        }
    } catch (err) {
        console.error("Exception occurred:", err);
    }
}

testInsert();
