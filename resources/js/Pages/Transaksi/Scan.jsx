import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Head, Link } from '@inertiajs/react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useEffect, useRef, useState } from 'react';

export default function Scan() {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const [manualCode, setManualCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        let active = true;
        const startScanner = async () => {
            try {
                if (!videoRef.current) return;

                let deviceId;
                if (navigator?.mediaDevices?.enumerateDevices) {
                    const devices =
                        await navigator.mediaDevices.enumerateDevices();
                    const videoDevices = devices.filter(
                        (device) => device.kind === 'videoinput',
                    );
                    deviceId = videoDevices[0]?.deviceId;
                }

                await reader.decodeFromVideoDevice(
                    deviceId,
                    videoRef.current,
                    (res, err) => {
                        if (res?.getText()) {
                            handleLookup(res.getText());
                            reader.reset();
                        }
                        if (err && err.name !== 'NotFoundException') {
                            setError('Gagal membaca QR. Coba ulangi.');
                        }
                    },
                );
            } catch (err) {
                setError('Kamera tidak tersedia atau izin ditolak.');
            }
        };

        startScanner();

        return () => {
            active = false;
            reader.reset();
        };
    }, []);

    const handleLookup = async (code) => {
        if (!code) return;
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const res = await fetch(
                `${route('pelanggan.lookup')}?code=${encodeURIComponent(code)}`,
                {
                    headers: { Accept: 'application/json' },
                },
            );
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Pelanggan tidak ditemukan.');
            }
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan.');
        } finally {
            setLoading(false);
        }
    };

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
        }).format(date);
    };

    const latestStatus = result?.recent?.[0]?.status ?? '-';
    const recommendations = result?.recommendations;

    return (
        <AuthenticatedLayout header="Scan QR Transaksi">
            <Head title="Scan QR Transaksi" />

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Scan QR Pelanggan</CardTitle>
                        <CardDescription>
                            Arahkan kamera ke QR pelanggan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="overflow-hidden rounded-lg border bg-muted/20">
                            <video
                                ref={videoRef}
                                className="h-64 w-full object-cover"
                                muted
                                playsInline
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="manual-code">
                                Atau masukkan kode manual
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="manual-code"
                                    value={manualCode}
                                    onChange={(e) =>
                                        setManualCode(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="KODE1234"
                                />
                                <Button
                                    type="button"
                                    onClick={() => handleLookup(manualCode)}
                                    disabled={loading || !manualCode}
                                >
                                    Cari
                                </Button>
                            </div>
                        </div>
                        {error && (
                            <div className="text-sm text-destructive">
                                {error}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Pelanggan</CardTitle>
                        <CardDescription>
                            Informasi hasil scan QR.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading && (
                            <div className="text-sm text-muted-foreground">
                                Memuat data...
                            </div>
                        )}
                        {!loading && !result && (
                            <div className="text-sm text-muted-foreground">
                                Scan QR atau masukkan kode pelanggan.
                            </div>
                        )}
                        {result?.found && (
                            <>
                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <div className="text-xs text-muted-foreground">
                                        Nama
                                    </div>
                                    <div className="text-base font-semibold">
                                        {result.pelanggan.nama}
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        No. HP
                                    </div>
                                    <div className="text-sm">
                                        {result.pelanggan.no_hp}
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Status Terakhir
                                    </div>
                                    <div className="text-sm font-medium capitalize">
                                        {latestStatus}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">
                                        Transaksi Terakhir
                                    </div>
                                    {result.recent.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">
                                            Belum ada transaksi.
                                        </div>
                                    ) : (
                                        result.recent.map((trx) => (
                                            <div
                                                key={trx.id}
                                                className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm"
                                            >
                                                <div>
                                                    <div className="font-medium">
                                                        {formatDate(trx.tanggal)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground capitalize">
                                                        {trx.status}
                                                    </div>
                                                </div>
                                                <div className="font-semibold">
                                                    {formatCurrency(
                                                        trx.total_harga,
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button asChild>
                                        <Link
                                            href={route('transaksi.create')}
                                            data={{
                                                pelanggan_id:
                                                    result.pelanggan.id,
                                            }}
                                        >
                                            Buat Transaksi
                                        </Link>
                                    </Button>
                                </div>
                                <div className="rounded-lg border bg-background p-4 text-sm">
                                    <div className="font-medium text-foreground">
                                        Rekomendasi
                                    </div>
                                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                        <div>{recommendations?.tarif}</div>
                                        <div>{recommendations?.jadwal}</div>
                                        <div>{recommendations?.harga}</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
