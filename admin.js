// Supabase Configuration
const { createClient } = supabase;
const supabaseUrl = 'https://emgnwgdigxlhxzuemlss.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZ253Z2RpZ3hsaHh6dWVtbHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMDQ5NDYsImV4cCI6MjA5NzU4MDk0Nn0.brBwl9t_7mAOnCC3GDhgE3JErF6zDa713TiqV6BisK4';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    const filterDate = document.getElementById('filterDate');
    const btnRefresh = document.getElementById('btnRefresh');
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    filterDate.value = today;

    // Fetch initial data
    fetchBookings(today);

    // Event Listeners
    filterDate.addEventListener('change', (e) => {
        fetchBookings(e.target.value);
    });

    btnRefresh.addEventListener('click', () => {
        fetchBookings(filterDate.value);
    });
});

async function fetchBookings(dateString) {
    const tableBody = document.getElementById('queueTableBody');
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center">กำลังโหลดข้อมูล...</td></tr>';

    try {
        const { data, error } = await supabaseClient
            .from('reservations')
            .select('*')
            .eq('booking_date', dateString)
            .order('time_slot', { ascending: true })
            .order('created_at', { ascending: true });

        if (error) {
            // Usually RLS issue if error hits
            throw error;
        }

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center">ไม่มีรายการจองคิวในวันนี้</td></tr>';
            return;
        }

        renderTable(data);
    } catch (err) {
        console.error("Supabase Select Error:", err);
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center" style="color:#ef4444;">เกิดข้อผิดพลาดในการดึงข้อมูล: ${err.message}<br><small>(แนะนำ: โปรดตรวจสอบ RLS Policy ให้สิทธิ์ anon สามารถ SELECT ได้)</small></td></tr>`;
    }
}

function renderTable(data) {
    const tableBody = document.getElementById('queueTableBody');
    tableBody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        
        // Actions based on current status
        let actionButtons = '';
        if (row.status === 'Booked' || row.status === 'booked') {
            actionButtons = `
                <div class="action-btns">
                    <button class="btn-arrive" onclick="updateStatus('${row.id}', 'arrived')" title="ลูกค้ามาถึงแล้ว">เช็คอิน</button>
                    <button class="btn-noshow" onclick="updateStatus('${row.id}', 'no_show')" title="ลูกค้าไม่มาตามนัด">No-show</button>
                    <button class="btn-cancel" onclick="updateStatus('${row.id}', 'cancelled')" title="ยกเลิกการจอง">ยกเลิก</button>
                    <button class="btn-delete" onclick="deleteReservation('${row.id}')" title="ลบข้อมูลทดสอบ">ลบ</button>
                </div>
            `;
        } else {
            actionButtons = `
                <div class="action-btns">
                    <span style="color: #9ca3af; font-size: 0.9rem; align-self: center;">ทำรายการแล้ว</span>
                    <button class="btn-delete" onclick="deleteReservation('${row.id}')" style="margin-left:auto;" title="ลบข้อมูลทดสอบ">ลบ</button>
                </div>
            `;
        }

        tr.innerHTML = `
            <td><strong>${row.time_slot}</strong></td>
            <td><span style="font-family: monospace; color: #5D4037;">${row.booking_code}</span></td>
            <td>${row.customer_name}</td>
            <td>${row.phone_number}</td>
            <td>${row.guests_count} ท่าน</td>
            <td>${row.special_note || '-'}</td>
            <td><span class="status-badge status-${row.status}">${row.status}</span></td>
            <td>${actionButtons}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Global function to be called by inline onclick
window.updateStatus = async function(id, newStatus) {
    if (!confirm(`คุณต้องการเปลี่ยนสถานะคิวนี้ใช่หรือไม่?`)) return;

    try {
        const { error } = await supabaseClient
            .from('reservations')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            throw error;
        }
        
        alert('อัปเดตสถานะสำเร็จ!');
        // Refresh table after successful update
        const filterDate = document.getElementById('filterDate').value;
        fetchBookings(filterDate);
    } catch (err) {
        console.error("Supabase Update Error:", err);
        alert('❌ เกิดข้อผิดพลาดในการอัปเดตสถานะ: ' + err.message + '\n\nโปรดตรวจสอบ RLS Policy ให้สิทธิ์ anon สามารถ UPDATE ได้');
    }
}

// Function to delete reservation (for test data)
window.deleteReservation = async function(id) {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะ "ลบรายการ" นี้อย่างถาวร?\n(หมายเหตุ: แนะนำให้ใช้ลบเฉพาะข้อมูลทดสอบเท่านั้น)`)) return;

    try {
        const { error } = await supabaseClient
            .from('reservations')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }
        
        alert('ลบรายการสำเร็จ!');
        // Refresh table after successful delete
        const filterDate = document.getElementById('filterDate').value;
        fetchBookings(filterDate);
    } catch (err) {
        console.error("Supabase Delete Error:", err);
        alert('❌ เกิดข้อผิดพลาดในการลบข้อมูล: ' + err.message + '\n\nโปรดตรวจสอบ RLS Policy ให้สิทธิ์ anon สามารถ DELETE ได้');
    }
}
