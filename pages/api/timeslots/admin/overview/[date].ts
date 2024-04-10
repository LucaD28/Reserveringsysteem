// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import supabase from "../../../../../helpers/supabase";
import { Data, TimeSlot } from "../../../../../helpers/types/types";



export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const { date } = req.query;

    if (typeof date !== "string") {
        return res.status(400).json({ error: "Invalid date format!" });
    }
    const token = req.headers.authorization?.split(' ')[1];
    const refresh_token = req.body.refresh_token;
    
    supabase.auth.setSession({
        access_token: token,
        refresh_token: refresh_token,
    });


    try {
        const {data} = await supabase.rpc('get_timeslots_with_reservations', { date_param: date });
        const timeslotsWithCapacity : TimeSlot[] = data.map((timeslot) => {
            return {
                id: timeslot.timeslot_id,
                date: timeslot.timeslot_date,
                start_time: timeslot.start_time,
                end_time: timeslot.end_time,
                capacity: timeslot.capacity,
                reservations: timeslot.reservations,
                template_id: timeslot.template_id
            }
        })
        res.status(200).json({ timeslots: timeslotsWithCapacity });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
