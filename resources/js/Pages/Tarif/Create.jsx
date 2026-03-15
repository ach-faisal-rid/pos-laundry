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

export default function Create() {
    const { data, setData, post, processing, errors, transform } = useForm({
        nama: '',
        harga_per_kilo: '',
        aktif: 'true',
    });

    const submit = (e) => {
        e.preventDefault();
        transform((form) => ({
            ...form,
            aktif: form.aktif === 'true',
        }));
        post(route('tarif.store'), {
            onFinish: () => transform((form) => form),
        });
    };

    return (
        <AuthenticatedLayout header="Tambah Tarif">
            <Head title="Tambah Tarif" />

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Form Tarif</CardTitle>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nama">Nama Layanan</Label>
                            <Input
                                id="nama"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                placeholder="Cuci Kering"
                            />
                            {errors.nama && (
                                <p className="text-sm text-destructive">
                                    {errors.nama}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="harga_per_kilo">Harga / Kilo</Label>
                            <Input
                                id="harga_per_kilo"
                                type="number"
                                min="0"
                                step="1"
                                value={data.harga_per_kilo}
                                onChange={(e) =>
                                    setData('harga_per_kilo', e.target.value)
                                }
                                placeholder="7000"
                            />
                            {errors.harga_per_kilo && (
                                <p className="text-sm text-destructive">
                                    {errors.harga_per_kilo}
                                </p>
                            )}
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
                            Simpan
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route('tarif.index')}>Batal</Link>
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </AuthenticatedLayout>
    );
}
