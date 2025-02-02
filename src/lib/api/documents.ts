"use client";

import { supabase } from '@/lib/supabase/client';
import { ErrorLogger } from '@/lib/errors/logger';

export type DocumentType = 'bill_of_lading' | 'commercial_invoice' | 'packing_list' | 'customs_declaration' | 'certificate_of_origin' | 'insurance_certificate' | 'other' | 'invoice';
export type DocumentStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'final';

export type Document = ShipmentDocument;

export interface ShipmentDocument {
  id: string;
  shipment_id: string;
  type: DocumentType;
  status: DocumentStatus;
  file_key: string;
  file_name: string;
  file_size: number;
  metadata: Record<string, any>;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  title: string; // New field
  size: string;  // New field
  url: string;   // New field
}

export async function fetchShipmentDocuments(shipmentId: string): Promise<ShipmentDocument[]> {
  try {
    
    const { data, error } = await supabase
      .from('shipment_documents')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorLogger.error('Failed to fetch shipment documents', error as Error);
    throw error;
  }
}

export async function uploadDocument(params: {
  shipmentId: string;
  type: DocumentType;
  file: File;
  metadata?: Record<string, any>;
}): Promise<ShipmentDocument> {
  try {
    
    
    // Upload file to storage
    const fileKey = `documents/${params.shipmentId}/${Date.now()}-${params.file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('shipment-documents')
      .upload(fileKey, params.file);

    if (uploadError) throw uploadError;

    // Get the file size
    const fileSize = formatBytes(params.file.size);  // Add a utility function to format the file size (e.g., 1.2MB)

    // Generate the document URL
    const { data: publicUrlData } = supabase.storage.from('shipment-documents').getPublicUrl(fileKey);
    const publicURL = publicUrlData.publicUrl;  // Using a different variable name to avoid conflict

    // Create document record
    const { data: documentData, error } = await supabase
      .from('shipment_documents')
      .insert({
        shipment_id: params.shipmentId,
        type: params.type,
        file_key: fileKey,
        file_name: params.file.name,
        file_size: params.file.size,
        metadata: params.metadata || {},
        title: params.file.name, // You can use the file name or extract it from metadata
        size: fileSize,  // Store formatted size
        url: publicURL,   // URL for the file
      })
      .select()
      .single();

    if (error) throw error;
    return documentData;
  } catch (error) {
    ErrorLogger.error('Failed to upload document', error as Error);
    throw error;
  }
}


export async function deleteDocument(documentId: string): Promise<void> {
  try {
    
    
    // Get document to find file key
    const { data: document, error: fetchError } = await supabase
      .from('shipment_documents')
      .select('file_key')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('shipment-documents')
      .remove([document.file_key]);

    if (storageError) throw storageError;

    // Delete document record
    const { error: deleteError } = await supabase
      .from('shipment_documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) throw deleteError;
  } catch (error) {
    ErrorLogger.error('Failed to delete document', error as Error);
    throw error;
  }
}

export async function downloadDocument(documentId: string): Promise<void> {
  try {
    
    
    // Get document details
    const { data: documentData, error: fetchError } = await supabase
      .from('shipment_documents')
      .select('file_key, file_name')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;

    // Get download URL
    const { data, error: downloadError } = await supabase.storage
      .from('shipment-documents')
      .createSignedUrl(documentData.file_key, 60);

    if (downloadError) throw downloadError;

    // Trigger download
    const link = document.createElement('a'); // Global document object
    link.href = data.signedUrl;
    link.download = documentData.file_name; // Renamed to documentData
    document.body.appendChild(link); // Global document object
    link.click();
    document.body.removeChild(link); // Global document object
  } catch (error) {
    ErrorLogger.error('Failed to download document', error as Error);
    throw error;
  }
}

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}
