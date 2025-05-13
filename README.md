# Trợ lý Lý thuyết Thông tin (Information Theory Assistant)

Ứng dụng Next.js cho phép người dùng tải lên tài liệu PDF về lý thuyết thông tin và đặt câu hỏi bằng tiếng Việt, sử dụng OpenRouter API với các mô hình AI như Qwen, Mistral và Claude.

[Demo: https://information-theory-chatbot.vercel.app](https://information-theory-chatbot.vercel.app)

## Tính năng chính

- Tải lên và xử lý tài liệu PDF về lý thuyết thông tin
- Giao diện chat thông minh sử dụng OpenRouter API với các mô hình AI hiện đại
- Không có câu trả lời cứng - tất cả câu trả lời được tạo động từ mô hình AI
- Hiển thị văn bản theo thời gian thực - văn bản xuất hiện từng ký tự khi mô hình tạo
- Trả lời dựa trên ngữ cảnh từ tài liệu đã tải lên
- Thiết kế responsive với giao diện người dùng đẹp mắt
- Hỗ trợ tiếng Việt hoàn chỉnh
- Hiển thị công thức toán học bằng MathJax
- Chế độ Quiz giúp ôn tập kiến thức

## Yêu cầu hệ thống

- Node.js (v18.0.0 trở lên)
- npm hoặc yarn
- OpenRouter API key (miễn phí)
- Trình duyệt hiện đại (Chrome, Firefox, Edge, Safari)

## Bắt đầu sử dụng

1. **Clone repository**

```bash
git clone https://github.com/yourusername/info-theory-chatbot.git
cd info-theory-chatbot
```

2. **Cấu hình OpenRouter API key**

Tạo file `.env.local` và thêm API key của bạn:

```bash
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-api-key
NEXT_PUBLIC_SITE_URL=localhost:3000
NEXT_PUBLIC_SITE_NAME=Information Theory Chatbot
```

3. **Cài đặt dependencies**

```bash
npm install
# hoặc
yarn install
```

4. **Chạy development server**

```bash
npm run dev
# hoặc
yarn dev
```

5. **Mở trình duyệt**

Truy cập [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## Hướng dẫn sử dụng

1. **Tải tài liệu PDF** liên quan đến lý thuyết thông tin bằng giao diện tải lên.
2. Nhấp vào **"Xử lý tài liệu"** để trích xuất và xử lý nội dung.
3. Sau khi hoàn tất xử lý, bạn có thể **đặt câu hỏi bằng tiếng Việt** trong giao diện chat.
4. Trợ lý sẽ phản hồi bằng thông tin liên quan từ tài liệu sử dụng các mô hình AI thông qua OpenRouter API.
5. Theo dõi khi phản hồi xuất hiện theo thời gian thực, ký tự theo ký tự, khi chúng được tạo ra bởi mô hình.
6. Bạn có thể sử dụng chế độ **Quiz** để kiểm tra kiến thức của mình.
7. Xem và chọn các tài liệu được tải lên trong danh sách tài liệu.

## Lấy OpenRouter API Key (Miễn phí)

Để sử dụng ứng dụng này, bạn cần một OpenRouter API key. Đây là cách để có được một key:

1. Truy cập [trang web OpenRouter](https://openrouter.ai)
2. Tạo tài khoản hoặc đăng nhập nếu bạn đã có
3. Đi đến phần API Keys
4. Tạo API key mới và sao chép nó
5. Khi triển khai, thêm API key vào biến môi trường `NEXT_PUBLIC_OPENROUTER_API_KEY`

OpenRouter cung cấp quota miễn phí hàng ngày, đủ cho việc sử dụng cá nhân và nghiên cứu.

## Cấu trúc dự án

```plaintext
info-theory-chatbot/
├── public/                     # Tệp tĩnh
│   ├── mathjax-config.js       # Cấu hình MathJax để hiển thị công thức toán học
│   ├── default-documents/      # Tài liệu mặc định được tải sẵn
│   └── uploads/                # Thư mục lưu tạm tệp tải lên
├── documents/                  # Tài liệu PDF mẫu
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── ChatInterface.tsx   # Thành phần giao diện chat
│   │   ├── ClientFileProcessor.tsx # Xử lý file phía client
│   │   ├── PDFUploader.tsx     # Thành phần upload PDF
│   │   ├── QuizMode.tsx        # Chế độ quiz
│   │   └── chat/               # Các thành phần chat khác
│   ├── config/                 # Configuration files
│   │   └── api-keys.ts         # Cấu hình API keys
│   ├── data/                   # Dữ liệu
│   │   └── sample-questions.ts # Câu hỏi mẫu
│   ├── services/               # API services
│   │   ├── document-loader.ts  # Dịch vụ tải tài liệu
│   │   └── openrouter-api.ts   # Dịch vụ OpenRouter API
│   └── utils/                  # Utility functions
│       ├── preloaded-documents.ts # Tài liệu được tải trước
│       └── text-processor.ts   # Xử lý văn bản
└── package.json                # Project dependencies và scripts
```

## Cập nhật gần đây

- Xóa các phản hồi cứng cho các thuật ngữ như "entropy"
- Tất cả các phản hồi hiện được tạo bằng các mô hình AI thông qua OpenRouter
- Triển khai streaming text theo thời gian thực - văn bản xuất hiện từng ký tự khi được tạo
- Cải thiện xử lý lỗi cho các API request
- Thêm chế độ Quiz để hỗ trợ việc học tập
- Hỗ trợ nhiều file PDF cùng lúc
- Thêm tùy chọn để chọn tài liệu tham khảo khi trả lời

## Triển khai lên internet

Dự án này có thể được triển khai miễn phí lên nền tảng Vercel chỉ với vài bước đơn giản:

### Triển khai trên Vercel (Miễn phí)

1. Đăng ký tài khoản tại [Vercel](https://vercel.com) (có thể đăng nhập bằng GitHub)
2. Tạo một repository GitHub cho dự án này
3. Trong Vercel Dashboard, nhấp vào "Add New..." → "Project"
4. Chọn repository GitHub của bạn
5. Cấu hình các biến môi trường:
   - `NEXT_PUBLIC_OPENROUTER_API_KEY`
   - `NEXT_PUBLIC_SITE_URL` (URL của trang web sau khi triển khai)
   - `NEXT_PUBLIC_SITE_NAME`
6. Nhấp vào "Deploy"

Vercel sẽ tự động nhận dạng dự án Next.js và triển khai nó. URL của bạn sẽ có dạng: `your-project-name.vercel.app`

### Tính năng cao cấp đã triển khai

- **Xử lý PDF phía client**: Giúp giảm tải cho server và bảo mật thông tin người dùng
- **Sao lưu model**: Tự động chuyển sang model khác nếu model chính gặp lỗi
- **MathJax**: Hiển thị công thức toán học phức tạp
- **Streaming text**: Hiển thị văn bản theo thời gian thực
- **Quiz mode**: Chế độ kiểm tra kiến thức với các câu hỏi trắc nghiệm

## Tương lai phát triển

- Lịch sử cuộc trò chuyện
- Xuất cuộc trò chuyện dưới dạng PDF hoặc văn bản
- Cải thiện chia nhỏ văn bản và điểm liên quan
- Xác thực người dùng và lưu phiên
- Thêm nhiều loại tài liệu (Word, PPT, ...)
- Tùy chỉnh mô hình AI được sử dụng

## Giấy phép

MIT

## Liên hệ & Đóng góp

Nếu bạn muốn đóng góp vào dự án này, vui lòng tạo issues hoặc pull requests trên GitHub.

---

*Dự án này được phát triển với mục đích giáo dục để hỗ trợ sinh viên học môn Lý thuyết thông tin.*