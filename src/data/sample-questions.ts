/**
 * Dữ liệu mẫu chứa các câu hỏi trắc nghiệm và tự luận về Lý thuyết Thông tin
 * Sử dụng làm dữ liệu dự phòng trong trường hợp API không tạo được câu hỏi
 */

// Câu hỏi trắc nghiệm mẫu
export const sampleMultipleChoiceQuestions = [
  {
    type: "multiple_choice",
    question: "Entropy của một biến ngẫu nhiên X đạt giá trị tối đa khi nào?",
    options: [
      "Khi tất cả kết quả có xác suất xuất hiện bằng nhau",
      "Khi chỉ có một kết quả có xác suất xuất hiện là 1",
      "Khi phân phối xác suất tuân theo quy luật Poisson",
      "Khi phân phối xác suất tuân theo quy luật Gaussian"
    ],
    correctAnswer: 0,
    explanation: "Entropy của biến ngẫu nhiên X đạt giá trị tối đa khi tất cả các kết quả có xác suất xuất hiện bằng nhau. Trong trường hợp này, sự không chắc chắn là lớn nhất vì tất cả các kết quả đều có khả năng xuất hiện như nhau."
  },
  {
    type: "multiple_choice",
    question: "Công thức nào dưới đây thể hiện mối quan hệ giữa entropy của hai biến ngẫu nhiên X và Y?",
    options: [
      "H(X,Y) = H(X) + H(Y)",
      "H(X,Y) = H(X) + H(Y|X)",
      "H(X,Y) = H(X) - H(Y)",
      "H(X,Y) = H(X) * H(Y)"
    ],
    correctAnswer: 1,
    explanation: "Công thức đúng là H(X,Y) = H(X) + H(Y|X), trong đó H(X,Y) là entropy đồng thời của X và Y, H(X) là entropy của X, và H(Y|X) là entropy có điều kiện của Y khi biết X. Công thức này còn được gọi là quy tắc chuỗi cho entropy."
  },
  {
    type: "multiple_choice",
    question: "Định lý Shannon-Hartley xác định dung lượng kênh C bằng công thức nào?",
    options: [
      "C = B log₂(S/N)",
      "C = B log₂(1 + S/N)",
      "C = B log₂(S) - log₂(N)",
      "C = B/(1 + S/N)"
    ],
    correctAnswer: 1,
    explanation: "Định lý Shannon-Hartley xác định dung lượng kênh C = B log₂(1 + S/N), trong đó B là băng thông, S là công suất tín hiệu, và N là công suất nhiễu. Dung lượng kênh này đại diện cho tốc độ thông tin tối đa có thể được truyền qua kênh nhiễu Gaussian mà không có lỗi."
  },
  {
    type: "multiple_choice",
    question: "Khi nào lượng thông tin tương hỗ I(X;Y) giữa hai biến ngẫu nhiên X và Y bằng 0?",
    options: [
      "Khi X = Y",
      "Khi H(X) = H(Y)",
      "Khi X và Y độc lập thống kê",
      "Khi X là hàm một-một của Y"
    ],
    correctAnswer: 2,
    explanation: "Lượng thông tin tương hỗ I(X;Y) bằng 0 khi và chỉ khi X và Y độc lập thống kê. Điều này có nghĩa là không có thông tin chung giữa hai biến, và việc biết giá trị của biến này không giúp dự đoán giá trị của biến kia."
  },
  {
    type: "multiple_choice",
    question: "Mã Huffman được sử dụng trong kỹ thuật nào?",
    options: [
      "Mã hóa kênh để phát hiện và sửa lỗi",
      "Mã hóa nguồn để nén dữ liệu",
      "Điều chế tín hiệu trong truyền thông không dây",
      "Mã hóa bảo mật để bảo vệ thông tin"
    ],
    correctAnswer: 1,
    explanation: "Mã Huffman được sử dụng trong kỹ thuật mã hóa nguồn để nén dữ liệu. Nó là phương pháp mã hóa độ dài biến đổi, gán mã ngắn hơn cho các ký tự xuất hiện thường xuyên và mã dài hơn cho các ký tự hiếm gặp, giúp giảm kích thước dữ liệu mà không làm mất thông tin."
  }
];

// Câu hỏi tự luận mẫu
export const sampleEssayQuestions = [
  {
    type: "essay",
    question: "Giải thích khái niệm entropy trong Lý thuyết Thông tin và công thức tính entropy của một biến ngẫu nhiên.",
    sampleAnswer: "Entropy trong Lý thuyết Thông tin là độ đo lường mức độ không chắc chắn hoặc ngẫu nhiên của một biến ngẫu nhiên. Khái niệm này do Claude Shannon giới thiệu vào năm 1948.\n\nCông thức tính entropy của một biến ngẫu nhiên rời rạc X là:\nH(X) = -Σ p(x) log₂ p(x)\n\nTrong đó:\n- p(x) là xác suất xuất hiện của giá trị x trong biến ngẫu nhiên X\n- log₂ thể hiện logarit cơ số 2, khiến đơn vị của entropy là bit\n\nEntropy đạt giá trị tối đa khi tất cả các giá trị của X có xác suất xuất hiện bằng nhau, và bằng 0 khi chỉ có một giá trị có xác suất là 1 (không có sự không chắc chắn).",
    keywords: ["entropy", "độ đo lường không chắc chắn", "Shannon", "H(X) = -Σ p(x) log₂ p(x)", "bit", "xác suất bằng nhau", "giá trị tối đa", "không chắc chắn"]
  },
  {
    type: "essay",
    question: "Trình bày về mã hóa nguồn (source coding) và định lý mã hóa nguồn của Shannon.",
    sampleAnswer: "Mã hóa nguồn (source coding) là quá trình biểu diễn thông tin với số bit tối thiểu, nhằm nén dữ liệu để giảm dư thừa. Nó chuyển đổi dữ liệu từ nguồn thành chuỗi bit ngắn hơn mà vẫn giữ nguyên thông tin (nén không tổn hại) hoặc giảm thiểu mất mát thông tin (nén có tổn hại).\n\nĐịnh lý mã hóa nguồn của Shannon (hay còn gọi là định lý nén) phát biểu rằng: Không thể nén thông tin xuống dưới entropy của nó mà không mất thông tin. Nói cách khác, tốc độ bit trung bình tối thiểu để mã hóa không tổn hại một nguồn thông tin bằng với entropy của nguồn đó.\n\nVí dụ: Nếu một nguồn có entropy là 4 bits/ký tự, thì không thể nén nguồn này xuống dưới 4 bits/ký tự mà không mất thông tin.\n\nCác phương pháp mã hóa nguồn phổ biến bao gồm mã Huffman, mã số học, và thuật toán Lempel-Ziv, được ứng dụng trong các chuẩn nén như ZIP, JPEG, và MP3.",
    keywords: ["mã hóa nguồn", "biểu diễn thông tin", "số bit tối thiểu", "nén dữ liệu", "định lý Shannon", "entropy", "không mất thông tin", "Huffman", "nén không tổn hại", "nén có tổn hại"]
  },
  {
    type: "essay",
    question: "Mô tả mối quan hệ giữa lượng thông tin tương hỗ (mutual information) và entropy. Giải thích ý nghĩa của lượng thông tin tương hỗ.",
    sampleAnswer: "Lượng thông tin tương hỗ (mutual information) I(X;Y) giữa hai biến ngẫu nhiên X và Y đo lường lượng thông tin chung giữa chúng. Nó cho biết lượng thông tin về biến này có thể có được khi quan sát biến kia.\n\nMối quan hệ giữa lượng thông tin tương hỗ và entropy được biểu diễn qua các công thức:\nI(X;Y) = H(X) - H(X|Y) = H(Y) - H(Y|X) = H(X) + H(Y) - H(X,Y)\n\nTrong đó:\n- H(X) và H(Y) là entropy của X và Y\n- H(X|Y) và H(Y|X) là entropy có điều kiện\n- H(X,Y) là entropy đồng thời\n\nÝ nghĩa của lượng thông tin tương hỗ:\n1. Khi I(X;Y) = 0: X và Y độc lập thống kê, không có thông tin chung\n2. Khi I(X;Y) lớn: X và Y phụ thuộc mạnh, có nhiều thông tin chung\n3. I(X;X) = H(X): Lượng thông tin tương hỗ của biến với chính nó bằng entropy của biến đó\n\nLượng thông tin tương hỗ được ứng dụng rộng rãi trong học máy, xử lý tín hiệu và lựa chọn đặc trưng để đánh giá mức độ phụ thuộc giữa các biến.",
    keywords: ["lượng thông tin tương hỗ", "mutual information", "I(X;Y)", "entropy", "thông tin chung", "H(X) - H(X|Y)", "độc lập thống kê", "phụ thuộc", "entropy có điều kiện", "entropy đồng thời"]
  },
  {
    type: "essay",
    question: "Trình bày về kênh truyền, dung lượng kênh và định lý kênh nhiễu của Shannon.",
    sampleAnswer: "Kênh truyền trong Lý thuyết Thông tin là phương tiện mà thông tin được truyền từ nguồn đến đích. Kênh có thể bị ảnh hưởng bởi nhiễu, dẫn đến sai sót trong quá trình truyền tin.\n\nDung lượng kênh (Channel capacity) C là tốc độ tối đa mà thông tin có thể được truyền qua kênh một cách đáng tin cậy. Đối với kênh liên tục có nhiễu Gaussian trắng, dung lượng kênh được tính bằng định lý Shannon-Hartley: C = B log₂(1 + S/N), trong đó B là băng thông, S là công suất tín hiệu, và N là công suất nhiễu.\n\nĐịnh lý kênh nhiễu của Shannon phát biểu rằng:\n1. Nếu tốc độ truyền thông tin R < C (nhỏ hơn dung lượng kênh), thì có thể truyền thông tin với xác suất lỗi tùy ý nhỏ, bằng cách sử dụng các mã sửa lỗi phù hợp.\n2. Ngược lại, nếu R > C (lớn hơn dung lượng kênh), thì không thể tránh khỏi lỗi, bất kể cơ chế mã hóa nào được sử dụng.\n\nĐịnh lý này có ý nghĩa quan trọng trong thiết kế hệ thống truyền thông, vì nó thiết lập giới hạn lý thuyết cho tốc độ truyền dữ liệu mà không có lỗi.",
    keywords: ["kênh truyền", "dung lượng kênh", "channel capacity", "định lý kênh nhiễu", "Shannon", "nhiễu", "đáng tin cậy", "tốc độ truyền", "xác suất lỗi", "mã sửa lỗi", "Shannon-Hartley", "băng thông", "tín hiệu trên nhiễu"]
  },
  {
    type: "essay",
    question: "Giải thích về mã hóa kênh (channel coding) và vai trò của nó trong hệ thống truyền thông.",
    sampleAnswer: "Mã hóa kênh (channel coding) là quá trình thêm dư thừa có kiểm soát vào thông điệp để cho phép phát hiện và sửa lỗi tại đầu thu. Kỹ thuật này giúp đảm bảo thông tin được truyền đi một cách đáng tin cậy qua kênh có nhiễu.\n\nVai trò của mã hóa kênh trong hệ thống truyền thông:\n\n1. Tăng độ tin cậy: Giảm xác suất lỗi khi truyền qua kênh nhiễu bằng cách thêm bit dư thừa, cho phép phát hiện và sửa lỗi.\n\n2. Tối ưu hóa hiệu suất: Cho phép hệ thống truyền thông hoạt động gần với giới hạn lý thuyết (dung lượng kênh) được thiết lập bởi định lý Shannon.\n\n3. Bảo vệ dữ liệu: Đặc biệt quan trọng trong môi trường nhiễu cao như truyền thông không dây, lưu trữ dữ liệu trên đĩa, và truyền thông vệ tinh.\n\nCác loại mã hóa kênh phổ biến:\n- Mã khối (như Hamming, BCH, Reed-Solomon): Mã hóa khối dữ liệu cố định\n- Mã chập (Convolutional): Xử lý dữ liệu như dòng liên tục\n- Mã Turbo và LDPC: Mã hiệu suất cao tiếp cận giới hạn Shannon\n\nTrong hệ thống truyền thông đầy đủ, mã hóa kênh thường được kết hợp với mã hóa nguồn: mã hóa nguồn loại bỏ dư thừa để nén dữ liệu, sau đó mã hóa kênh thêm dư thừa có kiểm soát để chống lại nhiễu.",
    keywords: ["mã hóa kênh", "channel coding", "dư thừa", "phát hiện lỗi", "sửa lỗi", "độ tin cậy", "nhiễu", "bit dư thừa", "định lý Shannon", "mã khối", "mã chập", "Hamming", "Reed-Solomon", "Turbo", "LDPC", "kênh truyền"]
  }
];

// Hàm lấy câu hỏi mẫu tùy thuộc vào loại và mức độ khó
export function getSampleQuestions(type: 'multiple_choice' | 'essay', difficulty: 'easy' | 'normal' | 'hard' = 'normal', count: number = 5): any[] {
  const questions = type === 'multiple_choice' ? sampleMultipleChoiceQuestions : sampleEssayQuestions;
  
  // Trong thực tế, có thể lọc theo mức độ khó dựa trên thuộc tính của câu hỏi
  // Tạm thời, chúng ta sẽ lấy ngẫu nhiên các câu hỏi
  
  // Sao chép mảng để tránh thay đổi mảng gốc
  const shuffled = [...questions];
  
  // Trộn mảng
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Lấy số lượng câu hỏi cần thiết
  return shuffled.slice(0, Math.min(count, shuffled.length));
} 