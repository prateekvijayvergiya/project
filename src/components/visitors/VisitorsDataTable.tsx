import { useState, useMemo, useRef } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpiryAlertBanner } from '@/components/alerts/ExpiryAlertBanner';
import { useVisitors } from '@/hooks/useVisitors';
import { Visitor } from '@/lib/supabase';
import {
  Search,
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Calendar,
  Phone,
  User,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings2,
  UserX,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { format, addMonths, isAfter, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function VisitorsDataTable() {
  const { visitors, loading, updateVisitor, deleteVisitor } = useVisitors();
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // Hide some columns on mobile by default
    notes: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [visitorToDelete, setVisitorToDelete] = useState<Visitor | null>(null);
  const [highlightedVisitors, setHighlightedVisitors] = useState<string[]>([]);
  
  // Refs for scrolling to highlighted visitors
  const tableRef = useRef<HTMLDivElement>(null);
  const visitorRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-300',
      inactive: 'bg-gray-100 text-gray-800 border-gray-300',
      expired: 'bg-red-100 text-red-800 border-red-300',
    };
    return variants[status as keyof typeof variants] || variants.inactive;
  };

  const getSubscriptionBadge = (type: string) => {
    const variants = {
      basic: 'bg-blue-100 text-blue-800 border-blue-300',
      premium: 'bg-purple-100 text-purple-800 border-purple-300',
      vip: 'bg-amber-100 text-amber-800 border-amber-300',
    };
    return variants[type as keyof typeof variants] || variants.basic;
  };

  const getExpiryDate = (startDate: string, duration: number) => {
    return addMonths(new Date(startDate), duration);
  };

  const isExpiringSoon = (startDate: string, duration: number) => {
    const expiryDate = getExpiryDate(startDate, duration);
    const today = new Date();
    const days = differenceInDays(expiryDate, today);
    return days >= 0 && days <= 3;
  };

  const handleStatusToggle = async (visitor: Visitor) => {
    const newStatus = visitor.status === 'active' ? 'inactive' : 'active';
    await updateVisitor(visitor.id, { status: newStatus });
  };

  const handleDeleteClick = (visitor: Visitor) => {
    setVisitorToDelete(visitor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (visitorToDelete) {
      await deleteVisitor(visitorToDelete.id);
      setDeleteDialogOpen(false);
      setVisitorToDelete(null);
    }
  };

  // Handle highlighting expiring visitors
  const handleViewExpiringVisitors = (visitorIds: string[]) => {
    setHighlightedVisitors(visitorIds);
    
    // Scroll to the first highlighted visitor
    if (visitorIds.length > 0 && tableRef.current) {
      setTimeout(() => {
        const firstVisitorRef = visitorRefs.current[visitorIds[0]];
        if (firstVisitorRef) {
          firstVisitorRef.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }

    // Clear highlights after 10 seconds
    setTimeout(() => {
      setHighlightedVisitors([]);
    }, 10000);
  };

  const handleRowClick = (visitor: Visitor) => {
    navigate(`/visitors/${visitor.id}`);
  };

  const columns: ColumnDef<Visitor>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-1 sm:px-2 lg:px-3 text-xs sm:text-sm"
          >
            <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Name</span>
            <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const visitor = row.original;
        const isHighlighted = highlightedVisitors.includes(visitor.id);
        // Responsive: Only show name and duration on mobile
        return (
          <div
            className="flex items-center space-x-2 sm:space-x-3 min-w-0 max-w-[150px] sm:max-w-none cursor-pointer"
            onClick={() => handleRowClick(visitor)}
          >
            <div className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0",
              isHighlighted 
                ? "bg-orange-100 border-2 border-orange-400" 
                : "bg-blue-100"
            )}>
              <span className={cn(
                "font-medium text-xs sm:text-sm",
                isHighlighted ? "text-orange-600" : "text-blue-600"
              )}>
                {visitor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className={cn(
                "font-medium text-xs sm:text-sm truncate",
                isHighlighted ? "text-orange-900" : "text-gray-900"
              )}>
                {visitor.name}
              </div>
              {/* Mobile: show expiry date only */}
              <div className="text-xs text-gray-500 truncate sm:hidden">
                Expires: {format(getExpiryDate(visitor.start_date, visitor.duration), 'MMM dd, yyyy')}
              </div>
              {/* Desktop: show added date */}
              <div className="text-xs text-gray-500 truncate hidden sm:block">
                Added {format(new Date(visitor.created_at), 'MMM dd')}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-1 sm:px-2 lg:px-3 text-xs sm:text-sm"
          >
            <Phone className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Phone</span>
            <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 max-w-[120px] sm:max-w-none">
            <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="font-mono text-xs sm:text-sm truncate">{row.getValue('phone')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'start_date',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-1 sm:px-2 lg:px-3 text-xs sm:text-sm"
          >
            <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">Start Date</span>
            <span className="lg:hidden">Start</span>
            <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('start_date'));
        return (
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 max-w-[100px] sm:max-w-none">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{format(date, 'MMM dd, yy')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'subscription_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('subscription_type') as string;
        return (
          <Badge variant="outline" className={cn(getSubscriptionBadge(type), "text-xs")}>
            {type.charAt(0).toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'duration',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-1 sm:px-2 lg:px-3 text-xs sm:text-sm"
          >
            <Clock className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Duration</span>
            <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const duration = row.getValue('duration') as number;
        const visitor = row.original;
        const expiryDate = getExpiryDate(visitor.start_date, duration);
        const expiringSoon = isExpiringSoon(visitor.start_date, duration);
        const isHighlighted = highlightedVisitors.includes(visitor.id);
        
        return (
          <div className="space-y-1 max-w-[80px] sm:max-w-none">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{duration}m</span>
            </div>
            <div className="text-xs text-gray-500">
              <span className="hidden sm:inline">Expires: </span>
              {format(expiryDate, 'MMM dd')}
              {(expiringSoon || isHighlighted) && (
                <Badge variant="outline" className={cn(
                  "ml-1 text-xs",
                  isHighlighted 
                    ? "bg-orange-100 text-orange-800 border-orange-300 animate-pulse"
                    : "bg-orange-100 text-orange-800 border-orange-300"
                )}>
                  !
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant="outline" className={cn(getStatusBadge(status), "text-xs")}>
            {status.charAt(0).toUpperCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }) => {
        const notes = row.getValue('notes') as string;
        if (!notes) {
          return <span className="text-gray-400 text-xs">-</span>;
        }
        return (
          <div className="max-w-[100px] sm:max-w-xs">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate" title={notes}>
                {notes.length > 15 ? `${notes.slice(0, 15)}...` : notes}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const visitor = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Visitor
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusToggle(visitor)}>
                {visitor.status === 'active' ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(visitor)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filteredData = useMemo(() => {
    if (!globalFilter) return visitors;
    
    return visitors.filter((visitor) =>
      visitor.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
      visitor.phone.toLowerCase().includes(globalFilter.toLowerCase())
    );
  }, [visitors, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return (
      <div className="space-y-4 pb-20 lg:pb-6 w-full max-w-full overflow-x-hidden">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-6 w-full max-w-full overflow-x-hidden">
      <div className="w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">All Visitors</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Comprehensive list of all gym visitors</p>
      </div>

      {/* Expiry Alert Banner */}
      <ExpiryAlertBanner onViewExpiring={handleViewExpiringVisitors} />

      <Card className="shadow-lg border-0 w-full max-w-full overflow-hidden" ref={tableRef}>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-3 sm:p-4 lg:p-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Visitors Database</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                  {filteredData.length} visitor{filteredData.length !== 1 ? 's' : ''} found
                  {highlightedVisitors.length > 0 && (
                    <span className="ml-2 text-orange-600 font-medium">
                      ({highlightedVisitors.length} highlighted)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    <Settings2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Columns</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3 sm:p-4 lg:p-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
              <Input
                placeholder="Search by name or phone..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8 sm:pl-10 h-9 sm:h-11 text-sm w-full"
              />
            </div>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm flex-shrink-0">
              <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Filters
            </Button>
          </div>

          {/* Data Table */}
          <div className="rounded-md border bg-white w-full overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-50">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="font-semibold text-gray-900 text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    const visitor = row.original;
                    const isHighlighted = highlightedVisitors.includes(visitor.id);
                    
                    return (
                      <>
                        {/* Mobile: show only name and duration, whole row clickable */}
                        <TableRow
                          key={row.id + '-mobile'}
                          className="sm:hidden cursor-pointer hover:bg-gray-50"
                          onClick={() => handleRowClick(visitor)}
                        >
                          <TableCell colSpan={columns.length} className="py-3 px-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                {visitor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 truncate">{visitor.name}</div>
                                <div className="text-xs text-gray-500">Expires: {format(getExpiryDate(visitor.start_date, visitor.duration), 'MMM dd, yyyy')}</div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                        {/* Desktop: show full details */}
                        <TableRow
                          key={row.id + '-desktop'}
                          ref={(el) => { visitorRefs.current[visitor.id] = el; }}
                          data-state={row.getIsSelected() && 'selected'}
                          className={cn(
                            'hidden sm:table-row hover:bg-gray-50 transition-all duration-300',
                            isHighlighted && 'bg-orange-50 border-l-4 border-orange-400 shadow-md'
                          )}
                          onClick={() => handleRowClick(visitor)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-2 sm:py-4 px-2 sm:px-4">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      </>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <UserX className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                        <div>
                          <p className="text-gray-500 font-medium text-sm sm:text-base">No visitors found</p>
                          <p className="text-xs sm:text-sm text-gray-400">
                            {globalFilter 
                              ? 'Try adjusting your search terms'
                              : 'Add your first visitor to get started'
                            }
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-2 py-4">
            <div className="flex-1 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-xs sm:text-sm font-medium">Rows per page</p>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                  }}
                  className="h-7 sm:h-8 w-[60px] sm:w-[70px] rounded border border-input bg-background px-2 sm:px-3 py-1 text-xs sm:text-sm"
                >
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-xs sm:text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-6 w-6 sm:h-8 sm:w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-6 w-6 sm:h-8 sm:w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="mx-4 sm:mx-auto max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Delete Visitor</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{visitorToDelete?.name}</strong>? 
              This action cannot be undone and will permanently remove all visitor data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              Delete Visitor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}