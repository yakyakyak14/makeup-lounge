import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

type Conversation = {
  id: string;
  name: string;
  time: string;
  type: "client" | "artist";
  partner_id: string;
};

type Message = {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
};

type ConversationRow = {
  id: string;
  artist_id: string;
  client_id: string;
  booking_id: string | null;
  created_at: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation() as any;
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const timeText = (iso: string) => new Date(iso).toLocaleString();

  const fetchConversations = async (): Promise<Conversation[]> => {
    if (!user?.id) return [];
    setLoadingConvs(true);
    try {
      const { data: convs, error } = await supabase
        .from('conversations')
        .select('id, artist_id, client_id, booking_id, created_at')
        .or(`artist_id.eq.${user.id},client_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const ids = (convs || []) as ConversationRow[];
      const partnerIds = Array.from(new Set(ids.map(c => c.artist_id === user.id ? c.client_id : c.artist_id)));
      let nameMap = new Map<string, { name: string; type: 'client' | 'artist' }>();
      if (partnerIds.length > 0) {
        const { data: partners } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, user_type')
          .in('user_id', partnerIds);
        (partners || []).forEach((p: any) => {
          nameMap.set(p.user_id, { name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'User', type: p.user_type === 'artist' ? 'artist' : 'client' });
        });
      }

      const convItems: Conversation[] = ids.map(c => {
        const partnerId = c.artist_id === user.id ? c.client_id : c.artist_id;
        const partner = nameMap.get(partnerId) || { name: 'User', type: 'client' as const };
        return {
          id: c.id,
          name: partner.name,
          time: timeText(c.created_at),
          type: partner.type,
          partner_id: partnerId,
        };
      });
      setConversations(convItems);
      return convItems;
    } catch (e) {
      console.error(e);
      return [];
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => { fetchConversations(); }, [user?.id]);

  const fetchMessages = async (conversationId: string) => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    const mapped: Message[] = (data as MessageRow[]).map(m => ({
      id: m.id,
      text: m.content,
      sender: m.sender_id === user.id ? 'me' : 'other',
      time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
    setMessages(mapped);
  };

  useEffect(() => {
    if (!selectedConversation?.id) return;
    fetchMessages(selectedConversation.id);

    const channel = supabase
      .channel(`conv:${selectedConversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversation.id}`,
      }, (payload) => {
        const m = payload.new as MessageRow;
        setMessages(prev => ([...prev, {
          id: m.id,
          text: m.content,
          sender: m.sender_id === user?.id ? 'me' : 'other',
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConversation?.id, user?.id]);

  const ensureConversationForBooking = async (bookingId: string, artistId: string, clientId: string) => {
    // 1) Try by booking_id
    const { data: existing, error: exErr } = await supabase
      .from('conversations')
      .select('id')
      .eq('booking_id', bookingId)
      .maybeSingle();
    if (!exErr && existing?.id) return existing.id as string;

    // 2) Create if missing
    const { data: created, error: insErr } = await supabase
      .from('conversations')
      .insert({ booking_id: bookingId, artist_id: artistId, client_id: clientId })
      .select('id')
      .single();
    if (insErr) throw insErr;
    return created.id as string;
  };

  useEffect(() => {
    // If navigated from Bookings with a bookingId, ensure conversation exists and open it
    const s = (location?.state || {}) as any;
    if (!user?.id || (!s.bookingId && !s.conversationId)) return;

    (async () => {
      try {
        let convId = s.conversationId as string | undefined;
        if (!convId && s.bookingId && s.artistId && s.clientId) {
          convId = await ensureConversationForBooking(s.bookingId, s.artistId, s.clientId);
        }
        if (!convId) return;
        // Refresh conv list then select using fresh result
        const convs = await fetchConversations();
        const conv = convs.find(c => c.id === convId);
        if (conv) setSelectedConversation(conv);
        else setSelectedConversation({ id: convId, name: 'Conversation', time: '', type: 'client', partner_id: '' });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [location?.state, user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation?.id || !user?.id) return;
    await supabase.from('messages').insert({
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      content: newMessage.trim(),
    });
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
                        <p className="text-xs text-muted-foreground">
                          {conversation.time}
                        </p>
                      </div>
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
                  {messages.map((message) => (
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