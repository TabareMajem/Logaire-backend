import { supabase } from '@/lib/supabase/client';
import { mockAPIs } from './utils/api-mocks';
import { setupTestDatabase } from './utils/db-setup';

beforeAll(async () => {
  // Set up test database
  await setupTestDatabase();
  
  // Set up API mocks
  mockAPIs();
});

afterAll(async () => {
  // Clean up test data
  await supabase.from('agent_executions').delete().neq('id', '');
  await supabase.from('agent_registry').delete().neq('agent_type', '');
}); 