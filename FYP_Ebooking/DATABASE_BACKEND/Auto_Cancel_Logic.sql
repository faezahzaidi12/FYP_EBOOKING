-- ====================================================================
-- FAIL 2: SISTEM AUTOMASI & EMEL AMARAN PEMBATALAN (15-MINUTE AUTO-CANCEL) [45, 46]
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. Fungsi untuk menyemak, menghantar emel pembatalan, dan membatalkan tempahan [45, 46]
CREATE OR REPLACE FUNCTION public.auto_cancel_unattended_bookings()
RETURNS void AS $$
DECLARE
    r RECORD;
BEGIN
    -- A. Cari semua tempahan Pending yang sudah melepasi 15 minit untuk di-cancel,
    -- dan hantar emel amaran pembatalan sebelum menukar statusnya di database [45, 46]
    FOR r IN 
        SELECT 
            b.id AS booking_id,
            b.room_name,
            b.booked_by,
            b.booking_date,
            b.start_time,
            u.email AS user_email
        FROM public.bookings b
        JOIN auth.users u ON b.user_id = u.id
        WHERE b.status = 'Pending'
          AND (b.booking_date + b.start_time)::timestamp < (NOW() AT TIME ZONE 'Asia/Kuala_Lumpur' - INTERVAL '15 minutes')
    LOOP
        -- Tembak emel pembatalan rasmi (Cancellation Alert) ke Resend [1.1.2, 1.2.4, 46]
        PERFORM net.http_post(
            url := 'https://api.resend.com/emails',
            headers := jsonb_build_object(
                'Authorization', 'Bearer re_JvRp3AJH_3ViegjtkG721nanV4tWAoLyU', -- API Key Resend awak [1.1.2]
                'Content-Type', 'application/json'
            ),
            body := jsonb_build_object(
                'from', 'TVETMARA Booking <onboarding@resend.dev>',
                'to', ARRAY[r.user_email],
                'subject', '❌ [Cancelled] Booking Cancelled for ' || r.room_name,
                'html', '
                    <div style="font-family: Arial, sans-serif; border: 1px solid #ff4d4d; border-radius: 8px; padding: 25px; max-width: 500px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.05); color: #333333;">
                        <h2 style="color: #ff4d4d; margin-top: 0; font-size: 20px; text-transform: uppercase;">❌ BOOKING CANCELLED</h2>
                        <p>Dear <strong>' || r.booked_by || '</strong>,</p>
                        <p>Your booking for <strong>' || r.room_name || '</strong> has been <strong>automatically cancelled</strong> because you did not check-in within the required 15-minute window [45].</p>
                        
                        <p style="color: #ff4d4d; font-weight: bold;">Notice: The classroom/facility is now released and made available for other users [45].</p>
                        
                        <div style="background-color: #f8f9fa; border-left: 4px solid #ff4d4d; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; color: #555555;"><strong>Room/Facility:</strong> ' || r.room_name || '</p>
                            <p style="margin: 0; font-size: 14px; color: #555555;"><strong>Date:</strong> ' || r.booking_date || '</p>
                            <p style="margin: 0; font-size: 14px; color: #555555;"><strong>Scheduled Start:</strong> ' || to_char(r.start_time, 'HH24:MI') || '</p>
                            <p style="margin: 0; font-size: 14px; color: #555555;"><strong>Status:</strong> Automatically Cancelled</p>
                        </div>
                        
                        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
                        <p style="font-size: 11px; color: #aaaaaa; text-align: center; margin: 0;">
                            TVETMARA Besut Facility Management System
                        </p>
                    </div>
                '
            )
        );
    END LOOP;

    -- B. Selepas emel pembatalan dihantar, barulah kita kemas kini status di database [45]
    UPDATE public.bookings
    SET status = 'Cancelled'
    WHERE status = 'Pending'
      AND (booking_date + start_time)::timestamp < (NOW() AT TIME ZONE 'Asia/Kuala_Lumpur' - INTERVAL '15 minutes');

    -- C. Tukar semula status bilik/kemudahan kepada 'Available' di classrooms [45]
    UPDATE public.classrooms
    SET status = 'Available'
    WHERE room_name IN (
        SELECT room_name 
        FROM public.bookings 
        WHERE status = 'Cancelled'
          AND (booking_date + start_time)::timestamp >= (NOW() AT TIME ZONE 'Asia/Kuala_Lumpur' - INTERVAL '20 minutes')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Padam cron lama jika ada untuk mengelak ralat bertindih [1.2.2]
SELECT cron.unschedule(jobid) 
FROM cron.job 
WHERE jobname = 'auto-cancel-bookings-every-minute';

-- 3. Jadualkan tugas semakan automatik setiap 1 minit [1.2.2]
SELECT cron.schedule(
    'auto-cancel-bookings-every-minute',
    '* * * * *',
    'SELECT public.auto_cancel_unattended_bookings();'
);