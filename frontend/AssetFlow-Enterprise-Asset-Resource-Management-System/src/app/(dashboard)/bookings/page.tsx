'use client';

import { useMemo, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// react-big-calendar is untyped here, so define the view union locally.
type View = 'month' | 'week' | 'work_week' | 'day' | 'agenda';
import { useQuery } from '@tanstack/react-query';

import { Calendar, List, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BookingFormDialog } from '@/components/bookings/BookingFormDialog';
import { bookingApi } from '@/services/api/booking.api';
import { Booking } from '@/types';
import { BOOKING_STATUS_CONFIG } from '@/utils/constants';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

const assetName = (b: Booking) =>
  typeof b.asset === 'object' && b.asset ? b.asset.name : 'Asset';
const employeeName = (b: Booking) =>
  typeof b.employee === 'object' && b.employee ? b.employee.name : 'Employee';

export default function BookingsPage() {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingApi.list({ limit: 100 }),
  });

  const bookings: Booking[] = useMemo(() => data?.data ?? [], [data]);

  const events = useMemo(
    () =>
      bookings.map((b) => ({
        id: b._id,
        title: `${assetName(b)} — ${employeeName(b)}`,
        start: new Date(b.start_datetime),
        end: new Date(b.end_datetime),
        status: b.status,
      })),
    [bookings]
  );

  const eventStyleGetter = (event: { status?: string }) => {
    let backgroundColor = '#4f46e5';
    if (event.status === 'Cancelled') backgroundColor = '#dc2626';
    if (event.status === 'Completed') backgroundColor = '#059669';
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
      },
    };
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Bookings</h1>
          <p className="text-muted-foreground mt-1">
            Manage reservations for shared spaces, vehicles, and equipment.
          </p>
        </div>
        <BookingFormDialog onSuccess={() => refetch()} />
      </div>

      <Tabs defaultValue="list" className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between shrink-0 mb-4">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" /> List View
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Calendar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="flex-1 mt-0 overflow-y-auto">
          <div className="rounded-xl border bg-white dark:bg-zinc-950 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => {
                    const cfg = BOOKING_STATUS_CONFIG[booking.status];
                    return (
                      <TableRow key={booking._id}>
                        <TableCell className="font-medium">{assetName(booking)}</TableCell>
                        <TableCell>{employeeName(booking)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(booking.start_datetime), 'MMM d, yyyy h:mm a')}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(booking.end_datetime), 'MMM d, yyyy h:mm a')}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cfg ? `${cfg.bg} ${cfg.text} border-0` : ''}
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent
          value="calendar"
          className="flex-1 mt-0 h-full border rounded-xl bg-white dark:bg-zinc-950 overflow-hidden relative p-4"
        >
          <div className="h-full w-full calendar-container">
            <style jsx global>{`
              .calendar-container .rbc-calendar { font-family: inherit; }
              .calendar-container .rbc-toolbar button { color: inherit; border-radius: 6px; }
              .calendar-container .rbc-toolbar button.rbc-active {
                background-color: rgba(79, 70, 229, 0.1);
                color: #4f46e5;
                box-shadow: none;
              }
              .calendar-container .rbc-today { background-color: rgba(79, 70, 229, 0.05); }
              .dark .calendar-container .rbc-off-range-bg { background-color: rgba(0,0,0,0.2); }
              .dark .calendar-container .rbc-month-view,
              .dark .calendar-container .rbc-time-view,
              .dark .calendar-container .rbc-header { border-color: #27272a; }
              .dark .calendar-container .rbc-day-bg + .rbc-day-bg { border-color: #27272a; }
            `}</style>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              view={view}
              onView={(newView: View) => setView(newView)}
              date={date}
              onNavigate={(newDate: Date) => setDate(newDate)}
              eventPropGetter={eventStyleGetter}
              popup
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
