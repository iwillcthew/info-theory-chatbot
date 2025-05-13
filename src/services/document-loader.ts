// Note: Đây là file service cung cấp dữ liệu mẫu về Lý thuyết Thông tin để tạo câu hỏi
// Phiên bản này tương thích với môi trường trình duyệt (không sử dụng fs và path)

// Interface cho thông tin tài liệu
export interface DocumentInfo {
  id: string;
  title: string;
  path: string;
  chunks?: string[];
}

// Danh sách các tài liệu có sẵn trong thư mục documents
export const DEFAULT_DOCUMENTS: DocumentInfo[] = [
  {
    id: 'tonghop',
    title: 'Tổng hợp Lý thuyết Thông tin',
    path: 'documents/tonghop.pdf'
  },
  {
    id: 'giaotrinh',
    title: 'Giáo trình Lý thuyết Thông tin',
    path: 'documents/giaotrinh.pdf'
  }
];

/**
 * Trả về danh sách tài liệu có sẵn 
 */
export async function getDefaultDocuments(): Promise<DocumentInfo[]> {
  return DEFAULT_DOCUMENTS;
}

/**
 * Service API trả về thông tin tài liệu theo ID
 * Trong phiên bản trình duyệt, chúng ta trả về thông tin mẫu
 */
export async function readDocumentContent(documentId: string): Promise<string | null> {
  // Tìm tài liệu trong danh sách mặc định
  const document = DEFAULT_DOCUMENTS.find(doc => doc.id === documentId);
  
  if (!document) {
    console.error(`Document with ID ${documentId} not found`);
    return null;
  }
  
  // Trong phiên bản trình duyệt, trả về thông báo giả
  return `File loaded: ${document.title} (simulated browser environment)`;
}

/**
 * Dữ liệu mẫu trích xuất từ tài liệu - trong môi trường thực tế
 * cần triển khai API endpoint để đọc và phân tích PDF
 */
export const MOCK_DOCUMENT_CHUNKS: string[] = [
  `Lý thuyết thông tin (Information Theory) nghiên cứu về các phương pháp định lượng, 
  lưu trữ và truyền thông tin. Ngành khoa học này được Claude Shannon phát triển vào năm 1948 
  thông qua bài báo "A Mathematical Theory of Communication".
  
  Entropy là khái niệm trung tâm trong Lý thuyết Thông tin, đo lường mức độ không chắc chắn 
  hoặc ngẫu nhiên của một biến ngẫu nhiên. Công thức tính entropy: H(X) = -Σ p(x) log₂ p(x).`,
  
  `Entropy của biến ngẫu nhiên X đạt giá trị tối đa khi tất cả các kết quả có xác suất xuất hiện 
  bằng nhau. Ngược lại, entropy bằng 0 khi chỉ có một kết quả có xác suất xuất hiện là 1, 
  tức là không có sự không chắc chắn.
  
  Entropy có điều kiện H(X|Y) đo lường mức độ không chắc chắn còn lại về X khi đã biết Y.
  Công thức: H(X|Y) = -Σ p(x,y) log₂ p(x|y)`,
  
  `Lượng thông tin tương hỗ (Mutual Information) I(X;Y) đo lường lượng thông tin chung 
  giữa hai biến ngẫu nhiên. Nó cho biết bao nhiêu thông tin về biến này có thể có được 
  khi quan sát biến kia.
  
  Công thức: I(X;Y) = H(X) - H(X|Y) = H(Y) - H(Y|X) = H(X) + H(Y) - H(X,Y)
  
  Khi X và Y độc lập, I(X;Y) = 0, nghĩa là không có thông tin chung.`,
  
  `Mã hóa nguồn (Source coding) là quá trình biểu diễn thông tin với số bit tối thiểu.
  Định lý mã hóa nguồn của Shannon: Không thể nén thông tin xuống dưới entropy của nó
  mà không mất thông tin.
  
  Mã hóa Huffman là một phương pháp mã hóa độ dài biến đổi, gán mã ngắn hơn cho các ký tự 
  xuất hiện thường xuyên và mã dài hơn cho các ký tự hiếm gặp.`,
  
  `Kênh truyền (Channel) là phương tiện mà thông tin được truyền từ nguồn đến đích.
  Dung lượng kênh (Channel capacity) C là tốc độ tối đa mà thông tin có thể được truyền 
  qua kênh một cách đáng tin cậy.
  
  Định lý kênh nhiễu của Shannon: Nếu tốc độ truyền thông tin R < C, có thể truyền thông tin
  với xác suất lỗi tùy ý nhỏ. Ngược lại, nếu R > C, không thể tránh khỏi lỗi.`,
  
  `Định lý Shannon-Hartley: C = B log₂(1 + S/N), trong đó B là băng thông, S là công suất tín hiệu,
  và N là công suất nhiễu.
  
  Mã hóa kênh (Channel coding) thêm dư thừa có kiểm soát vào thông điệp để cho phép phát hiện
  và sửa lỗi tại đầu thu. Mã Hamming, mã Reed-Solomon và mã Turbo là các ví dụ về mã sửa lỗi.`,
  
  `Entropy vi sai (Differential entropy) mở rộng khái niệm entropy cho biến ngẫu nhiên liên tục.
  h(X) = -∫ f(x) log₂ f(x) dx, trong đó f(x) là hàm mật độ xác suất của X.
  
  Nguyên lý entropy tối đa: Trong các phân phối xác suất thỏa mãn một tập ràng buộc nhất định,
  phân phối có entropy lớn nhất là phân phối "ít thiên vị" nhất.`,
  
  `Độ phức tạp Kolmogorov của một chuỗi là độ dài của chương trình ngắn nhất
  (trong một ngôn ngữ lập trình phổ quát) tạo ra chuỗi đó. Nó đo lường mức độ ngẫu nhiên của chuỗi.
  
  Entropy tương đối (Kullback-Leibler divergence) D(P||Q) đo lường sự khác biệt giữa
  hai phân phối xác suất P và Q. Nó không âm và bằng 0 khi và chỉ khi P = Q.`
];

// Bổ sung các đoạn thông tin thêm về Lý thuyết Thông tin
export const ADDITIONAL_CHUNKS: string[] = [
  `Quá trình truyền thông tin qua kênh nhiễu tuân theo mô hình cơ bản:
  Nguồn thông tin → Bộ mã hóa nguồn → Bộ mã hóa kênh → Kênh truyền → Bộ giải mã kênh → Bộ giải mã nguồn → Đích.
  
  Trong đó, mã hóa nguồn giúp giảm dư thừa, còn mã hóa kênh giúp tăng khả năng chịu lỗi.`,
  
  `Lượng thông tin của một sự kiện x có xác suất p(x) được định nghĩa là I(x) = -log₂(p(x)).
  Đơn vị là bit. Các sự kiện càng ít có khả năng xảy ra (xác suất thấp) thì chứa càng nhiều thông tin.`,
  
  `Lý thuyết thông tin có ứng dụng rộng rãi trong nhiều lĩnh vực:
  - Truyền thông: nén dữ liệu, mã hóa, điều chế
  - Máy học: cây quyết định, mạng nơ-ron
  - Xử lý ngôn ngữ tự nhiên: mô hình ngôn ngữ, dịch máy
  - Vật lý: cơ học lượng tử, nhiệt động lực học`,
  
  `Mã khối tuyến tính là một lớp quan trọng của mã sửa lỗi, trong đó mỗi từ mã là tổ hợp tuyến tính 
  của các từ mã khác. Mã Hamming, BCH và Reed-Solomon là các ví dụ của mã khối tuyến tính.
  
  Mã Reed-Solomon đặc biệt hiệu quả để phát hiện và sửa lỗi burst (lỗi liên tiếp), được sử dụng trong 
  CD, DVD, mã QR, và truyền dữ liệu vệ tinh.`
];

// Kết hợp tất cả các đoạn để tạo tài liệu mẫu phong phú hơn
export async function getMockDocumentChunks(): Promise<string[]> {
  return [...MOCK_DOCUMENT_CHUNKS, ...ADDITIONAL_CHUNKS];
} 