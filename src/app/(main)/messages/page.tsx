"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessageList, MessageItem, ComposeMessage } from "@/components/forum";
import { CyberCard, GlitchText } from "@/components/cyberpunk";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Plus, ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  senderId: string;
  receiverId: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface Conversation {
  id: string;
  content: string;
  createdAt: string;
  otherUser: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  unreadCount: number;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("messages");
  const tCommon = useTranslations("common");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversations
  useEffect(() => {
    if (session?.user?.id) {
      loadConversations();
    }
  }, [session]);

  // Check for userId in URL params (for "Send Message" links)
  useEffect(() => {
    const userId = searchParams.get("userId");
    if (userId && session?.user?.id) {
      handleSelectConversation(userId);
    }
  }, [searchParams, session]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/messages");
      if (!response.ok) throw new Error("Failed to load conversations");
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    try {
      setLoadingMessages(true);
      const response = await fetch(
        `/api/messages?otherUserId=${otherUserId}`
      );
      if (!response.ok) throw new Error("Failed to load messages");
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectConversation = async (userId: string) => {
    console.log("handleSelectConversation called with userId:", userId);
    setSelectedUserId(userId);

    // Find conversation with this user
    const conversation = conversations.find(
      (conv) => conv.otherUser.id === userId
    );

    console.log("Found conversation:", conversation);

    if (conversation) {
      console.log("Setting selected user from conversation:", conversation.otherUser);
      setSelectedUser(conversation.otherUser);
      await loadMessages(userId);

      // Mark messages as read
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: userId }),
      });

      // Update unread count in local state
      setConversations((prev) =>
        prev.map((conv) =>
          conv.otherUser.id === userId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } else {
      console.log("No existing conversation, fetching user details...");
      // New conversation - fetch user details
      try {
        const response = await fetch(`/api/users?userId=${userId}`);
        console.log("User fetch response status:", response.status);
        if (response.ok) {
          const userData = await response.json();
          console.log("Selected user data:", userData);
          if (userData && userData.id) {
            setSelectedUser(userData);
            setMessages([]);
            console.log("Selected user set successfully");
          } else {
            console.error("Invalid user data received");
            toast.error("Failed to load user details");
          }
        } else {
          console.error("Failed to fetch user:", response.statusText);
          toast.error("Failed to load user details");
        }
      } catch (error) {
        console.error("Error loading user:", error);
        toast.error("Failed to load user details");
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedUserId || !session?.user?.id) return;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUserId,
          content,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const newMessage = await response.json();
      setMessages((prev) => [...prev, newMessage]);

      // Reload conversations to update the list
      loadConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to load users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleNewMessage = (userId: string) => {
    setShowNewMessageDialog(false);
    // Use setTimeout to ensure dialog closes before navigation
    setTimeout(() => {
      handleSelectConversation(userId);
    }, 100);
  };

  const filteredUsers = users.filter((user) =>
    (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CyberCard>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Please log in to view your messages
            </p>
          </div>
        </CyberCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-8rem)]">
      <div className="mb-6 flex items-center justify-between">
        <GlitchText text={t("title")} className="text-3xl font-bold" />
        <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => loadUsers()}>
              <Plus className="mr-2 h-4 w-4" />
              {t("compose")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("newMessage")}</DialogTitle>
              <DialogDescription>{t("selectUser")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchUsers")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleNewMessage(user.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Avatar className="h-10 w-10 border-2 border-primary/30">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {user.name?.[0]?.toUpperCase() ||
                            user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium">{user.name || user.email}</p>
                        {user.name && (
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <CyberCard className="h-[calc(100vh-16rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Conversations List */}
          <div className="border-r border-border/50">
            <div className="p-4 border-b border-border/50">
              <h2 className="font-semibold">{t("conversations")}</h2>
            </div>
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                {tCommon("loading")}
              </div>
            ) : (
              <MessageList
                conversations={conversations}
                selectedUserId={selectedUserId || undefined}
                onSelectConversation={handleSelectConversation}
                currentUserId={session.user.id}
              />
            )}
          </div>

          {/* Messages Area */}
          <div className="col-span-2 flex flex-col">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border/50 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedUserId(null);
                      setSelectedUser(null);
                      setMessages([]);
                    }}
                    className="md:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-10 w-10 border-2 border-primary/30">
                    <AvatarImage src={selectedUser.image || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {selectedUser.name?.[0]?.toUpperCase() ||
                        selectedUser.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {selectedUser.name || selectedUser.email}
                    </h3>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {loadingMessages ? (
                    <div className="text-center text-muted-foreground">
                      {tCommon("loading")}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t("noConversations")}</p>
                      <p className="text-sm mt-2">{t("startConversation")}</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <MessageItem
                          key={message.id}
                          content={message.content}
                          createdAt={message.createdAt}
                          isOwn={message.senderId === session.user.id}
                          sender={message.sender}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </ScrollArea>

                {/* Compose Message */}
                <div className="p-4 border-t border-border/50">
                  <ComposeMessage onSend={handleSendMessage} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">{t("selectUser")}</p>
                  <p className="text-sm mt-2">{t("startConversation")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CyberCard>
    </div>
  );
}
