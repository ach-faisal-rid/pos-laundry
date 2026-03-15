import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastTitle,
} from '@/Components/ui/toast';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function Dashboard({ stats, recent }) {
    const [toasts, setToasts] = useState([]);
    const knownIdsRef = useRef(new Set(recent?.map((item) => item.id) || []));
    const [animatedRevenue, setAnimatedRevenue] = useState(
        stats?.pendapatan_hari_ini ?? 0,
    );

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['stats', 'recent'] });
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const target = Number(stats?.pendapatan_hari_ini ?? 0);
        const start = animatedRevenue;
        const diff = target - start;
        if (diff === 0) return;

        const duration = 800;
        const startTime = performance.now();

        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const value = Math.round(start + diff * progress);
            setAnimatedRevenue(value);
            if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    }, [stats?.pendapatan_hari_ini]);

    useEffect(() => {
        const knownIds = knownIdsRef.current;
        const newItems = (recent || []).filter((item) => !knownIds.has(item.id));
        if (newItems.length === 0) return;

        const newToasts = newItems.map((item) => ({
            id: item.id,
            title: 'Transaksi Baru',
            description: `${item.pelanggan?.nama ?? 'Pelanggan'} • ${formatCurrency(
                item.total_harga,
            )}`,
        }));

        newItems.forEach((item) => knownIds.add(item.id));
        setToasts((prev) => [...newToasts, ...prev].slice(0, 5));
    }, [recent]);

    const totalStatus =
        (stats?.status?.proses ?? 0) +
        (stats?.status?.selesai ?? 0) +
        (stats?.status?.diambil ?? 0);

    const progressValue = useMemo(() => {
        if (!totalStatus) return 0;
        const selesai = stats?.status?.selesai ?? 0;
        const diambil = stats?.status?.diambil ?? 0;
        return Math.round(((selesai + diambil) / totalStatus) * 100);
    }, [stats?.status, totalStatus]);

    const formatCurrency = (value) => {
        const number = Number(value ?? 0);
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(number);
    };

    const formatDate = (value) => {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const statusBadge = (status) => {
        switch (status) {
            case 'proses':
                return 'bg-amber-500/10 text-amber-700';
            case 'selesai':
                return 'bg-emerald-500/10 text-emerald-700';
            case 'diambil':
                return 'bg-sky-500/10 text-sky-700';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <AuthenticatedLayout
            header="Dashboard"
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                <div className="rounded-xl border bg-background p-6 shadow-sm">
                    <h3 className="text-2xl font-semibold text-foreground">
                        Selamat datang di POS Laundry
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Ringkas laporan dan pantau operasional harian di satu
                        layar.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardDescription>Transaksi Hari Ini</CardDescription>
                            <CardTitle className="text-2xl">
                                {stats?.status?.proses ?? 0}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Total order yang masuk hari ini.
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Omzet Hari Ini</CardDescription>
                            <CardTitle className="text-2xl">
                                {formatCurrency(animatedRevenue)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Perhitungan otomatis dari transaksi.
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Dalam Proses</CardDescription>
                            <CardTitle className="text-2xl">
                                {stats?.status?.proses ?? 0}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Order yang belum selesai.
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Dana Perawatan</CardDescription>
                            <CardTitle className="text-2xl">
                                {formatCurrency(stats?.dana_saldo ?? 0)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Saldo dana perawatan mesin.
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Aktivitas Terbaru</CardTitle>
                            <CardDescription>
                                Update transaksi yang baru masuk.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(recent || []).length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    Belum ada aktivitas terbaru.
                                </div>
                            ) : (
                                recent.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                                    >
                                        <div>
                                            <div className="font-medium text-foreground">
                                                {item.pelanggan?.nama ??
                                                    'Pelanggan'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatDate(item.tanggal)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadge(
                                                    item.status,
                                                )}`}
                                            >
                                                {item.status}
                                            </span>
                                            <span className="text-sm font-semibold text-foreground">
                                                {formatCurrency(item.total_harga)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Progress Laundry</CardTitle>
                            <CardDescription>
                                Proses menuju selesai & diambil.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Progress value={progressValue} />
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span className="rounded-full bg-amber-500/10 px-2 py-1 text-amber-700">
                                    Proses: {stats?.status?.proses ?? 0}
                                </span>
                                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-700">
                                    Selesai: {stats?.status?.selesai ?? 0}
                                </span>
                                <span className="rounded-full bg-sky-500/10 px-2 py-1 text-sky-700">
                                    Diambil: {stats?.status?.diambil ?? 0}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Notifikasi Real-time</CardTitle>
                        <CardDescription>
                            Transaksi baru akan muncul sebagai toast dan list ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {toasts.length === 0 ? (
                            <div className="text-sm text-muted-foreground">
                                Belum ada notifikasi baru.
                            </div>
                        ) : (
                            toasts.map((toastItem) => (
                                <div
                                    key={toastItem.id}
                                    className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2"
                                >
                                    <div>
                                        <div className="font-medium text-foreground">
                                            {toastItem.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {toastItem.description}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {toasts.map((toastItem) => (
                <Toast
                    key={`toast-${toastItem.id}`}
                    open
                    duration={4000}
                >
                    <div className="grid gap-1">
                        <ToastTitle>{toastItem.title}</ToastTitle>
                        <ToastDescription>{toastItem.description}</ToastDescription>
                    </div>
                    <ToastClose />
                </Toast>
            ))}
        </AuthenticatedLayout>
    );
}
