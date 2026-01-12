# 🎨 Frontend React Components - WhatsApp 2FA Integration

## 📱 3 Komponen Baru Dibuat

### 1️⃣ **WhatsAppOtpModal.tsx** - Registrasi dengan 2FA

📍 Lokasi: `src/components/WhatsAppOtpModal.tsx`

**Features:**

- Input nomor WhatsApp dengan format validation
- Generate OTP 6-digit
- Step 1: Input & send OTP
- Step 2: Buka WhatsApp → Copy kode → Verify
- wa.me link dengan pre-filled message
- Loading states dan error handling

**How to Use:**

```tsx
import { WhatsAppOtpModal } from "./components/WhatsAppOtpModal";

const [showWhatsAppOtp, setShowWhatsAppOtp] = useState(false);

<WhatsAppOtpModal
  isOpen={showWhatsAppOtp}
  onClose={() => setShowWhatsAppOtp(false)}
  onSuccess={(phoneNumber) => {
    console.log("Verified:", phoneNumber);
    // Proceed ke registration
  }}
  type="user" // atau "business"
/>;
```

**API Integration:**

- POST `/api/auth/send-otp-register` (User)
- POST `/api/auth/verify-otp-register` (User)
- POST `/api/businesses/send-otp-register` (Business)
- POST `/api/businesses/verify-otp-register` (Business)

---

### 2️⃣ **CartSidebarGrouped.tsx** - Cart Terpisah per UMKM

📍 Lokasi: `src/components/CartSidebarGrouped.tsx`

**Features:**

- Group cart items by UMKM (business)
- Collapsible UMKM sections
- Show UMKM name + item count + subtotal
- Separate checkout button PER UMKM
- Tidak bisa mix checkout dari multiple UMKMs
- Quantity controls (+ / -)
- Remove item button

**Key Points:**

- 1 UMKM = 1 checkout flow
- User bisa punya items dari multiple UMKMs
- Tapi checkout satu per satu ke masing2 UMKM
- Setiap checkout ke UMKM beda = order ID berbeda

**How to Use:**

```tsx
import { CartSidebarGrouped } from "./components/CartSidebarGrouped";

<CartSidebarGrouped
  isOpen={isCartOpen}
  onClose={() => setIsCartOpen(false)}
  userPhoneNumber={userPhone}
/>;
```

---

### 3️⃣ **OrderHistoryModalNew.tsx** - Order History + WhatsApp Contact

📍 Lokasi: `src/components/OrderHistoryModalNew.tsx`

**Features:**

- List semua orders user
- Group by UMKM
- Status badge (pending, diproses, dikirim, selesai)
- Show order details (items, total, catatan)
- Button: "Hubungi UMKM via WhatsApp"
- Auto-open WhatsApp dengan pre-filled message
- Loading states

**Status Colors:**

- ⏳ Menunggu Konfirmasi = Yellow
- 🔵 Sedang Diproses = Blue
- 🟣 Sedang Dikirim = Purple
- 🟢 Selesai = Green
- 🔴 Dibatalkan = Red

**How to Use:**

```tsx
import { OrderHistoryModal } from "./components/OrderHistoryModalNew";

<OrderHistoryModal
  isOpen={showOrderHistory}
  onClose={() => setShowOrderHistory(false)}
  userPhoneNumber={userPhone}
/>;
```

**API Integration:**

- GET `/api/orders/user/all` (Fetch user orders)
- GET `/api/orders/{orderId}` (Get order details + wa.me link)

---

## 🔄 Flow Diagram

### Registration Flow

```
User
  ↓
Click "Daftar via WhatsApp"
  ↓
[WhatsAppOtpModal]
  ├─ Input nomor: 0812345678901
  ├─ Generate OTP: 670613
  ├─ wa.me link terbuka
  ├─ User copy OTP
  ├─ Paste OTP ke form
  └─ Verify → Success!
  ↓
User verified, proceed ke profile/home
```

### Shopping + Checkout Flow

```
User browse products
  ↓
Add to cart (product A dari UMKM 1)
Add to cart (product B dari UMKM 1)
Add to cart (product C dari UMKM 2)
  ↓
Open Cart
  ├─ UMKM 1 (2 items, Rp XX)
  │  └─ Button: Checkout UMKM 1
  └─ UMKM 2 (1 item, Rp XX)
     └─ Button: Checkout UMKM 2
  ↓
Click "Checkout UMKM 1"
  ├─ Create order untuk UMKM 1 only
  ├─ Remove items dari UMKM 1 dari cart
  └─ Pelanggan dapat wa.me link
  ↓
User buka WhatsApp → Kirim order ke UMKM
  ↓
UMKM confirm order → update status
```

### Order History Flow

```
User click "Riwayat Pesanan"
  ↓
[OrderHistoryModal]
  ├─ Fetch all orders dari API
  ├─ Show orders grouped by UMKM
  ├─ Show status untuk tiap order
  └─ Button: "Hubungi UMKM via WhatsApp"
  ↓
Click button
  ├─ Fetch order details + whatsapp_link
  ├─ Open WhatsApp dengan pre-filled message
  └─ UMKM info: alamat, catatan, dll
  ↓
User communicate directly dengan UMKM
```

---

## 📝 Integration Checklist

### Update LoginModal.tsx

```tsx
// Add import
import { WhatsAppOtpModal } from './WhatsAppOtpModal';

// Add state
const [showWhatsAppOtp, setShowWhatsAppOtp] = useState(false);

// Add button di LoginModal
<button onClick={() => setShowWhatsAppOtp(true)}>
  Daftar via WhatsApp
</button>

// Add modal
<WhatsAppOtpModal
  isOpen={showWhatsAppOtp}
  onClose={() => setShowWhatsAppOtp(false)}
  onSuccess={(phone) => {
    // Save phone, proceed ke registration
  }}
  type="user"
/>
```

### Update App.tsx / Main Component

```tsx
// Replace CartSidebar dengan CartSidebarGrouped
// import { CartSidebarGrouped } from './components/CartSidebarGrouped';

<CartSidebarGrouped
  isOpen={isCartOpen}
  onClose={toggleCart}
  userPhoneNumber={user?.phone}
/>

// Add OrderHistoryModal
<OrderHistoryModal
  isOpen={showOrderHistory}
  onClose={() => setShowOrderHistory(false)}
  userPhoneNumber={user?.phone}
/>
```

---

## 🎯 Key Technical Details

### Phone Number Handling

- Input format: `0812345678901` atau `812345678901`
- Send to API: `628175447460` (format +62)
- Auto-conversion in components

### API Headers

```typescript
headers: {
  'Content-Type': 'application/json',
  'X-User-ID': userPhoneNumber, // Required for fetch operations
}
```

### Error Handling

- Invalid OTP format
- Expired OTP (auto-refresh)
- Network errors → toast notifications
- Form validation

### State Management

- Cart: Context API (existing)
- User: Context API atau localStorage
- Modal states: useState (local)

---

## 🚀 Next Steps

1. **Import components di App.tsx**
2. **Update LoginModal untuk WhatsApp registration**
3. **Replace CartSidebar dengan CartSidebarGrouped**
4. **Add OrderHistoryModal ke main layout**
5. **Test full flow end-to-end**
6. **Style adjustments sesuai design**

---

## 📦 Dependencies

- `react` & `react-dom`
- `lucide-react` (Icons) ✅ Already in project
- `motion/react` (Animations) ✅ Already in project
- `sonner@2.0.3` (Toast notifications) ✅ Already in project

---

**Version**: 1.0 - Frontend Components  
**Status**: ✅ Ready to integrate  
**Last Updated**: December 19, 2025
