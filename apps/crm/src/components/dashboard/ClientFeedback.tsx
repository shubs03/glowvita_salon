
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { FaStar } from 'react-icons/fa';

const feedback = [
    { client: 'Sarah L.', comment: "Amazing service! My nails have never looked better.", rating: 5 },
    { client: 'Michael B.', comment: "Great haircut, and the conversation was even better. Will be back!", rating: 5 },
    { client: 'Jessica P.', comment: "Very relaxing spa day. Just what I needed.", rating: 4 },
];

export function ClientFeedback() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Client Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {feedback.map((item, index) => (
                    <div key={index} className="border-b pb-2 last:border-b-0">
                        <div className="flex justify-between items-center mb-1">
                            <p className="font-semibold text-sm">{item.client}</p>
                            <div className="flex items-center gap-1">
                                {[...Array(item.rating)].map((_, i) => (
                                    <FaStar key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                ))}
                                {[...Array(5 - item.rating)].map((_, i) => (
                                    <FaStar key={i} className="h-4 w-4 text-gray-300" />
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">&ldquo;{item.comment}&rdquo;</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
