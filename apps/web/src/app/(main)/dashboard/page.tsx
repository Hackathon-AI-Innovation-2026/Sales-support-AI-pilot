"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { SalesFunnel } from "@/components/dashboard/SalesFunnel";
import { HotLeadsTable } from "@/components/dashboard/HotLeadsTable";
import { RevenueForecast } from "@/components/dashboard/RevenueForecast";
import { ConversionTrend } from "@/components/dashboard/ConversionTrend";
import { CardSkeleton, TableSkeleton } from "@/components/common/Skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
    const queryClient = useQueryClient();

    // Fetch summary stats
    const { data: summary, isLoading: isSummaryLoading } = useQuery({
        queryKey: ["dashboard", "summary"],
        queryFn: () => api.get("/dashboard/summary").then((res) => res.data),
    });

    // Fetch conversion rate
    const { data: rate, isLoading: isRateLoading } = useQuery({
        queryKey: ["dashboard", "rate"],
        queryFn: () => api.get("/dashboard/conversion-rate").then((res) => res.data),
    });

    // Fetch sales funnel stages
    const { data: funnel, isLoading: isFunnelLoading } = useQuery({
        queryKey: ["dashboard", "funnel"],
        queryFn: () => api.get("/dashboard/funnel").then((res) => res.data),
    });

    // Fetch revenue forecast
    const { data: forecast, isLoading: isForecastLoading } = useQuery({
        queryKey: ["dashboard", "forecast"],
        queryFn: () => api.get("/dashboard/revenue-forecast").then((res) => res.data),
    });

    // Fetch hot leads
    const { data: hotLeads, isLoading: isHotLeadsLoading } = useQuery({
        queryKey: ["dashboard", "hotLeads"],
        queryFn: () => api.get("/dashboard/hot-leads?limit=10").then((res) => res.data),
    });

    const isLoading =
        isSummaryLoading ||
        isRateLoading ||
        isFunnelLoading ||
        isForecastLoading ||
        isHotLeadsLoading;

    const handleRefresh = async () => {
        // Invalidate all queryKeys starting with ["dashboard"] to pull fresh data
        await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Tổng quan Báo cáo</h1>
                        <p className="text-muted-foreground text-sm">
                            Đang tải báo cáo hệ thống bán hàng...
                        </p>
                    </div>
                </div>
                {/* KPI Cards Skeletons */}
                <CardSkeleton count={4} />
                {/* Tables & Charts Skeletons */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <TableSkeleton rows={4} cols={4} />
                    </div>
                    <div>
                        <TableSkeleton rows={4} cols={2} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6 text-primary" />
                        Tổng quan Báo cáo
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Hệ thống báo cáo hiệu suất leads và dự báo doanh số
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Làm mới
                </Button>
            </div>

            {/* Row 1: KPI Cards */}
            <SummaryCards
                totalLeads={summary?.totalLeads ?? 0}
                wonThisMonth={summary?.wonThisMonth ?? 0}
                conversionRate={rate?.conversionRate ?? 0}
                activeTasks={summary?.activeTasks ?? 0}
            />

            {/* Row 2: Funnel Chart & Hot Leads Table */}
            <div className="grid gap-6 lg:grid-cols-6">
                <div className="lg:col-span-3 flex flex-col">
                    <SalesFunnel data={funnel ?? []} />
                </div>
                <div className="lg:col-span-3 flex flex-col">
                    <HotLeadsTable leads={hotLeads ?? []} />
                </div>
            </div>

            {/* Row 3: Revenue Forecast & Weekly Conversion Trend */}
            <div className="grid gap-6 lg:grid-cols-6">
                <div className="lg:col-span-3 flex flex-col">
                    <RevenueForecast
                        totalForecast={forecast?.totalForecast ?? 0}
                        details={forecast?.details ?? []}
                    />
                </div>
                <div className="lg:col-span-3 flex flex-col">
                    <ConversionTrend />
                </div>
            </div>
        </div>
    );
}
