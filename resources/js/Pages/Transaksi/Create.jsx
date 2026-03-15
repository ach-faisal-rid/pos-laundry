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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

export default function Create({ pelanggans, tarifs }) {
    const { data, setData, post, processing, errors } = useForm({
        pelanggan_id: '',
        tarif_id: '',
        tanggal: new Date().toISOString().slice(0, 10),
        berat: '',
        harga_per_kilo: '',
        status: 'proses',
        catatan: '',
    });

    const total = useMemo(() => {
        const berat = Number(data.berat || 0);
        const harga = Number(data.harga_per_kilo || 0);
        return berat * harga;
    }, [data.berat, data.harga_per_kilo]);

    const submit = (e) => {
        e.preventDefault();
        post(route('transaksi.store'));
    };

    const formatCurrency = (value) => {
        const number = Number(value ?? 0);
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(number);
    };

    return (
        <AuthenticatedLayout header="Tambah Transaksi">
            <Head title="Tambah Transaksi" />

            <Card className="max-w-3xl">
                <CardHeader>
                    <CardTitle>Form Transaksi</CardTitle>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Pelanggan</Label>
                            <Select
                                value={data.pelanggan_id}
                                onValueChange={(value) =>
                                    setData('pelanggan_id', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih pelanggan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pelanggans.map((pelanggan) => (
                                        <SelectItem
                                            key={pelanggan.id}
                                            value={String(pelanggan.id)}
                                        >
                                            {pelanggan.nama} - {pelanggan.no_hp}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.pelanggan_id && (
                                <p className="text-sm text-destructive">
                                    {errors.pelanggan_id}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="tanggal">Tanggal</Label>
                                <Input
                                    id="tanggal"
                                    type="date"
                                    value={data.tanggal}
                                    onChange={(e) =>
                                        setData('tanggal', e.target.value)
                                    }
                                />
                                {errors.tanggal && (
                                    <p className="text-sm text-destructive">
                                        {errors.tanggal}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                        setData('status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="proses">Proses</SelectItem>
                                        <SelectItem value="selesai">Selesai</SelectItem>
                                        <SelectItem value="diambil">Diambil</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-sm text-destructive">
                                        {errors.status}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Tarif</Label>
                                <Select
                                    value={data.tarif_id}
                                    onValueChange={(value) => {
                                        const selected = tarifs.find(
                                            (tarif) =>
                                                String(tarif.id) === value,
                                        );
                                        setData({
                                            ...data,
                                            tarif_id: value,
                                            harga_per_kilo:
                                                selected?.harga_per_kilo ?? '',
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tarif" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tarifs.map((tarif) => (
                                            <SelectItem
                                                key={tarif.id}
                                                value={String(tarif.id)}
                                            >
                                                {tarif.nama} - Rp{' '}
                                                {Number(tarif.harga_per_kilo).toLocaleString('id-ID')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tarif_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.tarif_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="berat">Berat (kg)</Label>
                                <Input
                                    id="berat"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.berat}
                                    onChange={(e) =>
                                        setData('berat', e.target.value)
                                    }
                                />
                                {errors.berat && (
                                    <p className="text-sm text-destructive">
                                        {errors.berat}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="harga_per_kilo">
                                    Harga per Kilo
                                </Label>
                                <Input
                                    id="harga_per_kilo"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.harga_per_kilo}
                                    onChange={(e) =>
                                        setData('harga_per_kilo', e.target.value)
                                    }
                                />
                                {errors.harga_per_kilo && (
                                    <p className="text-sm text-destructive">
                                        {errors.harga_per_kilo}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Total Perkiraan
                                </span>
                                <span className="text-base font-semibold">
                                    {formatCurrency(total)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="catatan">Catatan</Label>
                            <Textarea
                                id="catatan"
                                value={data.catatan}
                                onChange={(e) =>
                                    setData('catatan', e.target.value)
                                }
                                placeholder="Catatan tambahan"
                            />
                            {errors.catatan && (
                                <p className="text-sm text-destructive">
                                    {errors.catatan}
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button type="submit" disabled={processing}>
                            Simpan
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route('transaksi.index')}>Batal</Link>
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </AuthenticatedLayout>
    );
}
