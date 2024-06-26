// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import supabase from "../../../../../helpers/supabase";
import { Data, TimeSlot } from "../../../../../helpers/types/types";
import validateSession from "../../../../../helpers/commonfunctions/setsession";



export default async function handler(req: NextApiRequest, res: NextApiResponse<{error: string}>) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    validateSession(req);

    const { id } = req.query;
    const date : string = req.body.date;
    const adjusted_capacity : number = req.body.adjusted_capacity;
    if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid id format!" });
    }

    if (typeof adjusted_capacity !== "number") {
        return res.status(400).json({ error: "Invalid capacity format!" });
    }


    try {
        const {data, error} = await supabase.from('timeslot_override').upsert({adjusted_capacity: adjusted_capacity, date: date, template: id}, {onConflict: 'date,template'}).select()
        if(error){
            return res.status(500).json({ error: error.message })
        }
        return res.status(200).json({ error: null });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
