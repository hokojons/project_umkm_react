@echo off
REM Test submit UMKM with curl

curl -X POST "http://localhost:8000/api/umkm/submit" ^
  -H "X-User-ID: 8" ^
  -F "nama_toko=Test Toko" ^
  -F "nama_pemilik=Test Owner" ^
  -F "deskripsi=Test Deskripsi" ^
  -F "kategori_id=1" ^
  -F "produk=[{\"nama_produk\":\"Test Product\",\"deskripsi\":\"Test Desc\",\"harga\":10000,\"stok\":10,\"kategori\":\"product\"}]"
