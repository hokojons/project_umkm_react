# Pasar UMKM Marketplace

Platform marketplace digital yang didedikasikan untuk memberdayakan Usaha Mikro, Kecil, dan Menengah (UMKM). Aplikasi ini memungkinkan UMKM untuk memasarkan produk mereka secara online dan memudahkan pelanggan untuk menemukan serta membeli produk lokal berkualitas.

## 🚀 Fitur Utama

- **Authentication & Authorization**: Sistem login aman dengan multi-role (Customer, UMKM Owner, Admin).
- **Manajemen Produk**: UMKM dapat mengelola (tambah, edit, hapus) produk mereka dengan mudah.
- **Katalog Produk**: Tampilan katalog yang menarik dengan fitur pencarian dan filter.
- **Keranjang Belanja & Checkout**: Alur pembelian yang mulus dari pemilihan produk hingga pembayaran.
- **Dashboard Admin**: Panel kontrol untuk mengelola user, transaksi, dan konten platform.
- **Responsive Design**: Tampilan yang optimal di berbagai ukuran layar (Desktop, Tablet, Mobile).
- **Dark Mode**: Dukungan tema gelap dan terang untuk kenyamanan pengguna.
- **UI Interaktif**: Menggunakan animasi halus dan komponen modern untuk pengalaman pengguna yang lebih baik.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) (v18) dengan [Vite](https://vitejs.dev/)
- **Bahasa**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)
- **State Management & Data**: React Hook Form, Axios
- **Routing**: React Router DOM (v7)
- **Animation**: Framer Motion
- **Charts**: Recharts

### Backend
- **Framework**: [Laravel](https://laravel.com/) (v12)
- **Bahasa**: PHP (v8.2+)
- **Database**: MySQL

## 📦 Instalasi & Menjalankan Project

Ikuti langkah-langkah berikut untuk menjalankan project ini di komputer lokal Anda.

### Prasyarat
- Node.js & npm / yarn
- PHP & Composer
- Database MySQL

### 1. Setup Backend (Laravel)

```bash
cd laravel

# Install dependencies
composer install

# Copy .env file
cp .env.example .env

# Generate Application Key
php artisan key:generate

# Konfigurasi database di file .env, kemudian jalankan migrasi
php artisan migrate

# Jalankan server
php artisan serve
```

### 2. Setup Frontend (React)

```bash
cd React

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Aplikasi frontend akan berjalan di `http://localhost:5173` (atau port lain yang tersedia) dan backend di `http://localhost:8000`.

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan buat Pull Request untuk perubahan yang ingin Anda ajukan.

## 📄 Lisensi

Project ini dilisensikan di bawah [MIT License](LICENSE).
