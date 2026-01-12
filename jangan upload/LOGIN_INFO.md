# Login Credentials - Testing

## Admin Account
- **Email**: admin@umkm.com
- **Password**: password
- **Phone**: 08123456789
- **Role**: admin

## Test Customer Account
- **Email**: customer@test.com
- **Phone**: 081234567899
- **Password**: password123
- **Role**: customer

## UMKM Owners (Sample Data)
All UMKM owners use password: `password`

1. **Budi Santoso** - Warung Makan Bu Budi
   - Phone: 081234567890
   - Email: budi@umkm.com
   - Role: umkm_owner

2. **Siti Rahmawati** - Kerajinan Tangan Siti
   - Phone: 081234567891
   - Email: siti@umkm.com
   - Role: umkm_owner

3. **Ahmad Wijaya** - Fashion Ahmad Collection
   - Phone: 081234567892
   - Email: ahmad@umkm.com
   - Role: umkm_owner

4. **Dewi Lestari** - Kue Lestari
   - Phone: 081234567893
   - Email: dewi@umkm.com
   - Role: umkm_owner

5. **Rudi Hartono** - Elektronik Rudi
   - Phone: 081234567894
   - Email: rudi@umkm.com
   - Role: umkm_owner

## Login Methods
You can login using either:
- Email + Password
- Phone Number + Password

Example:
```json
{
  "email": "admin@umkm.com",
  "password": "password"
}
```
or
```json
{
  "no_telepon": "08123456789",
  "password": "password"
}
```
