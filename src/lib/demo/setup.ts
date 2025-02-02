// src/lib/demo/setup.ts


import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export async function setupDemoAccount() {
  console.log("------------------------\n\n\nsetup.ts setupDemoAccount got invoked\n\n\n------------------------");
  try {
    // Check if demo user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', 'eq.demo@freightflow.com')
      .single();

    console.log(`------------------------\n\n\nexisting user api got called ${existingUser ? existingUser : 'No user found'}\n\n\n and \n\n\n ${checkError ? checkError.message : 'No error'}------------------------`);

    // If no user exists, create a new one
    if (!existingUser && !checkError) {
      console.log(`------------------------\n\n\ninside if means creating new user ${existingUser}\n\n\n------------------------`);
      const { error: createError } = await supabase.auth.signUp({
        email: 'demo@freightflow.com',
        password: 'demo123456',  // Ensure this is strong enough if required
        options: {
          data: {
            is_demo: true,
            name: 'Demo User',
            role: 'user'
          }
        }
      });

      if (createError) {
        console.error('Error creating demo user:', createError.message);
        throw createError;
      }
    }
  } catch (error) {
    ErrorLogger.error('Demo account setup failed', error as Error);
    throw error;
  }
}



// import { supabase } from '@/lib/supabase/client';
// import { ErrorLogger } from '@/lib/errors/logger';

// export async function setupDemoAccount() {
//   console.log("------------------------\n\n\nsetup.ts setupDemoAccount got invoked\n\n\n------------------------");
//   try {
//     // Create demo user if it doesn't exist
//     const { data: existingUser, error: checkError } = await supabase
//       .from('user_profiles')
//       .select('id')
//       .eq('email', 'eq.demo@freightflow.com')
//       .single();

//       console.log(`------------------------\n\n\nexisting user api got called ${existingUser}\n\n\n and \n\n\n ${checkError}------------------------`);

//     if (!existingUser || !checkError) {
//       console.log(`------------------------\n\n\ninside if means creating new user ${existingUser}\n\n\n------------------------`);
//       // Create demo user
//       const { error: createError } = await supabase.auth.signUp({
//         email: 'demo@freightflow.com',
//         password: 'demo123456',
//         options: {
//           data: {
//             is_demo: true,
//             name: 'Demo User',
//             role: 'user'
//           }
//         }
//       });

//       if (createError) throw createError;
//     }
//   } catch (error) {
//     ErrorLogger.error('Demo account setup failed', error as Error);
//     throw error;
//   }
// }
