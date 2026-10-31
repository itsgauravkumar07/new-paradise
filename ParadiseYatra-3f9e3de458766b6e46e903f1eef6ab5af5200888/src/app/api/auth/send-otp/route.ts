import { NextRequest, NextResponse } from 'next/server';
import { sendOTPEmail } from '@/lib/nodemailer';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { message: 'Email address is required' },
                { status: 400 }
            );
        }

        // Generate a random 6-digit OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        // Send the OTP using our new Nodemailer utility
        const emailResult = await sendOTPEmail(email, generatedOtp);

        if (!emailResult.success) {
            return NextResponse.json(
                { message: 'Failed to send OTP email', error: emailResult.error },
                { status: 500 }
            );
        }

        // IMPORTANT: In a production environment, you should save the `generatedOtp` 
        // to a database (like MongoDB, Postgres) or Redis along with the user's email 
        // and an expiration timestamp (e.g., 10 minutes from now) so you can verify 
        // it in the verify-otp route.
        // 
        // Example: await db.otp.create({ data: { email, otp: generatedOtp, expiresAt } })

        return NextResponse.json({
            message: 'OTP sent successfully',
            // NOTE: We are returning the OTP in the response purely for testing purposes!
            // Remove `otp: generatedOtp` in a real production environment.
            otp: generatedOtp 
        });
    } catch (error) {
        console.error('Send OTP API error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
