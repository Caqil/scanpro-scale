// components/admin/users/user-filters.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface UserFiltersProps {
  filters: {
    tier: string;
    status: string;
    role: string;
  };
  onFilterChange: (filters: {
    tier: string;
    status: string;
    role: string;
  }) => void;
}

export function UserFilters({ filters, onFilterChange }: UserFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const resetFilters = () => {
    onFilterChange({
      tier: "all",
      status: "all",
      role: "all",
    });
  };

  return (
    <div className="flex gap-2">
      <Select
        value={filters.tier}
        onValueChange={(value) => handleFilterChange("tier", value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Account Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.role}
        onValueChange={(value) => handleFilterChange("role", value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={resetFilters}
        disabled={
          filters.tier === "all" &&
          filters.status === "all" &&
          filters.role === "all"
        }
      >
        <Filter className="h-4 w-4" />
      </Button>
    </div>
  );
}
