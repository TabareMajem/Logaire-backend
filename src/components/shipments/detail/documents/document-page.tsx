"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Upload, FileText, FileSpreadsheet, FileImage, Package, File } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../../components/ui/dialog';
import { Badge } from '../../../../../components/ui/badge';
import { Skeleton } from '../../../../../components/ui/skeleton';

// Types
interface Document {
  id: string;
  file_name: string;
  file_size: number;
  type: 'invoice' | 'packing_list' | 'certificate' | 'customs' | 'other';
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  version: number;
  created_at: string;
}

// Mock data
const mockDocuments: Document[] = [
  {
    id: '1',
    file_name: 'Invoice-2024-001.pdf',
    file_size: 1024576,
    type: 'invoice',
    status: 'approved',
    version: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    file_name: 'Packing-List-2024-001.xlsx',
    file_size: 2048576,
    type: 'packing_list',
    status: 'pending',
    version: 1,
    created_at: new Date().toISOString(),
  },
];

// Document Icon component
const DocumentIcon = ({ type }: { type: Document['type'] }) => {
  const iconMap = {
    invoice: FileText,
    packing_list: FileSpreadsheet,
    certificate: FileImage,
    customs: Package,
    other: File,
  };
  
  const Icon = iconMap[type] || File;
  return <Icon className="h-6 w-6" />;
};

// Document List Item component
const DocumentItem = ({ document }: { document: Document }) => {
  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
  };

  const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    return `${minutes} minutes ago`;
  };

  const statusVariant: Record<Document['status'], 'default' | 'secondary' | 'destructive'> = {
    draft: 'secondary',
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
  };

  return (
    <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="p-2 bg-muted rounded-lg">
        <DocumentIcon type={document.type} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium truncate">{document.file_name}</h4>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{formatBytes(document.file_size)}</span>
              <span>•</span>
              <span>Version {document.version}</span>
              <span>•</span>
              <span>{formatTimeAgo(document.created_at)}</span>
            </div>
          </div>
          <Badge variant={statusVariant[document.status]}>
            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </Badge>
        </div>
      </div>
    </div>
  );
};

// Document List component
const DocumentList = ({ documents, isLoading }: { documents?: Document[], isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-20" />
                <div className="w-1 h-1 rounded-full bg-muted" />
                <Skeleton className="h-4 w-24" />
                <div className="w-1 h-1 rounded-full bg-muted" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!documents?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No documents found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <DocumentItem key={document.id} document={document} />
      ))}
    </div>
  );
};

// Main Page Component
export function DocumentPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    // Simulate API call
    const fetchDocuments = () => {
      setTimeout(() => {
        setDocuments(mockDocuments);
        setIsLoading(false);
      }, 1000);
    };

    fetchDocuments();
  }, []);

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || doc.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return a.file_name.localeCompare(b.file_name);
        case 'size':
          return b.file_size - a.file_size;
        default:
          return 0;
      }
    });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your documents
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input type="file" />
              <Button className="w-full">Upload</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">All Documents</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    className="pl-8 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-36">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="invoice">Invoices</SelectItem>
                    <SelectItem value="packing_list">Packing Lists</SelectItem>
                    <SelectItem value="certificate">Certificates</SelectItem>
                    <SelectItem value="customs">Customs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="m-0">
              <DocumentList documents={filteredDocuments} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="pending" className="m-0">
              <DocumentList 
                documents={filteredDocuments.filter(doc => doc.status === 'pending')}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="approved" className="m-0">
              <DocumentList
                documents={filteredDocuments.filter(doc => doc.status === 'approved')}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="rejected" className="m-0">
              <DocumentList
                documents={filteredDocuments.filter(doc => doc.status === 'rejected')}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}