import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export class DocumentCommandHandlers {
  private supabase = supabase;;

  async listRecentDocuments(): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .select('title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      if (!data.length) {
        return "You don't have any recent documents.";
      }

      const documents = data.map(doc => 
        `${doc.title} (${doc.status})`
      ).join(', ');

      return `Your recent documents are: ${documents}`;
    } catch (error) {
      ErrorLogger.error('List documents command failed', error as Error);
      return "I couldn't retrieve your recent documents.";
    }
  }

  async checkDocumentStatus(params: { reference: string }): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .select('status, updated_at')
        .eq('reference', params.reference)
        .single();

      if (error) throw error;

      return `Document ${params.reference} is currently ${data.status}`;
    } catch (error) {
      ErrorLogger.error('Check document status command failed', error as Error);
      return `I couldn't find document ${params.reference}`;
    }
  }
}