import { useParams, useNavigate } from 'react-router-dom';
import { useVisitors } from '@/hooks/useVisitors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, Calendar, Clock, User, FileText, Star } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function VisitorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { visitors, updateVisitor } = useVisitors();
  const visitor = visitors.find(v => v.id === id);

  // Renew dialog state
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewType, setRenewType] = useState<'basic' | 'premium' | 'vip'>(visitor?.subscription_type || 'basic');
  const [renewDuration, setRenewDuration] = useState<number>(visitor?.duration || 1);
  const [renewLoading, setRenewLoading] = useState(false);

  if (!visitor) {
    return (
      <div className="p-6 text-center text-gray-500">Visitor not found.</div>
    );
  }

  const initials = visitor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleRenew = async () => {
    setRenewLoading(true);
    try {
      await updateVisitor(visitor.id, {
        subscription_type: renewType,
        duration: renewDuration,
        start_date: new Date().toISOString().slice(0, 10),
        status: 'active',
      });
      setRenewOpen(false);
    } finally {
      setRenewLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 px-2 sm:px-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-4 bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
      </Button>
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-t-xl p-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg mb-3 border-4 border-blue-200">
            <span className="text-3xl font-bold text-blue-700">{initials}</span>
          </div>
          <CardTitle className="text-2xl font-bold text-white text-center w-full truncate">{visitor.name}</CardTitle>
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            <Badge className="bg-white text-blue-700 border-blue-200 font-semibold text-xs px-3 py-1 shadow">{visitor.subscription_type}</Badge>
            <Badge className="bg-white text-green-700 border-green-200 font-semibold text-xs px-3 py-1 shadow capitalize">{visitor.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6 bg-white rounded-b-xl">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-gray-700">{visitor.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-indigo-500" />
            <span className="font-medium text-gray-700">Start Date: {visitor.start_date}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-500" />
            <span className="font-medium text-gray-700">Duration: {visitor.duration} month(s)</span>
          </div>
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="font-medium text-gray-700">Subscription: {visitor.subscription_type}</span>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Status: {visitor.status}</span>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <div className="font-semibold text-gray-700 mb-1">Notes</div>
              <div className="text-gray-600 text-sm">{visitor.notes || <span className="text-gray-400">No notes</span>}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-500">Created: {visitor.created_at}</span>
          </div>
          <div className="flex justify-end">
            <AlertDialog open={renewOpen} onOpenChange={setRenewOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-4 py-2 rounded shadow">
                  Renew
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Renew Subscription</AlertDialogTitle>
                  <AlertDialogDescription>
                    Update the subscription type and duration for this visitor.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Subscription Type</label>
                    <Select value={renewType} onValueChange={v => setRenewType(v as 'basic' | 'premium' | 'vip')}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (months)</label>
                    <Select value={String(renewDuration)} onValueChange={v => setRenewDuration(Number(v))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 month</SelectItem>
                        <SelectItem value="3">3 months</SelectItem>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={renewLoading}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRenew} disabled={renewLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {renewLoading ? 'Renewing...' : 'Ok'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 