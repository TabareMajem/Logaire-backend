import { FileText, FileSpreadsheet, FileCheck, File, LucideIcon } from 'lucide-react';
import { DocumentType } from '@/lib/api/documents'; // Make sure DocumentType is correctly imported

interface DocumentIconProps {
  type: DocumentType;
  className?: string;
}

// Updated iconMap with icons for customs_declaration, certificate_of_origin, and insurance_certificate
const iconMap: Record<DocumentType, LucideIcon> = {
  bill_of_lading: FileText,
  invoice: FileSpreadsheet,
  packing_list: FileCheck,
  other: File,
  commercial_invoice: FileText,
  customs_declaration: File,  // Fallback icon for customs_declaration
  certificate_of_origin: File, // Fallback icon for certificate_of_origin
  insurance_certificate: File, // Fallback icon for insurance_certificate
};

export function DocumentIcon({ type, className }: DocumentIconProps) {
  const Icon = iconMap[type] || File; // Fallback to a default icon if needed
  return <Icon className={className} />;
}
