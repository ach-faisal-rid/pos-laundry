<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePelangganRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $pelangganId = $this->route('pelanggan')?->id;

        return [
            'nama' => ['required', 'string', 'max:255'],
            'no_hp' => [
                'required',
                'string',
                'min:11',
                'max:14',
                'regex:/^[0-9+()\\-\\s]+$/',
                Rule::unique('pelanggans', 'no_hp')->ignore($pelangganId),
            ],
            'alamat' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'no_hp.min' => 'No. HP harus 11-14 digit. Contoh: 08537182716',
            'no_hp.max' => 'No. HP harus 11-14 digit. Contoh: 08537182716',
            'no_hp.regex' => 'No. HP hanya boleh angka dan simbol +()-spasi.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $noHp = $this->no_hp ? preg_replace('/\D+/', '', $this->no_hp) : $this->no_hp;
        if (is_string($noHp) && str_starts_with($noHp, '62')) {
            $noHp = '0' . substr($noHp, 2);
        }

        $this->merge([
            'nama' => $this->nama ? trim($this->nama) : $this->nama,
            'no_hp' => $noHp ? trim($noHp) : $noHp,
            'alamat' => $this->alamat ? trim($this->alamat) : $this->alamat,
        ]);
    }
}
