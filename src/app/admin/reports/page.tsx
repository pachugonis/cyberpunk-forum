"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Flag, Eye, CheckCircle2, XCircle, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { CyberCard, GlitchText } from "@/components/cyberpunk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { getDateFnsLocale } from "@/lib/date-locale";

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: "PENDING" | "REVIEWING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
  resolvedAt: string | null;
  reporter: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  topic?: {
    id: string;
    title: string;
    author: {
      id: string;
      name: string | null;
    };
  };
  comment?: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string | null;
    };
    topic: {
      id: string;
      title: string;
    };
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("PENDING");
  const [stats, setStats] = useState({
    pending: 0,
    reviewing: 0,
    resolved: 0,
    dismissed: 0,
  });
  const t = useTranslations('admin');
  const locale = useLocale();
  const dateLocale = getDateFnsLocale(locale);

  const fetchReports = async (status?: string) => {
    try {
      const url = status ? `/api/reports?status=${status}` : "/api/reports";
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [pending, reviewing, resolved, dismissed] = await Promise.all([
        fetch("/api/reports?status=PENDING").then((r) => r.json()),
        fetch("/api/reports?status=REVIEWING").then((r) => r.json()),
        fetch("/api/reports?status=RESOLVED").then((r) => r.json()),
        fetch("/api/reports?status=DISMISSED").then((r) => r.json()),
      ]);

      setStats({
        pending: pending.total || 0,
        reviewing: reviewing.total || 0,
        resolved: resolved.total || 0,
        dismissed: dismissed.total || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchReports(activeTab);
    fetchStats();
  }, [activeTab]);

  const updateReportStatus = async (
    reportId: string,
    status: "PENDING" | "REVIEWING" | "RESOLVED" | "DISMISSED"
  ) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update report");
      }

      toast.success(`Report marked as ${status.toLowerCase()}`);
      fetchReports(activeTab);
      fetchStats();
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Failed to update report");
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete report");
      }

      toast.success("Report deleted");
      fetchReports(activeTab);
      fetchStats();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; text: string }> = {
      PENDING: { color: "bg-[var(--cyber-yellow)]", text: t('pending') },
      REVIEWING: { color: "bg-[var(--cyber-cyan)]", text: t('reviewing') },
      RESOLVED: { color: "bg-[var(--cyber-green)]", text: t('resolved') },
      DISMISSED: { color: "bg-gray-500", text: t('dismissed') },
    };

    const variant = variants[status] || variants.PENDING;

    return (
      <Badge className={`${variant.color} text-black font-mono`}>
        {variant.text}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <GlitchText
          text={t('reportsManagement')}
          className="text-3xl font-bold mb-2"
        />
        <p className="text-muted-foreground font-mono">
          {t('reviewReports')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <CyberCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-mono">{t('pending')}</p>
              <p className="text-2xl font-bold text-[var(--cyber-yellow)]">
                {stats.pending}
              </p>
            </div>
            <Flag className="h-8 w-8 text-[var(--cyber-yellow)]" />
          </div>
        </CyberCard>
        <CyberCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-mono">{t('reviewing')}</p>
              <p className="text-2xl font-bold text-[var(--cyber-cyan)]">
                {stats.reviewing}
              </p>
            </div>
            <Eye className="h-8 w-8 text-[var(--cyber-cyan)]" />
          </div>
        </CyberCard>
        <CyberCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-mono">{t('resolved')}</p>
              <p className="text-2xl font-bold text-[var(--cyber-green)]">
                {stats.resolved}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-[var(--cyber-green)]" />
          </div>
        </CyberCard>
        <CyberCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-mono">{t('dismissed')}</p>
              <p className="text-2xl font-bold text-gray-500">
                {stats.dismissed}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-gray-500" />
          </div>
        </CyberCard>
      </div>

      <CyberCard>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-[#0a0a0f] border-b border-[#2a2a35]">
            <TabsTrigger value="PENDING" className="font-mono">
              {t('pending')} ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="REVIEWING" className="font-mono">
              {t('reviewing')} ({stats.reviewing})
            </TabsTrigger>
            <TabsTrigger value="RESOLVED" className="font-mono">
              {t('resolved')} ({stats.resolved})
            </TabsTrigger>
            <TabsTrigger value="DISMISSED" className="font-mono">
              {t('dismissed')} ({stats.dismissed})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-mono">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <Flag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground font-mono">
                  No reports in this category
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#2a2a35]">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 hover:bg-[#1a1a24] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={report.reporter.image || undefined} />
                            <AvatarFallback className="bg-[var(--cyber-cyan)] text-black text-xs">
                              {report.reporter.name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-mono">
                              <span className="text-[var(--cyber-cyan)]">
                                {report.reporter.name || "Anonymous"}
                              </span>
                              {" reported "}
                              <span className="text-[var(--cyber-magenta)]">
                                {report.topic ? "a topic" : "a comment"}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {formatDistanceToNow(new Date(report.createdAt), {
                                addSuffix: true,
                                locale: dateLocale,
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="pl-11">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono">
                              {report.reason}
                            </Badge>
                            {getStatusBadge(report.status)}
                          </div>

                          {report.description && (
                            <p className="text-sm text-muted-foreground mb-3 font-mono">
                              {report.description}
                            </p>
                          )}

                          {report.topic && (
                            <div className="bg-[#0a0a0f] p-3 rounded border border-[#2a2a35]">
                              <p className="text-xs text-muted-foreground mb-1 font-mono">
                                Reported Topic:
                              </p>
                              <Link
                                href={`/topic/${report.topic.id}`}
                                className="text-sm hover:text-[var(--cyber-cyan)] transition-colors font-mono flex items-center gap-2"
                              >
                                {report.topic.title}
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                              <p className="text-xs text-muted-foreground mt-1 font-mono">
                                By {report.topic.author.name || "Unknown"}
                              </p>
                            </div>
                          )}

                          {report.comment && (
                            <div className="bg-[#0a0a0f] p-3 rounded border border-[#2a2a35]">
                              <p className="text-xs text-muted-foreground mb-1 font-mono">
                                Reported Comment:
                              </p>
                              <p className="text-sm mb-2 font-mono line-clamp-2">
                                {report.comment.content}
                              </p>
                              <Link
                                href={`/topic/${report.comment.topic.id}`}
                                className="text-xs hover:text-[var(--cyber-cyan)] transition-colors font-mono flex items-center gap-1"
                              >
                                View in topic: {report.comment.topic.title}
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                              <p className="text-xs text-muted-foreground mt-1 font-mono">
                                By {report.comment.author.name || "Unknown"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {report.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReportStatus(report.id, "REVIEWING")}
                            className="border-[var(--cyber-cyan)] text-[var(--cyber-cyan)] hover:bg-[var(--cyber-cyan)] hover:text-black"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                        )}
                        {(report.status === "PENDING" || report.status === "REVIEWING") && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReportStatus(report.id, "RESOLVED")}
                              className="border-[var(--cyber-green)] text-[var(--cyber-green)] hover:bg-[var(--cyber-green)] hover:text-black"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReportStatus(report.id, "DISMISSED")}
                              className="border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-black"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Dismiss
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteReport(report.id)}
                          className="border-[var(--cyber-red)] text-[var(--cyber-red)] hover:bg-[var(--cyber-red)] hover:text-black"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CyberCard>
    </div>
  );
}
