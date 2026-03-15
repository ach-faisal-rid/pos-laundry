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

export default function Edit({ dana }) {
    const { data, setData, put, processing, errors } = useForm({
        keterangan: dana?.keterangan ?? '',
        jumlah: dana?.jumlah ?? '',
        tanggal: dana?.tanggal ?? new Date().toISOString().slice(0, 10),
        jenis: dana?.jenis ?? 'pengeluaran',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('dana-perawatan.update', dana.id));
    };

    return (
        <AuthenticatedLayout header="Edit Dana Perawatan">
            <Head title="Edit Dana Perawatan" />

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Edit Dana Perawatan</CardTitle>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="space-y-4">
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
                            <Label>Jenis</Label>
                            <Select
                                value={data.jenis}
                                onValueChange={(value) =>
                                    setData('jenis', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pengeluaran">
                                        Pengeluaran
                                    </SelectItem>
                                    <SelectItem value="pemasukan">
                                        Pemasukan
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.jenis && (
                                <p className="text-sm text-destructive">
                                    {errors.jenis}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="jumlah">Jumlah</Label>
                            <Input
                                id="jumlah"
                                type="number"
                                min="0"
                                step="1"
                                value={data.jumlah}
                                onChange={(e) =>
                                    setData('jumlah', e.target.value)
                                }
                                placeholder="50000"
                            />
                            {errors.jumlah && (
                                <p className="text-sm text-destructive">
                                    {errors.jumlah}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="keterangan">Keterangan</Label>
                            <Textarea
                                id="keterangan"
                                value={data.keterangan}
                                onChange={(e) =>
                                    setData('keterangan', e.target.value)
                                }
                                placeholder="Servis mesin cuci"
                            />
                            {errors.keterangan && (
                                <p className="text-sm text-destructive">
                                    {errors.keterangan}
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button type="submit" disabled={processing}>
                            Simpan Perubahan
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route('dana-perawatan.index')}>
                                Batal
                            </Link>
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </AuthenticatedLayout>
    );
}
