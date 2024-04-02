// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import supabase from "../../../helpers/supabase"
type TimeSlot = {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    capacity: number;
}
type Data = {
    timeslots?: TimeSlot[];
    error?: string;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    if(req.method !== "GET") {
        return res.status(405).json({error: "Method not allowed!"})
    }
    const { date } = req.query
    if (typeof date !== "string") {
        return res.status(400).json({error: "Invalid date format!"})
    }
    // Inside your API route or wherever you need to fetch timeslots
    const { data: timeslots, error } = await supabase
    .rpc('fetch_timeslotsv2', { date_param: date }); // Use the actual date you want to query for

    if (error) {
        return res.status(500).json({error: `An error occurred while fetching timeslots! ${error.message}`})
    } else {
        return res.status(200).json({timeslots})
    }

}
