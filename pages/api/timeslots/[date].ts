// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import supabase from "../../../helpers/supabase"
import { Data } from "../../../helpers/types/types"
//NOT USED
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    if(req.method !== "GET") {
        return res.status(405).json({error: "Method not allowed!"})
    }
    const { date } = req.query
    if (typeof date !== "string") {
        return res.status(400).json({error: "Invalid date format!"})
    }
    
    const { data: timeslots, error } = await supabase.rpc('fetch_timeslots', { date_param: date });

    if (error) {
        return res.status(500).json({error: `An error occurred while fetching timeslots! ${error.message}`})
    } else {
        return res.status(200).json({timeslots})
    }

}
