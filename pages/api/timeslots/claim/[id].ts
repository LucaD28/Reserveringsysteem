// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import supabase from "../../../../helpers/supabase";
import fetchTimeslots from "../../../../helpers/commonfunctions/fetchtimeslots";
import { Data, Reservation, TimeSlot, TimeSlotType } from "../../../../helpers/types/types";
import { v4 as uuidv4 } from 'uuid'
import validateRequestBody from "../../../../helpers/commonfunctions/validaterequestbody";



export default async function handler(req: NextApiRequest, res: NextApiResponse<{error: string}>) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    // const validationResult = validateRequestBody(req.body, ['date', 'type', 'email', 'name']);
    // if (!validationResult.valid) {
    //     return res.status(400).json({ error: `Missing required fields: ${validationResult.missingFields?.join(', ')}` });
    // }

    const { id } = req.query;

    const date: string = req.body.date;
    const type: TimeSlotType = req.body.type;
    const email: string = req.body.email;
    const name : string = req.body.name;

    if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid uuid format!" });
    }

    if (type !== "timeslot_override" && type !== "timeslot_template"){
        return res.status(400).json({ error: "Property 'type' must be of value 'timeslot_template' or 'timeslot_override'!"})
    }

    try {
        const timeslotsWithCapacity : TimeSlot[] = await fetchTimeslots(date);
        const requestedTimeslot: TimeSlot | undefined = timeslotsWithCapacity.find(timeslot => timeslot.id === id);

        if (requestedTimeslot) {
            const reservation : Reservation = {
                id: uuidv4(),
                email: email,
                name: name,
                date: date,
                status: 'Confirmed',
                timeslot_override: type == 'timeslot_override' ? id : null,
                timeslot_template: type == 'timeslot_template' ? id : null,
            }
            const {data, error} = await supabase.from('reservation').insert(reservation)
            if(error){
                return res.status(500).json({error: error.message})
            }else{
                return res.status(200).json({error: null})
            }
        } else {
            return res.status(400).json({ error: `No open spot available for the requested timeslot!` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
