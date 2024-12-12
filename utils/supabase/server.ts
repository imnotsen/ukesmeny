/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  try {
    const cookieStore = cookies()
    
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => {
            try {
              return cookieStore.getAll().map((cookie) => ({
                name: cookie.name,
                value: cookie.value,
              }))
            } catch (error) {
              console.error('Error getting cookies:', error)
              return []
            }
          },
          setAll: (cookiesList) => {
            try {
              cookiesList.map((cookie) => {
                cookieStore.set(cookie.name, cookie.value, cookie.options)
              })
            } catch (error) {
              console.error('Error setting cookies:', error)
            }
          },
        },
      }
    )
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    throw new Error('Failed to initialize Supabase client')
  }
}