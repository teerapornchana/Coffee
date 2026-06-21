// Initialize Supabase Client
const { createClient } = supabase;
const supabaseUrl = 'https://emgnwgdigxlhxzuemlss.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZ253Z2RpZ3hsaHh6dWVtbHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMDQ5NDYsImV4cCI6MjA5NzU4MDk0Nn0.brBwl9t_7mAOnCC3GDhgE3JErF6zDa713TiqV6BisK4';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    // Set min date to today for the date picker
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        dateInput.min = minDate;
    }

    // Form Submission with Supabase Integration
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Collect Form Data
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const guests = parseInt(document.getElementById('guests').value, 10);
            const note = document.getElementById('note').value;
            
            const btn = document.querySelector('.btn-submit');
            
            // Visual feedback - Loading state
            const originalText = btn.textContent;
            btn.textContent = 'กำลังบันทึกข้อมูลการจอง...';
            btn.style.opacity = '0.8';
            btn.style.pointerEvents = 'none';
            
            // Generate unique booking code
            const bookingCode = 'BB-' + Math.floor(1000 + Math.random() * 9000);
            
            try {
                // Insert data into Supabase table 'reservations'
                const { error } = await supabaseClient
                    .from('reservations')
                    .insert([
                        { 
                            booking_code: bookingCode,
                            customer_name: name,
                            phone_number: phone,
                            booking_date: date,
                            time_slot: time,
                            guests_count: guests,
                            special_note: note || null, // Optional field
                            status: 'Booked' // Default status
                        }
                    ]);
                
                if (error) {
                    throw error;
                }
                
                // Show Success Message
                alert(`🎉 จองโต๊ะสำเร็จเรียบร้อยแล้วครับ คุณ ${name}!\n\nรหัสอ้างอิงการจอง: ${bookingCode}\nกรุณาแคปหน้าจอนี้ไว้เป็นหลักฐานครับ`);
                
                // Reset form after success
                form.reset();

            } catch (err) {
                // Show Error Message
                console.error("Supabase Error:", err);
                alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message + '\nกรุณาลองใหม่อีกครั้งครับ');
            } finally {
                // Restore button state
                btn.textContent = originalText;
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            }
        });
    }
});
