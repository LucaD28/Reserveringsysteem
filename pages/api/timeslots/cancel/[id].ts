// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import supabase from "../../../../helpers/supabase";
import fetchTimeslots from "../../../../helpers/commonfunctions/fetchtimeslots";
import { Data, Reservation, TimeSlot, TimeSlotType } from "../../../../helpers/types/types";
import { v4 as uuidv4 } from 'uuid'
import validateRequestBody from "../../../../helpers/commonfunctions/validaterequestbody";



export default async function handler(req: NextApiRequest, res: NextApiResponse<{error: string}>) {

    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const validationResult = validateRequestBody(req.body, ['key']);
    if (!validationResult.valid) {
        return res.status(400).json({ error: `Missing required fields: ${validationResult.missingFields?.join(', ')}` });
    }

    const { id } = req.query;

    const key : string = req.body.key;
    if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid uuid format!" });
    }
    if (typeof key !== "string") {
        return res.status(400).json({ error: "Invalid key format!" });
    }

    const {data} = await supabase.from('reservation').select('id').eq('id', id).eq('key', key);  
    if(!data || data?.length === 0){
        return res.status(404).json({ error: "Reservation not found!" })
    }
    const {error} = await supabase.from('reservation').delete().eq('id', id).eq('key', key);
    if(error){
        return res.status(500).json({ error: "Error while deleting reservation!" })
    }
    return res.status(200).json({ error: null })
}
