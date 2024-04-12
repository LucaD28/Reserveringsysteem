// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import supabase from "../../../helpers/supabase";
import { EmailType, Reservation } from "../../../helpers/types/types";


const nodemailer = require("nodemailer")

export default async function handler(req: NextApiRequest, res: NextApiResponse<{error: string}>) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const type : EmailType = req.body.type
    const reservation : Reservation = req.body.reservation

    let text = "";
    let subject = ""
    if(type == 'cancel_confirmation'){
        text = `Beste ${reservation.name}, \nHierbij de bevestiging dat uw reservering op ${reservation.date} is geannuleerd.`
        subject = 'Annuleringsbevestiging'
    }else if(type == 'reservation_confirmation'){
        text = `Beste ${reservation.name}, \nHierbij de bevestiging dat uw reservering op ${reservation.date} is ontvangen.\nAls u de reservering wilt annuleren kan dat via ${process.env.NEXT_PUBLIC_WEBSITE_URL}/cancel?key=${reservation.key}&id=${reservation.id}&name=${encodeURIComponent(reservation.name)}&email=${reservation.email}&date=${reservation.date}`
        subject = 'Reserveringsbevestiging'
    }else if(type == 'cancel_confirmation_admin'){
        text = `Beste ${reservation.name}, \nHelaas hebben wij uw reservering op ${reservation.date} moeten annuleren.\nSorry voor het ongemak. \nVoor het maken van een nieuwe reservering kunt u terecht op ${process.env.NEXT_PUBLIC_WEBSITE_URL}.`
        subject = 'Annulering Reservering'
    }

    if (!reservation) return res.status(500).json({error: "No reservation provided"});
    await sendMail(reservation.email, subject, text);
    return res.status(200).json({ error: null })
}


async function sendMail(receiver_email : string, subject : string, text : string) {

    let connectionObject = {
      host: process.env.HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      tls: {
          rejectUnauthorized: false
      }
    };
    const transporter = nodemailer.createTransport(connectionObject);

    await transporter.sendMail({
      from: '"Reserveringssysteem" <testemailvoorcode@gmail.com>',
      to: receiver_email,
      subject: subject,
      text: text
    });
  }