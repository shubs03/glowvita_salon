import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { FaStar } from 'react-icons/fa';

interface Feedback {
  client: string;
  comment: string;
  rating: number;
  date: string;
  entityType?: string;
}

export function ClientFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClientFeedback = async () => {
      try {
        const response = await fetch('/api/crm/vendor/metrics/reviews');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setFeedback(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching client feedback:', error);
        // Fallback to mock data on error
        const mockFeedback = [
          { client: 'Sarah L.', comment: "Amazing service! My nails have never looked better.", rating: 5, date: 'Aug 20, 2024', entityType: 'Service' },
          { client: 'Michael B.', comment: "Great haircut, and the conversation was even better.", rating: 5, date: 'Aug 19, 2024', entityType: 'Service' },
          { client: 'Jessica P.', comment: "Very relaxing spa day. Just what I needed.", rating: 4, date: 'Aug 19, 2024', entityType: 'Service' },
          { client: 'David R.', comment: "Good service, but a bit of a wait.", rating: 3, date: 'Aug 18, 2024', entityType: 'Product' },
        ];
        setFeedback(mockFeedback);
      } finally {
        setLoading(false);
      }
    };

    fetchClientFeedback();
  }, []);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Recent Client Feedback</CardTitle>
          <CardDescription>What your clients are saying about their recent visits.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Client Feedback</CardTitle>
        <CardDescription>What your clients are saying about their recent visits.</CardDescription>
      </CardHeader>
      <CardContent>
        {feedback.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Client</TableHead>
                  <TableHead className="whitespace-nowrap">Comment</TableHead>
                  <TableHead className="whitespace-nowrap">Type</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium truncate max-w-[100px]">{item.client}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[100px]">{item.date}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p className="text-sm text-muted-foreground truncate max-w-[150px]">&ldquo;{item.comment}&rdquo;</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {item.entityType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-sm font-medium">{item.rating}</span>
                        <FaStar className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No client feedback available
          </div>
        )}
      </CardContent>
    </Card>
  );
}