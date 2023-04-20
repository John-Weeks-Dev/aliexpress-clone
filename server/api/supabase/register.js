import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // const user = await serverSupabaseUser(event)
    const client = serverSupabaseClient(event)
    const { data, error } = await client.auth.signUp(
        {
            email: body.email,
            password: body.password,
            // options: {
            //     data: {
            //         first_name: firstName.value,
            //         last_name: lastName.value,
            //     }
            // }
        }
    )

    if (error) {
        console.log(error)
        throw createError({ 
            statusCode: error.status, 
            statusMessage: error.message
        })
    }

    return data
  })