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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ tier }) {
    const { data, setData, put, processing, errors, transform } = useForm({
        kode: tier?.kode ?? '',
        nama: tier?.nama ?? '',
        min_transaksi: tier?.min_transaksi ?? 0,
        diskon_persen: tier?.diskon_persen ?? 0,
        aktif: tier?.aktif ? 'true' : 'false',
    });

    const submit = (e) => {
        e.preventDefault();
        transform((form) => ({
            ...form,
            aktif: form.aktif === 'true',
            min_transaksi: Number(form.min_transaksi),
            diskon_persen: Number(form.diskon_persen),
        }));
        put(route('loyalty-tier.update', tier.id), {
            onFinish: () => transform((form) => form),
        });
    };

    return (
        <AuthenticatedLayout header="Edit Diskon Loyalti">
            <Head title="Edit Diskon Loyalti" />

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Edit Diskon Loyalti</CardTitle>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="kode">Kode</Label>
                            <Input
                                id="kode"
                                value={data.kode}
                                onChange={(e) =>
                                    setData('kode', e.target.value.toUpperCase())
                                }
                            />
                            {errors.kode && (
                                <p className="text-sm text-destructive">
                                    {errors.kode}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nama">Nama</Label>
                            <Input
                                id="nama"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                            />
                            {errors.nama && (
                                <p className="text-sm text-destructive">
                                    {errors.nama}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="min_transaksi">
                                    Min. Transaksi
                                </Label>
                                <Input
                                    id="min_transaksi"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.min_transaksi}
                                    onChange={(e) =>
                                        setData('min_transaksi', e.target.value)
                                    }
                                />
                                {errors.min_transaksi && (
                                    <p className="text-sm text-destructive">
                                        {errors.min_transaksi}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="diskon_persen">
                                    Diskon (%)
                                </Label>
                                <Input
                                    id="diskon_persen"
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={data.diskon_persen}
                                    onChange={(e) =>
                                        setData('diskon_persen', e.target.value)
                                    }
                                />
                                {errors.diskon_persen && (
                                    <p className="text-sm text-destructive">
                                        {errors.diskon_persen}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={data.aktif}
                                onValueChange={(value) =>
                                    setData('aktif', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Aktif</SelectItem>
                                    <SelectItem value="false">Nonaktif</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.aktif && (
                                <p className="text-sm text-destructive">
                                    {errors.aktif}
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button type="submit" disabled={processing}>
                            Simpan Perubahan
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route('loyalty-tier.index')}>Batal</Link>
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </AuthenticatedLayout>
    );
}
