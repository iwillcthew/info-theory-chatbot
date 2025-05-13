'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { findRelevantChunks } from '@/utils/text-processor'
import { OpenRouterAPIService, DocumentInfo } from '@/services/openrouter-api'
import { openRouterApiKey } from '@/config/api-keys'
import ClientFileProcessor from '@/components/ClientFileProcessor'
import QuizMode from '@/components/QuizMode'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isTyping?: boolean
}

interface ChatInterfaceProps {
  initialTextChunks?: string[]
  documentInfo?: DocumentInfo[]
}

// Initialize the OpenRouter API service
const apiService = new OpenRouterAPIService();

// Information Theory Key Terms and Concepts for highlighting
const infoTheoryTerms = {
  // Core concepts
  'entropy': 'Độ đo lường mức độ không chắc chắn hoặc ngẫu nhiên của một biến ngẫu nhiên',
  'information': 'Lượng thông tin khi nhận được một tin nhắn hoặc sự kiện xác định',
  'bit': 'Đơn vị cơ bản của thông tin, thường được biểu diễn là log₂',
  'mutual information': 'Độ đo lường sự phụ thuộc giữa hai biến ngẫu nhiên',
  'channel capacity': 'Tốc độ thông tin tối đa có thể truyền qua một kênh có nhiễu',
  'shannon': 'Claude Shannon - người sáng lập Lý thuyết Thông tin hiện đại',
  
  // Advanced concepts
  'kullback-leibler divergence': 'Đo lường sự khác biệt giữa hai phân phối xác suất',
  'data compression': 'Kỹ thuật giảm kích thước dữ liệu',
  'huffman coding': 'Phương pháp nén dữ liệu không mất mát tối ưu',
  'source coding': 'Kỹ thuật biểu diễn thông tin một cách hiệu quả',
  'channel coding': 'Kỹ thuật mã hóa thông tin để khắc phục lỗi khi truyền',
  'conditional entropy': 'Entropy của một biến ngẫu nhiên với điều kiện biết giá trị của biến khác',
  
  // Related concepts
  'information gain': 'Sự giảm entropy khi biết giá trị của một biến ngẫu nhiên khác',
  'error correction': 'Kỹ thuật phát hiện và sửa lỗi trong quá trình truyền thông tin',
  'cross entropy': 'Độ đo lường hiệu quả của mô hình dự đoán so với dữ liệu thực tế',
  'joint entropy': 'Entropy của hai hoặc nhiều biến ngẫu nhiên cùng nhau',
  
  // Expanded core concepts
  'differential entropy': 'Mở rộng của entropy cho biến ngẫu nhiên liên tục',
  'maximum entropy': 'Nguyên tắc chọn phân phối có entropy lớn nhất trong các điều kiện ràng buộc',
  'minimum description length': 'Nguyên tắc chọn mô hình có độ phức tạp thấp nhất mô tả dữ liệu',
  'kolmogorov complexity': 'Độ dài của chương trình ngắn nhất tạo ra một chuỗi',
  'typicality': 'Thuộc tính của chuỗi có xác suất gần với giá trị kỳ vọng',
  'typical set': 'Tập hợp chuỗi có xác suất gần với giá trị kỳ vọng',
  'redundancy': 'Lượng thông tin thừa trong một thông điệp, giúp phát hiện và sửa lỗi',
  'uncertainty': 'Trạng thái không biết chính xác giá trị hoặc kết quả của một sự kiện',
  'randomness': 'Tính ngẫu nhiên, thiếu một mẫu hoặc quy tắc có thể dự đoán',
  'information content': 'Lượng thông tin chứa trong một thông điệp hoặc sự kiện',
  'log-likelihood': 'Logarithm của hàm hợp lý, sử dụng trong ước lượng tham số',
  
  // Coding theory
  'coding theory': 'Nghiên cứu về cách mã hóa thông tin hiệu quả và đáng tin cậy',
  'hamming distance': 'Số vị trí khác nhau giữa hai chuỗi có cùng độ dài',
  'hamming code': 'Mã sửa lỗi tuyến tính, có thể phát hiện lỗi 2 bits và sửa lỗi 1 bit',
  'reed-solomon code': 'Mã sửa lỗi hiệu quả sử dụng nhiều trong lưu trữ và truyền dữ liệu',
  'convolutional code': 'Mã sửa lỗi sử dụng chuỗi bit đầu vào để tạo chuỗi đầu ra dài hơn',
  'turbo code': 'Lớp mã sửa lỗi hiệu suất cao gần với giới hạn Shannon',
  'ldpc code': 'Mã kiểm tra chẵn lẻ mật độ thấp, hiệu quả cho truyền thông tin',
  'prefix code': 'Mã không có mã nào là tiền tố của mã khác, cho phép giải mã không mơ hồ',
  'arithmetic coding': 'Phương pháp nén dữ liệu biểu diễn thông điệp dưới dạng khoảng số thực',
  'lempel-ziv-welch': 'Thuật toán nén dữ liệu phổ biến dựa trên từ điển',
  'run-length encoding': 'Phương pháp nén dữ liệu mã hóa chuỗi các giá trị giống nhau',
  
  // Channel theory
  'channel': 'Phương tiện truyền thông tin từ nguồn đến đích',
  'noisy channel': 'Kênh truyền làm biến đổi thông tin do nhiễu',
  'binary symmetric channel': 'Mô hình kênh bit đảo đối xứng với xác suất lỗi không đổi',
  'additive white gaussian noise': 'Mô hình nhiễu cơ bản trong Lý thuyết Thông tin',
  'signal-to-noise ratio': 'Tỷ lệ giữa cường độ tín hiệu và nhiễu',
  'shannon-hartley theorem': 'Định lý về dung lượng kênh liên tục có nhiễu Gaussian',
  'shannon limit': 'Giới hạn lý thuyết về tốc độ truyền thông tin không bị lỗi',
  'ergodic process': 'Quá trình ngẫu nhiên có đặc tính thống kê không đổi theo thời gian',
  'markov process': 'Quá trình ngẫu nhiên mà trạng thái tương lai chỉ phụ thuộc vào trạng thái hiện tại',
  'stationary process': 'Quá trình ngẫu nhiên có đặc tính thống kê không đổi khi dịch thời gian',
  
  // Probability and statistics
  'probability distribution': 'Hàm xác định xác suất của tất cả các giá trị có thể của biến ngẫu nhiên',
  'gaussian distribution': 'Phân phối xác suất chuẩn, thường gặp trong tự nhiên',
  'uniform distribution': 'Phân phối xác suất đều cho tất cả các giá trị có thể',
  'bernoulli distribution': 'Phân phối xác suất cho các biến nhị phân',
  'binomial distribution': 'Phân phối xác suất cho số lần thành công trong các thử nghiệm Bernoulli',
  'poisson distribution': 'Phân phối xác suất cho số sự kiện trong một khoảng thời gian cố định',
  'bayes theorem': 'Công thức tính xác suất có điều kiện dựa trên thông tin tiên nghiệm',
  'expectation': 'Giá trị trung bình hoặc kỳ vọng của một biến ngẫu nhiên',
  'variance': 'Độ đo sự phân tán của một biến ngẫu nhiên',
  
  // Applications
  'data mining': 'Quá trình tìm kiếm mẫu và tri thức từ dữ liệu lớn',
  'cryptography': 'Nghiên cứu về bảo mật thông tin và giao tiếp an toàn',
  'machine learning': 'Nghiên cứu về thuật toán học từ dữ liệu',
  'neural network': 'Mô hình tính toán lấy cảm hứng từ hệ thần kinh sinh học',
  'decision tree': 'Mô hình dự đoán sử dụng cấu trúc cây quyết định',
  'reinforcement learning': 'Phương pháp học máy dựa trên tương tác với môi trường',
  'genetic algorithm': 'Thuật toán tối ưu hóa lấy cảm hứng từ quá trình tiến hóa tự nhiên',
  
  // Mathematical foundations
  'logarithm': 'Hàm số toán học ngược với hàm mũ, cơ sở của entropy',
  'convex function': 'Hàm số mà đường nối hai điểm bất kỳ nằm trên hoặc trên đồ thị của hàm',
  'jensen inequality': 'Bất đẳng thức về giá trị kỳ vọng của hàm lồi',
  'gibbs inequality': 'Bất đẳng thức liên quan đến entropy tương đối',
  'fano inequality': 'Bất đẳng thức liên quan đến xác suất lỗi tối thiểu',
  'cauchy-schwarz inequality': 'Bất đẳng thức cơ bản trong đại số tuyến tính',
  'information bottleneck': 'Phương pháp nén thông tin với mục tiêu giữ lại thông tin có liên quan',
  
  // Information measures
  'perplexity': 'Đo lường chất lượng của mô hình xác suất trong xử lý ngôn ngữ tự nhiên',
  'fisher information': 'Đo lường thông tin dự kiến từ một tham số chưa biết',
  'relative entropy': 'Đồng nghĩa với Kullback-Leibler divergence',
  'information radius': 'Đo lường khoảng cách giữa các phân phối xác suất'
};

// Suggested questions for students by category
const suggestedQuestions: Record<string, string[]> = {
  'Khái niệm cơ bản': [
    'Entropy là gì và nó đo lường cái gì?',
    'Công thức tính entropy là gì và ý nghĩa của nó?',
    'Lý thuyết thông tin có những ứng dụng nào trong thực tế?',
    'Giải thích khái niệm bit thông tin và ý nghĩa của nó',
    'Liên hệ giữa entropy và độ bất định như thế nào?'
  ],
  'Kỹ thuật mã hóa': [
    'Phương pháp mã hóa Huffman hoạt động như thế nào?',
    'So sánh mã hóa Huffman và mã hóa số học (Arithmetic coding)',
    'Giải thích nguyên lý nén dữ liệu không mất mát',
    'Mã tiền tố (Prefix code) là gì và ưu điểm của nó?',
    'Thuật toán Lempel-Ziv-Welch nén dữ liệu như thế nào?'
  ],
  'Lý thuyết kênh truyền': [
    'Làm thế nào để tính channel capacity trong kênh có nhiễu?',
    'Định lý Shannon-Hartley và ý nghĩa thực tiễn của nó',
    'Mô hình kênh nhị phân đối xứng (BSC) và các tham số của nó',
    'Giải thích Shannon limit và tầm quan trọng của nó',
    'Mối quan hệ giữa tỷ lệ tín hiệu trên nhiễu và dung lượng kênh'
  ],
  'Các ứng dụng hiện đại': [
    'Lý thuyết thông tin ứng dụng trong machine learning như thế nào?',
    'Vai trò của entropy trong học sâu (deep learning)',
    'Information bottleneck trong mạng nơ-ron là gì?',
    'Cách áp dụng Lý thuyết Thông tin trong nén hình ảnh và video',
    'Mối liên hệ giữa Lý thuyết Thông tin và mật mã học'
  ]
};

// Key Information Theory formulas for quick reference - based on the image provided
const keyFormulas = [
  // Độ đo thông tin
  { name: 'Độ đo thông tin', formula: '$$\\log \\frac{1}{p(x_i)} = -\\log p(x_i)$$', description: 'Đơn vị đo: bit (lb), nat (ln), hart (lg)' },
  { name: 'Đơn vị đo thông tin', formula: '$$1 \\text{ nat} = \\log_2(e) \\approx 1.4427 \\text{ bit}$$', description: '1 hart = log₂(10) ≈ 3.3219 bit' },
  
  // Lượng tin riêng
  { name: 'Lượng tin riêng của 1 tin rời rạc', formula: '$$I(x_i) = \\log\\frac{1}{p(x_i)} = -\\log p(x_i)$$', description: 'Đơn vị: bit' },
  { name: 'Lượng tin riêng của 1 nguồn rời rạc', formula: '$$I(X) = \\sum_{i=0}^{N} p(x_i)\\log\\frac{1}{p(x_i)} = -\\sum_{i=0}^{N} p(x_i)\\log p(x_i)$$', description: '' },
  
  // Entropy
  { name: 'Entropy của 1 tin rời rạc', formula: '$$H(x_i) = I(x_i) = -\\log p(x_i)$$', description: '' },
  { name: 'Entropy của 1 nguồn rời rạc', formula: '$$H(X) = -\\sum_{i=0}^{N} p(x_i)\\log p(x_i)$$', description: '' },
  { name: 'Entropy của nguồn liên tục', formula: '$$H(X) = -\\int_{-\\infty}^{+\\infty} w(x)\\log w(x)dx; \\text{ w(x) là hàm mđxs}$$', description: '' },
  
  // Lượng tin riêng và entropy đồng thời
  { name: 'Lượng tin riêng, entropy của tin rời rạc đồng thời', formula: '$$I(x_i,y_j) = H(x_i,y_j) = -\\log p(x_i,y_j)$$', description: '' },
  { name: 'Lượng tin riêng, entropy của nguồn rời rạc đồng thời', formula: '$$I(X,Y) = H(X,Y) = -\\sum_{i,j} p(x_i,y_j)\\log p(x_i,y_j)$$', description: '' },
  { name: 'Entropy của nguồn liên tục đồng thời', formula: '$$H(X,Y) = -\\int_{-\\infty}^{+\\infty}\\int_{-\\infty}^{+\\infty} w(x,y)\\log w(x,y)dxdy$$', description: '' },
  
  // Entropy có điều kiện
  { name: 'Entropy của tin rời rạc có điều kiện', formula: '$$H(x_i|y_j) = \\log\\frac{1}{p(x_i|y_j)}$$', description: '' },
  { name: 'Entropy của nguồn rời rạc có điều kiện', formula: '$$H(X|Y) = -\\sum_{i,j} p(x_i,y_j)\\log p(x_i|y_j)$$', description: '' },
  { name: 'Entropy có điều kiện Y cho X', formula: '$$H(Y|X) = -\\sum_{i,j} p(x_i,y_j)\\log p(y_j|x_i)$$', description: '' },
  { name: 'Entropy của nguồn liên tục có điều kiện', formula: '$$H(X|Y) = -\\int_{-\\infty}^{+\\infty}\\int_{-\\infty}^{+\\infty} w(x,y)\\log w(x|y)dxdy$$', description: '' },
  { name: 'Entropy liên tục có điều kiện', formula: '$$H(Y|X) = -\\int_{-\\infty}^{+\\infty}\\int_{-\\infty}^{+\\infty} w(x,y)\\log w(y|x)dxdy$$', description: '' },
  
  // Tính chất entropy
  { name: 'Quan hệ giữa các entropy', formula: '$$H(X,Y) = H(X) + H(Y|X) = H(Y) + H(X|Y)$$', description: 'Nếu X, Y độc lập thống kê: H(Y|X) = H(Y); H(X|Y) = H(X)' },
  { name: 'Bất đẳng thức entropy', formula: '$$0 \\leq H(X|Y) \\leq H(X); 0 \\leq H(Y|X) \\leq H(Y)$$', description: 'Đối với nguồn rời rạc có N tin: H(X) ≤ log N' },
  
  // Lượng tin tương hỗ
  { name: 'Lượng tin tương hỗ giữa 2 tin rời rạc', formula: '$$I(x_i;y_j) = H(x_i) - H(x_i|y_j) = \\log\\frac{p(x_i|y_j)}{p(x_i)}$$', description: '' },
  { name: 'Lượng tin tương hỗ biểu diễn qua xác suất đồng thời', formula: '$$= \\log\\frac{p(x_i,y_j)}{p(x_i)\\cdot p(y_j)} = \\log\\frac{p(y_j|x_i)}{p(y_j)} = H(y_j) - H(y_j|x_i)$$', description: 'I(x_i;y_j) = I(x_i) + I(y_j) - I(x_i,y_j)' },
  { name: 'Lượng tin tương hỗ TB giữa 2 nguồn rời rạc', formula: '$$I(X;Y) = \\sum_{i,j} p(x_i,y_j)\\log\\frac{p(x_i|y_j)}{p(x_i)} = \\sum_{i,j} p(x_i,y_j)\\log\\frac{p(y_j|x_i)}{p(y_j)}$$', description: '' },
  { name: 'Lượng tin tương hỗ biểu diễn qua xác suất đồng thời', formula: '$$= \\sum_{i,j} p(x_i,y_j)\\log\\frac{p(x_i,y_j)}{p(x_i)\\cdot p(y_j)} = H(X) - H(X|Y) = H(Y) - H(Y|X) = H(X) + H(Y) - H(X,Y)$$', description: '' },
  { name: 'Lượng tin tương hỗ giữa 2 nguồn liên tục', formula: '$$I(X;Y) = \\int_{-\\infty}^{+\\infty}\\int_{-\\infty}^{+\\infty} w(x,y)\\log\\frac{w(x,y)}{w(x)\\cdot w(y)}dxdy$$', description: '' },
  { name: 'Lượng tin tương hỗ liên tục biểu diễn qua w(x|y)', formula: '$$= \\int_{-\\infty}^{+\\infty}\\int_{-\\infty}^{+\\infty} w(x,y)\\log\\frac{w(x|y)}{w(x)}dxdy$$', description: '' },
  { name: 'Lượng tin tương hỗ liên tục biểu diễn qua w(y|x)', formula: '$$= \\int_{-\\infty}^{+\\infty}\\int_{-\\infty}^{+\\infty} w(x,y)\\log\\frac{w(y|x)}{w(y)}dxdy$$', description: '' },
  
  // Tốc độ lấp tin
  { name: 'Tốc độ lấp tin của nguồn rời rạc', formula: '$$R(X) = n_0 \\cdot H(X) = \\frac{\\text{dv thông tin}}{\\text{dv thời gian}}$$', description: 'n₀: số tin trung bình nguồn có thể tạo ra trong 1 đơn vị thời gian (tần số tạo tin của nguồn)' },
  { name: 'Tốc độ lấp tin của nguồn đẳng xác suất', formula: '$$\\text{Nếu nguồn đẳng xác suất: } p(x_i) = \\frac{1}{N} \\forall i: R = n_0 \\cdot H(X)_{max} = n_0 \\cdot \\log N = F\\cdot \\log N$$', description: '' },
  { name: 'Tốc độ lấp tin của nguồn liên tục', formula: '$$R = 2F_{max}\\cdot H(X)$$', description: '' },
  { name: 'Tốc độ lấp tin của nguồn có công suất đỉnh hữu hạn', formula: '$$R = 2F_{max}\\cdot \\log(x_{Max} - x_{Min})$$', description: '' },
  { name: 'Tốc độ lấp tin của nguồn có công suất trung bình hạn chế', formula: '$$R = 2F_{max}\\cdot \\log\\sqrt{2\\pi eP_x}$$', description: '' }
];

// Reference list with updated link
const referenceList = [
  { name: 'Tài liệu học tập Lý thuyết thông tin', url: 'https://drive.google.com/drive/folders/1geGUBDOGwiVb67W31ckAxegC1hZ3Et9B?usp=drive_link' }
];

export default function ChatInterface({ initialTextChunks = [], documentInfo = [] }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('Khái niệm cơ bản')
  const [showFormulasReference, setShowFormulasReference] = useState(false)
  const [showReferences, setShowReferences] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [textChunks, setTextChunks] = useState<string[]>(initialTextChunks)
  const [activeDocuments, setActiveDocuments] = useState<DocumentInfo[]>(documentInfo)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [activeMode, setActiveMode] = useState<'chat' | 'quiz'>('chat')

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check API connectivity on component mount
  useEffect(() => {
    const checkApiConnectivity = async () => {
      try {
        console.log('Checking API connectivity...');
        setApiStatus('checking');
        
        // Simple health check - fetch models list from OpenRouter
        const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterApiKey}`
          }
        });
        
        if (response.ok) {
          console.log('API connection successful');
          setApiStatus('connected');
          setApiError(null);
        } else {
          const errorText = await response.text();
          console.error('API connection failed:', response.status, errorText);
          setApiStatus('error');
          
          if (response.status === 401) {
            setApiError('API key không hợp lệ hoặc đã hết hạn. Vui lòng liên hệ quản trị viên.');
          } else {
            setApiError(`Lỗi kết nối tới API: ${response.status} ${response.statusText}`);
          }
        }
      } catch (error) {
        console.error('API connectivity check failed:', error);
        setApiStatus('error');
        setApiError('Không thể kết nối tới máy chủ API. Vui lòng kiểm tra kết nối mạng.');
      }
    };
    
    checkApiConnectivity();
  }, []);

  // Thêm script MathJax để render công thức toán học
  useEffect(() => {
    // Kiểm tra nếu MathJax chưa được tải
    if (!(window as any).MathJax) {
      console.log('Loading MathJax script...');
      
      // Add MathJax configuration first
      const configScript = document.createElement('script');
      configScript.text = `
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
            displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
            processEscapes: true,
            processEnvironments: true
          },
          options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
            ignoreHtmlClass: 'tex2jax_ignore',
            processHtmlClass: 'tex2jax_process'
          }
        };
      `;
      document.head.appendChild(configScript);
      
      // Now load the MathJax script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      script.id = 'MathJax-script';
      
      script.onload = () => {
        console.log('MathJax script loaded successfully');
      };
      
      script.onerror = (error) => {
        console.error('Failed to load MathJax script:', error);
      };
      
      document.head.appendChild(script);
    }
  }, []);

    // Hàm để kích hoạt render công thức toán học khi có tin nhắn mới
  const typeset = useCallback(() => {
      if ((window as any).MathJax && (window as any).MathJax.typesetPromise) {
      try {
        console.log('Running MathJax typeset...');
        (window as any).MathJax.typesetPromise()
          .then(() => {
            console.log('MathJax typesetting completed successfully');
          })
          .catch((err: any) => {
            console.error('MathJax typesetting promise error:', err);
          });
      } catch (err) {
        console.error('MathJax typesetting error:', err);
      }
    } else {
      console.warn('MathJax not available for typesetting');
    }
  }, []);

    // Kích hoạt render khi có tin nhắn mới
  useEffect(() => {
    // Give time for the DOM to update before running MathJax
    const timeoutId = setTimeout(() => {
    typeset();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages, typeset]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Function to handle streaming token updates
  const handleStreamToken = (token: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastIndex = newMessages.length - 1;
      
      // Nếu đã có tin nhắn cuối từ bot
      if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
        newMessages[lastIndex] = {
          ...newMessages[lastIndex],
          content: newMessages[lastIndex].content + token
        };
        
        // Nếu token có chứa thông báo lỗi cắt, đánh dấu tin nhắn không còn typing
        if (token.includes('[Phản hồi bị cắt do lỗi kết nối')) {
          newMessages[lastIndex].isTyping = false;
        }
      }
      
      return newMessages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const userMessage = input.trim()
    setInput('')

    // Create a new user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    
    // Add a new assistant message with typing indicator
    setMessages(prev => [...prev, { role: 'assistant', content: '', isTyping: true }])
    
    // Scroll to bottom to show the typing indicator
    setTimeout(scrollToBottom, 100)
    
    setIsLoading(true)
    console.log('Starting to process query:', userMessage);

    try {
      // Find relevant chunks if we have document chunks
      let relevantText = ''
      
        console.log(`Available text chunks: ${textChunks.length}`);
      if (textChunks.length > 0) {
        console.log(`Finding relevant content from ${textChunks.length} document chunks`);
        // Get the most relevant chunks based on the user's query
        const relevantChunks = findRelevantChunks(textChunks, userMessage, 5)
        
        if (relevantChunks.length > 0) {
          console.log(`Found ${relevantChunks.length} relevant chunks`);
          relevantText = relevantChunks.join('\n\n');
          console.log('Content length for relevant chunks:', relevantText.length);
          // Log preview of first chunk
          if (relevantChunks[0]) {
            console.log('Preview of first relevant chunk:', relevantChunks[0].substring(0, 100) + '...');
          }
        } else {
          console.log('No relevant chunks found for query');
        }
      } else {
        console.log('No document chunks available, using only model knowledge');
      }
      
      // Stream tokens as they come in for real-time response
      let hasStarted = false
      
      // Call API service
      console.log('Calling OpenRouter API with user message:', userMessage.substring(0, 50) + '...');
      
      if (relevantText) {
        console.log('Using document content as context for the API call');
        console.log(`Using document information for ${activeDocuments.length} documents`);
      }
      
      // Generate response from API
      const response = await apiService.generateResponse(
        userMessage, 
        relevantText,  // Pass relevant text as context
        (token: string) => {
          if (!hasStarted) {
            hasStarted = true
            console.log('First token received, streaming started');
          }
          handleStreamToken(token)
        },
        activeDocuments.length > 0 ? activeDocuments : undefined
      )
      
      // If we didn't get any streaming tokens but have a complete response
      // (fall back for non-streaming models)
      if (!hasStarted && response) {
        console.log('Using complete response as no streaming tokens were received');
        // Replace the typing message with the complete response
        setMessages(prev => {
          const newMessages = [...prev]
          // Find the last assistant message
          const lastAssistantIndex = newMessages.length - 1
          if (lastAssistantIndex >= 0 && newMessages[lastAssistantIndex].role === 'assistant') {
            newMessages[lastAssistantIndex] = {
              role: 'assistant',
              content: response,
              isTyping: false
            }
          }
          return newMessages
        })
      }
      
      // Make sure typing indicator is removed at the end
      setMessages(prev => {
        const newMessages = [...prev]
        const lastAssistantIndex = newMessages.length - 1
        if (lastAssistantIndex >= 0 && newMessages[lastAssistantIndex].role === 'assistant' && newMessages[lastAssistantIndex].isTyping) {
          newMessages[lastAssistantIndex] = {
            ...newMessages[lastAssistantIndex],
            isTyping: false
          }
        }
        return newMessages
      })
      
      // Ensure math rendering after response is complete
      console.log('Response complete, running MathJax typeset');
      setTimeout(() => {
        try {
          typeset();
        } catch (typesetError) {
          console.error('Error running MathJax typeset:', typesetError);
        }
      }, 100)
      
    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage = error instanceof Error
        ? `Đã xảy ra lỗi: ${error.message}`
        : 'Đã xảy ra lỗi không xác định khi gọi API'
      
      // Update the last assistant message with the error
      setMessages(prev => {
        const newMessages = [...prev]
        const lastAssistantIndex = newMessages.length - 1
        if (lastAssistantIndex >= 0 && newMessages[lastAssistantIndex].role === 'assistant') {
          newMessages[lastAssistantIndex] = {
              role: 'assistant',
              content: errorMessage,
              isTyping: false
          }
          return newMessages;
        } else {
          // Add a new message if there's no assistant message to update
          return [...prev, {
            role: 'assistant',
            content: errorMessage,
            isTyping: false
          }];
        }
      });
    } finally {
      setIsLoading(false)
      console.log('Request processing completed');
    }
  }

  // Handler for when processed files change in ClientFileProcessor
  const handleProcessedFilesChange = (selectedChunks: string[], docInfo: DocumentInfo[] = []) => {
    console.log(`Received ${selectedChunks.length} chunks from ClientFileProcessor`);
    
    // Ensure we're updating the state properly
    if (selectedChunks.length > 0) {
      // Log a sample of the received content to verify it's correct
      if (selectedChunks[0]) {
        console.log('Sample content from first chunk:', selectedChunks[0].substring(0, 100) + '...');
      }
      
      // Check if this is a change in the selection
      const isNewSelection = textChunks.length !== selectedChunks.length || 
        (textChunks.length > 0 && selectedChunks.length > 0 && textChunks[0] !== selectedChunks[0]);
      
      // Update the states
    setTextChunks(selectedChunks);
      setActiveDocuments(docInfo);
      
      if (isNewSelection) {
        let message = '';
        if (selectedChunks.length > 0) {
          message = `Đã cập nhật tài liệu tham khảo với ${selectedChunks.length} phần nội dung từ ${docInfo.length} tài liệu. AI sẽ sử dụng thông tin từ các tài liệu được chọn để trả lời câu hỏi của bạn.`;
        } else {
          message = 'Không có tài liệu nào được chọn. AI sẽ sử dụng kiến thức riêng để trả lời câu hỏi của bạn.';
        }
        
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
            content: message 
          }
        ]);
        
        // Scroll to see the message
        setTimeout(scrollToBottom, 100);
      }
      
      console.log('Document content loaded successfully, ready for queries');
    } else {
      console.log('No document chunks received or all documents deselected');
      setTextChunks([]);
      setActiveDocuments([]);
      
      // Notify user that no documents are selected
      if (textChunks.length > 0) {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: 'Tất cả tài liệu đã bị bỏ chọn. AI sẽ dựa vào kiến thức riêng để trả lời câu hỏi của bạn.' 
          }
        ]);
        
        // Scroll to see the message
        setTimeout(scrollToBottom, 100);
      }
    }
  };

  const handleSuggestedQuestionClick = (question: string) => {
    setInput(question);
    // Trigger MathJax rendering after changing the input
    setTimeout(typeset, 100);
    // Optional: automatically submit the question
    // setTimeout(() => {
    //   const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    //   handleSubmit(fakeEvent);
    // }, 100);
  };

  // Function to convert a single markdown line to HTML
  const convertMarkdownLine = (line: string): string => {
    // Headers
    if (line.startsWith('### ')) {
      return `<h3>${line.substring(4)}</h3>`;
    } else if (line.startsWith('## ')) {
      return `<h2>${line.substring(3)}</h2>`;
    } else if (line.startsWith('# ')) {
      return `<h1>${line.substring(2)}</h1>`;
    }
    
    // Bold
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    line = line.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    // Code
    line = line.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Highlight Information Theory specific terms for assistant messages
    Object.entries(infoTheoryTerms).forEach(([term, definition]) => {
      // Use word boundary to avoid partial matches
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      line = line.replace(regex, `<span class="info-theory-term" title="${definition}">$&</span>`);
    });
    
    return line;
  };
  
  // Function to process a block of code
  const processCodeBlock = (codeBlock: string): string => {
    return `<pre><code>${codeBlock}</code></pre>`;
  };

  // Hàm chuyển đổi văn bản thông thường sang định dạng với công thức toán học và markdown đơn giản
  const processContent = (content: string, isUserMessage: boolean = false): React.ReactNode => {
    try {
    // Xử lý markdown và công thức toán học
    
    // Bước 1: Bảo vệ công thức toán học từ xử lý markdown
    const mathPlaceholders: Record<string, string> = {};
    let processedContent = content;
    let blockCounter = 0;
    let inlineCounter = 0;
      
      console.log('Processing content for rendering...');
    
    // Xử lý block math ($$...$$)
    const blockRegex = /\$\$([\s\S]*?)\$\$/g;
    processedContent = processedContent.replace(blockRegex, (match, formula) => {
      const placeholder = `__MATH_BLOCK_${blockCounter}__`;
      mathPlaceholders[placeholder] = match;
      blockCounter++;
      return placeholder;
    });
      
      if (blockCounter > 0) {
        console.log(`Protected ${blockCounter} block math formulas from markdown processing`);
      }
    
    // Xử lý inline math ($...$)
    const inlineRegex = /\$(.*?)\$/g;
    processedContent = processedContent.replace(inlineRegex, (match, formula) => {
      const placeholder = `__MATH_INLINE_${inlineCounter}__`;
      mathPlaceholders[placeholder] = match;
      inlineCounter++;
      return placeholder;
    });
      
      if (inlineCounter > 0) {
        console.log(`Protected ${inlineCounter} inline math formulas from markdown processing`);
      }
    
    // Bước 2: Xử lý markdown
    // Tách thành các dòng
    const lines = processedContent.split('\n');
    let htmlContent = '';
    let inCodeBlock = false;
    let codeContent = '';
      
      // Track list state with better nesting support
      let inOrderedList = false;
      let inUnordedList = false;
      let listIndentLevel = 0;
      let previousLineIndent = 0;
      let listCounter = 1;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
        let currentIndent = line.search(/\S|$/);
      
      // Xử lý code block
      if (line.trim() === '```' || line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeContent = '';
          continue;
        } else {
          htmlContent += processCodeBlock(codeContent);
          inCodeBlock = false;
          continue;
        }
      }
      
      if (inCodeBlock) {
        codeContent += line + '\n';
        continue;
      }
      
        // Handle empty lines - close any open lists
        if (line.trim() === '') {
          if (inOrderedList) {
            htmlContent += '</ol>';
            inOrderedList = false;
            listCounter = 1; // Reset counter for next list
          }
          if (inUnordedList) {
            htmlContent += '</ul>';
            inUnordedList = false;
          }
          listIndentLevel = 0;
          htmlContent += '<br />';
        continue;
        }
        
        // Detect list items with proper indentation tracking
        const unorderedMatch = line.trim().match(/^(\s*)[-*]\s+(.+)$/);
        const orderedMatch = line.trim().match(/^(\s*)(\d+)\.\s+(.+)$/);
        
        if (unorderedMatch) {
          const content = unorderedMatch[2];
          
          // Handle list nesting based on indentation
          if (!inUnordedList) {
            htmlContent += '<ul>';
            inUnordedList = true;
          } else if (currentIndent > previousLineIndent + 2) {
            // Start nested list
            htmlContent += '<ul>';
            listIndentLevel++;
          } else if (currentIndent < previousLineIndent && listIndentLevel > 0) {
            // Close nested list
        htmlContent += '</ul>';
            listIndentLevel--;
          }
          
          htmlContent += `<li>${convertMarkdownLine(content)}</li>`;
          previousLineIndent = currentIndent;
          continue;
        } 
        else if (orderedMatch) {
          const itemNum = parseInt(orderedMatch[2]);
          const content = orderedMatch[3];
          
          // Handle ordered list with proper numbering
          if (!inOrderedList) {
          htmlContent += '<ol>';
            inOrderedList = true;
            listCounter = itemNum; // Start counting from the actual number
          } else if (currentIndent > previousLineIndent + 2) {
            // Start nested ordered list
            htmlContent += '<ol>';
            listIndentLevel++;
            listCounter = itemNum; // Reset counter for nested list
          } else if (currentIndent < previousLineIndent && listIndentLevel > 0) {
            // Close nested list
            htmlContent += '</ol>';
            listIndentLevel--;
          }
          
          // Use the actual numbering from the content
          htmlContent += `<li value="${itemNum}">${convertMarkdownLine(content)}</li>`;
          listCounter = itemNum + 1; // Increment for next expected item
          previousLineIndent = currentIndent;
        continue;
        } 
        else {
          // Not a list item, close any open lists
          if (inOrderedList) {
            // Close all nested lists
            for (let j = 0; j <= listIndentLevel; j++) {
        htmlContent += '</ol>';
            }
            inOrderedList = false;
            listIndentLevel = 0;
            listCounter = 1;
          }
          if (inUnordedList) {
            // Close all nested lists
            for (let j = 0; j <= listIndentLevel; j++) {
              htmlContent += '</ul>';
            }
            inUnordedList = false;
            listIndentLevel = 0;
      }
      
      // Xử lý đoạn văn
        htmlContent += `<p>${convertMarkdownLine(line)}</p>`;
      }
        
        previousLineIndent = currentIndent;
      }
      
      // Ensure all lists are properly closed
      if (inOrderedList) {
        for (let j = 0; j <= listIndentLevel; j++) {
          htmlContent += '</ol>';
        }
      }
      if (inUnordedList) {
        for (let j = 0; j <= listIndentLevel; j++) {
          htmlContent += '</ul>';
        }
    }
    
    // Bước 3: Phục hồi các công thức toán học
    Object.entries(mathPlaceholders).forEach(([placeholder, formula]) => {
      if (htmlContent.includes(placeholder)) {
        if (placeholder.includes('MATH_BLOCK')) {
          const mathContent = formula.slice(2, -2); // Remove $$ markers
          htmlContent = htmlContent.replace(
            placeholder,
            `<div class="math-block py-2">\\[${mathContent}\\]</div>`
          );
        } else if (placeholder.includes('MATH_INLINE')) {
          const mathContent = formula.slice(1, -1); // Remove $ markers
          htmlContent = htmlContent.replace(
            placeholder,
            `<span class="math-inline">\\(${mathContent}\\)</span>`
          );
        }
      }
    });
    
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    } catch (error) {
      console.error('Error processing content:', error);
      return <div>{content}</div>; // Fallback to plain text if there's an error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setShowSuggestions(true);
  };

  // Render các công thức toán học khi hiển thị/ẩn danh sách
  useEffect(() => {
    if (showFormulasReference && (window as any).MathJax) {
      setTimeout(() => {
        (window as any).MathJax.typesetPromise && (window as any).MathJax.typesetPromise();
      }, 100);
    }
  }, [showFormulasReference]);

  // Additional useEffect to handle the case when user has preloaded docs
  useEffect(() => {
    // Check if there are initial text chunks but no messages yet (except welcome)
    if (initialTextChunks.length > 0 && messages.length === 1) {
      // Nothing to do, the welcome message already informs about preloaded docs
    }
  }, [initialTextChunks, messages]);

  // Update textChunks state when initialTextChunks prop changes
  useEffect(() => {
    console.log(`ChatInterface: initialTextChunks prop updated with ${initialTextChunks.length} chunks`);
    setTextChunks(initialTextChunks);
  }, [initialTextChunks]);

  // Update activeDocuments state when documentInfo prop changes
  useEffect(() => {
    console.log(`ChatInterface: documentInfo prop updated with ${documentInfo.length} documents`);
    if (documentInfo.length > 0) {
      console.log("Active documents:", documentInfo.map(doc => doc.name).join(", "));
    }
    setActiveDocuments(documentInfo);
  }, [documentInfo]);

  // Add a global click handler to re-typeset MathJax content after any UI interaction
  useEffect(() => {
    const handleGlobalClick = () => {
      // Short delay to ensure the DOM has been updated
      setTimeout(() => {
        if ((window as any).MathJax && (window as any).MathJax.typesetPromise) {
          try {
            console.log('Re-running MathJax typeset after UI interaction');
            (window as any).MathJax.typesetPromise()
              .then(() => {
                console.log('Post-interaction MathJax typesetting completed');
              })
              .catch((err: any) => {
                console.error('MathJax typesetting error after interaction:', err);
              });
          } catch (err) {
            console.error('Error running MathJax typeset:', err);
          }
        }
      }, 100);
    };

    // Add the global click handler to the document
    document.addEventListener('click', handleGlobalClick);
    
    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* API Error Alert - show when there's an API error */}
      {apiError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-3 rounded">
          <div className="flex items-start">
            <div className="mr-2 text-lg">⚠️</div>
            <div>
              <p className="font-medium">Lỗi kết nối API</p>
              <p>{apiError}</p>
              <div className="flex mt-2 space-x-2">
                <button 
                  onClick={() => {
                    setApiError(null);
                    setTimeout(typeset, 100); // Re-typeset after closing the error
                  }} 
                  className="px-2 py-1 bg-white text-sm text-red-700 border border-red-300 rounded hover:bg-red-50"
                >
                  Đóng thông báo
                </button>
                {apiStatus === 'error' && (
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-2 py-1 bg-red-200 text-sm text-red-800 rounded hover:bg-red-300"
                  >
                    Thử lại
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Thanh công cụ */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex space-x-2">
            {/* Nút chuyển đổi chế độ */}
            <div className="flex border border-blue-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveMode('chat')}
                className={`px-3 py-1 flex items-center ${
                  activeMode === 'chat' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-blue-600'
                }`}
              >
                <span className="mr-1">💬</span> Hỏi đáp
              </button>
              <button
                onClick={() => setActiveMode('quiz')}
                className={`px-3 py-1 flex items-center ${
                  activeMode === 'quiz' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-blue-600'
                }`}
              >
                <span className="mr-1">📝</span> Luyện tập
              </button>
            </div>
            
            {activeMode === 'chat' && (
              <>
                <button
                  onClick={() => setShowFormulasReference(!showFormulasReference)}
                  className={`px-3 py-1 rounded-lg flex items-center ${
                    showFormulasReference 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-blue-300 text-blue-600'
                  }`}
                >
                  <span className="mr-1">📊</span> 
                  {showFormulasReference ? 'Ẩn công thức' : 'Xem tóm tắt công thức'}
                </button>
                
                <a 
                  href={referenceList[0].url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg flex items-center bg-white border border-blue-300 text-blue-600 hover:bg-blue-100"
                >
                  <span className="mr-1">📚</span> Tài liệu học tập
                </a>
              </>
            )}
          </div>
          
          {activeMode === 'chat' && (
            <button
              onClick={handleNewChat}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center"
            >
              <span className="mr-1">🔄</span> Cuộc trò chuyện mới
            </button>
          )}
        </div>
        
        {/* Collapsible formula section */}
        {activeMode === 'chat' && showFormulasReference && (
          <div className="p-3 bg-white border border-blue-200 rounded mb-2">
            <h4 className="font-semibold text-blue-700 mb-2 text-center">TÓM TẮT CÔNG THỨC</h4>
            <div 
              className="overflow-y-auto pr-2"
              style={{ maxHeight: 'calc(80vh - 200px)' }}
            >
              {keyFormulas.map((item, index) => (
                <div key={index} className="mb-3 border-b border-gray-100 pb-2">
                  <div className="font-semibold text-gray-800">{item.name}</div>
                  <div className="math-block py-1">{item.formula}</div>
                  {item.description && (
                    <div className="text-sm text-gray-600">{item.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content area - Nội dung chính thay đổi theo chế độ */}
      {activeMode === 'chat' ? (
        <>
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto mb-3 p-3 bg-gray-50 rounded-lg"
            style={{ 
              minHeight: '400px',
              maxHeight: 'calc(100vh - 200px)', 
              overflowY: 'auto', 
              scrollbarWidth: 'thin',
              scrollbarColor: '#CBD5E0 #EDF2F7'
            }}
          >
        {messages.length === 0 ? (
              <div>
                <div className="text-center text-gray-600 my-4">
                  <p className="text-lg font-semibold mb-2">
                    Chào mừng đến với Trợ lý Lý thuyết Thông tin!
                  </p>
                  <p className="mb-3">
                  Hỏi bất kỳ câu hỏi nào về môn Lý thuyết Thông tin, từ khái niệm, công thức toán học đến ứng dụng thực tiễn. Trợ lý sẽ cung cấp giải đáp chi tiết, dễ hiểu và chính xác.
                  </p>
                  <p className="text-sm text-blue-600 mb-3">
                    <strong>Mẹo:</strong> Bạn có thể chuyển sang chế độ <span className="font-bold">Luyện tập</span> để thử sức với các câu hỏi trắc nghiệm về Lý thuyết Thông tin.
                  </p>
                </div>
                
                {/* Câu hỏi gợi ý theo danh mục - Always visible on empty chat */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h3 className="text-blue-800 font-medium mb-2">Gợi ý câu hỏi theo chủ đề:</h3>
                  
                  {/* Category tabs */}
                  <div className="flex overflow-x-auto mb-2 pb-1">
                    {Object.keys(suggestedQuestions).map((category) => (
                      <button
                        key={category}
                        className={`px-3 py-1 mr-2 rounded-t-lg whitespace-nowrap ${
                          activeCategory === category 
                            ? 'bg-white border-b-2 border-blue-500 font-medium' 
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                        onClick={() => setActiveCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  
                  {/* Questions for selected category */}
                  <div className="grid grid-cols-1 gap-2">
                    {activeCategory && suggestedQuestions[activeCategory as keyof typeof suggestedQuestions]?.map((question: string, index: number) => (
                      <button
                        key={index}
                        className="text-left p-2 bg-white border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                        onClick={() => handleSuggestedQuestionClick(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
                  className={`mb-3 p-3 rounded-lg ${
                message.role === 'user' 
                      ? 'bg-blue-100 border-2 border-blue-300 ml-auto max-w-[80%]' 
                  : 'bg-white shadow max-w-[80%]'
              }`}
            >
                  {message.role === 'user' && (
                    <div className="text-xs text-blue-700 mb-1 font-semibold">
                      Câu hỏi:
                    </div>
                  )}
                  <div className={`math-content markdown-content ${message.role === 'user' ? 'text-blue-900' : ''}`}>
                    {processContent(message.content, message.role === 'user')}
                    {message.isTyping && <span className="typing-cursor">|</span>}
                  </div>
                  
                  {/* Hiển thị thanh định nghĩa với bất kỳ thuật ngữ Lý thuyết Thông tin nào được nhắc đến */}
                  {message.role === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                      <div className="info-theory-reference">
                        <span className="font-medium">Mẹo học tập:</span> Di chuột qua các <span className="text-blue-600">thuật ngữ được đánh dấu</span> để xem định nghĩa.
                      </div>
                    </div>
                  )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
            <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi điều gì đó về Lý thuyết Thông tin..."
              disabled={isLoading || apiStatus === 'error'} 
              rows={2}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              style={{ minHeight: '60px', maxHeight: '120px' }}
        />
        <button
          type="submit"
              disabled={isLoading || !input.trim() || apiStatus === 'error'}
          className={`px-4 py-2 rounded-lg ${
                isLoading || !input.trim() || apiStatus === 'error'
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Đang xử lý...' : 'Gửi'}
        </button>
      </form>
        </>
      ) : (
        /* Quiz Mode container */
        <div className="flex-1 overflow-y-auto">
          <QuizMode />
        </div>
      )}
    </div>
  )
} 