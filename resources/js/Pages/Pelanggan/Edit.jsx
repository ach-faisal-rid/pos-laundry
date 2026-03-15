import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

export default function Edit({ pelanggan, history, recommendations }) {
    const { data, setData, put, processing, errors } = useForm({
        nama: pelanggan?.nama ?? '',
        no_hp: pelanggan?.no_hp ?? '',
        alamat: pelanggan?.alamat ?? '',
    });
    const [qrDataUrl, setQrDataUrl] = useState('');
    const { flash } = usePage().props;
    const digitsOnly = data.no_hp.replace(/\D/g, '');
    const noHpLengthInvalid =
        digitsOnly.length > 0 &&
        (digitsOnly.length < 11 || digitsOnly.length > 14);

    const submit = (e) => {
        e.preventDefault();
        put(route('pelanggan.update', pelanggan.id));
    };

    useEffect(() => {
        if (!pelanggan?.kode) return;
        QRCode.toDataURL(pelanggan.kode, { width: 200 })
            .then(setQrDataUrl)
            .catch(() => setQrDataUrl(''));
    }, [pelanggan?.kode]);

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

    return (
        <AuthenticatedLayout header="Edit Pelanggan">
            <Head title="Edit Pelanggan" />

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Edit Data Pelanggan</CardTitle>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="space-y-4">
                        {flash?.message && (
                            <div className="rounded-md border border-muted bg-muted/40 px-4 py-3 text-sm text-foreground">
                                {flash.message}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="nama">Nama</Label>
                            <Input
                                id="nama"
                                value={data.nama}
                                onChange={(e) =>
                                    setData('nama', e.target.value)
                                }
                                placeholder="Nama pelanggan"
                            />
                            {errors.nama && (
                                <p className="text-sm text-destructive">
                                    {errors.nama}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="no_hp">No. HP</Label>
                            <Input
                                id="no_hp"
                                value={data.no_hp}
                                onChange={(e) =>
                                    setData(
                                        'no_hp',
                                        e.target.value
                                            .replace(/\D/g, '')
                                            .slice(0, 14),
                                    )
                                }
                                placeholder="08xxxxxxxxxx"
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                            <p className="text-xs text-muted-foreground">
                                Wajib 11-14 digit. Contoh: 08537182716
                            </p>
                            {noHpLengthInvalid && !errors.no_hp && (
                                <p className="text-sm text-destructive">
                                    No. HP harus 11-14 digit. Contoh:
                                    08537182716
                                </p>
                            )}
                            {errors.no_hp && (
                                <p className="text-sm text-destructive">
                                    {errors.no_hp}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alamat">Alamat</Label>
                            <Textarea
                                id="alamat"
                                value={data.alamat}
                                onChange={(e) =>
                                    setData('alamat', e.target.value)
                                }
                                placeholder="Alamat pelanggan"
                            />
                            {errors.alamat && (
                                <p className="text-sm text-destructive">
                                    {errors.alamat}
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button
                            type="submit"
                            disabled={processing || noHpLengthInvalid}
                        >
                            Simpan Perubahan
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route('pelanggan.index')}>
                                Batal
                            </Link>
                        </Button>
                    </CardFooter>
                </form>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>QR Pelanggan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="rounded-lg border bg-muted/30 p-3">
                            <div className="text-xs text-muted-foreground">
                                Kode Pelanggan
                            </div>
                            <div className="text-base font-semibold">
                                {pelanggan?.kode ?? '-'}
                            </div>
                        </div>
                        {qrDataUrl ? (
                            <img
                                src={qrDataUrl}
                                alt="QR Pelanggan"
                                className="mx-auto h-44 w-44"
                            />
                        ) : (
                            <div className="text-xs text-muted-foreground">
                                QR belum tersedia.
                            </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                            Gunakan kode ini untuk scan transaksi cepat.
                        </div>
                        {!pelanggan?.kode && (
                            <Button asChild>
                                <Link
                                    href={route(
                                        'pelanggan.generate-kode',
                                        pelanggan.id,
                                    )}
                                    method="patch"
                                    as="button"
                                >
                                    Generate QR
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>History & Rekomendasi</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="rounded-lg border bg-muted/20 p-4">
                            <div className="text-xs text-muted-foreground">
                                Total transaksi
                            </div>
                            <div className="text-base font-semibold">
                                {recommendations?.stat?.total_transaksi ?? 0}
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                {recommendations?.tarif}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {recommendations?.jadwal}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {recommendations?.harga}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm font-medium">
                                Transaksi Terakhir
                            </div>
                            {(history || []).length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    Belum ada transaksi.
                                </div>
                            ) : (
                                history.map((trx) => (
                                    <div
                                        key={trx.id}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2 text-sm"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {formatDate(trx.tanggal)}
                                            </div>
                                            <div className="text-xs text-muted-foreground capitalize">
                                                {trx.status}
                                            </div>
                                            {trx.tarif?.nama && (
                                                <div className="text-xs text-muted-foreground">
                                                    {trx.tarif.nama}
                                                </div>
                                            )}
                                        </div>
                                        <div className="font-semibold">
                                            Rp {Number(trx.total_harga).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
