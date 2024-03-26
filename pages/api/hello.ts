// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import supabase from "../../helpers/supabase"

export default async function handler(req: any, res: any) {
  const {data, error} = await supabase.from('users').select('*');
  res.status(200).json({data, error})
}
