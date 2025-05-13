// Predefined document chunks from PDF files
// These chunks are extracted from the PDF files in the documents folder

// Define mapping between document IDs and their respective chunks
const documentChunksMap: Record<string, string[]> = {
  "preloaded-1": [
    `Lý thuyết thông tin là ngành nghiên cứu về lượng hóa thông tin. Khái niệm quan trọng nhất trong Lý thuyết Thông tin là entropy, đo lường độ bất định hoặc mức độ ngẫu nhiên của một nguồn tin.

Entropy được định nghĩa theo công thức H(X) = -∑p(x)log₂p(x), trong đó p(x) là xác suất xuất hiện của ký hiệu x trong nguồn tin X.

Kênh truyền là phương tiện truyền thông tin từ nguồn đến đích, có thể bị ảnh hưởng bởi nhiễu. Dung lượng kênh truyền (Channel capacity) là tốc độ thông tin tối đa có thể truyền qua kênh một cách đáng tin cậy.`,
    `Entropy là đại lượng đo độ bất định của nguồn tin. Nếu một nguồn tin có tính đoán trước cao, entropy của nó sẽ thấp. Ngược lại, nếu một nguồn tin hoàn toàn ngẫu nhiên, entropy của nó sẽ đạt giá trị cao nhất.`
  ],
  "preloaded-2": [
    `Công thức tính entropy: H(X) = -∑p(x)log₂p(x)

Ví dụ: một nguồn tin nhị phân có hai khả năng xuất hiện với xác suất là p và 1-p, entropy của nó là:
H(X) = -p*log₂(p) - (1-p)*log₂(1-p)

Entropy đạt giá trị lớn nhất là 1 bit khi p = 0.5, tức là khi hai khả năng xuất hiện với xác suất bằng nhau.`,

    `Lượng tin tương hỗ (Mutual Information) là đại lượng đo mức độ phụ thuộc giữa hai biến ngẫu nhiên X và Y.

Công thức: I(X;Y) = H(X) - H(X|Y) = H(Y) - H(Y|X) = H(X) + H(Y) - H(X,Y)

Trong đó:
- H(X) và H(Y) là entropy của X và Y
- H(X|Y) là entropy có điều kiện của X khi biết Y
- H(X,Y) là entropy đồng thời của X và Y

Lượng tin tương hỗ luôn không âm và bằng 0 khi và chỉ khi X và Y độc lập về mặt thống kê.`,

    `Mã hóa nguồn (Source coding) là quá trình biểu diễn thông tin một cách hiệu quả, với mục tiêu giảm thiểu số bit cần thiết để biểu diễn một thông điệp.

Định lý mã hóa nguồn của Shannon (Shannon Source Coding Theorem) phát biểu rằng: Độ dài trung bình tối thiểu của một mã không mất mát (lossless code) không thể nhỏ hơn entropy của nguồn tin.

Mã Huffman là một ví dụ điển hình của mã hóa nguồn tối ưu, trong đó các ký hiệu xuất hiện thường xuyên hơn được mã hóa bằng các từ mã ngắn hơn.`,

    `Mã hóa kênh (Channel coding) là kỹ thuật thêm thông tin dư thừa (redundancy) vào dữ liệu để giúp phát hiện và sửa lỗi khi dữ liệu truyền qua kênh có nhiễu.

Định lý mã hóa kênh của Shannon (Shannon's Channel Coding Theorem) phát biểu rằng: Nếu tốc độ truyền tin R nhỏ hơn dung lượng kênh C, thì tồn tại một phương pháp mã hóa sao cho thông tin có thể được truyền với xác suất lỗi tùy ý nhỏ.

Dung lượng kênh Gaussian với nhiễu trắng cộng (AWGN) được tính theo công thức:
C = B * log₂(1 + S/N)
Trong đó:
- B là băng thông của kênh (Hz)
- S/N là tỷ số tín hiệu trên nhiễu (Signal-to-Noise Ratio)`,

    `Lý thuyết thông tin có nhiều ứng dụng trong thực tế như:
1. Nén dữ liệu (Data compression): MP3, JPEG, ZIP...
2. Mã hóa và sửa lỗi (Error detection and correction): Mã Reed-Solomon, Turbo code...
3. Mật mã học (Cryptography): Mã hóa khóa công khai, chữ ký số...
4. Machine Learning: Decision tree, Information gain...
5. Xử lý ngôn ngữ tự nhiên (NLP): Entropy trong mô hình ngôn ngữ...
6. Hệ thống thông tin và truyền thông hiện đại: 5G, Wi-Fi, thiết bị IoT...`
  ]
};

// Predefined document chunks for tonghop.pdf and giaotrinh.pdf
export const preloadedDocumentChunks: string[] = [
  // Chunks from all documents
  ...Object.values(documentChunksMap).flat()
];

// Information about the preloaded documents
export const preloadedDocuments = [
  {
    id: "preloaded-1",
    name: "Tổng hợp Lý thuyết Thông tin",
    description: "Tài liệu tổng hợp về Lý thuyết Thông tin",
    chunkCount: documentChunksMap["preloaded-1"].length,
    pageCount: 45
  },
  {
    id: "preloaded-2",
    name: "Giáo trình Lý thuyết Thông tin",
    description: "Giáo trình giảng dạy Lý thuyết Thông tin",
    chunkCount: documentChunksMap["preloaded-2"].length,
    pageCount: 65
  }
];

// Function to get document chunks by document IDs
export function getAllPreloadedChunks(documentIds?: string[]): string[] {
  if (!documentIds || documentIds.length === 0) {
    // If no document IDs specified, return all chunks
    return preloadedDocumentChunks;
  }
  
  // Return only chunks from the specified documents
  const selectedChunks: string[] = [];
  
  documentIds.forEach(id => {
    if (documentChunksMap[id]) {
      selectedChunks.push(...documentChunksMap[id]);
    }
  });
  
  return selectedChunks;
} 