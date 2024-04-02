// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next"
import supabase from "../../helpers/supabase"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({"message": "Hello World"})
}