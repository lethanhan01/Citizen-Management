# 📋 Rà Soát Mã Nguồn - Citizen Management System

**Ngày rà soát:** 18 Tháng 1, 2025
**Phạm vi:** Toàn bộ dự án (Server + Client)

---

## 🔴 NHỮNG VẤN ĐỀ TIỀM ẨN VÀ TỒN TẠI

### I. 🚨 VẤN ĐỀ BẢO MẬT CAO

#### 1. **Tiếp lộ Thông Tin Nhạy Cảm trong Mã Nguồn**
- **Vị trí:** `server/.env` (đang commit vào Git)
- **Chi tiết:**
  - Supabase API key công khai: `SUPABASE_KEY=eyJhbGc...`
  - Database password: `DB_PASSWORD=PrjKTPMPasswordDB5432`
  - JWT secret đơn giản: `JWT_SECRET=cai_nay_dung_de_sign_token_khi_login`
  - Password pepper: `PASSWORD_PEPPER=chuoi_bi_mat_cuc_dai_va_ngau_nhien_123456789`

**⚠️ Tác hại:** Bất kỳ ai truy cập repository cũng có thể lấy được toàn bộ credentials để truy cập database production

**🔧 Giải pháp:**
```bash
# 1. Thêm vào .gitignore ngay lập tức
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# 2. Xóa lịch sử git của .env (nếu muốn tuyệt đối an toàn)
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch server/.env' --prune-empty --tag-name-filter cat -- --all

# 3. Tạo file .env.example để hướng dẫn config
# 4. Thay đổi toàn bộ credentials ngay lập tức (Supabase key, DB password, JWT secret)
```

---

#### 2. **Endpoint Đăng Ký (Register) Không Bảo Vệ**
- **Vị trí:** `server/src/routes/web.js` dòng 55
- **Chi tiết:**
```javascript
router.post("/api/v1/auth/register", authController.handleRegister);
// ❌ Không có kiểm tra quyền! Bất kỳ ai cũng có thể tạo tài khoản
```

**⚠️ Tác hại:** Bất kỳ người dùng nào từ bên ngoài đều có thể tự tạo tài khoản admin/accountant mới

**🔧 Giải pháp:**
```javascript
// Thêm kiểm tra xác thực
router.post(
  "/api/v1/auth/register",
  verifyToken,           // ← Yêu cầu đã đăng nhập
  checkRole(["admin"]),  // ← Chỉ admin mới được tạo user
  authController.handleRegister
);
```

---

#### 3. **Cảnh Báo trong Code: Endpoint Đăng Ký Cục Bộ**
- **Vị trị:** `server/src/routes/web.js` dòng 54
- **Nội dung:** Comment cảnh báo: "Cái này cực kỳ nguy hiểm => Tạo ra để Group test => Cần xóa đi khi hoàn thiện project"
- **⚠️ Vấn đề:** Endpoint vẫn còn mở nhưng không bảo vệ

---

#### 4. **SSL Certificate Bypass cho Supabase**
- **Vị trị:** `server/src/config/sequelize.js`
```javascript
ssl: {
  require: true,
  rejectUnauthorized: false  // ❌ NGUY HIỂM: Cho phép MITM attack
}
```

**⚠️ Tác hại:** Cho phép tấn công Man-in-the-Middle (MITM)

**🔧 Giải pháp:**
```javascript
// Chỉ dùng rejectUnauthorized: false khi phát triển locally
const rejectUnauthorized = process.env.NODE_ENV !== 'production';
// Hoặc tải certificate SSL đúng cách
```

---

#### 5. **JWT Secret Quá Đơn Giản**
- **Vị trị:** `server/.env`
- **Chi tiết:** `JWT_SECRET=cai_nay_dung_de_sign_token_khi_login` (dễ đoán)

**🔧 Giải pháp:**
```bash
# Tạo secret mạnh bằng:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Kết quả: 8f3d2c...a9b1c (64 ký tự ngẫu nhiên)
```

---

### II. ⚠️ VẤN ĐỀ XÁC THỰC & PHÂN QUYỀN

#### 1. **Không Xác Thực Token ở Phía Server cho Nhiều Routes**
- **Vị trị:** `server/src/routes/web.js`
- **Chi tiết:** 
  - Route `/api/v1/campaigns` (dòng 50 trong index.js): Không yêu cầu `verifyToken`
  - Nhiều route GET có thể không được bảo vệ đầy đủ

**🔧 Giải pháp:**
```javascript
// Kiểm tra tất cả routes quan trọng phải có verifyToken
router.get("/api/v1/campaigns", verifyToken, campaignController.getCampaigns);
```

---

#### 2. **Token Hết Hạn: Chỉ Kiểm Tra Phía Client**
- **Vị trí:** `client/src/lib/axios.ts`
- **Chi tiết:** Client kiểm tra `exp` claim nhưng backend không refresh token
- **⚠️ Vấn đề:** Nếu client bị lộ localStorage, token vẫn hợp lệ đến khi hết hạn

**🔧 Giải pháp:**
- Implement refresh token flow
- Thêm token blacklist/revocation trên server
- Giảm JWT expiry time (ví dụ: 15 phút thay vì 24h)

---

#### 3. **Role "staff" Chỉ Kiểm Tra Phía Client**
- **Vị trí:** `client/src/components/RequireAuth.tsx`
- **Chi tiết:** 
```typescript
// ❌ Kiểm tra role ở client có thể bị bypass
if (user?.role === "staff" && !isStaffAllowed(location.pathname)) {
  return showAuthPopup;
}
```

**⚠️ Tác hại:** Người dùng có thể sửa localStorage để thay đổi role thành "admin"

**🔧 Giải pháp:**
- Backend PHẢI kiểm tra `checkRole` trên mọi sensitive routes
- Frontend chỉ làm UI improvement, không phải duy nhất validation

---

#### 4. **Endpoint Xóa User Không Kiểm Tra Quyền**
- **Vị trí:** `server/src/routes/web.js` dòng 84-88, 110-114
```javascript
// ❌ Thiếu checkRole
router.delete(
    "/api/v1/users/:id",
    verifyToken,  // ← Chỉ kiểm tra token, không kiểm tra role
    userController.handleDeleteUser
);
```

**🔧 Giải pháp:**
```javascript
router.delete(
    "/api/v1/users/:id",
    verifyToken,
    checkRole(["admin"]),  // ← Thêm dòng này
    userController.handleDeleteUser
);
```

---

### III. 🐛 VẤN ĐỀ LỖI & XỬ LÝ EXCEPTION

#### 1. **Endpoint `/campaigns` Không Được Xử Lý Đúng**
- **Vị trí:** `server/src/index.js` dòng 50-55
```javascript
app.get("/campaigns", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM finance.campaign");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi truy vấn database");  // ❌ Không theo format JSON
    }
});
```

**⚠️ Vấn đề:**
- Không tuân theo REST API format
- Không xác thực token
- Nên sử dụng controller pattern thay vì inline logic

**🔧 Giải pháp:**
- Di chuyển logic sang campaign controller
- Thêm `verifyToken` middleware
- Trả về JSON error format nhất quán

---

#### 2. **Error Messages Tiếp Lộ Chi Tiết Nội Bộ**
- **Vị trị:** `server/src/controllers/personController.js`
```javascript
res.status(500).json({
    success: false,
    message: "Lỗi khi lấy danh sách nhân khẩu",
    error: error.message  // ❌ Tiếp lộ chi tiết lỗi
});
```

**⚠️ Tác hại:** Attacker có thể biết chi tiết hệ thống qua error message

**🔧 Giải pháp:**
```javascript
// Production
if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
} else {
    res.status(500).json({ success: false, message: "Lỗi", error: error.message });
}
```

---

#### 3. **Không Kiểm Tra Input Validation**
- **Vị trí:** Hầu hết controllers không xác thực dữ liệu đầu vào
- **Ví dụ:** `server/src/controllers/personController.js` - không kiểm tra độ tuổi, email format, v.v.

**🔧 Giải pháp:**
```javascript
// Sử dụng middleware validation
import { body, validationResult } from 'express-validator';

router.put(
    "/api/v1/nhan-khau/:id",
    [
        body('full_name').trim().notEmpty().withMessage('Name required'),
        body('dob').isISO8601().withMessage('Invalid date format'),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        next();
    },
    personController.updateNhanKhau
);
```

---

### IV. 🔍 VẤN ĐỀ HIỆU SUẤT & SCALABILITY

#### 1. **Database Connection Pool Quá Nhỏ**
- **Vị trí:** `server/src/config/db.js` dòng 18
```javascript
max: 5,  // ❌ Chỉ 5 connection
idleTimeoutMillis: 30000,
```

**⚠️ Vấn đề:** Với 5 connection limit, hệ thống dễ bị reject connection khi load cao

**🔧 Giải pháp:**
```javascript
max: 20,  // Tăng lên (tuỳ thuộc server resources)
min: 2,   // Thêm minimum connections
```

---

#### 2. **Sequelize Logging Bị Tắt**
- **Vị trị:** `server/src/config/sequelize.js`
```javascript
logging: false  // ❌ Khó debug khi có issue
```

**🔧 Giải pháp:**
```javascript
logging: process.env.NODE_ENV === 'development' ? console.log : false
```

---

#### 3. **Không Có Pagination Mặc Định**
- **Vị trí:** `server/src/controllers/personController.js`
- **Chi tiết:** Query có `limit` nhưng nếu client không truyền, sẽ lấy tất cả records (có thể 100k records)

**🔧 Giải pháp:**
```javascript
const limit = Math.min(parseInt(req.query.limit) || 20, 100);  // Cap max 100
const page = Math.max(parseInt(req.query.page) || 1, 1);
```

---

#### 4. **N+1 Query Problem (Sequelize Associations)**
- **Vị trí:** Khi lấy household và người dùng, có thể không include associations
- **Ví dụ:** Lấy 20 households → 20 queries cho head person

**🔧 Giải pháp:**
```javascript
const households = await Household.findAll({
    include: [
        { association: 'head', attributes: ['person_id', 'full_name'] },
        { association: 'members', attributes: ['person_id', 'full_name'] }
    ]
});
```

---

### V. 🔴 VẤN ĐỀ KIẾN TRÚC & DESIGN

#### 1. **Sử Dụng `any` Type Quá Nhiều trong TypeScript**
- **Vị trí:** `client/src/**/*.tsx`
```typescript
// ❌ Quá nhiều 'any'
const list = (res.data?.data ?? []).map((u: any) => ({...}));
```

**⚠️ Tác hại:** Mất đi lợi ích của TypeScript

**🔧 Giải pháp:**
```typescript
interface User {
    id: string;
    username: string;
    role: 'admin' | 'accountant' | 'staff';
}

const list = (res.data?.data ?? []).map((u: User) => ({...}));
```

---

#### 2. **Console.log Quá Nhiều trong Production**
- **Vị trị:** `client/src/pages/services/people/UpdatePerson.tsx` - 10+ console.log
- **Vị trí:** `server/src/services/feeService.js`, `schedulerService.js`

**🔧 Giải pháp:**
```typescript
// Tạo utility logger
const logger = {
    debug: (msg: string) => {
        if (process.env.NODE_ENV !== 'production') console.log(msg);
    },
    error: (msg: string, err?: any) => console.error(msg, err)
};
```

---

#### 3. **Không Có Error Boundary cho Dashboard**
- **Vị trị:** `client/src/pages/Dashboard.tsx` - Sử dụng `lazy` import nhưng nếu fail không có fallback
- **Chi tiết:** 
```typescript
const LazyChart = lazy(() =>
    import('@coreui/react-chartjs').then((m) => ({ default: m.CChart }))
);
```

**🔧 Giải pháp:**
```typescript
const Chart = (props: ChartProps) => (
  <Suspense fallback={<div>Đang tải biểu đồ...</div>}>
    <ErrorBoundary FallbackComponent={ChartErrorFallback}>
      <LazyChart {...props} />
    </ErrorBoundary>
  </Suspense>
);
```

---

#### 4. **Không Có Loading State Cho Async Operations**
- **Vị trị:** Nhiều components không hiển thị loading khi fetch data
- **Ví dụ:** `Dashboard.tsx` - có `loading` state nhưng không hiển thị spinner

**🔧 Giải pháp:**
```typescript
if (loading) return <Spinner />;
if (error) return <ErrorAlert message={error} />;
return <DashboardContent data={dashboardData} />;
```

---

### VI. 🔐 VẤN ĐỀ DATABASE & DATA INTEGRITY

#### 1. **Không Có Transaction cho Cleanup Job**
- **Vị trị:** `server/src/services/schedulerService.js` - Có transaction nhưng nếu fail toàn bộ rollback
- **Chi tiết:** Job chạy hàng ngày nhưng nếu fail không có retry logic

**🔧 Giải pháp:**
```javascript
export const initScheduledJobs = () => {
    cron.schedule("0 0 * * *", async () => {
        try {
            await cleanupExpiredMemberships();
        } catch (error) {
            console.error("Cron job failed:", error);
            // Thêm: Send alert email, Log to monitoring service
            await logErrorToDB(error);
        }
    });
};
```

---

#### 2. **Không Có Soft Delete**
- **Vị trí:** Hầu hết controllers implement hard delete
- **⚠️ Vấn đề:** Dữ liệu lịch sử bị mất, audit trail không đầy đủ

**🔧 Giải pháp:**
```javascript
// Model: Thêm deleted_at column
Person.addScope('notDeleted', {
    where: { deleted_at: null }
});

// Update queries
const person = await Person.scope('notDeleted').findByPk(id);
```

---

#### 3. **Không Có Audit Log**
- **Vị trí:** Không có tracking ai thay đổi gì, khi nào

**🔧 Giải pháp:**
```javascript
// Middleware tự động log changes
async function auditLog(req, res, next) {
    const originalSend = res.json;
    res.json = function(data) {
        if (req.method !== 'GET') {
            await AuditLog.create({
                user_id: req.user?.user_id,
                action: req.method,
                resource: req.path,
                timestamp: new Date()
            });
        }
        return originalSend.call(this, data);
    };
    next();
}
```

---

### VII. 🔧 VẤN ĐỀ CẤU HÌNH & DEPLOYMENT

#### 1. **Không Có Environment-Specific Config**
- **Vị trị:** `client/.env` hardcoded cho production URL
- **⚠️ Vấn đề:** Khó phát triển locally, khó thay đổi env

**🔧 Giải pháp:**
```bash
# Tạo file riêng
.env.development → http://localhost:5000
.env.production  → https://citizen-management-w0w5.onrender.com
.env.staging     → https://staging-api.example.com
```

---

#### 2. **CORS Quá Rộng Có Thể**
- **Vị trị:** `server/src/index.js`
```javascript
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);  // ❌ Cho phép request không có origin
        if (allowed.length === 0 || allowed.includes(origin)) {  // ❌ Nếu allowed.length === 0, cho phép tất cả
```

**🔧 Giải pháp:**
```javascript
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin && process.env.NODE_ENV !== 'development') {
            return callback(new Error('CORS: Missing origin'));
        }
        if (allowed.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400  // Thêm cache 1 ngày
};
```

---

#### 3. **Không Có Rate Limiting**
- **⚠️ Vấn đề:** API dễ bị brute force, DDoS

**🔧 Giải pháp:**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 phút
    max: 100,  // 100 requests per 15 min
    message: 'Quá nhiều request, vui lòng thử lại sau'
});

app.use('/api/', limiter);

// Rate limit strict hơn cho login
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,  // 1 giờ
    max: 5,  // 5 attempts per hour
    skipSuccessfulRequests: true
});

router.post('/api/v1/auth/login', loginLimiter, authController.handleLogin);
```

---

#### 4. **Không Có HTTPS Enforcement**
- **⚠️ Vấn đề:** Token có thể bị sniff trên HTTPS

**🔧 Giải pháp:**
```javascript
// Thêm HSTS header
app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// Redirect HTTP → HTTPS
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            return res.redirect(301, `https://${req.header('host')}${req.url}`);
        }
        next();
    });
}
```

---

### VIII. 📋 VẤN ĐỀ DOCUMENTATION & CODE QUALITY

#### 1. **Không Có JSDoc Comments**
- **Vị trị:** Hầu hết function không có description
- **⚠️ Vấn đề:** Khó maintain, khó onboard developer mới

**🔧 Giải pháp:**
```javascript
/**
 * Lấy danh sách nhân khẩu với phân trang
 * @param {number} page - Trang hiện tại (mặc định: 1)
 * @param {number} limit - Số record mỗi trang (mặc định: 20)
 * @param {string} search - Từ khóa tìm kiếm (optional)
 * @returns {Promise<{data: Array, pagination: Object}>}
 * @throws {Error} Nếu query database thất bại
 */
export const getAllNhanKhau = async (req, res) => { ... };
```

---

#### 2. **Không Có Unit Tests**
- **⚠️ Vấn đề:** Khó refactor, dễ introduce bugs
- **package.json:** `"test": "echo \"Error: no test specified\" && exit 1"`

**🔧 Giải pháp:**
```bash
# Thêm Jest + testing library
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Viết test
describe('PersonController.getAllNhanKhau', () => {
    it('should return paginated persons', async () => {
        const mockPersons = [{ id: 1, name: 'John' }];
        // Mock service...
        const result = await getAllNhanKhau(mockReq, mockRes);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: mockPersons
        }));
    });
});
```

---

#### 3. **Type Definitions Không Tổ Chức Tốt**
- **Vị trị:** `client/src/types/` - Có file `citizen.ts`, `household.ts` nhưng không có index.ts central export

**🔧 Giải pháp:**
```typescript
// client/src/types/index.ts
export * from './citizen';
export * from './household';
export * from './account';

// Sử dụng: import { Citizen, Household } from '@/types';
// Thay vì: import { Citizen } from '@/types/citizen'; ...
```

---

### IX. 🔄 VẤN ĐỀ CRON JOB & SCHEDULED TASKS

#### 1. **Scheduler Không Robust**
- **Vị trị:** `server/src/services/schedulerService.js`
- **Chi tiết:**
  - Không có retry mechanism nếu job fail
  - Không có alerting khi job fail
  - Không có way để stop/pause job

**🔧 Giải pháp:**
```javascript
// Thêm job status tracking
const jobStatus = {
    lastRun: null,
    nextRun: null,
    isRunning: false,
    lastError: null
};

export const initScheduledJobs = () => {
    cron.schedule("0 0 * * *", async () => {
        if (jobStatus.isRunning) {
            console.warn("Previous job still running, skipping");
            return;
        }
        
        jobStatus.isRunning = true;
        jobStatus.lastRun = new Date();
        
        try {
            await cleanupExpiredMemberships();
            jobStatus.lastError = null;
        } catch (error) {
            jobStatus.lastError = error.message;
            await sendAlert(error);  // Gửi email alert
            // Retry logic
            setTimeout(() => retryJob(), 5000);
        } finally {
            jobStatus.isRunning = false;
            jobStatus.nextRun = new Date(Date.now() + 24*60*60*1000);
        }
    });
    
    // Expose job status endpoint
    app.get('/api/v1/scheduler-status', (req, res) => {
        res.json(jobStatus);
    });
};
```

---

### X. 🎨 VẤN ĐỀ FRONTEND

#### 1. **localStorage Có Thể Bị XSS**
- **Vị trị:** `client/src/stores/auth.store.ts`
```typescript
localStorage.setItem('token', token);  // ❌ Dễ bị XSS
```

**🔧 Giải pháp:**
```typescript
// Option 1: Sử dụng HttpOnly cookie (yêu cầu backend support)
// Option 2: Memory storage + SessionStorage (tuy nhiên mất data on refresh)
// Option 3: Dùng IndexedDB + encryption
```

---

#### 2. **Không Sanitize HTML Output**
- **⚠️ Vấn đề:** Nếu có field cho user input mà display lại (XSS vulnerability)

**🔧 Giải pháp:**
```bash
npm install dompurify

# Sử dụng:
import DOMPurify from 'dompurify';
<div>{DOMPurify.sanitize(userInput)}</div>
```

---

#### 3. **State Management Không Consistent**
- **Vị trị:** Nhiều stores (`person.store`, `fee.store`, v.v.) nhưng không có pattern nhất quán
- **⚠️ Vấn đề:** Khó maintain, dễ miss caching logic

**🔧 Giải pháp:**
```typescript
// Tạo base factory
export const createStore = <T>(name: string, initialState: T) => {
    return create<T>()(
        persist(
            (set) => ({
                ...initialState,
                setState: (partial) => set(partial)
            }),
            { name: `${name}-store` }
        )
    );
};
```

---

## 📊 BẢNG TÓM TẮT CÁC VẤN ĐỀ

| Mức Độ | Thể Loại | Vấn Đề | Ưu Tiên |
|--------|----------|--------|---------|
| 🔴 Critical | Security | Credentials trong .env + Git | 1 |
| 🔴 Critical | Security | Register endpoint không bảo vệ | 2 |
| 🔴 Critical | Security | SSL bypass + rejectUnauthorized: false | 3 |
| 🟠 High | Security | Role validation chỉ phía client | 4 |
| 🟠 High | Security | No rate limiting | 5 |
| 🟠 High | Auth | Endpoints thiếu role check | 6 |
| 🟠 High | Design | Quá nhiều `any` type | 7 |
| 🟡 Medium | Perf | Connection pool quá nhỏ (max: 5) | 8 |
| 🟡 Medium | Design | No input validation | 9 |
| 🟡 Medium | Testing | Không có unit tests | 10 |

---

## ✅ DANH SÁCH KIỂM TRA CẦN LÀM NGAY

- [ ] **Xóa .env khỏi Git history** - NGAY LẬP TỨC
- [ ] **Thay đổi tất cả credentials** (Supabase, DB, JWT)
- [ ] **Thêm .env vào .gitignore**
- [ ] **Bảo vệ endpoint `/auth/register`** với `verifyToken + checkRole(['admin'])`
- [ ] **Sửa SSL config** - loại bỏ `rejectUnauthorized: false` cho production
- [ ] **Thêm input validation** cho tất cả POST/PUT endpoints
- [ ] **Implement rate limiting** cho login + API
- [ ] **Kiểm tra tất cả routes** có `verifyToken` và `checkRole` thích hợp
- [ ] **Thêm environment-specific config** (.env.development, .env.production)
- [ ] **Tăng database connection pool** từ 5 → 20
- [ ] **Thêm monitoring** cho scheduler jobs
- [ ] **Bắt đầu viết unit tests**
- [ ] **Document public API** với Swagger/OpenAPI

---

## 🎯 KHUYẾN NGHỊ TRUNG HẠN

1. **Implement CI/CD pipeline** - tự động chạy tests, linting trước mỗi PR
2. **Setup monitoring & logging** - Sentry, DataDog, hoặc tương tự
3. **Database migration management** - Sequelize migrations structured
4. **API versioning** - /api/v2 khi cần breaking changes
5. **Documentation** - Swagger/OpenAPI spec cho public API

---

## 📞 LIÊN HỆ

Nếu có câu hỏi về các issue được nêu trên, vui lòng tham khảo:
- OWASP Top 10
- Node.js Security Best Practices
- React Security Best Practices
