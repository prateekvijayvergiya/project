import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useVisitors } from '@/hooks/useVisitors';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserPlus, 
  Save, 
  X, 
  Calendar as CalendarIcon,
  Phone,
  User,
  Clock,
  FileText,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface VisitorFormData {
  name: string;
  phone: string;
  start_date: string;
  subscription_type: 'basic' | 'premium' | 'vip';
  duration: number;
  status: 'active' | 'inactive' | 'expired';
  notes: string;
}

interface VisitorFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<VisitorFormData>;
  mode?: 'create' | 'edit';
}

export function VisitorForm({ 
  onSuccess, 
  onCancel, 
  initialData,
  mode = 'create' 
}: VisitorFormProps) {
  const { addVisitor } = useVisitors();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData?.start_date ? new Date(initialData.start_date) : new Date()
  );

  const [formData, setFormData] = useState<VisitorFormData>({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    start_date: initialData?.start_date || format(new Date(), 'yyyy-MM-dd'),
    subscription_type: initialData?.subscription_type || 'basic',
    duration: initialData?.duration || 1,
    status: initialData?.status || 'active',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Partial<Omit<VisitorFormData, 'duration'> & { duration?: string }>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Omit<VisitorFormData, 'duration'> & { duration?: string }> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (![1, 3, 6, 12].includes(formData.duration)) {
      newErrors.duration = 'Please select a valid duration';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) return;

    setIsSubmitting(true);

    try {
      await addVisitor({ ...formData, user_id: user.id });
      
      // Reset form on success
      if (mode === 'create') {
        setFormData({
          name: '',
          phone: '',
          start_date: format(new Date(), 'yyyy-MM-dd'),
          subscription_type: 'basic',
          duration: 1,
          status: 'active',
          notes: '',
        });
        setSelectedDate(new Date());
      }

      onSuccess?.();
    } catch (error) {
      // Error is handled in the hook with toast
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof VisitorFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      handleInputChange('start_date', format(date, 'yyyy-MM-dd'));
      setCalendarOpen(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      subscription_type: 'basic',
      duration: 1,
      status: 'active',
      notes: '',
    });
    setSelectedDate(new Date());
    setErrors({});
  };

  const subscriptionOptions = [
    { value: 'basic', label: 'Basic', description: 'Standard gym access' },
    { value: 'premium', label: 'Premium', description: 'Gym + group classes' },
    { value: 'vip', label: 'VIP', description: 'Full access + personal training' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'text-green-600' },
    { value: 'inactive', label: 'Inactive', color: 'text-gray-600' },
    { value: 'expired', label: 'Expired', color: 'text-red-600' },
  ];

  // Updated duration options - only 1, 3, 6, 12 months
  const durationOptions = [
    { value: 1, label: '1 month' },
    { value: 3, label: '3 months' },
    { value: 6, label: '6 months' },
    { value: 12, label: '12 months' },
  ];

  return (
    <div className="space-y-3 sm:space-y-4 pb-16 lg:pb-6 w-full">
      <Card className="shadow-lg border-0 bg-white w-full">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-3 sm:p-4">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
              <UserPlus className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {mode === 'create' ? 'Add New Visitor' : 'Edit Visitor'}
              </h3>
              <p className="text-xs text-gray-600 mt-1 truncate">
                {mode === 'create' 
                  ? 'Register a new gym visitor with their subscription details'
                  : 'Update visitor information and subscription details'
                }
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3 sm:p-4">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Personal Information Section */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <h4 className="text-sm sm:text-base font-semibold text-gray-900">Personal Information</h4>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter visitor's full name"
                    className={cn(
                      "h-9 sm:h-10 transition-colors text-sm",
                      errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <X className="h-3 w-3" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className={cn(
                        "h-9 sm:h-10 pl-8 transition-colors text-sm",
                        errors.phone && "border-red-500 focus:border-red-500 focus:ring-red-500"
                      )}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <X className="h-3 w-3" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Subscription Details Section */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <h4 className="text-sm sm:text-base font-semibold text-gray-900">Subscription Details</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="start_date" className="text-sm font-medium text-gray-700">
                    Start Date *
                  </Label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-9 sm:h-10 justify-start text-left font-normal bg-white hover:bg-gray-50 text-gray-700 text-sm",
                          !selectedDate && "text-muted-foreground",
                          errors.start_date && "border-red-500"
                        )}
                        disabled={isSubmitting}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-auto p-0 bg-white border shadow-lg" 
                      align="start"
                      style={{ backgroundColor: 'white' }}
                    >
                      <div className="bg-white rounded-md border shadow-md p-3">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          initialFocus
                          className="bg-white"
                          style={{ backgroundColor: 'white' }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  {errors.start_date && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <X className="h-3 w-3" />
                      <span>{errors.start_date}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="subscription_type" className="text-sm font-medium text-gray-700">
                    Subscription Type *
                  </Label>
                  <Select 
                    value={formData.subscription_type} 
                    onValueChange={(value) => handleInputChange('subscription_type', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-9 sm:h-10 text-sm">
                      <SelectValue placeholder="Select subscription type" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-gray-500">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                    Duration *
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                    <Select 
                      value={formData.duration.toString()} 
                      onValueChange={(value) => handleInputChange('duration', parseInt(value))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-9 sm:h-10 pl-8 text-sm">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.duration && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <X className="h-3 w-3" />
                      <span>{errors.duration}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status *
                  </Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-9 sm:h-10 text-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className={option.color}>{option.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <h4 className="text-sm sm:text-base font-semibold text-gray-900">Additional Information</h4>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about the visitor (optional)..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  Optional: Add any special requirements, preferences, or important information
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel || resetForm}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 text-sm h-9"
              >
                <X className="h-3 w-3 mr-2" />
                {onCancel ? 'Cancel' : 'Reset Form'}
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm h-9"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>
                      {mode === 'create' ? 'Adding Visitor...' : 'Updating Visitor...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-3 w-3" />
                    <span>
                      {mode === 'create' ? 'Add Visitor' : 'Update Visitor'}
                    </span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}