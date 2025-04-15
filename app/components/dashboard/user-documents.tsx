"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  Search,
  MoreVertical,
  Trash2,
  Share2,
  Plus,
  FileUp,
  File,
  Filter,
} from "lucide-react";

interface UserDocumentsProps {
  userId: string;
}

export function UserDocuments({ userId }: UserDocumentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");

  // Mock document data
  const mockDocuments = [
    {
      id: "doc-1",
      name: "Business Proposal.pdf",
      type: "pdf",
      size: "2.4 MB",
      created: "2025-03-25T12:34:56",
      lastAccessed: "2025-03-27T09:12:34",
      action: "convert",
      result: "Business Proposal.docx",
    },
    {
      id: "doc-2",
      name: "Financial Report.pdf",
      type: "pdf",
      size: "5.1 MB",
      created: "2025-03-24T10:22:33",
      lastAccessed: "2025-03-26T14:32:10",
      action: "compress",
      result: "Financial Report (compressed).pdf",
    },
    {
      id: "doc-3",
      name: "Marketing Presentation.pptx",
      type: "pptx",
      size: "7.8 MB",
      created: "2025-03-23T15:45:12",
      lastAccessed: "2025-03-25T11:23:45",
      action: "convert",
      result: "Marketing Presentation.pdf",
    },
    {
      id: "doc-4",
      name: "Contract Document.pdf",
      type: "pdf",
      size: "1.2 MB",
      created: "2025-03-22T09:15:23",
      lastAccessed: "2025-03-24T16:54:32",
      action: "sign",
      result: "Contract Document (signed).pdf",
    },
    {
      id: "doc-5",
      name: "Project Timeline.xlsx",
      type: "xlsx",
      size: "845 KB",
      created: "2025-03-21T14:30:45",
      lastAccessed: "2025-03-23T10:11:22",
      action: "convert",
      result: "Project Timeline.pdf",
    },
    {
      id: "doc-6",
      name: "Team Photo.jpg",
      type: "jpg",
      size: "3.2 MB",
      created: "2025-03-20T11:22:33",
      lastAccessed: "2025-03-22T09:44:55",
      action: "convert",
      result: "Team Photo.pdf",
    },
    {
      id: "doc-7",
      name: "Employee Handbook.pdf",
      type: "pdf",
      size: "4.7 MB",
      created: "2025-03-19T16:17:18",
      lastAccessed: "2025-03-21T13:14:15",
      action: "protect",
      result: "Employee Handbook (protected).pdf",
    },
  ];

  // Filter documents based on tab and search query
  const filteredDocuments = mockDocuments.filter((doc) => {
    // Filter by tab
    if (currentTab !== "all" && doc.action !== currentTab) {
      return false;
    }

    // Filter by search query
    if (
      searchQuery &&
      !doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Your Documents</CardTitle>
              <CardDescription>
                View and manage your processed documents
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter tabs and search */}
          <div className="mb-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs
              defaultValue="all"
              onValueChange={setCurrentTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="convert">Converted</TabsTrigger>
                <TabsTrigger value="compress">Compressed</TabsTrigger>
                <TabsTrigger value="sign">Signed</TabsTrigger>
                <TabsTrigger value="protect">Protected</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Documents table */}
          {filteredDocuments.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getFileIcon(doc.type)}
                          <span>{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(doc.created)}</TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell className="capitalize">{doc.action}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-primary"
                        >
                          <Download className="h-4 w-4" />
                          {doc.result}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {searchQuery
                  ? `No documents matching "${searchQuery}"`
                  : "Upload your first document to get started"}
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          )}
        </CardContent>
        {filteredDocuments.length > 0 && (
          <CardFooter className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredDocuments.length} of {mockDocuments.length} documents
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}