
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { Textarea } from "@repo/ui/textarea";
import { Button } from "@repo/ui/button";
import { FaPaperPlane } from "react-icons/fa";

const messages = [
    { user: 'Alice', message: 'Hey team, just a reminder that the new inventory arrives tomorrow morning.' },
    { user: 'You', message: 'Thanks for the heads up, Alice! I\'ll be there early to help unload.' },
    { user: 'Bob', message: 'Perfect, I need to restock my station.' },
]

export function TeamChat() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Chat</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 h-64 overflow-y-auto pr-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.user === 'You' ? 'justify-end' : ''}`}>
                            {msg.user !== 'You' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://placehold.co/32x32.png?text=${msg.user.charAt(0)}`} />
                                    <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`rounded-lg p-3 max-w-xs ${msg.user === 'You' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                {msg.user !== 'You' && <p className="font-semibold text-xs mb-1">{msg.user}</p>}
                                <p className="text-sm">{msg.message}</p>
                            </div>
                              {msg.user === 'You' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://placehold.co/32x32.png?text=Y`} />
                                    <AvatarFallback>Y</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex items-center space-x-2 pt-4 border-t">
                    <Textarea placeholder="Type your message..." className="min-h-[40px]"/>
                     <Button size="icon">
                        <FaPaperPlane className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
