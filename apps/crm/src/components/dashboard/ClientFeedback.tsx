
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { FaStar } from 'react-icons/fa';

const feedback = [
    { client: 'Sarah L.', comment: "Amazing service! My nails have never looked better.", rating: 5, date: '2024-08-20' },
    { client: 'Michael B.', comment: "Great haircut, and the conversation was even better.", rating: 5, date: '2024-08-19' },
    { client: 'Jessica P.', comment: "Very relaxing spa day. Just what I needed.", rating: 4, date: '2024-08-19' },
    { client: 'David R.', comment: "Good service, but a bit of a wait.", rating: 3, date: '2024-08-18' },
];

export function ClientFeedback() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Recent Client Feedback</CardTitle>
                <CardDescription>What your clients are saying about their recent visits.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Comment</TableHead>
                            <TableHead className="text-right">Rating</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {feedback.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <div className="font-medium">{item.client}</div>
                                    <div className="text-xs text-muted-foreground">{item.date}</div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-muted-foreground truncate max-w-xs">&ldquo;{item.comment}&rdquo;</p>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <span className="text-sm font-medium">{item.rating}.0</span>
                                        <FaStar className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
