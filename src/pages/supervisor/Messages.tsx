import { useEffect, useState, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { VoiceMessage } from "@/components/VoiceMessage";
import { UserAvatar } from "@/components/UserAvatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useNotifications } from "@/contexts/NotificationContext";
import { api } from "@/services/api";
import { MessageSquare, Send, Loader2, User, Trash2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Student {
  _id: string;
  name: string;
  email: string;
  matricNumber: string;
  avatarPath?: string;
  unread_count: number;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  receiver: {
    _id: string;
    name: string;
    email: string;
  };
  content?: string;
  messageType: "text" | "voice";
  voiceUrl?: string;
  voiceDuration?: number;
  isRead: boolean;
  createdAt: string;
}

export default function Messages() {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    // Radix ScrollArea renders the actual scrollable element as [data-radix-scroll-area-viewport]
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement | null;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    } else {
      // Fallback: scroll the sentinel div into view
      messagesEndRef.current?.scrollIntoView({ behavior });
    }
  };

  const fetchStudents = useCallback(async () => {
    try {
      const { data: studentsData } = await api.get('/users/supervisor/students');
      const { data: messagesData } = await api.get('/messages');

      const enrichedStudents = studentsData.map((student: any) => {
        const unreadCount = messagesData.filter((msg: any) =>
          msg.sender._id === student._id &&
          msg.receiver._id === user?._id &&
          !msg.isRead
        ).length;

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          matricNumber: student.matricNumber,
          avatarPath: student.avatarPath,
          unread_count: unreadCount,
        };
      });

      setStudents(enrichedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchMessages = useCallback(async () => {
    if (!selectedStudent) return;

    try {
      const { data } = await api.get('/messages');

      const filteredMessages = data.filter((msg: any) =>
        (msg.sender._id === user?._id && msg.receiver._id === selectedStudent._id) ||
        (msg.sender._id === selectedStudent._id && msg.receiver._id === user?._id)
      );

      // Sort messages by creation time (oldest first, newest last - like WhatsApp)
      const sortedMessages = filteredMessages.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setMessages(sortedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [selectedStudent, user]);

  const markMessagesAsRead = useCallback(async () => {
    if (!selectedStudent || !user) return;

    try {
      await api.put(`/messages/mark-read/${selectedStudent._id}`);
      
      // Update local state
      setMessages(prev => prev.map(msg =>
        msg.sender._id === selectedStudent._id ? { ...msg, isRead: true } : msg
      ));

      // Update student unread count locally
      setStudents(prev => prev.map(student =>
        student._id === selectedStudent._id
          ? { ...student, unread_count: 0 }
          : student
      ));

      // Refresh notification count after marking messages as read
      await refreshNotifications();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [selectedStudent, user, refreshNotifications]);

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user, fetchStudents]);

  useEffect(() => {
    if (selectedStudent && user) {
      fetchMessages();
    }
  }, [selectedStudent, user, fetchMessages]);

  useEffect(() => {
    if (selectedStudent && user && messages.length > 0) {
      markMessagesAsRead();
    }
  }, [selectedStudent, user, messages.length, markMessagesAsRead]);

  // Scroll to bottom when messages load or a new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("auto");
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent || !user) return;

    setIsSending(true);

    try {
      const { data } = await api.post('/messages', {
        receiver: selectedStudent._id,
        content: newMessage.trim(),
        messageType: "text"
      });

      setMessages(prev => [...prev, {
        _id: data._id,
        sender: {
          _id: user!._id,
          name: user!.name,
          email: user!.email,
        },
        receiver: {
          _id: selectedStudent._id,
          name: selectedStudent.name,
          email: selectedStudent.email,
        },
        content: data.content,
        messageType: "text",
        isRead: data.isRead,
        createdAt: data.createdAt,
      }]);
      setNewMessage("");
      // Refresh notifications after sending message
      await refreshNotifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.msg || error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendVoice = async (audioBlob: Blob, duration: number) => {
    if (!selectedStudent || !user) {
      toast({
        title: "Error",
        description: "Missing student or user information",
        variant: "destructive",
      });
      return;
    }

    if (!audioBlob || audioBlob.size === 0) {
      toast({
        title: "Error",
        description: "No audio data to send",
        variant: "destructive",
      });
      return;
    }

    console.log('Sending voice message:', {
      blobSize: audioBlob.size,
      blobType: audioBlob.type,
      duration: duration,
      receiverId: selectedStudent._id
    });

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append('voice', audioBlob, 'voice-message.webm');
      formData.append('receiver', selectedStudent._id);
      formData.append('duration', duration.toString());

      console.log('FormData created, sending request...');

      const { data } = await api.post('/messages/voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Voice message sent successfully:', data);

      setMessages(prev => [...prev, {
        _id: data._id,
        sender: {
          _id: user!._id,
          name: user!.name,
          email: user!.email,
        },
        receiver: {
          _id: selectedStudent._id,
          name: selectedStudent.name,
          email: selectedStudent.email,
        },
        messageType: "voice",
        voiceUrl: data.voiceUrl,
        voiceDuration: data.voiceDuration,
        isRead: data.isRead,
        createdAt: data.createdAt,
      }]);

      toast({
        title: "Success",
        description: "Voice message sent successfully",
      });
      // Refresh notifications after sending voice message
      await refreshNotifications();
    } catch (error: any) {
      console.error('Error sending voice message:', error);
      
      let errorMessage = "Failed to send voice message";
      if (error.response) {
        errorMessage = error.response.data?.msg || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error - could not reach server";
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Communicate with your students
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 h-[calc(100vh-12rem)] md:h-[calc(100vh-16rem)]">
          {/* Student List */}
          <Card className="card-elevated md:col-span-1 order-2 md:order-1">
            <CardHeader className="pb-3 px-4 md:px-6">
              <CardTitle className="text-base md:text-lg">Students</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[200px] md:h-[calc(100vh-22rem)]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <User className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No students assigned
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {students.map((student) => (
                      <button
                        key={student._id}
                        onClick={() => setSelectedStudent(student)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                          selectedStudent?._id === student._id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <UserAvatar 
                            user={student}
                            className="h-8 w-8 md:h-10 md:w-10"
                            fallbackClassName={cn(
                              "font-semibold text-sm md:text-base",
                              selectedStudent?._id === student._id
                                ? "bg-primary-foreground text-primary"
                                : "bg-secondary text-secondary-foreground"
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm md:text-base">{student.name}</p>
                          <p className={cn(
                            "text-xs truncate",
                            selectedStudent?._id === student._id
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}>
                            {student.matricNumber}
                          </p>
                        </div>
                        {student.unread_count > 0 && (
                          <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded-full flex-shrink-0">
                            {student.unread_count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="card-elevated md:col-span-2 order-1 md:order-2 flex flex-col min-h-[400px] md:min-h-0 message-container">
            {selectedStudent ? (
              <>
                <CardHeader className="pb-3 border-b px-4 md:px-6">
                  <div className="flex items-center gap-3">
                    <UserAvatar 
                      user={selectedStudent}
                      className="h-8 w-8 md:h-10 md:w-10"
                      fallbackClassName="bg-primary text-primary-foreground font-semibold text-sm md:text-base"
                    />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base md:text-lg truncate">{selectedStudent.name}</CardTitle>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">
                        {selectedStudent.matricNumber}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 message-container overflow-hidden relative">
                  <ScrollArea 
                    className="flex-1 h-full" 
                    ref={scrollAreaRef}
                  >
                    <div className="px-2 py-2 md:px-6 md:py-4 min-h-full flex flex-col justify-end">
                      <div className="space-y-1">
                        {messages.map((message) => {
                          const isOwn = message.sender._id === user?._id;
                          return (
                            <div
                              key={message._id}
                              className={cn(
                                "flex w-full",
                                isOwn ? "justify-end" : "justify-start"
                              )}
                            >
                              <div
                                className={cn(
                                  "relative group max-w-[80%] md:max-w-[70%] rounded-lg px-3 py-2 message-bubble shadow-sm",
                                  isOwn 
                                    ? "bg-[#dcf8c6] text-gray-800 dark:bg-[#1a4731] dark:text-emerald-100 rounded-br-sm" 
                                    : "bg-white text-gray-800 dark:bg-slate-700 dark:text-slate-100 rounded-bl-sm border border-gray-100 dark:border-slate-600"
                                )}
                              >
                                {isOwn && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-600 shadow-sm border dark:border-slate-500 rounded-full hover:bg-gray-50 dark:hover:bg-slate-500"
                                      >
                                        <MoreVertical className="h-3 w-3 text-gray-600 dark:text-slate-300" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32">
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteMessage(message._id)}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                                <div className="message-text text-sm leading-relaxed mb-1">
                                  {message.messageType === "voice" && message.voiceUrl ? (
                                    <VoiceMessage 
                                      voiceUrl={message.voiceUrl}
                                      duration={message.voiceDuration}
                                      isOwn={isOwn}
                                    />
                                  ) : (
                                    message.content
                                  )}
                                </div>
                                <div
                                  className={cn(
                                    "text-xs flex items-center gap-1 justify-end",
                                    isOwn
                                      ? "text-gray-500 dark:text-emerald-300/70"
                                      : "text-gray-500 dark:text-slate-400"
                                  )}
                                >
                                  <span>
                                    {new Date(message.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {isOwn && (
                                    <svg className="w-4 h-4 text-blue-500" viewBox="0 0 16 15" fill="none">
                                      <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="currentColor"/>
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="p-3 md:p-4 border-t message-input-container">
                    <div className="flex gap-2 items-end">
                      <Textarea
                        id="message-input"
                        name="message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        className="min-h-[40px] md:min-h-[44px] resize-none text-sm md:text-base flex-1"
                        style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                        autoComplete="off"
                      />
                      <VoiceRecorder 
                        onSendVoice={handleSendVoice}
                        disabled={isSending}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        size="icon"
                        className="h-10 w-10 md:h-11 md:w-11 flex-shrink-0"
                        aria-label="Send message"
                      >
                        {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center p-4 md:p-6">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-10 w-10 md:h-12 md:w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground text-sm md:text-base">
                    Select a student to start messaging
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
