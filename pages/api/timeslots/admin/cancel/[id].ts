// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import supabase from "../../../../../helpers/supabase";
import validateSession from "../../../../../helpers/commonfunctions/setsession";




export default async function handler(req: NextApiRequest, res: NextApiResponse<{error: string}>) {

    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed!" });
    }
    
    validateSession(req);
    const { id } = req.query;


    if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid uuid format!" });
    }

    const {data} = await supabase.from('reservation').select('id').eq('id', id)
    if(!data || data?.length === 0){
        return res.status(404).json({ error: "Reservation not found!" })
    }

    const {error} = await supabase.from('reservation').delete().eq('id', id)
    if(error){
        return res.status(500).json({ error: "Error while deleting reservation!" })
    }

    return res.status(200).json({ error: null })
}
