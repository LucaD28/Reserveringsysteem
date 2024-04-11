// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import supabase from "../../../../../helpers/supabase";
import { Data, TimeSlot } from "../../../../../helpers/types/types";
import validateSession from "../../../../../helpers/commonfunctions/setsession";



export default async function handler(req: NextApiRequest, res: NextApiResponse<{error: string}>) {

    if (req.method !== "PUT") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    validateSession(req);

    const duration = req.body.duration;

    if (typeof duration !== "number") {
        return res.status(400).json({ error: "Invalid duration format!" });
    }

    try {
        const {error} = await supabase.rpc('update_setting_value', {setting_name_param: 'timeslot_duration', value_param: duration})
        if(error){
            return res.status(500).json({error: error.message})
        }
        return res.status(200).json({ error: null });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
