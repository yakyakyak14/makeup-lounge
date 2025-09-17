import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: "client" | "artist";
}

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
}

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Sample data for demonstration
  const conversations: Conversation[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      lastMessage: "Looking forward to our session tomorrow!",
      time: "2h ago",
      unread: 2,
      type: "client"
    },
    {
      id: "2", 
      name: "Emma Wilson",
      lastMessage: "Thank you for the amazing makeup!",
      time: "1d ago",
      unread: 0,
      type: "client"
    },
    {
      id: "3",
      name: "Maya Chen (Artist)",
      lastMessage: "I'd love to collaborate on this project",
      time: "3d ago", 
      unread: 1,
      type: "artist"
    }
  ];

  const sampleMessages: Message[] = [
    {
      id: "1",
      text: "Hi! I'd like to book you for my wedding on March 15th",
      sender: "other",
      time: "10:30 AM"
    },
    {
      id: "2", 
      text: "I'd be happy to help! What time works best for you?",
      sender: "me",
      time: "10:35 AM"
    },
    {
      id: "3",
      text: "Around 8 AM would be perfect. How much do you charge for bridal makeup?",
      sender: "other", 
      time: "10:40 AM"
    },
    {
      id: "4",
      text: "My bridal package starts at ₦50,000. This includes trial, day-of makeup, and touch-up kit.",
      sender: "me",
      time: "10:45 AM"
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // In a real app, this would send to backend
    console.log('Sending message:', newMessage);
    setNewMessage("");
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-gradient">Messages</h1>
            <p className="text-muted-foreground">Connect with clients and artists</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-4 p-4">
            <h2 className="font-semibold mb-4 flex items-center">
              <MessageCircle className="mr-2 h-4 w-4" />
              Conversations ({conversations.length})
            </h2>
            
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start chatting with artists or clients!</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                      selectedConversation?.id === conversation.id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10">
                          {conversation.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {conversation.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conversation.time}
                        </p>
                      </div>
                      {conversation.unread > 0 && (
                        <Badge variant="default" className="text-xs">
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-8 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10">
                      {selectedConversation.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.type === 'client' ? 'Client' : 'Artist'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[400px]">
                  {sampleMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'me' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'me'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-accent text-accent-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div className="text-muted-foreground">
                  <MessageCircle className="mx-auto h-16 w-16 mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p>Choose a conversation from the left to start messaging</p>
                  
                  {/* Demo hint */}
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg max-w-md mx-auto">
                    <p className="text-sm text-primary">
                      💡 This is a demo interface. In the full version, messages would sync with your database and support real-time chat.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;