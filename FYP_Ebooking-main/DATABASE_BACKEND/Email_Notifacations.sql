-- ====================================================================
-- FAIL 3: SISTEM NOTIFIKASI EMEL AUTOMATIK (DENGAN TULISAN FACILITY UNIVERSAL) [46]
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. Fungsi Emel 15 Minit Sebelum Kelas Mula (KINI MENGGUNAKAN 'FACILITY' UNIVERSAL) [46]
CREATE OR REPLACE FUNCTION public.send_booking_reminder_emails()
RETURNS void AS $$
DECLARE
    r RECORD;
BEGIN
    -- Cari tempahan Pending dan cantumkan (JOIN) dengan classrooms untuk dapatkan page_url yang betul [35]
    FOR r IN 
        SELECT 
            b.id AS booking_id,
            b.room_name,
            b.booked_by,
            b.start_time,
            b.end_time,
            c.page_url, -- Mengambil pautan halaman tersendiri secara dinamik [35]
            u.email AS user_email
        FROM public.bookings b
        JOIN public.classrooms c ON b.room_name = c.room_name
        JOIN auth.users u ON b.user_id = u.id
        WHERE b.status = 'Pending'
          AND b.booking_date = (NOW() AT TIME ZONE 'Asia/Kuala_Lumpur')::date
          AND to_char(b.start_time, 'HH24:MI') = to_char((NOW() AT TIME ZONE 'Asia/Kuala_Lumpur' + INTERVAL '15 minutes'), 'HH24:MI')
    LOOP
        -- Tembak isyarat emel ke API Resend [1.1.2, 1.2.4]
        PERFORM net.http_post(
            url := 'https://api.resend.com/emails',
            headers := jsonb_build_object(
                'Authorization', 'Bearer re_JvRp3AJH_3ViegjtkG721nanV4tWAoLyU', -- API Key Resend awak [1.1.2]
                'Content-Type', 'application/json'
            ),
            body := jsonb_build_object(
                'from', 'TVETMARA Booking <onboarding@resend.dev>',
                'to', ARRAY[r.user_email],
                'subject', '⚠️ [Action Required] Check-in Required for ' || r.room_name,
                -- DIKEMASKINI: Ditukar CLASSROOM kepada FACILITY supaya universal untuk semua bilik & gelanggang! [46]
                'html', '
                    <div style="font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; padding: 25px; max-width: 500px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.05); color: #333333;">
                        <h2 style="color: #ff4d4d; margin-top: 0; font-size: 20px; text-transform: uppercase;">⚠️ FACILITY CHECK-IN REQUIRED</h2>
                        <p>Dear <strong>' || r.booked_by || '</strong>,</p>
                        <p>This is a reminder that your booking for <strong>' || r.room_name || '</strong> is scheduled to start in 15 minutes.</p>
                        
                        <p>To secure your reservation, please confirm your attendance by checking in below:</p>
                        
                        <div style="background-color: #f8f9fa; border-left: 4px solid #ff4d4d; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; color: #555555;"><strong>Room/Facility:</strong> ' || r.room_name || '</p>
                            <p style="margin: 0; font-size: 14px; color: #555555;"><strong>Time:</strong> ' || to_char(r.start_time, 'HH24:MI') || ' - ' || to_char(r.end_time, 'HH24:MI') || '</p>
                            <p style="margin: 0; font-size: 14px; color: #555555;"><strong>Status:</strong> Pending Check-in</p>
                        </div>
                        
                        <!-- Pautan dinamik dihala terus mengikut fail HTML bilik darjah, library, atau sukan yang betul! [28] -->
                        <a href="http://127.0.0.1:5500/' || r.page_url || '" 
                           style="display: block; text-align: center; background-color: #28a745; color: #ffffff; padding: 14px; text-decoration: none; font-weight: bold; border-radius: 5px; font-size: 16px; margin: 25px 0;">
                           CONFIRM & CHECK-IN NOW
                        </a>
                        
                        <p style="font-size: 13px; color: #777777; line-height: 1.5;">
                            <strong>Important Note:</strong> You must check in within 15 minutes after the scheduled start time. If you do not check in, your booking will be automatically cancelled.
                        </p>
                        
                        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
                        <p style="font-size: 11px; color: #aaaaaa; text-align: center; margin: 0;">TVETMARA Besut Facility Management System</p>
                    </div>
                '
            )
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Fungsi Emel Amaran 5 Minit Sebelum Tamat (KINI MENGGUNAKAN 'SESSION' UNIVERSAL) [45, 46]
CREATE OR REPLACE FUNCTION public.send_booking_end_warning_emails()
RETURNS void AS $$
DECLARE
    r RECORD;
    has_next_class boolean;
BEGIN
    -- Cari kelas aktif (Checked-In) yang berbaki 5 minit sebelum tamat [45, 46]
    FOR r IN 
        SELECT 
            b.id AS booking_id,
            b.room_name,
            b.booked_by,
            b.booking_date,
            b.start_time,
            b.end_time,
            c.page_url, -- Mengambil pautan halaman tersendiri secara dinamik [35]
            u.email AS user_email
        FROM public.bookings b
        JOIN public.classrooms c ON b.room_name = c.room_name
        JOIN auth.users u ON b.user_id = u.id
        WHERE b.status = 'Checked-In'
          AND b.booking_date = (NOW() AT TIME ZONE 'Asia/Kuala_Lumpur')::date
          AND to_char(b.end_time, 'HH24:MI') = to_char((NOW() AT TIME ZONE 'Asia/Kuala_Lumpur' + INTERVAL '5 minutes'), 'HH24:MI')
    LOOP
        -- Semak jika ada kelas lain bertaraf Pending/Checked-In sejurus selepas kelas r.end_time [45]
        SELECT EXISTS (
            SELECT 1 
            FROM public.bookings next_b
            WHERE next_b.room_name = r.room_name
              AND next_b.booking_date = r.booking_date
              AND next_b.start_time = r.end_time
              AND next_b.status IN ('Pending', 'Checked-In')
        ) INTO has_next_class;

        IF has_next_class THEN
            -- KES A: Ada kelas seterusnya (Sesi tamat, butang extend kelabu mati) [46]
            PERFORM net.http_post(
                url := 'https://api.resend.com/emails',
                headers := jsonb_build_object(
                    'Authorization', 'Bearer re_JvRp3AJH_3ViegjtkG721nanV4tWAoLyU', -- API Key Resend awak [1.1.2]
                    'Content-Type', 'application/json'
                ),
                body := jsonb_build_object(
                    'from', 'TVETMARA Booking <onboarding@resend.dev>',
                    'to', ARRAY[r.user_email],
                    'subject', '⚠️ [Session Ending] Next Session Scheduled - ' || r.room_name,
                    -- DIKEMASKINI: Ditukar classroom kepada facility [46]
                    'html', '
                        <div style="font-family: Arial, sans-serif; border: 1px solid #ff4d4d; border-radius: 8px; padding: 25px; max-width: 500px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.05); color: #333333;">
                            <h2 style="color: #ff4d4d; margin-top: 0; font-size: 20px; text-transform: uppercase;">⚠️ SESSION ENDING</h2>
                            <p>Dear <strong>' || r.booked_by || '</strong>,</p>
                            <p>Your session in <strong>' || r.room_name || '</strong> is ending in 5 minutes.</p>
                            
                            <p style="color: #ff4d4d; font-weight: bold;">Notice: There is another session scheduled immediately after your booking. Please vacate the facility promptly.</p>
                            
                            <!-- Butang Kelabu Mati (Tidak boleh diklik) -->
                            <div style="display: block; text-align: center; background-color: #cccccc; color: #666666; padding: 14px; font-weight: bold; border-radius: 5px; font-size: 14px; margin: 25px 0; border: 1px solid #999999; cursor: not-allowed;">
                                EXTENSION BLOCKED (NEXT SESSION SCHEDULED)
                            </div>
                            
                            <div style="background-color: #f8f9fa; border-left: 4px solid #ff4d4d; padding: 15px; margin: 20px 0;">
                                <p style="margin: 0; font-size: 14px; color: #555555;"><strong>Room/Facility:</strong> ' || r.room_name || '</p>
                                <p style="margin: 0; font-size: 14px; color: #555555;"><strong>End Time:</strong> ' || to_char(r.end_time, 'HH24:MI') || '</p>
                            </div>
                        </div>
                    '
                )
            );
        ELSE
            -- KES B: TIADA kelas seterusnya (Boleh tanya nak extend, butang hijau aktif secara dinamik!) [46]
            PERFORM net.http_post(
                url := 'https://api.resend.com/emails',
                headers := jsonb_build_object(
                    'Authorization', 'Bearer re_JvRp3AJH_3ViegjtkG721nanV4tWAoLyU', -- API Key Resend awak [1.1.2]
                    'Content-Type', 'application/json'
                ),
                body := jsonb_build_object(
                    'from', 'TVETMARA Booking <onboarding@resend.dev>',
                    'to', ARRAY[r.user_email],
                    'subject', '⏰ [Session Ending] Would you like to extend? - ' || r.room_name,
                    -- DIKEMASKINI: Ditukar classroom kepada room/facility [46]
                    'html', '
                        <div style="font-family: Arial, sans-serif; border: 1px solid #007bff; border-radius: 8px; padding: 25px; max-width: 500px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.05); color: #333333;">
                            <h2 style="color: #007bff; margin-top: 0; font-size: 20px; text-transform: uppercase;">⏰ EXTEND YOUR SESSION?</h2>
                            <p>Dear <strong>' || r.booked_by || '</strong>,</p>
                            <p>Your session in <strong>' || r.room_name || '</strong> is scheduled to end in 5 minutes.</p>
                            
                            <p><strong>Good news:</strong> There are no subsequent bookings for this room/facility. Would you like to extend your session by 1 hour?</p>
                            
                            <!-- Pautan dinamik DFK 1 - DFK 10 [28] -->
                            <a href="http://127.0.0.1:5500/' || r.page_url || '?extend_id=' || r.booking_id || '&end_time=' || to_char(r.end_time, 'HH24:MI') || '" 
                               style="display: block; text-align: center; background-color: #28a745; color: #ffffff; padding: 14px; text-decoration: none; font-weight: bold; border-radius: 5px; font-size: 16px; margin: 25px 0; box-shadow: 0 4px 6px rgba(40,167,69,0.2);">
                                EXTEND SESSION BY 1 HOUR
                            </a>
                            
                            <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
                                <p style="margin: 0; font-size: 14px; color: #555555;"><strong>Room/Facility:</strong> ' || r.room_name || '</p>
                                <p style="margin: 0; font-size: 14px; color: #555555;"><strong>End Time:</strong> ' || to_char(r.end_time, 'HH24:MI') || '</p>
                            </div>
                        </div>
                    '
                )
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Padam dan daftarkan semula pemasa cron [1.2.2]
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'send-reminder-emails-every-minute';
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'send-end-warning-emails-every-minute';

SELECT cron.schedule(
    'send-reminder-emails-every-minute',
    '* * * * *',
    'SELECT public.send_booking_reminder_emails();'
);

SELECT cron.schedule(
    'send-end-warning-emails-every-minute',
    '* * * * *',
    'SELECT public.send_booking_end_warning_emails();'
);