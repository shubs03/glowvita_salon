import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import AppointmentModel from "@repo/lib/models/Appointment/Appointment.model";
import fs from 'fs';

const uri = "mongodb://glowvitasalon:glowvita199209@ac-tdhpnyq-shard-00-00.lajwagc.mongodb.net:27017,ac-tdhpnyq-shard-00-01.lajwagc.mongodb.net:27017,ac-tdhpnyq-shard-00-02.lajwagc.mongodb.net:27017/?ssl=true&replicaSet=atlas-bg4bli-shard-0&authSource=admin";

export async function GET(req) {
  try {
    const vendorId = "69fad7d74e0484fe13261dad";
    
    // Ensure DB connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri);
    }

    const appts = await AppointmentModel.find({ 
      $or: [
        { vendorId: new mongoose.Types.ObjectId(vendorId) },
        { vendorId: vendorId }
      ]
    });

    let completedOnline = 0;
    let pendingOnline = 0;
    let cancelledOnline = 0;
    let completedSalon = 0;
    let pendingSalon = 0;

    let completedOnlineGross = 0;
    let pendingOnlineGross = 0;
    let cancelledOnlineFinal = 0;
    let completedSalonFees = 0;
    let pendingSalonFees = 0;

    appts.forEach(appt => {
      const status = appt.status;
      const paymentMethod = appt.paymentMethod;
      const gross = appt.totalAmount || 0;
      const final = appt.finalAmount || 0;
      const fees = (appt.platformFee || 0) + (appt.serviceTax || 0);

      if (paymentMethod === 'Pay Online') {
        if (status === 'completed' || status === 'partially-completed') {
          completedOnline++;
          completedOnlineGross += gross;
        } else if (status === 'cancelled') {
          cancelledOnline++;
          cancelledOnlineFinal += final;
        } else if (status === 'scheduled' || status === 'confirmed') {
          pendingOnline++;
          pendingOnlineGross += gross;
        }
      } else if (paymentMethod === 'Pay at Salon') {
        if (status === 'completed' || status === 'partially-completed') {
          completedSalon++;
          completedSalonFees += fees;
        } else if (status === 'scheduled' || status === 'confirmed') {
          pendingSalon++;
          pendingSalonFees += fees;
        }
      }
    });

    const result = {
      vendorId,
      appointmentsFound: appts.length,
      results: {
        online: {
          completed: { count: completedOnline, amount: completedOnlineGross },
          pending: { count: pendingOnline, amount: pendingOnlineGross },
          cancelled: { count: cancelledOnline, amount: cancelledOnlineFinal }
        },
        salon: {
          completed: { count: completedSalon, amount: completedSalonFees },
          pending: { count: pendingSalon, amount: pendingSalonFees }
        }
      }
    };

    // Write to scratch file
    fs.writeFileSync('C:\\Users\\Admin\\.gemini\\antigravity\\brain\\b3792550-c2d6-4356-bff4-7adbce1d722a\\scratch\\verify_result.json', JSON.stringify(result, null, 2));

    return NextResponse.json({ success: true, message: "Result written to file", data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
