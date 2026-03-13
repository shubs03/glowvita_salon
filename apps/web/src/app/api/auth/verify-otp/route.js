import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: "Email and OTP are required" }, { status: 400 });
    }

    if (!global.otpStore) {
      return NextResponse.json({ success: false, error: "OTP expired or invalid" }, { status: 400 });
    }

    const storedData = global.otpStore.get(email);

    if (!storedData) {
      return NextResponse.json({ success: false, error: "OTP expired or invalid" }, { status: 400 });
    }

    // Check if expired
    if (Date.now() > storedData.expiry) {
      global.otpStore.delete(email); // Clean up
      return NextResponse.json({ success: false, error: "OTP has expired" }, { status: 400 });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 400 });
    }

    // OTP verified successfully, clean up
    global.otpStore.delete(email);

    return NextResponse.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ success: false, error: "Failed to verify OTP" }, { status: 500 });
  }
}
