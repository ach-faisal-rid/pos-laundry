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
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ pelanggan }) {
    const { data, setData, put, processing, errors } = useForm({
        nama: pelanggan?.nama ?? '',
        no_hp: pelanggan?.no_hp ?? '',
        alamat: pelanggan?.alamat ?? '',
    });
    const digitsOnly = data.no_hp.replace(/\D/g, '');
    const noHpLengthInvalid =
        digitsOnly.length > 0 &&
        (digitsOnly.length < 11 || digitsOnly.length > 14);

    const submit = (e) => {
        e.preventDefault();
        put(route('pelanggan.update', pelanggan.id));
    };

    return (
        <AuthenticatedLayout header="Edit Pelanggan">
            <Head title="Edit Pelanggan" />

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Edit Data Pelanggan</CardTitle>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="space-y-4">
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
        </AuthenticatedLayout>
    );
}
